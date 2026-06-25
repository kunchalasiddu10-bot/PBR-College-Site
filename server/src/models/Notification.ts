import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: Schema.Types.ObjectId; // User receiving the alert
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
  isRead: boolean;
  metadata?: Schema.Types.Mixed; // Route target, details, or direct identifiers payload
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification recipient user is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'Attendance',
        'Assignment',
        'Exam',
        'Result',
        'Placement',
        'Library',
        'Events',
        'Fees',
        'Complaint',
        'Announcement',
        'Emergency',
        'System',
      ],
      required: [true, 'Notification type is required'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quick-fetch unread notifications for a user
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);
export default Notification;
