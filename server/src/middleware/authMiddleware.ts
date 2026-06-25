import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { IUser } from '../utils/password';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  // Check authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    next(new AppError('Authentication credentials are missing. Please sign in.', 401));
    return;
  }

  try {
    // Verify the Access Token
    const decoded = verifyAccessToken(token);

    // Fetch the user details to ensure account still exists and is active
    const userDoc = await User.findById(decoded.id);

    if (!userDoc) {
      next(new AppError('Account not found.', 401));
      return;
    }

    if (userDoc.status !== 'Active') {
      next(new AppError(`Your account has been ${userDoc.status.toLowerCase()}. Please contact administration.`, 403));
      return;
    }

    // Attach user profile object to request context
    req.user = {
      id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
      department: userDoc.department,
      status: userDoc.status,
      profileImage: userDoc.profileImage,
      phoneNumber: userDoc.phoneNumber,
      emailVerified: userDoc.emailVerified,
      lastLogin: userDoc.lastLogin,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    };

    next();
  } catch (error) {
    next(new AppError('Invalid or expired authentication token. Please login again.', 401));
  }
};
export default protect;
