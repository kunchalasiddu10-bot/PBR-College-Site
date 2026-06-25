import { Schema, model, Document } from 'mongoose';

export interface IPlacementApplicant {
  student: Schema.Types.ObjectId;
  status: 'Applied' | 'Shortlisted' | 'Selected' | 'Rejected';
  roundReached: string;
  appliedAt: Date;
}

export interface IPlacement extends Document {
  company: Schema.Types.ObjectId;
  jobTitle: string;
  jobDescription: string;
  package: string; // e.g. '12 LPA'
  eligibilityCriteria: string; // e.g. 'CGPA > 7.5'
  driveDate: Date;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  applicants: IPlacementApplicant[];
  createdAt: Date;
  updatedAt: Date;
}

const placementApplicantSchema = new Schema<IPlacementApplicant>({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Selected', 'Rejected'],
    default: 'Applied',
  },
  roundReached: {
    type: String,
    default: 'Aptitude Test',
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

const placementSchema = new Schema<IPlacement>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    jobDescription: {
      type: String,
      required: [true, 'Job description is required'],
    },
    package: {
      type: String,
      required: [true, 'Salary package is required'],
      trim: true,
    },
    eligibilityCriteria: {
      type: String,
      required: [true, 'Eligibility criteria description is required'],
    },
    driveDate: {
      type: Date,
      required: [true, 'Placement drive date is required'],
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed'],
      default: 'Upcoming',
    },
    applicants: [placementApplicantSchema],
  },
  {
    timestamps: true,
  }
);

export const Placement = model<IPlacement>('Placement', placementSchema);
export default Placement;
