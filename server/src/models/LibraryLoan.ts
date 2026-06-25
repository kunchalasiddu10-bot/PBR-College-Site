import { Schema, model, Document } from 'mongoose';

export interface ILibraryLoan extends Document {
  student: Schema.Types.ObjectId;
  book: Schema.Types.ObjectId;
  issueDate: Date;
  dueDate: Date;
  returnDate?: Date;
  fineAmount: number;
  status: 'Issued' | 'Returned' | 'Overdue';
  createdAt: Date;
  updatedAt: Date;
}

const libraryLoanSchema = new Schema<ILibraryLoan>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: 'LibraryBook',
      required: [true, 'Book reference is required'],
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required'],
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    returnDate: {
      type: Date,
    },
    fineAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Issued', 'Returned', 'Overdue'],
      default: 'Issued',
    },
  },
  {
    timestamps: true,
  }
);

export const LibraryLoan = model<ILibraryLoan>('LibraryLoan', libraryLoanSchema);
export default LibraryLoan;
