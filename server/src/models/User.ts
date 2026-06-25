import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser } from '../utils/password'; // import type context or declare inline

export interface IUserDocument extends Omit<IUser, 'id'>, Document {
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Prevents password from being returned in standard queries
    },
    role: {
      type: String,
      enum: ['Student', 'Faculty', 'HOD', 'Admin', 'Visitor'],
      default: 'Visitor',
    },
    department: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Disabled', 'Suspended'],
      default: 'Active',
    },
    profileImage: {
      type: String,
      default: '',
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    refreshToken: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to optimize logins and verification lookups
userSchema.index({ email: 1, status: 1 });

// Encrypt password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const rawPassword = this.password;
    if (!rawPassword) {
      return next(new Error('Password is required'));
    }
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(rawPassword, salt);
    this.password = hash;
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Instance method to compare candidate passwords
userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUserDocument>('User', userSchema);
export default User;
