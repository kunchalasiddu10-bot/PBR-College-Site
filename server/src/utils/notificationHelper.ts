import Notification from '../models/Notification';
import UserNotificationPreferences from '../models/UserNotificationPreferences';
import { sendRealTimeNotification } from '../services/socketService';

export interface CreateNotificationParams {
  recipientId: string;
  title: string;
  message: string;
  type:
    | 'Attendance'
    | 'Assignment'
    | 'Exam'
    | 'Result'
    | 'Placement'
    | 'Library'
    | 'Events'
    | 'Fees'
    | 'Complaint'
    | 'Announcement'
    | 'Emergency'
    | 'System';
  metadata?: any;
}

/**
 * Helper to easily trigger database + socket notifications across ERP controllers
 */
export const triggerNotification = async (params: CreateNotificationParams): Promise<any> => {
  const { recipientId, title, message, type, metadata } = params;

  try {
    // 1. Check user notifications preferences
    let prefs = await UserNotificationPreferences.findOne({ user: recipientId });
    if (!prefs) {
      prefs = await UserNotificationPreferences.create({ user: recipientId });
    }

    // Verify if this notification type is muted
    if (prefs.disabledTypes.includes(type)) {
      console.log(`🔇 [Notification Helper] Muted notification type ${type} for user ${recipientId}.`);
      return null;
    }

    // 2. Write to MongoDB
    const notification = await Notification.create({
      recipient: recipientId,
      title,
      message,
      type,
      metadata: metadata || {},
    });

    // 3. Dispatch via Socket.IO instantly
    sendRealTimeNotification(recipientId, notification);

    // 4. Placeholder for future email transmission triggers
    if (prefs.emailEnabled) {
      console.log(`✉️ [Email Service Queue] Triggering future email alert for ${type} to user ${recipientId}...`);
    }

    return notification;
  } catch (error) {
    console.error('❌ [Notification Helper] Failed to trigger notification:', error);
    return null;
  }
};
