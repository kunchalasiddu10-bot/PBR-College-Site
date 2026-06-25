import { Schema, model, Document } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  code: string;
  credits: number;
  department: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subjectSchema = new Schema<ISubject>(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: [1, 'Credits must be at least 1'],
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

export const Subject = model<ISubject>('Subject', subjectSchema);
export default Subject;
