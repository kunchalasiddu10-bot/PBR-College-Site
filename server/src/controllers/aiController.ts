import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import AISession from '../models/AISession';
import ChatHistory from '../models/ChatHistory';
import SavedPrompt from '../models/SavedPrompt';
import UserPreferences from '../models/UserPreferences';
import { processRAGQuery } from '../services/aiRAGService';
import AppError from '../utils/AppError';

/**
 * Handle AI Natural Language queries
 */
export const postAIChat = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { question, sessionId } = req.body;
    const userId = req.user!.id;
    const role = req.user!.role as any;

    if (!question) {
      throw new AppError('Question text is required.', 400);
    }

    // 1. Resolve or create chat session
    let session;
    if (sessionId) {
      session = await AISession.findOne({ _id: sessionId, user: userId });
      if (!session) throw new AppError('Chat session not found.', 404);
    } else {
      // Create auto session
      session = await AISession.create({
        user: userId,
        title: question.slice(0, 30) + '...',
      });
    }

    // 2. Execute RAG Query Processor
    const answer = await processRAGQuery({
      userId,
      role,
      question,
    });

    // 3. Save dialogue to history
    await ChatHistory.create([
      { user: userId, session: session._id, role: 'user', message: question },
      { user: userId, session: session._id, role: 'assistant', message: answer },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        answer,
        sessionId: session._id,
        sessionTitle: session.title,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve user chat sessions
 */
export const getAISessions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessions = await AISession.find({ user: req.user!.id }).sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      data: { sessions },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve messages in a session
 */
export const getSessionMessages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params; // Session ID
    const messages = await ChatHistory.find({
      session: id,
      user: req.user!.id,
    }).sort({ timestamp: 1 });

    res.status(200).json({
      status: 'success',
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a chat session
 */
export const createAISession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title } = req.body;
    const session = await AISession.create({
      user: req.user!.id,
      title: title || 'New AI Conversation',
    });

    res.status(201).json({
      status: 'success',
      data: { session },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear a chat session
 */
export const deleteAISession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const session = await AISession.findOneAndDelete({ _id: id, user: req.user!.id });
    if (!session) throw new AppError('Session not found', 404);

    // Delete associated chat history messages
    await ChatHistory.deleteMany({ session: id });

    res.status(200).json({
      status: 'success',
      message: 'Chat session history cleared successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ----------------- SAVED PROMPTS CRUD -----------------
 */

export const getSavedPrompts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const prompts = await SavedPrompt.find({ user: req.user!.id });
    res.status(200).json({
      status: 'success',
      data: { savedPrompts: prompts },
    });
  } catch (error) {
    next(error);
  }
};

export const createSavedPrompt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, promptText } = req.body;
    const prompt = await SavedPrompt.create({
      user: req.user!.id,
      title,
      promptText,
    });

    res.status(201).json({
      status: 'success',
      data: { savedPrompt: prompt },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSavedPrompt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await SavedPrompt.findOneAndDelete({ _id: id, user: req.user!.id });
    res.status(200).json({
      status: 'success',
      message: 'Saved prompt shortcut removed.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ----------------- USER PREFERENCES -----------------
 */

export const getUserPreferences = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let prefs = await UserPreferences.findOne({ user: req.user!.id });
    if (!prefs) {
      prefs = await UserPreferences.create({ user: req.user!.id });
    }
    res.status(200).json({
      status: 'success',
      data: { preferences: prefs },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserPreferences = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const prefs = await UserPreferences.findOneAndUpdate(
      { user: req.user!.id },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({
      status: 'success',
      data: { preferences: prefs },
    });
  } catch (error) {
    next(error);
  }
};
