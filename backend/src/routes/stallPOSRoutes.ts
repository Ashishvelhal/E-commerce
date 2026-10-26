import { Router } from 'express';
import {
  getActiveSession,
  startSession,
  createStallOrder,
  getStallSessionSummary,
  closeStallSession,
  getStallSessions,
} from '../controllers/stallPOSController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

// Protect all Stall POS routes for admin only
router.use(protect, adminOnly);

router.get('/session/active', getActiveSession);
router.post('/session/start', startSession);
router.post('/orders', createStallOrder);
router.get('/session/:id/summary', getStallSessionSummary);
router.post('/session/:id/close', closeStallSession);
router.get('/sessions', getStallSessions);

export default router;
