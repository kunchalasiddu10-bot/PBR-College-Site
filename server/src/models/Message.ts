import { Schema, model, Document } from 'mongoose';

export interface IMessage extends Document {
  chat: Schema.Types.ObjectId;
  sender: Schema.Types.ObjectId;
  text: string;
  attachments: string[]; // List of attachment file URLs
  readBy: Schema.Types.ObjectId[]; // List of users who read the message
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    chat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: [true, 'Message must belong to a chat thread'],
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Message must have a sender'],
    },
    text: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
    },
    attachments: [
      {
        type: String,
      },
    ],
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
messageSchema.index({ chat: 1, createdAt: 1 });

export const Message = model<IMessage>('Message', messageSchema);
export default Message;
