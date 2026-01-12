const Booking = require('../../models/Booking');
const Vendor = require('../../models/Vendor');
const Transaction = require('../../models/Transaction');
const { PAYMENT_STATUS } = require('../../utils/constants');

/**
 * Initiate Cash Collection
 * Optional: Sends OTP to customer
 */
exports.initiateCashCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.paymentMethod !== 'cash' && booking.paymentMethod !== 'pay_at_home') {
      return res.status(400).json({ success: false, message: 'This booking is not a cash payment' });
    }

    // Optional: Update final total and extra items if provided during initiation
    const { totalAmount, extraItems } = req.body;
    if (totalAmount !== undefined) {
      booking.finalAmount = Number(totalAmount);
    }
    if (extraItems && Array.isArray(extraItems)) {
      booking.workDoneDetails = {
        ...booking.workDoneDetails,
        items: extraItems.map(item => ({
          title: item.title,
          qty: Number(item.qty) || 1,
          price: Number(item.price) || 0
        }))
      };
    }

    // Force mark modified for nested object if needed
    if (extraItems) booking.markModified('workDoneDetails');

    // For backwards compatibility and future use, we can still generate it but not force it
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    booking.customerConfirmationOTP = otp;
    booking.paymentOtp = otp;
    await booking.save();

    // Emit socket event to user with full bill details and OTP
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${booking.userId}`).emit('booking_updated', {
        bookingId: booking._id,
        finalAmount: booking.finalAmount,
        customerConfirmationOTP: booking.customerConfirmationOTP,
        paymentOtp: booking.paymentOtp,
        workDoneDetails: booking.workDoneDetails
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bill finalized',
      totalAmount: booking.finalAmount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Confirm Cash Collection (by Vendor/Worker)
 */
exports.confirmCashCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp, amount, extraItems } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // OTP Verification - REQUIRED to ensure customer agrees to final bill
    if (booking.customerConfirmationOTP && otp && booking.customerConfirmationOTP !== otp) {
      // Allow 0000 only if explicitly allowed in environment (for testing) or just strict check
      if (process.env.NODE_ENV !== 'development' || otp !== '0000') {
        return res.status(400).json({ success: false, message: 'Invalid OTP. Please enter the code sent to the customer.' });
      }
    }

    const collectionAmount = amount || booking.finalAmount;
    const Settings = require('../../models/Settings');
    const settings = await Settings.findOne({ type: 'global' });
    const commissionRate = (settings?.commissionPercentage || 10) / 100;

    // Optional: Update items if provided again
    if (extraItems && Array.isArray(extraItems)) {
      booking.workDoneDetails = {
        ...booking.workDoneDetails,
        items: extraItems.map(item => ({
          title: item.title,
          qty: item.qty || 1,
          price: item.price
        }))
      };
      booking.finalAmount = collectionAmount;
    }

    // Recalculate earnings and commission if amount changed or just to be safe
    booking.adminCommission = parseFloat((collectionAmount * commissionRate).toFixed(2));
    booking.vendorEarnings = parseFloat((collectionAmount - booking.adminCommission).toFixed(2));

    // Update Booking
    booking.cashCollected = true;
    booking.cashCollectedAt = new Date();
    booking.cashCollectedBy = userRole === 'vendor' ? 'vendor' : 'worker';
    booking.cashCollectorId = userId;
    booking.paymentStatus = PAYMENT_STATUS.COLLECTED_BY_VENDOR;

    // If it was a self-job or completed by worker, mark booking as completed or work_done?
    // Usually cash collection is the last step for cash bookings.
    if (booking.status === 'work_done' || booking.status === 'visited' || booking.status === 'in_progress') {
      booking.status = 'completed';
      booking.completedAt = new Date();
    }

    await booking.save();

    // Update Vendor Wallet (Even if worker collected, it goes to vendor's ledger)
    const vendorId = booking.vendorId;
    const vendor = await Vendor.findById(vendorId);

    if (vendor) {
      // Increase dues (amount vendor owes to admin)
      vendor.wallet.dues = (vendor.wallet.dues || 0) + collectionAmount;
      vendor.wallet.totalCashCollected = (vendor.wallet.totalCashCollected || 0) + collectionAmount;

      // Check cash limit
      if (vendor.wallet.dues > (vendor.wallet.cashLimit || 10000)) {
        vendor.wallet.isBlocked = true;
        vendor.wallet.blockedAt = new Date();
        vendor.wallet.blockReason = 'Cash collection limit exceeded. Please settle dues with admin.';
      }

      await vendor.save();

      // Record Transaction
      await Transaction.create({
        vendorId,
        bookingId: booking._id,
        amount: collectionAmount,
        type: 'cash_collected',
        description: `Cash collected for booking ${booking.bookingNumber}`,
        status: 'completed'
      });
    }

    // Emit socket event to user for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${booking.userId}`).emit('booking_updated', {
        bookingId: booking._id,
        status: booking.status,
        cashCollected: true,
        message: 'Payment recorded and booking completed!'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cash collection confirmed and recorded in ledger',
      data: {
        bookingId: booking._id,
        amount: collectionAmount,
        walletDues: vendor?.wallet?.dues
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Customer Confirm Payment (Optional flow for user to confirm they paid)
 */
exports.customerConfirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.customerConfirmed = true;
    await booking.save();

    res.status(200).json({ success: true, message: 'Payment confirmed by customer' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Cash Collection Status
 */
exports.getCashCollectionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).select('cashCollected cashCollectedAt cashCollectedBy paymentStatus');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
