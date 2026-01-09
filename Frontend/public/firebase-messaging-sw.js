/**
 * Firebase Messaging Service Worker
 * Handles background push notifications with sound alerts
 * Like Ola/Uber/Rapido - works even when app is closed
 */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration - Production values
const firebaseConfig = {
  apiKey: 'AIzaSyB0p9BwQh6P4U6RpNI783Mf2yLV96ZFemo',
  authDomain: 'homster-notifications.firebaseapp.com',
  projectId: 'homster-notifications',
  storageBucket: 'homster-notifications.firebasestorage.app',
  messagingSenderId: '330091938710',
  appId: '1:330091938710:web:b58aa8c0830445b1fa53b7',
  measurementId: 'G-E493PBZLED'
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Notification sounds based on type
const NOTIFICATION_SOUNDS = {
  new_booking: '/booking-alert.mp3',
  booking_accepted: '/success.mp3',
  worker_assigned: '/notification.mp3',
  job_assigned: '/booking-alert.mp3',
  booking_completed: '/success.mp3',
  default: '/notification.mp3'
};

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] 🔔 Background message received:', payload);

  const data = payload.data || {};
  const notification = payload.notification || {};
  const notificationType = data.type || 'default';

  // Determine notification style based on type
  let notificationTitle = notification.title || data.title || 'New Notification';
  let notificationBody = notification.body || data.body || '';
  let icon = notification.icon || '/Homster-logo.png';
  let badge = '/Homster-logo.png';
  let tag = data.bookingId || `notification-${Date.now()}`;
  let requireInteraction = false;
  let vibrate = [200, 100, 200];
  let actions = [];

  // Enhanced styling for different notification types
  switch (notificationType) {
    case 'new_booking':
      // High priority booking alert - like Ola/Uber
      notificationTitle = notification.title || data.title || '🔔 New Booking Request!';
      requireInteraction = true; // Keep notification visible until user interacts
      vibrate = [500, 200, 500, 200, 500]; // Strong vibration pattern
      actions = [
        { action: 'accept', title: '✓ Accept', icon: '/icons/accept.png' },
        { action: 'reject', title: '✗ Decline', icon: '/icons/reject.png' }
      ];
      break;

    case 'job_assigned':
      // Worker job assignment - urgent
      notificationTitle = notification.title || data.title || '🔔 New Job Assigned!';
      requireInteraction = true;
      vibrate = [500, 200, 500, 200, 500];
      actions = [
        { action: 'accept', title: '✓ Accept Job', icon: '/icons/accept.png' },
        { action: 'view', title: '👁️ View Details' }
      ];
      break;

    case 'booking_accepted':
      notificationTitle = notification.title || '✅ Booking Confirmed!';
      vibrate = [200, 100, 200];
      actions = [
        { action: 'view', title: '👁️ View Booking' }
      ];
      break;

    case 'worker_assigned':
      notificationTitle = notification.title || '👷 Worker Assigned';
      vibrate = [200, 100, 200];
      actions = [
        { action: 'track', title: '📍 Track Worker' }
      ];
      break;

    case 'booking_completed':
      notificationTitle = notification.title || '🎉 Booking Completed!';
      vibrate = [200, 100, 200, 100, 200];
      actions = [
        { action: 'rate', title: '⭐ Rate Now' }
      ];
      break;
  }

  const notificationOptions = {
    body: notificationBody,
    icon: icon,
    badge: badge,
    tag: tag,
    data: {
      ...data,
      notificationType: notificationType,
      url: data.link || '/',
      timestamp: Date.now()
    },
    // Vibration pattern for mobile devices
    vibrate: vibrate,
    // Keep notification until user interacts (for important ones)
    requireInteraction: requireInteraction,
    // Action buttons
    actions: actions,
    // Sound will be played by the system for high priority
    silent: false,
    // Renotify even if same tag exists
    renotify: true,
    // Timestamp
    timestamp: Date.now()
  };

  // Show the notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 📱 Notification clicked:', event.action, event.notification.data);

  const notification = event.notification;
  const data = notification.data || {};
  const action = event.action;

  // Close the notification
  notification.close();

  let urlToOpen = data.url || data.link || '/';

  // Handle different actions
  switch (action) {
    case 'accept':
      // Accept booking/job - navigate to details page
      if (data.bookingId) {
        if (data.notificationType === 'job_assigned') {
          urlToOpen = `/worker/job/${data.bookingId}`;
        } else {
          urlToOpen = `/vendor/bookings/${data.bookingId}`;
        }
      }
      break;

    case 'reject':
    case 'decline':
      // User rejected - just close notification
      return;

    case 'view':
    case 'track':
      // View details
      if (data.bookingId) {
        urlToOpen = data.link || `/user/booking/${data.bookingId}`;
      }
      break;

    case 'rate':
      // Navigate to rating page
      if (data.bookingId) {
        urlToOpen = `/user/booking/${data.bookingId}?rate=true`;
      }
      break;

    default:
      // Default click - open the link
      urlToOpen = data.link || data.url || '/';
  }

  // Ensure URL is absolute
  const origin = self.location.origin;
  if (urlToOpen && !urlToOpen.startsWith('http')) {
    urlToOpen = new URL(urlToOpen, origin).href;
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          // Navigate to the specific URL
          if (urlToOpen) {
            return client.navigate(urlToOpen);
          }
          return;
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] ❌ Notification closed:', event.notification.data);
});

// Handle push events for additional processing
self.addEventListener('push', (event) => {
  console.log('[SW] 📨 Push event received:', event);
});

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] 📦 Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] ✅ Service Worker activated');
  event.waitUntil(clients.claim());
});

console.log('[SW] 🚀 Firebase Messaging Service Worker loaded');
