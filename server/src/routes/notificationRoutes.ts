import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
} from '../controllers/notificationController';

const router = Router();

// Protect all routes
router.use(protect);

router.get('/', getNotifications);
router.patch('/read-all', markAllNotificationsAsRead);
router.patch('/:id/read', markNotificationAsRead);
router.delete('/:id', deleteNotification);

// Preferences CRUD
router.get('/preferences', getPreferences);
router.patch('/preferences', updatePreferences);

export default router;
