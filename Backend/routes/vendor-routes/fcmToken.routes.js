/**
 * Vendor FCM Token Routes
 * Manages FCM tokens for push notifications
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { sendPushNotification } = require('../../services/firebaseAdmin');
const Vendor = require('../../models/Vendor');
const User = require('../../models/User');
const Worker = require('../../models/Worker');

const MAX_TOKENS = 10; // Maximum tokens per platform

/**
 * @route   POST /api/vendors/fcm-tokens/save
 * @desc    Save FCM token for vendor
 * @access  Private (Vendor)
 */
router.post('/save', authenticate, async (req, res) => {
  try {
    const { token, platform = 'web' } = req.body;
    const vendorId = req.user._id;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    // Add token based on platform
    if (platform === 'web') {
      if (!vendor.fcmTokens) vendor.fcmTokens = [];
      if (!vendor.fcmTokens.includes(token)) {
        vendor.fcmTokens.push(token);
        // Limit to MAX_TOKENS
        if (vendor.fcmTokens.length > MAX_TOKENS) {
          vendor.fcmTokens = vendor.fcmTokens.slice(-MAX_TOKENS);
        }
      }
    } else if (platform === 'mobile') {
      if (!vendor.fcmTokenMobile) vendor.fcmTokenMobile = [];
      if (!vendor.fcmTokenMobile.includes(token)) {
        vendor.fcmTokenMobile.push(token);
        if (vendor.fcmTokenMobile.length > MAX_TOKENS) {
          vendor.fcmTokenMobile = vendor.fcmTokenMobile.slice(-MAX_TOKENS);
        }
      }
    }

    await vendor.save();

    // Remove this token from User and Worker collections to prevent cross-account notifications
    try {
      await User.updateMany(
        { $or: [{ fcmTokens: token }, { fcmTokenMobile: token }] },
        { $pull: { fcmTokens: token, fcmTokenMobile: token } }
      );

      await Worker.updateMany(
        { $or: [{ fcmTokens: token }, { fcmTokenMobile: token }] },
        { $pull: { fcmTokens: token, fcmTokenMobile: token } }
      );
    } catch (cleanupError) {
      console.error('Error removing token from other collections:', cleanupError);
    }

    res.json({ success: true, message: 'FCM token saved successfully' });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ success: false, error: 'Failed to save FCM token' });
  }
});

/**
 * @route   DELETE /api/vendors/fcm-tokens/remove
 * @desc    Remove FCM token for vendor
 * @access  Private (Vendor)
 */
router.delete('/remove', authenticate, async (req, res) => {
  try {
    const { token, platform = 'web' } = req.body;
    const vendorId = req.user._id;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    // Remove token based on platform
    if (platform === 'web' && vendor.fcmTokens) {
      vendor.fcmTokens = vendor.fcmTokens.filter(t => t !== token);
    } else if (platform === 'mobile' && vendor.fcmTokenMobile) {
      vendor.fcmTokenMobile = vendor.fcmTokenMobile.filter(t => t !== token);
    }

    await vendor.save();

    res.json({ success: true, message: 'FCM token removed successfully' });
  } catch (error) {
    console.error('Error removing FCM token:', error);
    res.status(500).json({ success: false, error: 'Failed to remove FCM token' });
  }
});

/**
 * @route   POST /api/vendors/fcm-tokens/test
 * @desc    Send test notification to vendor (development only)
 * @access  Private (Vendor)
 */
router.post('/test', authenticate, async (req, res) => {
  try {
    const vendorId = req.user._id;
    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    const tokens = [...(vendor.fcmTokens || []), ...(vendor.fcmTokenMobile || [])];
    const uniqueTokens = [...new Set(tokens)];

    if (uniqueTokens.length === 0) {
      return res.json({ success: false, error: 'No FCM tokens found for vendor' });
    }

    const response = await sendPushNotification(uniqueTokens, {
      title: '🔔 Test Notification',
      body: 'This is a test notification for vendor!',
      data: {
        type: 'test',
        link: '/vendor/dashboard'
      }
    });

    res.json({
      success: true,
      message: 'Test notification sent',
      successCount: response.successCount,
      failureCount: response.failureCount
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
