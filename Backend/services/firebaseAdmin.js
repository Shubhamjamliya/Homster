/**
 * Firebase Admin Service
 * Handles push notification sending via Firebase Cloud Messaging (FCM)
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
// Initialize Firebase Admin SDK
let serviceAccount;

try {
  if (process.env.FIREBASE_CONFIG) {
    // Production: Use environment variable JSON content
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    // Alternative Env Var
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } else {
    // Local: Use file path
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './config/firebase-service-account.json';
    serviceAccount = require(path.resolve(__dirname, '..', serviceAccountPath));
  }
} catch (error) {
  console.error('❌ Failed to load Firebase credentials:', error.message);
}

// Initialize only if not already initialized
if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin SDK initialized');
}

/**
 * Send push notification to multiple tokens
 * @param {string[]} tokens - Array of FCM tokens
 * @param {Object} payload - Notification payload
 * @param {string} payload.title - Notification title
 * @param {string} payload.body - Notification body
 * @param {Object} payload.data - Additional data (optional)
 * @param {string} payload.icon - Notification icon (optional)
 * @param {boolean} payload.highPriority - Send as high priority (default: true)
 * @returns {Promise<Object>} - Response with success/failure counts
 */
async function sendPushNotification(tokens, payload) {
  try {
    if (!tokens || tokens.length === 0) {
      console.log('No FCM tokens provided');
      return { successCount: 0, failureCount: 0 };
    }

    // Remove duplicates and empty values
    const uniqueTokens = [...new Set(tokens.filter(t => t && t.trim()))];

    if (uniqueTokens.length === 0) {
      console.log('No valid FCM tokens after filtering');
      return { successCount: 0, failureCount: 0 };
    }

    // Ensure data values are strings (FCM requirement)
    const stringData = {};
    if (payload.data) {
      Object.keys(payload.data).forEach(key => {
        stringData[key] = String(payload.data[key]);
      });
    }

    const message = {
      data: stringData,
      tokens: uniqueTokens,
      // Android specific configuration for high priority
      android: {
        priority: 'high', // HIGH priority for immediate delivery
        notification: {
          sound: 'default',
          priority: 'high',
          defaultSound: true,
          defaultVibrateTimings: true,
          channelId: 'high_priority_channel', // High priority channel
          vibrateTimingsMillis: [0, 500, 200, 500], // Custom vibration pattern
          visibility: 'public',
          notificationCount: 1
        }
      },
      // iOS/APNs specific configuration
      apns: {
        headers: {
          'apns-priority': '10', // Highest priority for immediate delivery
          'apns-push-type': 'alert'
        },
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            'content-available': 1, // Wake up app in background
            'mutable-content': 1
          }
        }
      },
      // Web push configuration
      webpush: {
        headers: {
          Urgency: 'high',
          TTL: '86400' // 24 hours
        },
        notification: {
          icon: payload.icon || '/Homster-logo.png',
          badge: '/Homster-logo.png',
          requireInteraction: payload.highPriority !== false,
          vibrate: [500, 200, 500]
        },
        fcmOptions: {
          link: payload.data?.link || '/'
        }
      }
    };

    // Only add notification block if NOT data-only
    if (!payload.dataOnly) {
      message.notification = {
        title: payload.title,
        body: payload.body,
      };
      // Add icon if provided
      if (payload.icon) {
        message.notification.image = payload.icon;
      }
    } else {
      console.log('[FCM] Sending DATA-ONLY notification (Custom UI):', payload.title);
      // For data-only, ensure critical fields are in data
      message.data.title = payload.title;
      message.data.body = payload.body;
      if (payload.icon) message.data.icon = payload.icon;
    }

    // message.notification.image handled above

    const response = await admin.messaging().sendEachForMulticast(message);

    console.log(`✅ Push notification sent - Success: ${response.successCount}, Failed: ${response.failureCount}`);

    // Log failed tokens for debugging
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.log(`❌ Failed token[${idx}]: ${resp.error?.code} - ${resp.error?.message}`);
        }
      });
    }

    return response;
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    throw error;
  }
}

/**
 * Send notification to a specific user
 * @param {string} userId - User's MongoDB _id
 * @param {Object} payload - Notification payload
 * @param {boolean} includeMobile - Include mobile tokens (default: true)
 */
async function sendNotificationToUser(userId, payload, includeMobile = true) {
  try {
    const User = require('../models/User');
    const user = await User.findById(userId);

    if (!user) {
      console.log(`User not found: ${userId}`);
      return;
    }

    let tokens = [];
    if (user.fcmTokens && user.fcmTokens.length > 0) {
      tokens = [...tokens, ...user.fcmTokens];
    }
    if (includeMobile && user.fcmTokenMobile && user.fcmTokenMobile.length > 0) {
      tokens = [...tokens, ...user.fcmTokenMobile];
    }

    if (tokens.length === 0) {
      console.log(`No FCM tokens found for user: ${userId}`);
      return;
    }

    await sendPushNotification(tokens, payload);
  } catch (error) {
    console.error(`Error sending notification to user ${userId}:`, error);
    // Don't throw - notifications are non-critical
  }
}

/**
 * Send notification to a specific vendor
 * @param {string} vendorId - Vendor's MongoDB _id
 * @param {Object} payload - Notification payload
 * @param {boolean} includeMobile - Include mobile tokens (default: true)
 */
async function sendNotificationToVendor(vendorId, payload, includeMobile = true) {
  try {
    const Vendor = require('../models/Vendor');
    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      console.log(`Vendor not found: ${vendorId}`);
      return;
    }

    let tokens = [];
    if (vendor.fcmTokens && vendor.fcmTokens.length > 0) {
      tokens = [...tokens, ...vendor.fcmTokens];
    }
    if (includeMobile && vendor.fcmTokenMobile && vendor.fcmTokenMobile.length > 0) {
      tokens = [...tokens, ...vendor.fcmTokenMobile];
    }

    if (tokens.length === 0) {
      console.log(`No FCM tokens found for vendor: ${vendorId}`);
      return;
    }

    await sendPushNotification(tokens, payload);
  } catch (error) {
    console.error(`Error sending notification to vendor ${vendorId}:`, error);
  }
}

/**
 * Send notification to a specific worker
 * @param {string} workerId - Worker's MongoDB _id
 * @param {Object} payload - Notification payload
 * @param {boolean} includeMobile - Include mobile tokens (default: true)
 */
async function sendNotificationToWorker(workerId, payload, includeMobile = true) {
  try {
    const Worker = require('../models/Worker');
    const worker = await Worker.findById(workerId);

    if (!worker) {
      console.log(`Worker not found: ${workerId}`);
      return;
    }

    let tokens = [];
    if (worker.fcmTokens && worker.fcmTokens.length > 0) {
      tokens = [...tokens, ...worker.fcmTokens];
    }
    if (includeMobile && worker.fcmTokenMobile && worker.fcmTokenMobile.length > 0) {
      tokens = [...tokens, ...worker.fcmTokenMobile];
    }

    if (tokens.length === 0) {
      console.log(`No FCM tokens found for worker: ${workerId}`);
      return;
    }

  } catch (error) {
    console.error(`Error sending notification to worker ${workerId}:`, error);
  }
}

/**
 * Send notification to a specific admin
 * @param {string} adminId - Admin's MongoDB _id
 * @param {Object} payload - Notification payload
 * @param {boolean} includeMobile - Include mobile tokens (default: true)
 */
async function sendNotificationToAdmin(adminId, payload, includeMobile = true) {
  try {
    const User = require('../models/User'); // Use User model for admin too as they share collection or separate Admin model?

    let adminUser = null;
    try {
      const Admin = require('../models/Admin');
      adminUser = await Admin.findById(adminId);
    } catch (e) {
      // If Admin model doesn't exist, try User model with role check?
      // Or maybe adminId refers to a User document.
      const User = require('../models/User');
      adminUser = await User.findById(adminId);
    }

    if (!adminUser) {
      console.log(`Admin not found: ${adminId}`);
      return;
    }

    let tokens = [];
    if (adminUser.fcmTokens && adminUser.fcmTokens.length > 0) {
      tokens = [...tokens, ...adminUser.fcmTokens];
    }
    if (includeMobile && adminUser.fcmTokenMobile && adminUser.fcmTokenMobile.length > 0) {
      tokens = [...tokens, ...adminUser.fcmTokenMobile];
    }

    if (tokens.length === 0) {
      console.log(`No FCM tokens found for admin: ${adminId}`);
      return;
    }

    await sendPushNotification(tokens, payload);
  } catch (error) {
    console.error(`Error sending notification to admin ${adminId}:`, error);
  }
}

module.exports = {
  sendPushNotification,
  sendNotificationToUser,
  sendNotificationToVendor,
  sendNotificationToWorker,
  sendNotificationToAdmin
};
