import { Schema, model, Document } from 'mongoose';

export interface IExam extends Document {
  subject: Schema.Types.ObjectId;
  date: Date;
  time: string;
  room: string;
  type: 'Internal 1' | 'Internal 2' | 'Semester End';
  createdAt: Date;
  updatedAt: Date;
}

const examSchema = new Schema<IExam>(
  {
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time slot description is required'],
      trim: true,
    },
    room: {
      type: String,
      required: [true, 'Exam room is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Internal 1', 'Internal 2', 'Semester End'],
      required: [true, 'Exam type is required'],
    },
  },
  {
    timestamps: true,
  }
);

export const Exam = model<IExam>('Exam', examSchema);
export default Exam;
