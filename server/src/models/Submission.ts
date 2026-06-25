import { Schema, model, Document } from 'mongoose';

export interface ISubmission extends Document {
  assignment: Schema.Types.ObjectId;
  student: Schema.Types.ObjectId;
  submittedAt: Date;
  attachmentUrl: string;
  grade?: string;
  remarks?: string;
  status: 'Submitted' | 'Graded';
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    assignment: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Assignment reference is required'],
      index: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    attachmentUrl: {
      type: String,
      required: [true, 'Attachment URL/file link is required'],
    },
    grade: {
      type: String,
      default: '',
    },
    remarks: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Submitted', 'Graded'],
      default: 'Submitted',
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique submissions per assignment-student pair
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export const Submission = model<ISubmission>('Submission', submissionSchema);
export default Submission;
