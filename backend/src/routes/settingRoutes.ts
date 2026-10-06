import { Router } from 'express';
import { getSettings, updateSettings, triggerReseed } from '../controllers/settingController';
import { protect, adminOnly } from '../middleware/auth';
import { publicApiRateLimiter, adminApiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/', publicApiRateLimiter, getSettings);
router.put('/', protect, adminOnly, adminApiRateLimiter, updateSettings);
router.post('/reseed', protect, adminOnly, triggerReseed);

export default router;
