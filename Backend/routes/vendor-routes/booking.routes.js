const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../../middleware/authMiddleware');
const { isVendor } = require('../../middleware/roleMiddleware');
const {
  getVendorBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
  assignWorker,
  updateBookingStatus,
  addVendorNotes
} = require('../../controllers/bookingControllers/vendorBookingController');

// Validation rules
const rejectBookingValidation = [
  body('reason').optional().trim()
];

const assignWorkerValidation = [
  body('workerId').isMongoId().withMessage('Valid worker ID is required')
];

const updateStatusValidation = [
  body('status').isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'])
    .withMessage('Invalid status')
];

const addNotesValidation = [
  body('notes').trim().notEmpty().withMessage('Notes are required')
];

// Routes
// Routes
router.get('/', authenticate, isVendor, getVendorBookings);
router.get('/:id', authenticate, isVendor, getBookingById);
router.post('/:id/accept', authenticate, isVendor, acceptBooking);
router.post('/:id/reject', authenticate, isVendor, rejectBookingValidation, rejectBooking);
router.post('/:id/assign-worker', authenticate, isVendor, assignWorkerValidation, assignWorker);
router.put('/:id/status', authenticate, isVendor, updateStatusValidation, updateBookingStatus);
router.post('/:id/notes', authenticate, isVendor, addNotesValidation, addVendorNotes);

module.exports = router;

