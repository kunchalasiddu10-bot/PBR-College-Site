import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getConversations,
  createConversation,
  getChatMessages,
  sendChatMessage,
  searchUsers,
} from '../controllers/chatController';

const router = Router();

router.use(protect);

router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/users/search', searchUsers);
router.get('/conversations/:id/messages', getChatMessages);
router.post('/conversations/:id/messages', sendChatMessage);

export default router;
