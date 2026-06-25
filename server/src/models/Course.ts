import { Schema, model, Document } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  code: string;
  description?: string;
  credits: number;
  department: Schema.Types.ObjectId;
  durationYears: number;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    credits: {
      type: Number,
      required: [true, 'Course credits are required'],
      min: 1,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
    },
    durationYears: {
      type: Number,
      required: [true, 'Duration in years is required'],
      min: 1,
      default: 4,
    },
  },
  {
    timestamps: true,
  }
);

export const Course = model<ICourse>('Course', courseSchema);
export default Course;
