const Booking = require('../../models/Booking');
const Service = require('../../models/Service');
const User = require('../../models/User');
const { validationResult } = require('express-validator');
const { BOOKING_STATUS, PAYMENT_STATUS } = require('../../utils/constants');
const { createNotification } = require('../notificationControllers/notificationController');

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
      amount  // Accept amount from frontend
    } = req.body;

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

    // Calculate pricing - use amount from frontend if provided, otherwise calculate
    let basePrice, discount, tax, finalAmount;

    if (amount && amount > 0) {
      // Use amount from frontend (from cart total)
      finalAmount = amount;
      basePrice = Math.round(amount / 1.18); // Reverse calculate base from final (assuming 18% tax)
      tax = amount - basePrice;
      discount = 0;
    } else {
      // Fallback to service pricing
      basePrice = service.basePrice || 500; // Default minimum ₹500
      discount = service.discountPrice ? (basePrice - service.discountPrice) : 0;
      tax = Math.round(basePrice * 0.18); // 18% GST
      finalAmount = basePrice - discount + tax;
    }

    // Ensure minimum amount for Razorpay (₹1)
    if (finalAmount < 1) {
      finalAmount = 1;
    }

    // Get category for the service
    const categoryId = service.categoryId || service.categoryIds?.[0];
    const category = categoryId ? await Service.findById(categoryId) : null;

    // Create booking with REQUESTED status (no vendor assigned yet)
    const bookingNumber = `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
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
      basePrice,
      discount,
      tax,
      finalAmount,
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
      userNotes: userNotes || null,
      paymentMethod: paymentMethod || null,
      status: BOOKING_STATUS.SEARCHING, // Initial search phase (hidden from user until payment/confirmed)
      paymentStatus: PAYMENT_STATUS.PENDING
    });

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

    // Find vendors within 10km radius
    const nearbyVendors = await findNearbyVendors(bookingLocation, 10);
    console.log(`Found ${nearbyVendors.length} nearby vendors for booking ${booking._id}`);

    // Send notifications to nearby vendors
    const vendorNotifications = nearbyVendors.map(vendor =>
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
        }
      })
    );

    await Promise.all(vendorNotifications);

    // Emit Socket.IO event to nearby vendors for real-time notification with sound
    const io = req.app.get('io');
    if (io) {
      console.log('Socket.IO instance found, emitting events...');
      nearbyVendors.forEach(vendor => {
        console.log(`Emitting new_booking_request to vendor_${vendor._id} (dist: ${vendor.distance})`);
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
          message: `New booking request within ${vendor.distance.toFixed(1)}km!`
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

    // NOTIFICATION SUPPRESSED: Don't notify user until booking is confirmed/paid
    /*
    await createNotification({
      userId,
      type: 'booking_requested',
      title: 'Booking Created',
      message: `Your booking ${booking.bookingNumber} has been created successfully.`,
      relatedId: booking._id,
      relatedType: 'booking'
    });
    */

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
      query.status = status;
    } else {
      // By default, exclude 'searching' bookings (which are not yet paid/confirmed)
      query.status = { $ne: BOOKING_STATUS.SEARCHING };
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
      .populate('vendorId', 'name businessName phone')
      .populate('serviceId', 'title iconUrl')
      .populate('categoryId', 'title slug')
      .populate('workerId', 'name phone')
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
      .populate('userId', 'name phone email')
      .populate('vendorId', 'name businessName phone email address')
      .populate('serviceId', 'title description iconUrl images')
      .populate('categoryId', 'title slug')
      .populate('workerId', 'name phone rating totalJobs location');

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

    // Update booking
    booking.status = BOOKING_STATUS.CANCELLED;
    booking.cancelledAt = new Date();
    booking.cancelledBy = 'user';
    booking.cancellationReason = cancellationReason || 'Cancelled by user';

    // If payment was successful, initiate refund
    if (booking.paymentStatus === PAYMENT_STATUS.SUCCESS) {
      booking.paymentStatus = PAYMENT_STATUS.REFUNDED;
      // TODO: Process refund through payment gateway
    }

    await booking.save();

    // Send notification to user
    await createNotification({
      userId,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Your booking ${booking.bookingNumber} has been cancelled.`,
      relatedId: booking._id,
      relatedType: 'booking'
    });

    // Send notification to vendor
    await createNotification({
      vendorId: booking.vendorId,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Booking ${booking.bookingNumber} has been cancelled by the customer.`,
      relatedId: booking._id,
      relatedType: 'booking'
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
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
      type: 'booking_created',
      title: 'Booking Rescheduled',
      message: `Booking ${booking.bookingNumber} has been rescheduled.`,
      relatedId: booking._id,
      relatedType: 'booking'
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

    // Check if booking is completed
    if (booking.status !== BOOKING_STATUS.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
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

    // TODO: Update service/worker/vendor ratings

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

