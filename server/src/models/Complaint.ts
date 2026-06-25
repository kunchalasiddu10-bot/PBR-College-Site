import { Schema, model, Document } from 'mongoose';

export interface IComplaint extends Document {
  student: Schema.Types.ObjectId;
  title: string;
  category: 'Academic' | 'Hostel' | 'Infrastructure' | 'Finance' | 'Other';
  description: string;
  status: 'Open' | 'In-Progress' | 'Resolved';
  resolutionDetails?: string;
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema<IComplaint>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Academic', 'Hostel', 'Infrastructure', 'Finance', 'Other'],
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      required: [true, 'Description content is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Open', 'In-Progress', 'Resolved'],
      default: 'Open',
    },
    resolutionDetails: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Complaint = model<IComplaint>('Complaint', complaintSchema);
export default Complaint;
