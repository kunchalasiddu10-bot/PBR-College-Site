import crypto from 'crypto';

export interface IUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'Student' | 'Faculty' | 'HOD' | 'Admin' | 'Visitor';
  department?: string;
  status: 'Active' | 'Disabled' | 'Suspended';
  profileImage?: string;
  phoneNumber?: string;
  refreshToken?: string | null;
  emailVerified: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  lastLogin?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Generates a secure, random hexadecimal string for emails, verification links, or password resets.
 */
export const generateCryptoToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hashes a raw token string using SHA-256 for secure database storage.
 */
export const hashCryptoToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
