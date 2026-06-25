import { Schema, model, Document } from 'mongoose';

export interface IAnnouncementView extends Document {
  announcement: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  viewedAt: Date;
}

const announcementViewSchema = new Schema<IAnnouncementView>(
  {
    announcement: {
      type: Schema.Types.ObjectId,
      ref: 'Announcement',
      required: [true, 'View must be linked to an announcement'],
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'View must be linked to a user'],
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

// Prevent duplicate views tracking by creating a compound unique index
announcementViewSchema.index({ announcement: 1, user: 1 }, { unique: true });

export const AnnouncementView = model<IAnnouncementView>('AnnouncementView', announcementViewSchema);
export default AnnouncementView;
