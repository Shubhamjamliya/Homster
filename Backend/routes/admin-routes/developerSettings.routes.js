const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const {
  requireSuperAdmin,
  clearBookingActivity
} = require('../../controllers/adminControllers/developerSettingsController');

router.delete(
  '/developer/reset-booking-activity',
  authenticate,
  requireSuperAdmin,
  clearBookingActivity
);

module.exports = router;
