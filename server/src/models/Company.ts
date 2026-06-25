import { Schema, model, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  industry: string;
  description?: string;
  website?: string;
  contactEmail: string;
  contactPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      trim: true,
    },
    industry: {
      type: String,
      required: [true, 'Industry name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Company = model<ICompany>('Company', companySchema);
export default Company;
