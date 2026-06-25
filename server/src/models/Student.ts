import { Schema, model, Document } from 'mongoose';

export interface IStudent extends Document {
  user: Schema.Types.ObjectId;
  rollNumber: string;
  admissionNumber: string;
  department: Schema.Types.ObjectId;
  currentSemester: number;
  section: string;
  cgpa: number;
  creditsCompleted: number;
  academicYear: string;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
    },
    admissionNumber: {
      type: String,
      required: [true, 'Admission number is required'],
      unique: true,
      trim: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
    },
    currentSemester: {
      type: Number,
      required: [true, 'Current semester is required'],
      min: 1,
      max: 8,
      default: 1,
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      uppercase: true,
      trim: true,
    },
    cgpa: {
      type: Number,
      default: 0.0,
      min: 0.0,
      max: 10.0,
    },
    creditsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Student = model<IStudent>('Student', studentSchema);
export default Student;
