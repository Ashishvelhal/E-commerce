import { Router } from 'express';
import {
  createOrder,
  createOrderByAdmin,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

// Admin manual order creation (must be before /:id)
router.post('/admin', protect, adminOnly, createOrderByAdmin);

// Guest + User checkout route
router.post('/', createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', getOrderById);

// Admin-protected routes
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;
