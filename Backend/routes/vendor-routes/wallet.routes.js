const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isVendor } = require('../../middleware/roleMiddleware');
const { getWallet, getTransactions, requestWithdrawal } = require('../../controllers/vendorControllers/vendorWalletController');

// Routes
router.get('/wallet', authenticate, isVendor, getWallet);
router.get('/transactions', authenticate, isVendor, getTransactions);
router.post('/withdraw', authenticate, isVendor, requestWithdrawal);

module.exports = router;
