import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/User';
import AppError from '../utils/AppError';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import {
  generateCryptoToken,
  hashCryptoToken,
} from '../utils/password';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// Helper to set cookie settings
const setRefreshTokenCookie = (res: Response, token: string) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProduction,           // HTTPS only in production
    sameSite: isProduction ? 'none' : 'strict', // 'none' required for cross-domain on Render
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * Register User Profile (Admin restricted)
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      next(new AppError('A user with this email address already exists.', 400));
      return;
    }

    // Create verification token
    const rawVerifyToken = generateCryptoToken();
    const hashedVerifyToken = hashCryptoToken(rawVerifyToken);

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      department,
      emailVerificationToken: hashedVerifyToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 Hours
    });

    // Mock verification email delivery by logging to console
    console.log('\n✉️  [MOCK EMAIL SERVICE] verification URL:');
    console.log(`👉 http://localhost:5173/verify-email/${rawVerifyToken}\n`);

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully. A verification link has been logged.',
      data: {
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User Login authentication
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Fetch user and explicitly request password field
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      next(new AppError('Invalid email address or password.', 401));
      return;
    }

    if (user.status !== 'Active') {
      next(new AppError(`Your account is currently ${user.status.toLowerCase()}. Please contact administration.`, 403));
      return;
    }

    if (!user.emailVerified) {
      next(new AppError('Please verify your email address before signing in.', 403));
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({ id: user._id.toString() });

    // Save refresh token to DB
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Set refresh token in HttpOnly Cookie
    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully.',
      data: {
        accessToken,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          profileImage: user.profileImage,
          emailVerified: user.emailVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Token rotation (Silent refresh check)
 */
export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      next(new AppError('Refresh token is missing. Please sign in again.', 401));
      return;
    }

    // Verify token validity
    const decoded = verifyRefreshToken(token);

    // Fetch matching user session
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      next(new AppError('Invalid refresh session. Please authenticate again.', 401));
      return;
    }

    if (user.status !== 'Active') {
      next(new AppError('Your account has been locked.', 403));
      return;
    }

    // Generate fresh token pairs (Rotation)
    const newAccessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    const newRefreshToken = generateRefreshToken({ id: user._id.toString() });

    user.refreshToken = newRefreshToken;
    await user.save();

    setRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({
      status: 'success',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(new AppError('Failed to refresh authentication session.', 401));
  }
};

/**
 * User Logout
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      // Decode and clear database token logs
      try {
        const decoded = verifyRefreshToken(token);
        await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
      } catch (err) {
        // Suppress decode error and continue cookie wipe
      }
    }

    // Wipe cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password entrypoint
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Protect against user enumeration by returning success regardless
      res.status(200).json({
        status: 'success',
        message: 'If the email matches a registered account, a reset link will be sent.',
      });
      return;
    }

    const resetToken = generateCryptoToken();
    user.passwordResetToken = hashCryptoToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 Hour

    await user.save();

    // Mock reset email link
    console.log('\n✉️  [MOCK EMAIL SERVICE] Password Reset URL:');
    console.log(`👉 http://localhost:5173/reset-password/${resetToken}\n`);

    res.status(200).json({
      status: 'success',
      message: 'If the email matches a registered account, a reset link will be sent.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password handler
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = hashCryptoToken(token);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      next(new AppError('The password reset link is invalid or has expired.', 400));
      return;
    }

    // Update password (pre-save hook will hash it)
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.refreshToken = null; // Forces log out of other devices
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password has been updated successfully. Please login with your new credentials.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Email token
 */
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params;
    const hashedToken = hashCryptoToken(token);

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      next(new AppError('The verification link is invalid or has expired.', 400));
      return;
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Your email address has been verified successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active session user profile
 */
export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};
