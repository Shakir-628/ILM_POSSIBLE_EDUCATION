import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getChatbotConfig,
  updateChatbotConfig,
  handleChat
} from '../controllers/chatbotController.js';

const router = express.Router();

// All chatbot routes require authentication
router.use(protect);

router.get('/config', getChatbotConfig);
router.put('/config', authorize('admin', 'superadmin'), updateChatbotConfig);
router.post('/chat', handleChat);

export default router;
