import { Router } from 'express';
import { getLogs, getStats } from '../controllers/log.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getLogs);
router.get('/stats', getStats);

export default router;
