import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
// import { playNotificationSound, isSoundEnabled } from '../utils/notificationSound';
// Using inline simple sound or imported one if available. 
// Note: importing from utils might fail if circular dep/path issues, but it should be fine.

// We need to dynamic import or use the existing sound util.
import { playNotificationSound, isSoundEnabled } from '../utils/notificationSound';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

/**
 * Universal hook for app-wide notifications
 * Connects to Socket.IO and listens for 'notification' event
 */
export const useAppNotifications = (userType) => {
  const socketRef = useRef(null);
  const toastRef = useRef(null);

  useEffect(() => {
    let tokenKey = 'accessToken';
    switch (userType) {
      case 'vendor':
        tokenKey = 'vendorAccessToken';
        break;
      case 'worker':
        tokenKey = 'workerAccessToken';
        break;
      case 'admin':
        tokenKey = 'adminAccessToken';
        break;
      case 'user':
      default:
        tokenKey = 'accessToken';
        break;
    }

    const token = localStorage.getItem(tokenKey);
    // If no token, we don't connect
    if (!token) return;

    // Initialize Socket.IO connection
    // Backend uses token to auth and identify user
    // Make sure to clean up previous socket if exists
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`✅ ${userType.toUpperCase()} App Socket connected`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ ${userType.toUpperCase()} App Socket disconnected`);
    });

    socket.on('connect_error', (err) => {
      console.error(`Socket connection error (${userType}):`, err);
    });

    // Listen for generic notifications
    socket.on('notification', (data) => {
      console.log('🔔 App Notification received:', data);

      if (isSoundEnabled(userType)) {
        playNotificationSound();
      }

      // Prevent duplicate toasts if strictly necessary, but standard toast behavior is usually fine.
      toast.custom((t) => (
        <div
          className={`${t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 cursor-pointer`}
          onClick={() => {
            toast.dismiss(t.id);
            // Could assume a navigate function here but keeping it simple
            // window.location.href = '/notifications'; // primitive
          }}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                {/* Icon or Avatar */}
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                  🔔
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {data.title}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {data.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toast.dismiss(t.id);
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Close
            </button>
          </div>
        </div>
      ), {
        duration: 5000,
        position: 'top-right'
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };

  }, [userType]);

  return socketRef.current;
};

export default useAppNotifications;
