import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { AppError } from '../utils/AppError';

/**
 * Middleware to restrict access based on user role.
 * Example: checkRole(['Admin', 'HOD'])
 */
export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication context missing.', 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError('Access denied: Insufficient privileges to view this resource.', 403));
      return;
    }

    next();
  };
};
export default checkRole;
