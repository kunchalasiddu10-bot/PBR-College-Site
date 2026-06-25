import { Schema, model, Document } from 'mongoose';

export interface IAISession extends Document {
  user: Schema.Types.ObjectId;
  title: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const aiSessionSchema = new Schema<IAISession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AISession = model<IAISession>('AISession', aiSessionSchema);
export default AISession;
