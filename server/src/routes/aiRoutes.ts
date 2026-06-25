import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  postAIChat,
  getAISessions,
  getSessionMessages,
  createAISession,
  deleteAISession,
  getSavedPrompts,
  createSavedPrompt,
  deleteSavedPrompt,
  getUserPreferences,
  updateUserPreferences,
} from '../controllers/aiController';

const router = Router();

// Protect all AI routes
router.use(protect);

// Chat & sessions
router.post('/chat', postAIChat);
router.get('/sessions', getAISessions);
router.post('/sessions', createAISession);
router.get('/sessions/:id/messages', getSessionMessages);
router.delete('/sessions/:id', deleteAISession);

// Saved prompt shortcuts
router.get('/saved-prompts', getSavedPrompts);
router.post('/saved-prompts', createSavedPrompt);
router.delete('/saved-prompts/:id', deleteSavedPrompt);

// User Preferences
router.get('/preferences', getUserPreferences);
router.patch('/preferences', updateUserPreferences);

export default router;
