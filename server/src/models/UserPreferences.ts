import { Schema, model, Document } from 'mongoose';

export interface IUserPreferences extends Document {
  user: Schema.Types.ObjectId;
  aiVoiceEnabled: boolean;
  themePreference: 'light' | 'dark';
  defaultSuggestions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userPreferencesSchema = new Schema<IUserPreferences>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    aiVoiceEnabled: {
      type: Boolean,
      default: false,
    },
    themePreference: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
    defaultSuggestions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const UserPreferences = model<IUserPreferences>('UserPreferences', userPreferencesSchema);
export default UserPreferences;
