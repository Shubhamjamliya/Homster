const Booking = require('../../models/Booking');
const Worker = require('../../models/Worker');
const { validationResult } = require('express-validator');
const { BOOKING_STATUS } = require('../../utils/constants');
const { createNotification } = require('../notificationControllers/notificationController');

/**
 * Get vendor bookings with filters
 */
const getVendorBookings = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {
      $or: [
        { vendorId }, // Bookings assigned to this vendor
        { vendorId: null, status: { $in: [BOOKING_STATUS.REQUESTED, BOOKING_STATUS.SEARCHING] } } // Unassigned REQUESTED/SEARCHING bookings
      ]
    };
    if (status) {
      query.status = status;
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
      .populate('userId', 'name phone email')
      .populate('serviceId', 'title iconUrl')
      .populate('categoryId', 'title slug')
      .populate('workerId', 'name phone rating')
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
    console.error('Get vendor bookings error:', error);
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
    const vendorId = req.user.id;
    const { id } = req.params;

    const booking = await Booking.findOne({
      _id: id,
      $or: [
        { vendorId },
        { vendorId: null, status: { $in: ['requested', 'searching'] } }
      ]
    })
      .populate('userId', 'name phone email profilePhoto')
      .populate('vendorId', 'name businessName phone email')
      .populate('serviceId', 'title description iconUrl images')
      .populate('categoryId', 'title slug')
      .populate('workerId', 'name phone rating totalJobs completedJobs');

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
 * Accept booking
 */
const acceptBooking = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { id } = req.params;

    // Find booking by ID (don't filter by vendorId since it's not assigned yet)
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking is in REQUESTED or SEARCHING status
    if (booking.status !== BOOKING_STATUS.REQUESTED && booking.status !== BOOKING_STATUS.SEARCHING) {
      return res.status(400).json({
        success: false,
        message: `Cannot accept booking with status: ${booking.status}`
      });
    }

    // Check if another vendor already accepted this booking
    if (booking.vendorId && booking.vendorId.toString() !== vendorId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been accepted by another vendor'
      });
    }

    // Assign vendor and update booking status
    booking.vendorId = vendorId;
    booking.status = BOOKING_STATUS.PENDING; // Wait for payment
    booking.acceptedAt = new Date();

    await booking.save();

    // Emit real-time socket event to the user
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${booking.userId}`).emit('booking_accepted', {
        bookingId: booking._id,
        vendor: {
          id: vendorId,
          name: req.user.name, // Assuming req.user has name from auth middleware
          businessName: req.user.businessName // Assuming req.user has businessName
        }
      });
    }

    // Send notification to user
    await createNotification({
      userId: booking.userId,
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      message: `Your booking ${booking.bookingNumber} has been confirmed by the vendor.`,
      relatedId: booking._id,
      relatedType: 'booking'
    });

    res.status(200).json({
      success: true,
      message: 'Booking accepted successfully',
      data: booking
    });
  } catch (error) {
    console.error('Accept booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept booking. Please try again.'
    });
  }
};

/**
 * Reject booking
 */
const rejectBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const vendorId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findOne({ _id: id, vendorId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== BOOKING_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: `Cannot reject booking with status: ${booking.status}`
      });
    }

    // Update booking
    booking.status = BOOKING_STATUS.REJECTED;
    booking.cancelledAt = new Date();
    booking.cancelledBy = 'vendor';
    booking.cancellationReason = reason || 'Rejected by vendor';

    await booking.save();

    // Send notification to user
    await createNotification({
      userId: booking.userId,
      type: 'booking_rejected',
      title: 'Booking Rejected',
      message: `Your booking ${booking.bookingNumber} has been rejected by the vendor.`,
      relatedId: booking._id,
      relatedType: 'booking'
    });

    res.status(200).json({
      success: true,
      message: 'Booking rejected successfully',
      data: booking
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject booking. Please try again.'
    });
  }
};

/**
 * Assign worker to booking
 */
const assignWorker = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const vendorId = req.user.id;
    const { id } = req.params;
    const { workerId } = req.body;

    const booking = await Booking.findOne({ _id: id, vendorId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify worker belongs to vendor
    const worker = await Worker.findOne({ _id: workerId, vendorId });
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found or does not belong to your vendor account'
      });
    }

    // Check if worker is active
    const validStatuses = ['active', 'ONLINE', 'ACTIVE'];
    if (!validStatuses.includes(worker.status)) {
      // Also allow if status is undefined/null (legacy) but that shouldn't happen
      return res.status(400).json({
        success: false,
        message: `Worker is not active (Status: ${worker.status})`
      });
    }

    // Update booking
    booking.workerId = workerId;
    booking.assignedAt = new Date();

    // If booking was confirmed, update to in_progress when worker is assigned
    if (booking.status === BOOKING_STATUS.CONFIRMED) {
      booking.status = BOOKING_STATUS.IN_PROGRESS;
      booking.startedAt = new Date();
    }

    await booking.save();

    // Send notification to user
    await createNotification({
      userId: booking.userId,
      type: 'worker_assigned',
      title: 'Worker Assigned',
      message: `A worker has been assigned to your booking ${booking.bookingNumber}.`,
      relatedId: booking._id,
      relatedType: 'booking'
    });

    // Send notification to worker
    await createNotification({
      workerId,
      type: 'booking_created',
      title: 'New Job Assigned',
      message: `You have been assigned to booking ${booking.bookingNumber}.`,
      relatedId: booking._id,
      relatedType: 'booking'
    });

    res.status(200).json({
      success: true,
      message: 'Worker assigned successfully',
      data: booking
    });
  } catch (error) {
    console.error('Assign worker error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign worker. Please try again.'
    });
  }
};

/**
 * Update booking status
 */
const updateBookingStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const vendorId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findOne({ _id: id, vendorId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Validate status transition
    const validTransitions = {
      [BOOKING_STATUS.PENDING]: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.REJECTED],
      [BOOKING_STATUS.CONFIRMED]: [BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.CANCELLED],
      [BOOKING_STATUS.IN_PROGRESS]: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED]
    };

    if (!validTransitions[booking.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${booking.status} to ${status}`
      });
    }

    // Update booking
    booking.status = status;

    if (status === BOOKING_STATUS.IN_PROGRESS && !booking.startedAt) {
      booking.startedAt = new Date();
    }

    if (status === BOOKING_STATUS.COMPLETED) {
      booking.completedAt = new Date();
    }

    await booking.save();

    // Send notification based on status
    if (status === BOOKING_STATUS.COMPLETED) {
      await createNotification({
        userId: booking.userId,
        type: 'booking_completed',
        title: 'Booking Completed',
        message: `Your booking ${booking.bookingNumber} has been completed. Please rate your experience.`,
        relatedId: booking._id,
        relatedType: 'booking'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status. Please try again.'
    });
  }
};

/**
 * Add vendor notes to booking
 */
const addVendorNotes = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const vendorId = req.user.id;
    const { id } = req.params;
    const { notes } = req.body;

    const booking = await Booking.findOne({ _id: id, vendorId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update booking
    booking.vendorNotes = notes;

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Notes added successfully',
      data: booking
    });
  } catch (error) {
    console.error('Add vendor notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add notes. Please try again.'
    });
  }
};

module.exports = {
  getVendorBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
  assignWorker,
  updateBookingStatus,
  addVendorNotes
};

