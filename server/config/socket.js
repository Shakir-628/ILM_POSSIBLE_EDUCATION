import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Configure this based on your needs
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.user.role}) - Socket ID: ${socket.id}`);

    // Join user-specific room
    socket.join(`user:${socket.user._id}`);
    
    // Join role-specific room
    socket.join(`role:${socket.user.role}`);
    
    console.log(`📍 User ${socket.user.name} joined rooms: user:${socket.user._id}, role:${socket.user.role}`);

    // Handle room join requests
    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`🚪 Socket ${socket.id} joined room: ${room}`);
    });

    // Handle room leave requests
    socket.on('leave_room', (room) => {
      socket.leave(room);
      console.log(`🚪 Socket ${socket.id} left room: ${room}`);
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`❌ User disconnected: ${socket.user.name} - Reason: ${reason}`);
    });
  });

  console.log('🔌 Socket.IO server initialized');
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Helper functions to emit events

export const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
  console.log(`📤 Emitted ${event} to user:${userId}`);
};

export const emitToRole = (role, event, data) => {
  if (!io) return;
  io.to(`role:${role}`).emit(event, data);
  console.log(`📤 Emitted ${event} to role:${role}`);
};

export const emitToAll = (event, data) => {
  if (!io) return;
  io.emit(event, data);
  console.log(`📤 Emitted ${event} to all users`);
};

export const emitToRoom = (room, event, data) => {
  if (!io) return;
  io.to(room).emit(event, data);
  console.log(`📤 Emitted ${event} to room:${room}`);
};

export default { initializeSocket, getIO, emitToUser, emitToRole, emitToAll, emitToRoom };

