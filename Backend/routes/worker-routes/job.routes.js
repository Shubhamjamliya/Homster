const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../../middleware/authMiddleware');
const { isWorker } = require('../../middleware/roleMiddleware');
const {
  getAssignedJobs,
  getJobById,
  updateJobStatus,
  startJob,
  completeJob,
  addWorkerNotes
} = require('../../controllers/bookingControllers/workerBookingController');

// Validation rules
const updateStatusValidation = [
  body('status').isIn(['in_progress', 'completed'])
    .withMessage('Invalid status')
];

const addNotesValidation = [
  body('notes').trim().notEmpty().withMessage('Notes are required')
];

// Routes
router.get('/jobs', authenticate, isWorker, getAssignedJobs);
router.get('/jobs/:id', authenticate, isWorker, getJobById);
router.put('/jobs/:id/status', authenticate, isWorker, updateStatusValidation, updateJobStatus);
router.post('/jobs/:id/start', authenticate, isWorker, startJob);
router.post('/jobs/:id/complete', authenticate, isWorker, completeJob);
router.post('/jobs/:id/notes', authenticate, isWorker, addNotesValidation, addWorkerNotes);

module.exports = router;

