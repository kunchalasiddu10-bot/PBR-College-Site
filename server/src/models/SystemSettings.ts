import { Schema, model, Document } from 'mongoose';

export interface IGradingScale {
  grade: string;
  minMarks: number;
  maxMarks: number;
  gradePoints: number;
}

export interface ICalendarEvent {
  eventName: string;
  date: Date;
  type: 'Academic' | 'Holiday' | 'Exam' | 'Event';
}

export interface ISystemSettings extends Document {
  collegeName: string;
  logoUrl?: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  workingDays: string[]; // e.g. ['Monday', 'Tuesday', ...]
  gradingSystem: IGradingScale[];
  academicCalendar: ICalendarEvent[];
  createdAt: Date;
  updatedAt: Date;
}

const gradingScaleSchema = new Schema<IGradingScale>({
  grade: { type: String, required: true },
  minMarks: { type: Number, required: true },
  maxMarks: { type: Number, required: true },
  gradePoints: { type: Number, required: true },
});

const calendarEventSchema = new Schema<ICalendarEvent>({
  eventName: { type: String, required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['Academic', 'Holiday', 'Exam', 'Event'], required: true },
});

const systemSettingsSchema = new Schema<ISystemSettings>(
  {
    collegeName: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
      default: 'PBR College of Engineering & Technology',
    },
    logoUrl: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      required: [true, 'College address is required'],
      default: 'PBR Street, Nellore, Andhra Pradesh, India',
    },
    contactEmail: {
      type: String,
      required: [true, 'College email is required'],
      default: 'info@pbrcollege.edu',
    },
    contactPhone: {
      type: String,
      required: [true, 'College phone number is required'],
      default: '+91-861-2345678',
    },
    workingDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    gradingSystem: {
      type: [gradingScaleSchema],
      default: [
        { grade: 'O', minMarks: 90, maxMarks: 100, gradePoints: 10 },
        { grade: 'A', minMarks: 80, maxMarks: 89, gradePoints: 9 },
        { grade: 'B', minMarks: 70, maxMarks: 79, gradePoints: 8 },
        { grade: 'C', minMarks: 60, maxMarks: 69, gradePoints: 7 },
        { grade: 'D', minMarks: 50, maxMarks: 59, gradePoints: 6 },
        { grade: 'E', minMarks: 40, maxMarks: 49, gradePoints: 5 },
        { grade: 'F', minMarks: 0, maxMarks: 39, gradePoints: 0 },
      ],
    },
    academicCalendar: [calendarEventSchema],
  },
  {
    timestamps: true,
  }
);

export const SystemSettings = model<ISystemSettings>('SystemSettings', systemSettingsSchema);
export default SystemSettings;
