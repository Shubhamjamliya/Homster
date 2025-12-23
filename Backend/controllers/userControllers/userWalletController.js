const User = require('../../models/User');
const { validationResult } = require('express-validator');
const { createOrder } = require('../../services/razorpayService');

/**
 * Get wallet balance
 */
const getWalletBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('wallet');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        balance: user.wallet.balance || 0
      }
    });
  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet balance. Please try again.'
    });
  }
};

/**
 * Add money to wallet
 */
const addMoneyToWallet = async (req, res) => {
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
    const { amount } = req.body;

    // Validate amount
    if (amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum amount to add is ₹100'
      });
    }

    // Create Razorpay order for wallet top-up
    const orderResult = await createOrder(
      amount,
      'INR',
      `WALLET_${userId}_${Date.now()}`,
      {
        userId: userId.toString(),
        type: 'wallet_topup'
      }
    );

    if (!orderResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId: orderResult.orderId,
        amount: orderResult.amount / 100,
        currency: orderResult.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Add money to wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order. Please try again.'
    });
  }
};

/**
 * Verify wallet top-up payment
 */
const verifyWalletTopup = async (req, res) => {
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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount
    } = req.body;

    // Verify signature
    const { verifyPayment } = require('../../services/razorpayService');
    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add money to wallet
    user.wallet.balance = (user.wallet.balance || 0) + amount;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Money added to wallet successfully',
      data: {
        balance: user.wallet.balance
      }
    });
  } catch (error) {
    console.error('Verify wallet topup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add money to wallet. Please try again.'
    });
  }
};

/**
 * Get wallet transaction history
 */
const getWalletTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    // TODO: Create WalletTransaction model for detailed transaction history
    // For now, return booking-related transactions from Booking model

    const Booking = require('../../models/Booking');
    const { PAYMENT_STATUS } = require('../../utils/constants');

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get bookings with wallet payments
    const bookings = await Booking.find({
      userId,
      paymentMethod: 'wallet',
      paymentStatus: PAYMENT_STATUS.SUCCESS
    })
      .select('bookingNumber finalAmount createdAt paymentMethod')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Booking.countDocuments({
      userId,
      paymentMethod: 'wallet',
      paymentStatus: PAYMENT_STATUS.SUCCESS
    });

    // Format transactions
    const transactions = bookings.map(booking => ({
      id: booking._id,
      type: 'debit',
      amount: booking.finalAmount,
      description: `Payment for booking ${booking.bookingNumber}`,
      date: booking.createdAt
    }));

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get wallet transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction history. Please try again.'
    });
  }
};

module.exports = {
  getWalletBalance,
  addMoneyToWallet,
  verifyWalletTopup,
  getWalletTransactions
};

