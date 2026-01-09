/**
 * Worker FCM Token Routes
 * Manages FCM tokens for push notifications
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { sendPushNotification } = require('../../services/firebaseAdmin');
const Worker = require('../../models/Worker');

const MAX_TOKENS = 10; // Maximum tokens per platform

/**
 * @route   POST /api/workers/fcm-tokens/save
 * @desc    Save FCM token for worker
 * @access  Private (Worker)
 */
router.post('/save', authenticate, async (req, res) => {
  try {
    const { token, platform = 'web' } = req.body;
    const workerId = req.user._id;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }

    // Add token based on platform
    if (platform === 'web') {
      if (!worker.fcmTokens) worker.fcmTokens = [];
      if (!worker.fcmTokens.includes(token)) {
        worker.fcmTokens.push(token);
        // Limit to MAX_TOKENS
        if (worker.fcmTokens.length > MAX_TOKENS) {
          worker.fcmTokens = worker.fcmTokens.slice(-MAX_TOKENS);
        }
      }
    } else if (platform === 'mobile') {
      if (!worker.fcmTokenMobile) worker.fcmTokenMobile = [];
      if (!worker.fcmTokenMobile.includes(token)) {
        worker.fcmTokenMobile.push(token);
        if (worker.fcmTokenMobile.length > MAX_TOKENS) {
          worker.fcmTokenMobile = worker.fcmTokenMobile.slice(-MAX_TOKENS);
        }
      }
    }

    await worker.save();

    res.json({ success: true, message: 'FCM token saved successfully' });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ success: false, error: 'Failed to save FCM token' });
  }
});

/**
 * @route   DELETE /api/workers/fcm-tokens/remove
 * @desc    Remove FCM token for worker
 * @access  Private (Worker)
 */
router.delete('/remove', authenticate, async (req, res) => {
  try {
    const { token, platform = 'web' } = req.body;
    const workerId = req.user._id;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }

    // Remove token based on platform
    if (platform === 'web' && worker.fcmTokens) {
      worker.fcmTokens = worker.fcmTokens.filter(t => t !== token);
    } else if (platform === 'mobile' && worker.fcmTokenMobile) {
      worker.fcmTokenMobile = worker.fcmTokenMobile.filter(t => t !== token);
    }

    await worker.save();

    res.json({ success: true, message: 'FCM token removed successfully' });
  } catch (error) {
    console.error('Error removing FCM token:', error);
    res.status(500).json({ success: false, error: 'Failed to remove FCM token' });
  }
});

/**
 * @route   POST /api/workers/fcm-tokens/test
 * @desc    Send test notification to worker (development only)
 * @access  Private (Worker)
 */
router.post('/test', authenticate, async (req, res) => {
  try {
    const workerId = req.user._id;
    const worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }

    const tokens = [...(worker.fcmTokens || []), ...(worker.fcmTokenMobile || [])];
    const uniqueTokens = [...new Set(tokens)];

    if (uniqueTokens.length === 0) {
      return res.json({ success: false, error: 'No FCM tokens found for worker' });
    }

    const response = await sendPushNotification(uniqueTokens, {
      title: '🔔 Test Notification',
      body: 'This is a test notification for worker!',
      data: {
        type: 'test',
        link: '/worker/dashboard'
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
