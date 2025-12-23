const Booking = require('../../models/Booking');
const { validationResult } = require('express-validator');
const { BOOKING_STATUS } = require('../../utils/constants');

/**
 * Get assigned jobs for worker
 */
const getAssignedJobs = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { workerId };
    if (status) {
      query.status = status;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get bookings
    const bookings = await Booking.find(query)
      .populate('userId', 'name phone email')
      .populate('vendorId', 'name businessName phone')
      .populate('serviceId', 'title iconUrl')
      .populate('categoryId', 'title slug')
      .sort({ scheduledDate: 1, createdAt: -1 })
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
    console.error('Get assigned jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs. Please try again.'
    });
  }
};

/**
 * Get job details by ID
 */
const getJobById = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;

    const booking = await Booking.findOne({ _id: id, workerId })
      .populate('userId', 'name phone email')
      .populate('vendorId', 'name businessName phone email address')
      .populate('serviceId', 'title description iconUrl images')
      .populate('categoryId', 'title slug');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job. Please try again.'
    });
  }
};

/**
 * Update job status
 */
const updateJobStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const workerId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findOne({ _id: id, workerId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Validate status transition
    const validTransitions = {
      [BOOKING_STATUS.CONFIRMED]: [BOOKING_STATUS.IN_PROGRESS],
      [BOOKING_STATUS.IN_PROGRESS]: [BOOKING_STATUS.COMPLETED]
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

    res.status(200).json({
      success: true,
      message: 'Job status updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job status. Please try again.'
    });
  }
};

/**
 * Mark job as started
 */
const startJob = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;

    const booking = await Booking.findOne({ _id: id, workerId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (booking.status !== BOOKING_STATUS.CONFIRMED && booking.status !== BOOKING_STATUS.IN_PROGRESS) {
      return res.status(400).json({
        success: false,
        message: `Cannot start job with status: ${booking.status}`
      });
    }

    // Update booking
    booking.status = BOOKING_STATUS.IN_PROGRESS;
    booking.startedAt = new Date();

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Job started successfully',
      data: booking
    });
  } catch (error) {
    console.error('Start job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start job. Please try again.'
    });
  }
};

/**
 * Mark job as completed
 */
const completeJob = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;

    const booking = await Booking.findOne({ _id: id, workerId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (booking.status !== BOOKING_STATUS.IN_PROGRESS) {
      return res.status(400).json({
        success: false,
        message: `Cannot complete job with status: ${booking.status}`
      });
    }

    // Update booking
    booking.status = BOOKING_STATUS.COMPLETED;
    booking.completedAt = new Date();

    await booking.save();

    // TODO: Update worker stats (totalJobs, completedJobs)

    res.status(200).json({
      success: true,
      message: 'Job completed successfully',
      data: booking
    });
  } catch (error) {
    console.error('Complete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete job. Please try again.'
    });
  }
};

/**
 * Add worker notes to booking
 */
const addWorkerNotes = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const workerId = req.user.id;
    const { id } = req.params;
    const { notes } = req.body;

    const booking = await Booking.findOne({ _id: id, workerId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Update booking
    booking.workerNotes = notes;

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Notes added successfully',
      data: booking
    });
  } catch (error) {
    console.error('Add worker notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add notes. Please try again.'
    });
  }
};

module.exports = {
  getAssignedJobs,
  getJobById,
  updateJobStatus,
  startJob,
  completeJob,
  addWorkerNotes
};

