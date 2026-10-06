import { Router } from 'express';
import {
  getProductReviews,
  getAllReviews,
  createReview,
  deleteReview,
} from '../controllers/reviewController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.post('/', createReview);

// Admin-protected
router.get('/admin', protect, adminOnly, getAllReviews);
router.delete('/:id', protect, adminOnly, deleteReview);

export default router;
