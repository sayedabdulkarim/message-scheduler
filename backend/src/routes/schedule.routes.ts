import { Router } from 'express';
import {
  getSchedules,
  createSchedule,
  getSchedule,
  updateSchedule,
  deleteSchedule,
  toggleSchedule,
  testSchedule,
} from '../controllers/schedule.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getSchedules);
router.post('/', createSchedule);
router.get('/:id', getSchedule);
router.put('/:id', updateSchedule);
router.delete('/:id', deleteSchedule);
router.post('/:id/toggle', toggleSchedule);
router.post('/:id/test', testSchedule);

export default router;
