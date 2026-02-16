const VendorBill = require('../../models/VendorBill');
const Booking = require('../../models/Booking');
const VendorServiceCatalog = require('../../models/VendorServiceCatalog');
const VendorPartsCatalog = require('../../models/VendorPartsCatalog');
const Settings = require('../../models/Settings');
const { BILL_STATUS } = require('../../utils/constants');

/**
 * Create or Update Vendor Bill
 * POST /api/vendors/bookings/:bookingId/bill
 */
const createOrUpdateBill = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { services, parts, customItems } = req.body;
    const vendorId = req.user.id; // From authMiddleware

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.vendorId.toString() !== vendorId) {
      return res.status(403).json({ success: false, message: 'Not authorized for this booking' });
    }

    // Initialize with original booking amounts
    // Booking Total (User pays) is usually Tax Inclusive
    // Booking Base Price is Tax Exclusive
    let totalServiceCharges = booking.finalAmount || 0;
    let serviceTaxableTotal = booking.basePrice || 0;

    const processedServices = [];
    if (services && Array.isArray(services)) {
      for (const item of services) {
        let catalogItem = null;
        if (item.catalogId) {
          catalogItem = await VendorServiceCatalog.findById(item.catalogId);
        }

        const name = catalogItem ? catalogItem.name : item.name;
        // Assumption: Service Catalog Prices are INCLUSIVE of GST (18%)
        const price = catalogItem ? catalogItem.price : (item.price || 0);
        const quantity = item.quantity || 1;
        const total = price * quantity;

        // Calculate Taxable for this item (Extract 18% GST)
        const taxable = total / 1.18;

        processedServices.push({
          catalogId: item.catalogId,
          name,
          price,
          quantity,
          total
        });
        totalServiceCharges += total;
        serviceTaxableTotal += taxable;
      }
    }

    // Process Parts
    // Assumption: Parts Catalog Prices are EXCLUSIVE of GST
    let totalPartsCharges = 0; // Inclusive of Tax
    let partsTaxableTotal = 0;

    const processedParts = [];
    if (parts && Array.isArray(parts)) {
      for (const item of parts) {
        let catalogItem = null;
        if (item.catalogId) {
          catalogItem = await VendorPartsCatalog.findById(item.catalogId);
        }

        const name = catalogItem ? catalogItem.name : item.name;
        const price = catalogItem ? catalogItem.price : (item.price || 0);
        const gstPercentage = catalogItem ? catalogItem.gstPercentage : (item.gstPercentage || 18);
        const quantity = item.quantity || 1;

        const taxable = price * quantity;
        const gstAmount = (taxable * gstPercentage / 100);
        const total = taxable + gstAmount;

        processedParts.push({
          catalogId: item.catalogId,
          name,
          price,
          gstPercentage,
          quantity,
          gstAmount,
          total
        });

        totalPartsCharges += total;
        partsTaxableTotal += taxable;
      }
    }

    // Process Custom Items
    // Assumption: Custom Prices are EXCLUSIVE of GST
    let totalCustomCharges = 0;
    let customTaxableTotal = 0;

    const processedCustomItems = [];
    if (customItems && Array.isArray(customItems)) {
      for (const item of customItems) {
        const name = item.name;
        const price = Number(item.price) || 0;
        const gstApplicable = item.gstApplicable !== false;
        const gstPercentage = gstApplicable ? (Number(item.gstPercentage) || 18) : 0;
        const quantity = Number(item.quantity) || 1;

        const taxable = price * quantity;
        const gstAmount = (taxable * gstPercentage / 100);
        const total = taxable + gstAmount;

        processedCustomItems.push({
          name,
          price,
          gstApplicable,
          gstPercentage,
          quantity,
          gstAmount,
          total
        });

        totalCustomCharges += total;
        customTaxableTotal += taxable;
      }
    }

    const grandTotal = totalServiceCharges + totalPartsCharges + totalCustomCharges;
    const totalTaxableAmount = serviceTaxableTotal + partsTaxableTotal + customTaxableTotal;

    // Calculate Earnings & Commission
    // Fetch global settings
    const settings = await Settings.findOne({ type: 'global' });
    const adminCommissionPercent = settings ? settings.commissionPercentage : 10;

    // Admin Commission = % of Taxable
    const adminCommissionAmount = totalTaxableAmount * (adminCommissionPercent / 100);

    // Vendor Earnings = Taxable Amount - Admin Commission
    // (Ignoring GST component which is tax liability)
    const vendorEarnings = totalTaxableAmount - adminCommissionAmount;

    // Create or Update Bill
    let bill = await VendorBill.findOne({ bookingId });
    if (bill) {
      bill.services = processedServices;
      bill.parts = processedParts;
      bill.customItems = processedCustomItems;
      bill.totalServiceCharges = totalServiceCharges;
      bill.totalPartsCharges = totalPartsCharges;
      bill.totalCustomCharges = totalCustomCharges;
      bill.grandTotal = grandTotal;
      bill.status = BILL_STATUS.GENERATED;
      await bill.save();
    } else {
      bill = await VendorBill.create({
        bookingId,
        vendorId,
        services: processedServices,
        parts: processedParts,
        customItems: processedCustomItems,
        totalServiceCharges,
        totalPartsCharges,
        totalCustomCharges,
        grandTotal,
        status: BILL_STATUS.GENERATED
      });
    }

    // Update Booking
    booking.finalAmount = Math.round(grandTotal);
    booking.vendorEarnings = Math.round(vendorEarnings);
    booking.adminCommission = Math.round(adminCommissionAmount);

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Bill generated successfully',
      bill,
      financials: {
        grandTotal: Math.round(grandTotal),
        totalTaxableAmount: Math.round(totalTaxableAmount),
        adminCommission: booking.adminCommission,
        vendorEarnings: booking.vendorEarnings
      }
    });

  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate bill' });
  }
};

/**
 * Get Bill by Booking ID
 * GET /api/vendors/bookings/:bookingId/bill
 */
const getBillByBookingId = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const bill = await VendorBill.findOne({ bookingId }).populate('services.catalogId parts.catalogId');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    res.status(200).json({ success: true, bill });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bill' });
  }
};

module.exports = {
  createOrUpdateBill,
  getBillByBookingId
};
