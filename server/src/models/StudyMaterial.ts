import { Schema, model, Document } from 'mongoose';

export interface IStudyMaterial extends Document {
  title: string;
  description?: string;
  subject: Schema.Types.ObjectId;
  section: Schema.Types.ObjectId;
  semester: number;
  fileUrl: string;
  uploadedBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const studyMaterialSchema = new Schema<IStudyMaterial>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },
    section: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
      required: [true, 'Section is required'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

export const StudyMaterial = model<IStudyMaterial>('StudyMaterial', studyMaterialSchema);
export default StudyMaterial;
