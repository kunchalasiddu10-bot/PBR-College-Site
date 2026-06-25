import { Schema, model, Document } from 'mongoose';

export interface IAcademicYear extends Document {
  name: string; // e.g. '2024-2025'
  startDate: Date;
  endDate: Date;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const academicYearSchema = new Schema<IAcademicYear>(
  {
    name: {
      type: String,
      required: [true, 'Academic year name is required'],
      unique: true,
      trim: true,
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

export const AcademicYear = model<IAcademicYear>('AcademicYear', academicYearSchema);
export default AcademicYear;
