import { Schema, model, Document } from 'mongoose';

export interface IUserNotificationPreferences extends Document {
  user: Schema.Types.ObjectId;
  emailEnabled: boolean;
  pushEnabled: boolean;
  disabledTypes: string[]; // List of notification types that the user wishes to mute/block
  createdAt: Date;
  updatedAt: Date;
}

const userPreferencesSchema = new Schema<IUserNotificationPreferences>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Preferences must belong to a user'],
      unique: true,
      index: true,
    },
    emailEnabled: {
      type: Boolean,
      default: true,
    },
    pushEnabled: {
      type: Boolean,
      default: true,
    },
    disabledTypes: [
      {
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
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const UserNotificationPreferences = model<IUserNotificationPreferences>(
  'UserNotificationPreferences',
  userPreferencesSchema
);
export default UserNotificationPreferences;
