import { Router } from 'express';
import {
  register,
  login,
  refresh,
  getMe,
  updateProfile,
  toggleWishlist,
  getAllUsers,
} from '../controllers/authController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/wishlist/:productId', protect, toggleWishlist);
router.get('/users', protect, adminOnly, getAllUsers);

export default router;
