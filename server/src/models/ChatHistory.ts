import { Schema, model, Document } from 'mongoose';

export interface IChatHistory extends Document {
  user: Schema.Types.ObjectId;
  session: Schema.Types.ObjectId;
  role: 'user' | 'assistant';
  message: string;
  timestamp: Date;
}

const chatHistorySchema = new Schema<IChatHistory>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    session: {
      type: Schema.Types.ObjectId,
      ref: 'AISession',
      required: [true, 'Session reference is required'],
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: [true, 'Role is required'],
    },
    message: {
      type: String,
      required: [true, 'Message text is required'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

export const ChatHistory = model<IChatHistory>('ChatHistory', chatHistorySchema);
export default ChatHistory;
