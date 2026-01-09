/**
 * User FCM Token Routes
 * Manages FCM tokens for push notifications
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { sendPushNotification } = require('../../services/firebaseAdmin');
const User = require('../../models/User');

const MAX_TOKENS = 10; // Maximum tokens per platform

/**
 * @route   POST /api/users/fcm-tokens/save
 * @desc    Save FCM token for user
 * @access  Private
 */
router.post('/save', authenticate, async (req, res) => {
  try {
    const { token, platform = 'web' } = req.body;
    const userId = req.user._id;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Add token based on platform
    if (platform === 'web') {
      if (!user.fcmTokens) user.fcmTokens = [];
      if (!user.fcmTokens.includes(token)) {
        user.fcmTokens.push(token);
        // Limit to MAX_TOKENS
        if (user.fcmTokens.length > MAX_TOKENS) {
          user.fcmTokens = user.fcmTokens.slice(-MAX_TOKENS);
        }
      }
    } else if (platform === 'mobile') {
      if (!user.fcmTokenMobile) user.fcmTokenMobile = [];
      if (!user.fcmTokenMobile.includes(token)) {
        user.fcmTokenMobile.push(token);
        if (user.fcmTokenMobile.length > MAX_TOKENS) {
          user.fcmTokenMobile = user.fcmTokenMobile.slice(-MAX_TOKENS);
        }
      }
    }

    await user.save();

    res.json({ success: true, message: 'FCM token saved successfully' });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ success: false, error: 'Failed to save FCM token' });
  }
});

/**
 * @route   DELETE /api/users/fcm-tokens/remove
 * @desc    Remove FCM token for user
 * @access  Private
 */
router.delete('/remove', authenticate, async (req, res) => {
  try {
    const { token, platform = 'web' } = req.body;
    const userId = req.user._id;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Remove token based on platform
    if (platform === 'web' && user.fcmTokens) {
      user.fcmTokens = user.fcmTokens.filter(t => t !== token);
    } else if (platform === 'mobile' && user.fcmTokenMobile) {
      user.fcmTokenMobile = user.fcmTokenMobile.filter(t => t !== token);
    }

    await user.save();

    res.json({ success: true, message: 'FCM token removed successfully' });
  } catch (error) {
    console.error('Error removing FCM token:', error);
    res.status(500).json({ success: false, error: 'Failed to remove FCM token' });
  }
});

/**
 * @route   POST /api/users/fcm-tokens/test
 * @desc    Send test notification to user (development only)
 * @access  Private
 */
router.post('/test', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const tokens = [...(user.fcmTokens || []), ...(user.fcmTokenMobile || [])];
    const uniqueTokens = [...new Set(tokens)];

    if (uniqueTokens.length === 0) {
      return res.json({ success: false, error: 'No FCM tokens found for user' });
    }

    const response = await sendPushNotification(uniqueTokens, {
      title: '🔔 Test Notification',
      body: 'This is a test notification from Appzeto!',
      data: {
        type: 'test',
        link: '/'
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
