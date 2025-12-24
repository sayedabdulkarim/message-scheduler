import { Router } from 'express';
import {
  getRecipients,
  createRecipient,
  updateRecipient,
  deleteRecipient,
} from '../controllers/recipient.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getRecipients);
router.post('/', createRecipient);
router.put('/:id', updateRecipient);
router.delete('/:id', deleteRecipient);

export default router;
