import { Schema, model, Document } from 'mongoose';

export interface IFacultyAssignment extends Document {
  faculty: Schema.Types.ObjectId;
  subject: Schema.Types.ObjectId;
  section: Schema.Types.ObjectId;
  academicYear: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const facultyAssignmentSchema = new Schema<IFacultyAssignment>(
  {
    faculty: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Faculty member
      required: [true, 'Faculty reference is required'],
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
    },
    section: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
      required: [true, 'Section reference is required'],
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

// Prevent duplicate assignment of the same faculty to the same section-subject in the same academic year
facultyAssignmentSchema.index({ faculty: 1, subject: 1, section: 1, academicYear: 1 }, { unique: true });

export const FacultyAssignment = model<IFacultyAssignment>('FacultyAssignment', facultyAssignmentSchema);
export default FacultyAssignment;
