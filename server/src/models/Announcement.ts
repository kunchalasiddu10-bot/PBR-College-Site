import { Schema, model, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  author: Schema.Types.ObjectId;
  attachments: string[]; // List of attachment file URLs
  scheduledFor: Date; // For scheduling posts
  targetAudience: {
    department?: string; // Target specific department code or ID (if null, targets all departments)
    semester?: number; // Target specific semester (if null, targets all semesters)
    section?: string; // Target specific section (if null, targets all sections)
  };
  isPinned: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Announcement content is required'],
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Announcement author is required'],
    },
    attachments: [
      {
        type: String,
      },
    ],
    scheduledFor: {
      type: Date,
      default: Date.now,
    },
    targetAudience: {
      department: {
        type: String,
        default: null,
      },
      semester: {
        type: Number,
        default: null,
      },
      section: {
        type: String,
        default: null,
      },
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
announcementSchema.index({ status: 1, isPinned: -1, scheduledFor: -1 });

export const Announcement = model<IAnnouncement>('Announcement', announcementSchema);
export default Announcement;
