import { Schema, model, Document } from 'mongoose';

export interface ILibraryBook extends Document {
  title: string;
  author: string;
  isbn: string;
  availableCopies: number;
  createdAt: Date;
  updatedAt: Date;
}

const libraryBookSchema = new Schema<ILibraryBook>(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, 'ISBN code is required'],
      unique: true,
      trim: true,
    },
    availableCopies: {
      type: Number,
      required: [true, 'Available copies count is required'],
      min: [0, 'Available copies cannot be negative'],
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const LibraryBook = model<ILibraryBook>('LibraryBook', libraryBookSchema);
export default LibraryBook;
