import { Schema, model, Document } from 'mongoose';

export interface IChat extends Document {
  participants: Schema.Types.ObjectId[];
  type: 'private' | 'group' | 'department' | 'class' | 'project' | 'club';
  name?: string; // Group Name
  academicYear?: string;
  semester?: number;
  section?: string;
  department?: string;
  createdBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    type: {
      type: String,
      enum: ['private', 'group', 'department', 'class', 'project', 'club'],
      default: 'private',
    },
    name: {
      type: String,
      trim: true,
    },
    academicYear: {
      type: String,
      trim: true,
    },
    semester: {
      type: Number,
    },
    section: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index participants for quick checks
chatSchema.index({ participants: 1 });

export const Chat = model<IChat>('Chat', chatSchema);
export default Chat;
