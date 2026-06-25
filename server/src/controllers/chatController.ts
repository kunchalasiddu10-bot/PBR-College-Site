import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Chat from '../models/Chat';
import Message from '../models/Message';
import User from '../models/User';
import AppError from '../utils/AppError';
import { getIO } from '../services/socketService';

/**
 * Get all conversations for the authenticated user, populated with latest messages
 */
export const getConversations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'name email role profileImage department')
      .populate('createdBy', 'name')
      .sort({ updatedAt: -1 });

    const conversations = [];
    for (const chat of chats) {
      // Fetch latest message
      const lastMessage = await Message.findOne({ chat: chat._id })
        .sort({ createdAt: -1 })
        .populate('sender', 'name profileImage');

      // Fetch unread count for this user
      const unreadCount = await Message.countDocuments({
        chat: chat._id,
        sender: { $ne: userId },
        readBy: { $ne: userId },
      });

      conversations.push({
        ...chat.toObject(),
        lastMessage,
        unreadCount,
      });
    }

    res.status(200).json({
      status: 'success',
      data: { conversations },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Initiate a direct (private) or group chat
 */
export const createConversation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { type, recipientId, participants, name, department, semester, section } = req.body;

    if (type === 'private' || !type) {
      if (!recipientId) {
        throw new AppError('Recipient User ID is required for private chats', 400);
      }

      // Check if private chat already exists
      let chat = await Chat.findOne({
        type: 'private',
        participants: { $all: [userId, recipientId], $size: 2 },
      }).populate('participants', 'name email role profileImage department');

      if (chat) {
        res.status(200).json({
          status: 'success',
          data: { chat },
        });
        return;
      }

      // Create new private chat
      chat = await Chat.create({
        participants: [userId, recipientId],
        type: 'private',
        createdBy: userId,
      });

      const populated = await chat.populate('participants', 'name email role profileImage department');
      res.status(201).json({
        status: 'success',
        data: { chat: populated },
      });
      return;
    }

    // Handle group / classroom / department chats creation
    const chatParticipants = [...(participants || [])];
    if (!chatParticipants.includes(userId)) {
      chatParticipants.push(userId);
    }

    const chat = await Chat.create({
      participants: chatParticipants,
      type,
      name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} Channel`,
      department,
      semester,
      section,
      createdBy: userId,
    });

    const populated = await chat.populate('participants', 'name email role profileImage department');

    // Notify other users of new group chat creation via socket
    const io = getIO();
    populated.participants.forEach((part: any) => {
      const pId = part._id.toString();
      if (pId !== userId) {
        io.to(`user:${pId}`).emit('chat:new', populated);
      }
    });

    res.status(201).json({
      status: 'success',
      data: { chat: populated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get messages inside a chat thread (paginated)
 */
export const getChatMessages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const chatId = req.params.id;
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const before = req.query.before as string; // Timestamp ISO string for scrolling load

    // Verify user is participant in this chat
    const chat = await Chat.findOne({ _id: chatId, participants: userId });
    if (!chat) {
      throw new AppError('Chat thread not found or access denied', 404);
    }

    const query: any = { chat: chatId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'name profileImage role')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Reverse messages to display in chronological order
    messages.reverse();

    // Mark these messages as read by the user
    await Message.updateMany(
      { chat: chatId, sender: { $ne: userId }, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    // Emit read receipt event via Socket
    const io = getIO();
    chat.participants.forEach((part) => {
      const pId = part.toString();
      if (pId !== userId) {
        io.to(`user:${pId}`).emit(`chat:${chatId}:read`, { userId });
      }
    });

    res.status(200).json({
      status: 'success',
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send a message inside a chat thread & broadcast it
 */
export const sendChatMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const chatId = req.params.id;
    const userId = req.user!.id;
    const { text, attachments } = req.body;

    if (!text && (!attachments || attachments.length === 0)) {
      throw new AppError('Message body cannot be empty', 400);
    }

    // Verify user is participant in this chat
    const chat = await Chat.findOne({ _id: chatId, participants: userId });
    if (!chat) {
      throw new AppError('Chat thread not found or access denied', 404);
    }

    const message = await Message.create({
      chat: chatId,
      sender: userId,
      text: text || '',
      attachments: attachments || [],
      readBy: [userId],
    });

    // Populate sender details
    const populated = await message.populate('sender', 'name profileImage role');

    // Update the Chat thread timestamp
    await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

    // Broadcast message via Socket.IO users rooms
    const io = getIO();
    chat.participants.forEach((part) => {
      const pId = part.toString();
      // Emits to all participants (including sender's active multi-tabs)
      io.to(`user:${pId}`).emit('chat:message', populated);
    });

    res.status(201).json({
      status: 'success',
      data: { message: populated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search active users in college directory to start a chat thread
 */
export const searchUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const search = req.query.search as string;

    const query: any = { _id: { $ne: userId }, status: 'Active' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('name email role profileImage department').limit(20);

    res.status(200).json({
      status: 'success',
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};
