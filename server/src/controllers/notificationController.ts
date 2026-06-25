import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Notification from '../models/Notification';
import UserNotificationPreferences from '../models/UserNotificationPreferences';
import AppError from '../utils/AppError';

/**
 * Get all notifications for the authenticated user
 */
export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const recipientId = req.user!.id;
    const limit = parseInt(req.query.limit as string, 10) || 50;

    const notifications = await Notification.find({ recipient: recipientId })
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({
      recipient: recipientId,
      isRead: false,
    });

    res.status(200).json({
      status: 'success',
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a specific notification as read
 */
export const markNotificationAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const recipientId = req.user!.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: recipientId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw new AppError('Notification not found or access denied', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all unread notifications of the user as read
 */
export const markAllNotificationsAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const recipientId = req.user!.id;

    await Notification.updateMany(
      { recipient: recipientId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a specific notification
 */
export const deleteNotification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const recipientId = req.user!.id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: recipientId,
    });

    if (!notification) {
      throw new AppError('Notification not found or access denied', 404);
    }

    res.status(200).json({
      status: 'success',
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification channels preferences
 */
export const getPreferences = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    let prefs = await UserNotificationPreferences.findOne({ user: userId });
    if (!prefs) {
      prefs = await UserNotificationPreferences.create({ user: userId });
    }

    res.status(200).json({
      status: 'success',
      data: { preferences: prefs },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update notification preferences
 */
export const updatePreferences = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { emailEnabled, pushEnabled, disabledTypes } = req.body;

    const prefs = await UserNotificationPreferences.findOneAndUpdate(
      { user: userId },
      { emailEnabled, pushEnabled, disabledTypes },
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
