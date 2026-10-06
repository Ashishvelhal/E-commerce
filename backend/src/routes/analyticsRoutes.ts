import { Router } from 'express';
import {
  getAdminAnalytics,
  logAdminAccess,
  getAdminAccessLogs,
  clearAdminAccessLogs,
} from '../controllers/analyticsController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

// Public route to capture access & login attempts (from Navbar / Login form via ipwho.is)
router.post('/admin-access-log', logAdminAccess);

// Protected Admin-only routes to view and manage security logs
router.get('/', protect, adminOnly, getAdminAnalytics);
router.get('/admin-access-logs', protect, adminOnly, getAdminAccessLogs);
router.delete('/admin-access-logs', protect, adminOnly, clearAdminAccessLogs);

export default router;
