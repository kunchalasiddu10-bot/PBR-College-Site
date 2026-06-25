import { Schema, model, Document } from 'mongoose';

export interface ISavedPrompt extends Document {
  user: Schema.Types.ObjectId;
  title: string;
  promptText: string;
  createdAt: Date;
  updatedAt: Date;
}

const savedPromptSchema = new Schema<ISavedPrompt>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Prompt title is required'],
      trim: true,
    },
    promptText: {
      type: String,
      required: [true, 'Prompt text is required'],
    },
  },
  {
    timestamps: true,
  }
);

export const SavedPrompt = model<ISavedPrompt>('SavedPrompt', savedPromptSchema);
export default SavedPrompt;
