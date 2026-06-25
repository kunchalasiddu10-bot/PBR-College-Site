import { Schema, model, Document } from 'mongoose';

export interface ITimetable extends Document {
  department: Schema.Types.ObjectId;
  semester: number;
  section: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  subject: Schema.Types.ObjectId;
  teacherName: string;
  startTime: string;
  endTime: string;
  room: string;
  createdAt: Date;
  updatedAt: Date;
}

const timetableSchema = new Schema<ITimetable>(
  {
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      uppercase: true,
      trim: true,
    },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: [true, 'Day is required'],
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
    },
    teacherName: {
      type: String,
      required: [true, 'Teacher name is required'],
      trim: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      trim: true,
    },
    room: {
      type: String,
      required: [true, 'Room number/code is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize scheduler conflict lookup
timetableSchema.index({ department: 1, semester: 1, section: 1, day: 1 });

export const Timetable = model<ITimetable>('Timetable', timetableSchema);
export default Timetable;
