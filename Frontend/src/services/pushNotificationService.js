/**
 * Push Notification Service
 * Handles FCM token registration and notification handling
 */

import { messaging, getToken, onMessage } from '../firebase';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/**
 * Register service worker for push notifications
 * @returns {Promise<ServiceWorkerRegistration>}
 */
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('✅ Service Worker registered:', registration.scope);
      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      throw error;
    }
  } else {
    throw new Error('Service Workers are not supported in this browser');
  }
}

/**
 * Request notification permission from user
 * @returns {Promise<boolean>}
 */
async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      return true;
    } else {
      console.log('❌ Notification permission denied');
      return false;
    }
  }
  console.log('❌ Notifications not supported');
  return false;
}

/**
 * Get FCM token from Firebase
 * @returns {Promise<string|null>}
 */
async function getFCMToken() {
  try {
    if (!messaging) {
      console.error('Firebase messaging not initialized');
      return null;
    }

    const registration = await registerServiceWorker();
    await registration.update(); // Update service worker

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log('✅ FCM Token obtained:', token.substring(0, 20) + '...');
      return token;
    } else {
      console.log('❌ No FCM token available');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
    throw error;
  }
}

/**
 * Register FCM token with backend
 * @param {string} userType - 'user', 'vendor', or 'worker'
 * @param {boolean} forceUpdate - Force token update
 * @returns {Promise<string|null>}
 */
async function registerFCMToken(userType = 'user', forceUpdate = false) {
  try {
    // Check if already registered
    const storageKey = `fcm_token_${userType}_web`;
    const savedToken = localStorage.getItem(storageKey);
    if (savedToken && !forceUpdate) {
      console.log('FCM token already registered');
      return savedToken;
    }

    // Request permission
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Notification permission not granted, skipping FCM registration');
      return null;
    }

    // Get token
    const token = await getFCMToken();
    if (!token) {
      console.log('Failed to get FCM token');
      return null;
    }

    // Determine API endpoint based on user type
    let endpoint;
    let authTokenKey;
    switch (userType) {
      case 'vendor':
        endpoint = '/vendors/fcm-tokens/save';
        authTokenKey = 'vendorAccessToken';
        break;
      case 'worker':
        endpoint = '/workers/fcm-tokens/save';
        authTokenKey = 'workerAccessToken';
        break;
      default:
        endpoint = '/users/fcm-tokens/save';
        authTokenKey = 'accessToken';
    }

    // Get auth token
    const authToken = localStorage.getItem(authTokenKey);
    if (!authToken) {
      console.log('No auth token found, skipping FCM registration');
      return null;
    }

    // Save to backend
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        token: token,
        platform: 'web'
      })
    });

    if (response.ok) {
      localStorage.setItem(storageKey, token);
      console.log('✅ FCM token registered with backend');
      return token;
    } else {
      const error = await response.json();
      console.error('Failed to register token with backend:', error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error registering FCM token:', error);
    return null;
  }
}

/**
 * Remove FCM token from backend
 * @param {string} userType - 'user', 'vendor', or 'worker'
 */
async function removeFCMToken(userType = 'user') {
  try {
    const storageKey = `fcm_token_${userType}_web`;
    const token = localStorage.getItem(storageKey);
    if (!token) {
      return;
    }

    // Determine API endpoint based on user type
    let endpoint;
    let authTokenKey;
    switch (userType) {
      case 'vendor':
        endpoint = '/vendors/fcm-tokens/remove';
        authTokenKey = 'vendorAccessToken';
        break;
      case 'worker':
        endpoint = '/workers/fcm-tokens/remove';
        authTokenKey = 'workerAccessToken';
        break;
      default:
        endpoint = '/users/fcm-tokens/remove';
        authTokenKey = 'accessToken';
    }

    const authToken = localStorage.getItem(authTokenKey);
    if (!authToken) {
      localStorage.removeItem(storageKey);
      return;
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    await fetch(`${baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        token: token,
        platform: 'web'
      })
    });

    localStorage.removeItem(storageKey);
    console.log('✅ FCM token removed');
  } catch (error) {
    console.error('Error removing FCM token:', error);
  }
}

/**
 * Setup foreground notification handler
 * @param {Function} handler - Custom handler function
 */
function setupForegroundNotificationHandler(handler) {
  if (!messaging) {
    console.error('Firebase messaging not initialized');
    return;
  }

  onMessage(messaging, (payload) => {
    console.log('📬 Foreground message received:', payload);

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(payload.notification?.title || 'New Notification', {
        body: payload.notification?.body || '',
        icon: payload.notification?.icon || '/Appzeto-logo.png',
        data: payload.data
      });
    }

    // Call custom handler
    if (handler) {
      handler(payload);
    }
  });
}

/**
 * Initialize push notifications
 * Call this on app load
 */
async function initializePushNotifications() {
  try {
    if (!('serviceWorker' in navigator)) {
      console.log('Service workers not supported');
      return;
    }

    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return;
    }

    await registerServiceWorker();
    console.log('✅ Push notifications initialized');
  } catch (error) {
    console.error('Error initializing push notifications:', error);
  }
}

export {
  initializePushNotifications,
  registerFCMToken,
  removeFCMToken,
  setupForegroundNotificationHandler,
  requestNotificationPermission,
  getFCMToken
};
