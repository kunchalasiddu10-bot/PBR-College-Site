import { Server, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyAccessToken } from '../utils/jwt';
import User from '../models/User';
import Student from '../models/Student';

interface ConnectedUser {
  userId: string;
  role: string;
  socketId: string;
}

let io: Server | null = null;
const userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds

import { allowedOrigins } from '../config/cors';

export const initSocketServer = (server: HTTPServer): Server => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication failed: Token missing'));
      }

      // Verify Access Token
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id);

      if (!user || user.status !== 'Active') {
        return next(new Error('Authentication failed: User account inactive or missing'));
      }

      // Attach user details to socket data
      socket.data.user = {
        id: user._id.toString(),
        role: user.role,
        department: user.department,
        name: user.name,
      };

      next();
    } catch (err) {
      next(new Error('Authentication failed: Invalid token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const user = socket.data.user;
    const userId = user.id;

    // Track active connection socket ID
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(socket.id);

    console.log(`🔌 User connected: ${user.name} (${user.role}) | Socket: ${socket.id}`);

    // Join specific rooms
    // 1. Personal Room
    socket.join(`user:${userId}`);

    // 2. Role-based rooms
    if (user.role === 'Student') {
      const studentDoc = await Student.findOne({ user: userId });
      if (studentDoc) {
        const semester = studentDoc.currentSemester;
        const section = studentDoc.section;
        const departmentId = studentDoc.department?.toString();

        if (departmentId) {
          socket.join(`dept:${departmentId}`);
        }
        if (semester && section) {
          socket.join(`class:${semester}:${section}`);
        }
      }
    } else if (user.role === 'Faculty' || user.role === 'HOD') {
      // HOD & Faculty join department room
      const userDoc = await User.findById(userId);
      if (userDoc && userDoc.department) {
        socket.join(`dept:${userDoc.department}`);
      }
    }

    // 3. Global Broadcast Room
    socket.join('all');

    // Notify others of online status
    socket.broadcast.emit('user:online', { userId });

    // Handle Client Events
    // Messaging typing indicators
    socket.on('chat:typing', (data: { chatId: string; isTyping: boolean }) => {
      socket.broadcast.emit(`chat:${data.chatId}:typing`, {
        userId,
        name: user.name,
        isTyping: data.isTyping,
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${user.name} | Socket: ${socket.id}`);
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
          // Broadcast offline status if no active connections left
          io?.emit('user:offline', { userId });
        }
      }
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO is not initialized yet');
  }
  return io;
};

/**
 * Send real-time notification to a specific user
 */
export const sendRealTimeNotification = (recipientId: string, notification: any): void => {
  if (!io) return;
  io.to(`user:${recipientId}`).emit('notification', notification);
};

/**
 * Broadcast event to a custom room
 */
export const broadcastToRoom = (roomName: string, event: string, payload: any): void => {
  if (!io) return;
  io.to(roomName).emit(event, payload);
};

/**
 * Check if a user has active socket connections
 */
export const isUserOnline = (userId: string): boolean => {
  const sockets = userSockets.get(userId);
  return sockets ? sockets.size > 0 : false;
};
