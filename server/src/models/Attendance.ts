import { Schema, model, Document } from 'mongoose';

export interface IAttendance extends Document {
  student: Schema.Types.ObjectId;
  subject: Schema.Types.ObjectId;
  date: Date;
  status: 'Present' | 'Absent' | 'Late';
  semester: number;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
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
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late'],
      required: [true, 'Attendance status is required'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quick aggregate student rates per subject
attendanceSchema.index({ student: 1, subject: 1, date: -1 });

export const Attendance = model<IAttendance>('Attendance', attendanceSchema);
export default Attendance;
