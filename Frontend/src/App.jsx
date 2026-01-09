import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import AppRoutes from './routes';
import { SocketProvider } from './context/SocketContext';
import { initializePushNotifications, setupForegroundNotificationHandler } from './services/pushNotificationService';

function App() {
  // Initialize push notifications on app load
  useEffect(() => {
    initializePushNotifications();

    // Setup foreground notification handler
    setupForegroundNotificationHandler((payload) => {
      console.log('📬 Notification received:', payload);
      // Show toast notification
      toast(payload.notification?.body || 'New notification', {
        icon: '🔔',
        duration: 5000,
      });
    });
  }, []);

  return (
    <BrowserRouter>
      <SocketProvider>
        <div className="App">
          <AppRoutes />
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 3000, // Global default
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '10px',
                padding: '12px 20px',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10B981',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
        </div>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;

