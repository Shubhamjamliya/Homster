// Socket.io initialization
const { Server } = require('socket.io');
const { authenticateSocket } = require('../middleware/authMiddleware');

let io = null;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean),
      credentials: true
    }
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
    } else if (socket.userRole === 'WORKER') {
      socket.join(`worker_${socket.userId}`);
    } else if (socket.userRole === 'ADMIN') {
      socket.join(`admin_${socket.userId}`);
    }

    // Live Tracking Events
    socket.on('join_tracking', (bookingId) => {
      socket.join(`booking_${bookingId}`);
      console.log(`User ${socket.userId} joined tracking for booking_${bookingId}`);
    });

    socket.on('update_location', (data) => {
      // data: { bookingId, lat, lng }
      // Broadcast to everyone in the booking room (User is listening)
      socket.to(`booking_${data.bookingId}`).emit('live_location_update', {
        lat: data.lat,
        lng: data.lng,
        role: socket.userRole
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  console.log('Socket.io initialized successfully');
};

// Get io instance for emitting notifications
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };

