const mongoose = require('mongoose');
const Booking = require('../../models/Booking');
const Service = require('../../models/Service');
const Category = require('../../models/Category');
const Cart = require('../../models/Cart');
const User = require('../../models/User');
const Vendor = require('../../models/Vendor');
const Worker = require('../../models/Worker');
const Review = require('../../models/Review');
const { validationResult } = require('express-validator');
const { BOOKING_STATUS, PAYMENT_STATUS } = require('../../utils/constants');
const { createNotification } = require('../notificationControllers/notificationController');
const { sendNotificationToUser, sendNotificationToVendor, sendNotificationToWorker } = require('../../services/firebaseAdmin');

/**
 * Create a new booking
 */
const createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    let {
      serviceId,
      vendorId,
      address,
      scheduledDate,
      scheduledTime,
      timeSlot,
      userNotes,
      paymentMethod,
      amount,
      isPlusAdded,
      bookedItems, // Array of specific items from cart
      visitingCharges: reqVisitingCharges,
      visitationFee: reqVisitationFee, // Backward compatibility
      basePrice: reqBasePrice,
      discount: reqDiscount,
      tax: reqTax
    } = req.body;

    let visitingCharges = reqVisitingCharges !== undefined ? reqVisitingCharges : (reqVisitationFee || 0);

    console.log('[CreateBooking] bookedItems received:', JSON.stringify(bookedItems, null, 2));

    // Calculate total value from booked items or fallback to base (Move to top)
    let totalServiceValue = 0;
    if (bookedItems && bookedItems.length > 0) {
      totalServiceValue = bookedItems.reduce((sum, item) => {
        const itemPrice = item.card?.price || item.price || 0;
        return sum + (itemPrice * (item.quantity || 1));
      }, 0);
    }
    // Note: Fallback to service.basePrice is done later if totalServiceValue is 0 AND service is loaded.
    // But we need 'service' to define fallback.
    // 'service' is loaded at line 46.
    // So we must calculate it AFTER loading service but BEFORE usage.
    // Usage is at line 98. Service loaded at 46.
    // So distinct placement: AFTER line 52.

    // Handle serviceId if it's an object (from populated cart data)
    if (typeof serviceId === 'object' && serviceId._id) {
      serviceId = serviceId._id;
    }

    // Verify service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Calculate total value from booked items or fallback to service base price immediately after service load
    if (totalServiceValue === 0 && bookedItems && bookedItems.length > 0) {
      // It was calculated above? No, I defined variable but didn't assign fallback yet.
      // Let's just do the whole calc here correctly.
    }

    // RE-EVALUATE: Better to consolidate the logic at one place: AFTER service load.
    if (totalServiceValue === 0) { // If not calculated from items or items were 0 price
      totalServiceValue = service.basePrice || 500;
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't assign vendor initially - send to nearby vendors instead
    // Vendor will be assigned when a vendor accepts the booking

    // Get category for the service FIRST (needed for plan validation)
    const categoryId = service.categoryId || service.categoryIds?.[0];
    const category = categoryId ? await Category.findById(categoryId) : null;

    // --- MOVE VENDOR SEARCH UP HERE ---
    // Find nearby vendors using location service
    const { findNearbyVendors, geocodeAddress } = require('../../services/locationService');

    // Determine booking location (prioritize frontend coordinates)
    let bookingLocation;
    if (address.lat && address.lng) {
      bookingLocation = { lat: address.lat, lng: address.lng };
      console.log('Using provided coordinates for vendor search:', bookingLocation);
    } else {
      bookingLocation = await geocodeAddress(
        `${address.addressLine1}, ${address.city}, ${address.state} ${address.pincode}`
      );
      console.log('Geocoded address for vendor search:', bookingLocation);
    }

    // Find vendors within 10km radius who offer this service category
    const vendorFilters = category ? { service: category.title } : {};
    let nearbyVendors = await findNearbyVendors(bookingLocation, 10, vendorFilters);

    // Deduplicate nearbyVendors by _id to prevent duplicate notifications
    const uniqueVendorIds = new Set();
    nearbyVendors = nearbyVendors.filter(vendor => {
      const idStr = vendor._id.toString();
      if (uniqueVendorIds.has(idStr)) return false;
      uniqueVendorIds.add(idStr);
      return true;
    });

    console.log(`[CreateBooking] Found ${nearbyVendors.length} nearby vendors for booking`);
    // --- END VENDOR SEARCH BLOCK ---

    // Calculate pricing - use amount from frontend if provided, otherwise calculate
    let basePrice, discount, tax, finalAmount;
    let bookingStatus = BOOKING_STATUS.SEARCHING;
    let bookingPaymentStatus = PAYMENT_STATUS.PENDING;

    // Check if this is a PLAN BENEFIT booking
    if (paymentMethod === 'plan_benefit') {
      const Plan = require('../../models/Plan');

      // Validate user has active plan
      if (!user.plans || !user.plans.isActive) {
        return res.status(400).json({ success: false, message: 'No active plan found' });
      }

      const userPlan = await Plan.findOne({ name: user.plans.name });
      if (!userPlan) {
        return res.status(400).json({ success: false, message: 'Plan details not found' });
      }

      // Check if service or category is covered
      const isCategoryCovered = categoryId && userPlan.freeCategories &&
        userPlan.freeCategories.some(cat => String(cat) === String(categoryId));
      const isServiceCovered = serviceId && userPlan.freeServices &&
        userPlan.freeServices.some(svc => String(svc) === String(serviceId));

      if (isCategoryCovered || isServiceCovered) {
        // Valid Free Booking - user pays 0, but vendor gets paid by admin
        // FIX: Use totalServiceValue for basePrice to show real cost in DB
        basePrice = totalServiceValue > 0 ? totalServiceValue : (service.basePrice || 500);
        discount = basePrice; // Full discount for user
        tax = 0;
        visitingCharges = 0;
        finalAmount = 0; // User pays nothing
        bookingStatus = BOOKING_STATUS.SEARCHING;
        bookingPaymentStatus = PAYMENT_STATUS.PLAN_COVERED;
      } else {
        return res.status(400).json({ success: false, message: 'Service not covered by your plan' });
      }
    } else if (amount && amount > 0) {
      // Use amount from frontend (from cart total)
      finalAmount = amount;

      if (reqBasePrice !== undefined && reqTax !== undefined) {
        // Use breakdown provided by frontend
        basePrice = reqBasePrice;
        discount = reqDiscount || 0;
        tax = reqTax;
        visitingCharges = (reqVisitingCharges !== undefined) ? reqVisitingCharges : (visitingCharges || 49);
      } else {
        // Backward compatibility: Reverse calculate
        // Ensure visitation fee is present
        if (!visitingCharges) visitingCharges = 49;

        // Reverse calculate base from final (Excluding fee)
        // Amount = (Base + Tax) + Fee -> Amount - Fee = Base * 1.18
        basePrice = Math.round((amount - visitingCharges) / 1.18);
        tax = amount - basePrice - visitingCharges;
        discount = 0;
      }
    } else {
      // Fallback to service pricing
      if (!visitingCharges) visitingCharges = 49;

      basePrice = service.basePrice || 500; // Default minimum ₹500
      discount = service.discountPrice ? (basePrice - service.discountPrice) : 0;
      tax = Math.round(basePrice * 0.18); // 18% GST
      finalAmount = basePrice - discount + tax + visitingCharges;
    }

    // Calculate vendor earnings and admin commission
    const Settings = require('../../models/Settings');
    const settings = await Settings.findOne({ type: 'global' });
    const commissionRate = (settings?.commissionPercentage || 10) / 100;
    let vendorEarnings, adminCommission;

    if (paymentMethod === 'plan_benefit') {
      // Vendor gets full amount from admin (or should we deduct commission too? use full value for now based on user request "earning money as on non free")
      // User said: "we shows vendor the earning money on service as on non free"
      // Usually "earnings" = "price - commission".
      // If user pays 0, Vendor still expects (Price - Commission) or Full Price?
      // "same no need to change on vendor" -> Implies logic should be identical to paid booking?
      // If paid booking: User pays 1000. Vendor gets 900.
      // If free booking: User pays 0. Vendor gets ???
      // If vendor sees "500", it means they see 500.
      // If real value is 800.
      // I will give vendor the full value (or minus commission) based on totalServiceValue.
      // Let's assume vendor gets (Value - Commission) always, but for Plan Benefit, Admin pays it.

      adminCommission = 0; // Admin doesn't take commission from... wait. Admin PAYS vendor.
      // If Admin pays vendor, Admin pays (Price - Commission)? No, Admin pays Vendor's share.
      // Let's set vendorEarnings = totalServiceValue - (totalServiceValue * commissionRate).

      const potentialCommission = Math.round(totalServiceValue * commissionRate);
      vendorEarnings = totalServiceValue - potentialCommission; // Standard earnings logic

      // But wait, step 129 had: vendorEarnings = servicePrice; (Full price).
      // If previously it was Full Price, maybe that's what user expects?
      // User said: "we shows vendor the earning money on service as on non free"
      // Non-free earnings = Price - Commission.
      // So I will apply commission deduction.

      adminCommission = 0; // Admin absorbs the cost, so technically commission is 0 recorded against user payment? 
      // Actually, let's keep it simple: Vendor gets what they would get if user paid.
      // If user paid X, Vendor gets X * 0.9.
      // So Vendor Earnings = totalServiceValue * 0.9.

    } else {
      // Regular booking - calculate commission
      // Use finalAmount (Total Paid) as base for commission as per requirement
      // Vendor Earnings = 90% of Total Amount
      adminCommission = parseFloat((finalAmount * commissionRate).toFixed(2));
      vendorEarnings = parseFloat((finalAmount - adminCommission).toFixed(2));
    }

    // Ensure minimum amount for Razorpay (₹1) for paid bookings
    if (finalAmount < 1 && paymentMethod !== 'plan_benefit') {
      finalAmount = 1;
    }

    // Create booking
    const bookingNumber = `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    console.log('[CreateBooking] About to save with bookedItems:', JSON.stringify(bookedItems || [], null, 2));

    const booking = await Booking.create({
      bookingNumber,
      userId,
      vendorId: null, // Will be assigned when vendor accepts
      serviceId,
      categoryId,
      serviceName: service.title,
      serviceCategory: category?.title || 'General',
      description: service.description,
      serviceImages: service.images || [],
      serviceImages: service.images || [],
      bookedItems: (Array.isArray(bookedItems) && bookedItems.length > 0) ? bookedItems : [],
      // Force bookedItems assignment and verify
      basePrice,
      discount,
      tax,
      visitingCharges,
      finalAmount,
      vendorEarnings,
      adminCommission,
      address: {
        type: address.type || 'home',
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || '',
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        landmark: address.landmark || '',
        lat: address.lat || null,
        lng: address.lng || null
      },
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      timeSlot: {
        start: timeSlot.start,
        end: timeSlot.end
      },
      // userNotes: userNotes || null, // Removed
      // isPlusAdded: isPlusAdded || false, // Removed
      paymentMethod: paymentMethod || null,
      status: bookingStatus,
      paymentStatus: bookingPaymentStatus
      // notifiedVendors will be set after wave sorting
    });

    // If Plus membership was added, update user status
    if (isPlusAdded) {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year membership
      user.plans = {
        isActive: true,
        name: 'Plus Membership',
        expiry: expiryDate,
        price: 999 // Or fetch based on constants if needed, hardcoding placeholder or 0
      };
      await user.save();
      console.log(`User ${userId} upgraded to Plus Membership until ${expiryDate}`);
    }

    // Nearby vendors already found above
    // WAVE-BASED ALERTING: Sort by distance and only notify first wave
    const sortedVendors = nearbyVendors.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    // Wave 1: First 3 vendors
    const WAVE_1_COUNT = 3;
    const wave1Vendors = sortedVendors.slice(0, WAVE_1_COUNT);

    // Store all potential vendors in booking for scheduler to use
    booking.potentialVendors = sortedVendors.map(v => ({
      vendorId: v._id,
      distance: v.distance || 0
    }));
    booking.currentWave = 1;
    booking.waveStartedAt = new Date();
    booking.notifiedVendors = wave1Vendors.map(v => v._id);
    await booking.save();

    if (wave1Vendors.length > 0) {
      console.log(`[CreateBooking] Wave 1: Alerting ${wave1Vendors.length} closest vendors (of ${sortedVendors.length} total)`);

      // Create BookingRequest entries for Wave 1 vendors
      const BookingRequest = require('../../models/BookingRequest');
      const bookingRequests = wave1Vendors.map(vendor => ({
        bookingId: booking._id,
        vendorId: vendor._id,
        status: 'PENDING',
        wave: 1,
        distance: vendor.distance || null,
        sentAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // Expires in 1 hour
      }));

      try {
        await BookingRequest.insertMany(bookingRequests, { ordered: false });
        console.log(`[CreateBooking] Created ${bookingRequests.length} BookingRequest entries`);
      } catch (err) {
        // Ignore duplicate key errors (if retrying)
        if (err.code !== 11000) console.error('[CreateBooking] BookingRequest insert error:', err);
      }
    } else {
      console.warn(`[CreateBooking] NO VENDORS FOUND nearby! Push notifications will not be sent.`);
    }

    // Send notifications to Wave 1 vendors ONLY
    const vendorNotifications = wave1Vendors.map(vendor =>
      createNotification({
        vendorId: vendor._id,
        type: 'booking_request',
        title: 'New Booking Request',
        message: `New service request for ${service.title} from ${user.name}`,
        relatedId: booking._id,
        relatedType: 'booking',
        data: {
          bookingId: booking._id,
          serviceName: service.title,
          customerName: user.name,
          customerPhone: user.phone,
          scheduledDate: scheduledDate,
          scheduledTime: scheduledTime,
          location: address,
          price: finalAmount,
          distance: vendor.distance // Distance in km
        },
        // Ensure proper push notification style for booking request
        pushData: {
          type: 'new_booking', // Triggers "Accept/Reject" buttons in SW
          dataOnly: false,
          link: `/vendor/bookings/${booking._id}`
        }
      })
    );

    await Promise.all(vendorNotifications);

    // Emit Socket.IO event to Wave 1 vendors for real-time notification with sound
    const io = req.app.get('io');
    if (io) {
      console.log('Socket.IO instance found, emitting Wave 1 events...');
      wave1Vendors.forEach(vendor => {
        console.log(`[Wave 1] Emitting to vendor_${vendor._id} (dist: ${vendor.distance?.toFixed(1)}km)`);
        io.to(`vendor_${vendor._id}`).emit('new_booking_request', {
          bookingId: booking._id,
          serviceName: service.title,
          customerName: user.name,
          customerPhone: user.phone,
          scheduledDate: scheduledDate,
          scheduledTime: scheduledTime,
          price: finalAmount,
          distance: vendor.distance,
          playSound: true, // Trigger sound alert
          message: `New booking request within ${vendor.distance?.toFixed(1) || '?'}km!`
        });
      });
    } else {
      console.error('CRITICAL: Socket.IO instance NOT found on req.app!');
    }

    // Populate booking details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name phone email')
      .populate('serviceId', 'title iconUrl')
      .populate('categoryId', 'title slug');

    // NOTIFY USER: Send actionable notification so they can track status

    // Send notification to user
    await createNotification({
      userId,
      type: 'booking_requested',
      title: 'Booking Created',
      message: `Your booking ${booking.bookingNumber} has been created successfully.`,
      relatedId: booking._id,
      relatedType: 'booking',
      pushData: {
        type: 'booking_requested',
        bookingId: booking._id.toString(),
        link: `/user/booking/${booking._id}`
        // dataOnly: true // Removed to ensure User sees the visual notification
      }
    });

    // Send notification to vendor only if assigned (Direct Booking)
    if (vendorId) {
      await createNotification({
        vendorId,
        type: 'booking_created',
        title: 'New Booking Received',
        message: `You have received a new booking ${booking.bookingNumber} for ${service.title}.`,
        relatedId: booking._id,
        relatedType: 'booking'
      });
    }

    // Clear booked items from user's cart
    try {
      if (bookedItems && bookedItems.length > 0) {
        const userCart = await Cart.findOne({ userId });
        if (userCart && userCart.items.length > 0) {
          console.log(`[CreateBooking] Clearing ${bookedItems.length} booked items from cart...`);

          // Identify items to remove by title
          const bookedTitles = new Set(bookedItems.map(item => item.card?.title || item.title));

          const originalCount = userCart.items.length;
          userCart.items = userCart.items.filter(item => {
            const itemTitle = item.title;
            const itemCardTitle = item.card?.title;
            // Remove if title matches
            const shouldRemove = bookedTitles.has(itemTitle) || (itemCardTitle && bookedTitles.has(itemCardTitle));
            return !shouldRemove;
          });

          if (userCart.items.length < originalCount) {
            await userCart.save();
            console.log(`[CreateBooking] Removed ${originalCount - userCart.items.length} items from cart. Remaining: ${userCart.items.length}`);
          }
        }
      } else if (serviceId) {
        // Fallback: if no bookedItems passed, check if this service is in cart and remove it.
        const userCart = await Cart.findOne({ userId });
        if (userCart) {
          const originalCount = userCart.items.length;
          userCart.items = userCart.items.filter(item => {
            // Check if item.serviceId matches the booked serviceId
            if (item.serviceId && item.serviceId.toString() === serviceId.toString()) return false;
            return true;
          });

          if (userCart.items.length < originalCount) {
            await userCart.save();
            console.log(`[CreateBooking] Removed service ${serviceId} from cart.`);
          }
        }
      }
    } catch (cartError) {
      console.error('[CreateBooking] Failed to clear cart items:', cartError);
      // specific error shouldn't fail the booking response
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking. Please try again.'
    });
  }
};

/**
 * Get user bookings with filters
 */
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { userId };
    if (status) {
      if (status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    } else {
      // Default: Fetch all, including SEARCHING. Frontend will filter for active.
    }
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get bookings
    const bookings = await Booking.find(query)
      .populate('vendorId', 'name businessName phone profilePhoto')
      .populate('serviceId', 'title iconUrl')
      .populate('categoryId', 'title slug')
      .populate('workerId', 'name phone profilePhoto')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings. Please try again.'
    });
  }
};

/**
 * Get booking details by ID
 */
const getBookingById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const booking = await Booking.findOne({ _id: id, userId })
      .select('+visitOtp +paymentOtp') // Include secure OTPs for the user
      .populate('userId', 'name phone email')
      .populate('vendorId', 'name businessName phone email address profilePhoto')
      .populate('serviceId', 'title description iconUrl images')
      .populate('categoryId', 'title slug')
      .populate('workerId', 'name phone rating totalJobs location profilePhoto');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking. Please try again.'
    });
  }
};

/**
 * Cancel booking
 */
const cancelBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const booking = await Booking.findOne({ _id: id, userId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be cancelled
    if (booking.status === BOOKING_STATUS.CANCELLED) {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === BOOKING_STATUS.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    // --- REFUND & CANCELLATION FEE LOGIC ---
    let refundAmount = 0;
    let cancellationFee = 0;
    let refundMessage = '';

    const hasStartedJourney = !!booking.journeyStartedAt;
    const isPaid = booking.paymentStatus === PAYMENT_STATUS.SUCCESS;
    const isWalletOrOnline = ['wallet', 'razorpay', 'upi', 'card'].includes(booking.paymentMethod);
    const isCash = booking.paymentMethod === 'cash';

    if (hasStartedJourney) {
      // SCENARIO: Worker/Vendor already started journey
      // Policy: Charge convenience fee (visitingCharges)
      cancellationFee = booking.visitingCharges || 49;

      if (isPaid && isWalletOrOnline) {
        // User paid upfront -> Refund (Total - Fee)
        refundAmount = Math.max(0, booking.finalAmount - cancellationFee);
        refundMessage = `Booking cancelled after journey start. Refund of ₹${refundAmount} initiated (Cancellation Fee: ₹${cancellationFee} deducted).`;
      } else {
        // User hasn't paid (e.g. COD or pending) -> Charge Fee from Wallet (allow negative)
        // No refund, but debt created (or deducted if balance exists)
        refundAmount = 0;
        refundMessage = `Booking cancelled after journey start. Cancellation fee of ₹${cancellationFee} charged to your wallet.`;

        // We need to charge this fee.
        // We will handle wallet debit below.
      }
    } else {
      // SCENARIO: Cancelled before journey start
      // Policy: Full Refund
      cancellationFee = 0;

      if (isPaid && isWalletOrOnline) {
        refundAmount = booking.finalAmount;
        refundMessage = `Booking cancelled successfully. Full refund of ₹${refundAmount} initiated to your wallet.`;
      } else {
        refundAmount = 0;
        refundMessage = 'Booking cancelled successfully.';
      }
    }

    // Update User Wallet
    if (refundAmount > 0 || cancellationFee > 0) {
      const User = require('../../models/User');
      const Transaction = require('../../models/Transaction');

      const user = await User.findById(userId);

      // 1. Process Refund
      if (refundAmount > 0) {
        user.wallet.balance = (user.wallet.balance || 0) + refundAmount;

        await Transaction.create({
          userId: user._id,
          type: 'refund',
          amount: refundAmount,
          status: 'completed',
          paymentMethod: 'wallet',
          description: `Refund for booking #${booking.bookingNumber}`,
          bookingId: booking._id,
          balanceAfter: user.wallet.balance
        });

        booking.paymentStatus = PAYMENT_STATUS.REFUNDED;
      }

      // 2. Process Cancellation Fee (Debit)
      // Only debit if it wasn't already deducted from the refund (i.e., case where user hasn't paid yet)
      if (cancellationFee > 0 && !isPaid) {
        user.wallet.balance = (user.wallet.balance || 0) - cancellationFee;

        await Transaction.create({
          userId: user._id,
          type: 'debit',
          amount: cancellationFee,
          status: 'completed',
          paymentMethod: 'wallet',
          description: `Cancellation fee for booking #${booking.bookingNumber}`,
          bookingId: booking._id,
          balanceAfter: user.wallet.balance
        });
      }

      await user.save();
    }

    // Update booking status
    booking.status = BOOKING_STATUS.CANCELLED;
    booking.cancelledAt = new Date();
    booking.cancelledBy = 'user';
    booking.cancellationReason = cancellationReason || 'Cancelled by user';

    await booking.save();

    // Send notification to user
    await createNotification({
      userId,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: refundMessage || `Your booking ${booking.bookingNumber} has been cancelled.`,
      relatedId: booking._id,
      relatedType: 'booking',
      pushData: {
        type: 'booking_cancelled',
        bookingId: booking._id.toString(),
        link: `/user/booking/${booking._id}`
      }
    });

    // Manual FCM push removed (handled by createNotification)

    // Send notification to vendor
    if (booking.vendorId) {
      await createNotification({
        vendorId: booking.vendorId,
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: `Booking ${booking.bookingNumber} has been cancelled by the customer.`,
        relatedId: booking._id,
        relatedType: 'booking',
        pushData: {
          type: 'booking_cancelled',
          bookingId: booking._id.toString(),
          link: `/vendor/bookings/${booking._id}`
        }
      });
      // Manual FCM push removed
    }

    // Notify worker if assigned
    if (booking.workerId) {
      await createNotification({
        workerId: booking.workerId,
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: `Job ${booking.bookingNumber} has been cancelled by the customer.`,
        relatedId: booking._id,
        relatedType: 'booking',
        pushData: {
          type: 'job_cancelled',
          bookingId: booking._id.toString(),
          link: `/worker/job/${booking._id}`
        }
      });
      // Manual FCM push removed
    }

    res.status(200).json({
      success: true,
      message: refundMessage || 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking. Please try again.'
    });
  }
};

/**
 * Reschedule booking
 */
const rescheduleBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { id } = req.params;
    const { scheduledDate, scheduledTime, timeSlot } = req.body;

    const booking = await Booking.findOne({ _id: id, userId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be rescheduled
    if (booking.status === BOOKING_STATUS.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule completed booking'
      });
    }

    if (booking.status === BOOKING_STATUS.CANCELLED) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule cancelled booking'
      });
    }

    // Update booking
    booking.scheduledDate = new Date(scheduledDate);
    booking.scheduledTime = scheduledTime;
    booking.timeSlot = {
      start: timeSlot.start,
      end: timeSlot.end
    };

    // Reset status to pending if it was confirmed
    if (booking.status === BOOKING_STATUS.CONFIRMED) {
      booking.status = BOOKING_STATUS.PENDING;
    }

    await booking.save();

    // Send notification to vendor
    await createNotification({
      vendorId: booking.vendorId,
      type: 'booking_created', // Keeping type as is for now
      title: 'Booking Rescheduled',
      message: `Booking ${booking.bookingNumber} has been rescheduled.`,
      relatedId: booking._id,
      relatedType: 'booking',
      pushData: {
        type: 'booking_rescheduled',
        bookingId: booking._id.toString(),
        link: `/vendor/bookings/${booking._id}`
      }
    });

    res.status(200).json({
      success: true,
      message: 'Booking rescheduled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Reschedule booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule booking. Please try again.'
    });
  }
};

/**
 * Add review and rating after completion
 */
const addReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { id } = req.params;
    const { rating, review, reviewImages } = req.body;

    const booking = await Booking.findOne({ _id: id, userId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking is completed or work is done
    if (booking.status !== BOOKING_STATUS.COMPLETED && booking.status !== BOOKING_STATUS.WORK_DONE) {
      return res.status(400).json({
        success: false,
        message: 'Can only review bookings after work is done'
      });
    }

    // Check if already reviewed
    if (booking.rating) {
      return res.status(400).json({
        success: false,
        message: 'Booking already reviewed'
      });
    }

    // Update booking
    booking.rating = rating;
    booking.review = review || null;
    booking.reviewImages = reviewImages || [];
    booking.reviewedAt = new Date();

    await booking.save();

    // Create a new Review document for the Review model (used by Admin)
    try {
      await Review.create({
        bookingId: booking._id,
        userId: booking.userId,
        serviceId: booking.serviceId,
        vendorId: booking.vendorId,
        workerId: booking.workerId,
        rating: rating,
        review: review || '',
        images: reviewImages || [],
        status: 'active'
      });
    } catch (reviewErr) {
      console.error('Error creating separate review document:', reviewErr);
      // We don't fail the request if the separate review creation fails
    }

    // Helper to update cumulative rating on Model
    const updateCumulativeRating = async (Model, docId, newRating) => {
      try {
        const doc = await Model.findById(docId);
        if (!doc) return;

        const oldTotal = doc.totalReviews || 0;
        const oldRating = doc.rating || 0;

        const newTotal = oldTotal + 1;
        const updatedRating = ((oldRating * oldTotal) + newRating) / newTotal;

        doc.rating = Number(updatedRating.toFixed(2));
        doc.totalReviews = newTotal;
        await doc.save();
      } catch (err) {
        console.error(`Error updating rating for ${Model.modelName}:`, err);
      }
    };

    // Update Vendor Rating (Always)
    if (booking.vendorId) {
      await updateCumulativeRating(Vendor, booking.vendorId, rating);
    }

    // Update Worker Rating (Only if worker was assigned)
    if (booking.workerId) {
      await updateCumulativeRating(Worker, booking.workerId, rating);
    }

    // Send notification to vendor
    await createNotification({
      vendorId: booking.vendorId,
      type: 'review_submitted',
      title: 'New Review Received',
      message: `You have received a ${rating}-star review for booking ${booking.bookingNumber}.`,
      relatedId: booking._id,
      relatedType: 'booking'
    });

    res.status(200).json({
      success: true,
      message: 'Review added successfully',
      data: booking
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review. Please try again.'
    });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  rescheduleBooking,
  addReview
};

