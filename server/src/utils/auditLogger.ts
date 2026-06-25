import AuditLog from '../models/AuditLog';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const logAudit = async (
  req: AuthenticatedRequest,
  action: string,
  details: string
): Promise<void> => {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    const userId = req.user?.id || null;

    await AuditLog.create({
      user: userId,
      action,
      ipAddress,
      userAgent,
      details,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('❌ Failed to save audit log:', error);
  }
};
