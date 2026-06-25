import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  viewAnnouncement,
} from '../controllers/announcementController';

const router = Router();

router.use(protect);

router.get('/', getAnnouncements);
router.post('/', createAnnouncement);
router.patch('/:id', updateAnnouncement);
router.post('/:id/view', viewAnnouncement);

export default router;
