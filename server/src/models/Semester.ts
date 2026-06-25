import { Schema, model, Document } from 'mongoose';

export interface ISemester extends Document {
  academicYear: Schema.Types.ObjectId;
  semesterNumber: number;
  startDate: Date;
  endDate: Date;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const semesterSchema = new Schema<ISemester>(
  {
    academicYear: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'Academic year reference is required'],
    },
    semesterNumber: {
      type: Number,
      required: [true, 'Semester number is required'],
      min: 1,
      max: 8,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate semesters in the same academic year
semesterSchema.index({ academicYear: 1, semesterNumber: 1 }, { unique: true });

export const Semester = model<ISemester>('Semester', semesterSchema);
export default Semester;
