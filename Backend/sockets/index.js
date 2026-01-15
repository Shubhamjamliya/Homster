// Socket.io initialization
const { Server } = require('socket.io');
const { authenticateSocket } = require('../middleware/authMiddleware');

let io = null;

const initializeSocket = (server) => {
  io = new Server(server, {
    pingTimeout: 60000,
    pingInterval: 25000,
    cors: {
      origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean),
      credentials: true,
      methods: ["GET", "POST"]
    },
    transports: ['polling', 'websocket']
  });

  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify token using the same method as HTTP middleware
      const { verifyAccessToken } = require('../utils/tokenService');
      const decoded = verifyAccessToken(token);

      socket.userId = decoded.userId;
      socket.userRole = decoded.role;

      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.userId}, Role: ${socket.userRole})`);

    // Join user-specific room for notifications
    if (socket.userRole === 'USER') {
      socket.join(`user_${socket.userId}`);
    } else if (socket.userRole === 'VENDOR') {
      socket.join(`vendor_${socket.userId}`);
      // Update vendor online status
      updateVendorOnlineStatus(socket.userId, true, socket.id);
    } else if (socket.userRole === 'WORKER') {
      socket.join(`worker_${socket.userId}`);
    } else if (socket.userRole === 'ADMIN') {
      socket.join(`admin_${socket.userId}`);
    }

    // Explicit Room Join Events (Fallback/Frontend Initiated)
    socket.on('join_vendor_room', (vendorId) => {
      // Security check: ensure the socket user actually IS this vendor
      if (socket.userRole === 'VENDOR' && socket.userId === vendorId) {
        socket.join(`vendor_${vendorId}`);
        console.log(`Socket ${socket.id} explicitly joined room vendor_${vendorId}`);
      }
    });

    socket.on('join_user_room', (userId) => {
      if (socket.userRole === 'USER' && socket.userId === userId) {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} explicitly joined room user_${userId}`);
      }
    });

    socket.on('join_worker_room', (workerId) => {
      if (socket.userRole === 'WORKER' && socket.userId === workerId) {
        socket.join(`worker_${workerId}`);
        console.log(`Socket ${socket.id} explicitly joined room worker_${workerId}`);
      }
    });

    // Live Tracking Events
    socket.on('join_tracking', (bookingId) => {
      socket.join(`booking_${bookingId}`);
      console.log(`User ${socket.userId} joined tracking for booking_${bookingId}`);
    });

    // Vendor acknowledges receiving booking alert
    socket.on('booking_alert_received', async (data) => {
      try {
        const BookingRequest = require('../models/BookingRequest');
        await BookingRequest.findOneAndUpdate(
          { bookingId: data.bookingId, vendorId: socket.userId },
          { status: 'VIEWED', viewedAt: new Date(), socketDelivered: true }
        );
        console.log(`[Socket] Vendor ${socket.userId} viewed booking ${data.bookingId}`);
      } catch (error) {
        console.error('[Socket] Error updating booking request:', error);
      }
    });

    // Vendor sets availability
    socket.on('set_availability', async (data) => {
      try {
        const Vendor = require('../models/Vendor');
        await Vendor.findByIdAndUpdate(socket.userId, {
          availability: data.status // 'AVAILABLE', 'BUSY', etc.
        });
        console.log(`[Socket] Vendor ${socket.userId} set availability to ${data.status}`);
      } catch (error) {
        console.error('[Socket] Error setting availability:', error);
      }
    });

    socket.on('update_location', async (data) => {
      // data: { bookingId, lat, lng }
      const lat = parseFloat(data.lat);
      const lng = parseFloat(data.lng);

      if (isNaN(lat) || isNaN(lng)) return;

      // 1. Broadcast to everyone in the booking room (User is listening)
      socket.to(`booking_${data.bookingId}`).emit('live_location_update', {
        lat,
        lng,
        role: socket.userRole
      });

      // 2. Save latest location to Database (optional but helps for initial tracking load)
      try {
        const Vendor = require('../models/Vendor');
        const Worker = require('../models/Worker');
        const { setVendorLocation } = require('../services/redisService');

        const updateData = {
          location: {
            lat,
            lng,
            updatedAt: new Date()
          },
          // Also update geoLocation for geo queries
          geoLocation: {
            type: 'Point',
            coordinates: [lng, lat] // GeoJSON is [lng, lat]
          }
        };

        if (socket.userRole === 'VENDOR') {
          await Vendor.findByIdAndUpdate(socket.userId, updateData);
          // Update Redis geo cache for fast lookups
          await setVendorLocation(socket.userId, lat, lng);
        } else if (socket.userRole === 'WORKER') {
          await Worker.findByIdAndUpdate(socket.userId, updateData);
        }
      } catch (error) {
        console.error('Error saving live location:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      // Update vendor offline status
      if (socket.userRole === 'VENDOR') {
        updateVendorOnlineStatus(socket.userId, false, null);
      }
    });
  });

  console.log('Socket.io initialized successfully');
};

// Helper function to update vendor online status
const updateVendorOnlineStatus = async (vendorId, isOnline, socketId) => {
  try {
    const Vendor = require('../models/Vendor');
    const { setVendorOnline, setVendorAvailability } = require('../services/redisService');

    const updateData = {
      isOnline,
      currentSocketId: socketId
    };

    if (isOnline) {
      updateData.availability = 'AVAILABLE';
    } else {
      updateData.lastSeenAt = new Date();
      updateData.availability = 'OFFLINE';
    }

    // Update MongoDB
    await Vendor.findByIdAndUpdate(vendorId, updateData);

    // Update Redis cache (fast lookup)
    await setVendorOnline(vendorId, isOnline);
    await setVendorAvailability(vendorId, updateData.availability);

    console.log(`[Socket] Vendor ${vendorId} is now ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
  } catch (error) {
    console.error('[Socket] Error updating vendor online status:', error);
  }
};

// Get io instance for emitting notifications
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };

