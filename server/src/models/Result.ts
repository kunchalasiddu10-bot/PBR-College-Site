import { Schema, model, Document } from 'mongoose';

export interface IResult extends Document {
  student: Schema.Types.ObjectId;
  subject: Schema.Types.ObjectId;
  semester: number;
  examType: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  createdAt: Date;
  updatedAt: Date;
}

const resultSchema = new Schema<IResult>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    examType: {
      type: String,
      required: [true, 'Exam type is required'],
      trim: true,
    },
    marksObtained: {
      type: Number,
      required: [true, 'Marks obtained are required'],
      min: 0,
    },
    maxMarks: {
      type: Number,
      required: [true, 'Max marks are required'],
      min: 1,
    },
    grade: {
      type: String,
      required: [true, 'Final grade designation is required'],
      uppercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick report card evaluations
resultSchema.index({ student: 1, semester: 1 });

export const Result = model<IResult>('Result', resultSchema);
export default Result;
