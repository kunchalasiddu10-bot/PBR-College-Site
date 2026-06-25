import { Router } from 'express';
import {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getMe,
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { authLimiter } from '../middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  emailVerificationSchema,
} from '../schemas/authSchema';

const router = Router();

// Public Authenticating routes
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refresh);

// Password resets & email verifications
router.post('/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', authLimiter, validateRequest(resetPasswordSchema), resetPassword);
router.post('/verify-email/:token', validateRequest(emailVerificationSchema), verifyEmail);

// User profile recovery
router.get('/me', protect, getMe);

// Admin-only registration of new users
router.post('/register', protect, checkRole(['Admin']), validateRequest(registerSchema), register);

export default router;
