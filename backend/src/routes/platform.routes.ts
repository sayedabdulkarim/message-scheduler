import { Router } from 'express';
import {
  getPlatforms,
  connectWhatsApp,
  getWhatsAppStatus,
  disconnectWhatsApp,
  verifyTelegram,
  disconnectTelegram,
} from '../controllers/platform.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getPlatforms);

// WhatsApp
router.post('/whatsapp/connect', connectWhatsApp);
router.get('/whatsapp/status', getWhatsAppStatus);
router.delete('/whatsapp', disconnectWhatsApp);

// Telegram
router.post('/telegram/verify', verifyTelegram);
router.delete('/telegram', disconnectTelegram);

export default router;
