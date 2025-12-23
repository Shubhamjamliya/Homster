const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../../middleware/authMiddleware');
const { isVendor } = require('../../middleware/roleMiddleware');
const {
  getWalletBalance,
  getEarnings,
  requestPayout,
  getTransactionHistory
} = require('../../controllers/vendorControllers/vendorWalletController');

// Validation rules
const payoutValidation = [
  body('amount').isFloat({ min: 100 }).withMessage('Minimum payout amount is ₹100')
];

// Routes
router.get('/balance', authenticate, isVendor, getWalletBalance);
router.get('/earnings', authenticate, isVendor, getEarnings);
router.post('/payout', authenticate, isVendor, payoutValidation, requestPayout);
router.get('/transactions', authenticate, isVendor, getTransactionHistory);

module.exports = router;
