import { Schema, model, Document } from 'mongoose';

export interface ISection extends Document {
  name: string; // e.g. 'A', 'B'
  course: Schema.Types.ObjectId;
  semester: number; // e.g. 1, 2, 3
  capacity: number;
  academicYear: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sectionSchema = new Schema<ISection>(
  {
    name: {
      type: String,
      required: [true, 'Section name is required'],
      trim: true,
      uppercase: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    capacity: {
      type: Number,
      required: [true, 'Section capacity is required'],
      min: 1,
      default: 60,
    },
    academicYear: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'Academic year reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee uniqueness of section name within a course, semester, and academic year
sectionSchema.index({ name: 1, course: 1, semester: 1, academicYear: 1 }, { unique: true });

export const Section = model<ISection>('Section', sectionSchema);
export default Section;
