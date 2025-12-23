const Booking = require('../../models/Booking');
const User = require('../../models/User');
const { validationResult } = require('express-validator');
const { PAYMENT_STATUS, BOOKING_STATUS } = require('../../utils/constants');
const { createOrder, verifyPayment, refundPayment } = require('../../services/razorpayService');
const { createNotification } = require('../notificationControllers/notificationController');

/**
 * Create Razorpay order for booking payment
 */
const createPaymentOrder = async (req, res) => {
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
    const { bookingId } = req.body;

    // Get booking
    const booking = await Booking.findOne({ _id: bookingId, userId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if payment already done
    if (booking.paymentStatus === PAYMENT_STATUS.SUCCESS) {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this booking'
      });
    }

    // Create Razorpay order
    console.log('Creating Razorpay order with amount:', booking.finalAmount);
    const orderResult = await createOrder(
      booking.finalAmount,
      'INR',
      booking.bookingNumber,
      {
        bookingId: booking._id.toString(),
        userId: userId.toString(),
        bookingNumber: booking.bookingNumber
      }
    );

    console.log('Razorpay order result:', orderResult);

    if (!orderResult.success) {
      console.error('Razorpay order creation failed:', orderResult.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
        error: orderResult.error || 'Unknown error'
      });
    }

    // Update booking with Razorpay order ID
    booking.razorpayOrderId = orderResult.orderId;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId: orderResult.orderId,
        amount: orderResult.amount / 100, // Convert back to rupees
        currency: orderResult.currency,
        key: process.env.RAZORPAY_KEY_ID,
        bookingId: booking._id
      }
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order. Please try again.',
      error: error.message
    });
  }
};

/**
 * Verify payment (webhook handler)
 */
const verifyPaymentWebhook = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Verify signature
    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Find booking by Razorpay order ID
    const booking = await Booking.findOne({ razorpayOrderId: razorpay_order_id });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update booking payment status
    booking.paymentStatus = PAYMENT_STATUS.SUCCESS;
    booking.paymentMethod = 'razorpay';
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.paymentId = razorpay_payment_id;

    // Update booking status to confirmed if it was pending or searching
    if (booking.status === BOOKING_STATUS.PENDING || booking.status === BOOKING_STATUS.SEARCHING) {
      booking.status = BOOKING_STATUS.CONFIRMED;
    }

    await booking.save();

    // Send notification to user
    await createNotification({
      userId: booking.userId,
      type: 'payment_success',
      title: 'Payment Successful',
      message: `Payment of ₹${booking.finalAmount} for booking ${booking.bookingNumber} was successful.`,
      relatedId: booking._id,
      relatedType: 'payment'
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
};

/**
 * Process wallet payment
 */
const processWalletPayment = async (req, res) => {
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
    const { bookingId } = req.body;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get booking
    const booking = await Booking.findOne({ _id: bookingId, userId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if payment already done
    if (booking.paymentStatus === PAYMENT_STATUS.SUCCESS) {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this booking'
      });
    }

    // Check wallet balance
    if (user.wallet.balance < booking.finalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }

    // Deduct from wallet
    user.wallet.balance -= booking.finalAmount;
    await user.save();

    // Update booking payment status
    booking.paymentStatus = PAYMENT_STATUS.SUCCESS;
    booking.paymentMethod = 'wallet';
    booking.paymentId = `WALLET_${Date.now()}`;

    // Update booking status to confirmed if it was pending or searching
    if (booking.status === BOOKING_STATUS.PENDING || booking.status === BOOKING_STATUS.SEARCHING) {
      booking.status = BOOKING_STATUS.CONFIRMED;
    }

    await booking.save();

    // Send notification to user
    await createNotification({
      userId,
      type: 'payment_success',
      title: 'Payment Successful',
      message: `Payment of ₹${booking.finalAmount} for booking ${booking.bookingNumber} was successful.`,
      relatedId: booking._id,
      relatedType: 'payment'
    });

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        bookingId: booking._id,
        amount: booking.finalAmount,
        remainingBalance: user.wallet.balance
      }
    });
  } catch (error) {
    console.error('Process wallet payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment. Please try again.'
    });
  }
};

/**
 * Process refund
 */
const processRefund = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { bookingId } = req.body;
    const { amount } = req.body; // Optional: partial refund

    // Get booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if payment was successful
    if (booking.paymentStatus !== PAYMENT_STATUS.SUCCESS) {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed for this booking'
      });
    }

    // Process refund based on payment method
    if (booking.paymentMethod === 'razorpay' && booking.razorpayPaymentId) {
      // Razorpay refund
      const refundResult = await refundPayment(
        booking.razorpayPaymentId,
        amount || booking.finalAmount,
        {
          bookingId: booking._id.toString(),
          reason: 'Booking cancellation'
        }
      );

      if (!refundResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to process refund'
        });
      }

      // Update booking payment status
      booking.paymentStatus = PAYMENT_STATUS.REFUNDED;
    } else if (booking.paymentMethod === 'wallet') {
      // Wallet refund - add back to user wallet
      const user = await User.findById(booking.userId);
      if (user) {
        user.wallet.balance += (amount || booking.finalAmount);
        await user.save();
      }

      // Update booking payment status
      booking.paymentStatus = PAYMENT_STATUS.REFUNDED;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Refund not supported for this payment method'
      });
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        bookingId: booking._id,
        refundAmount: amount || booking.finalAmount
      }
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund. Please try again.'
    });
  }
};

/**
 * Get payment history
 */
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get bookings with successful payments
    const bookings = await Booking.find({
      userId,
      paymentStatus: PAYMENT_STATUS.SUCCESS
    })
      .populate('serviceId', 'title iconUrl')
      .populate('vendorId', 'name businessName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Booking.countDocuments({
      userId,
      paymentStatus: PAYMENT_STATUS.SUCCESS
    });

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
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history. Please try again.'
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPaymentWebhook,
  processWalletPayment,
  processRefund,
  getPaymentHistory
};

