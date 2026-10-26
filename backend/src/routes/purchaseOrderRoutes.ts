import { Router } from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  receivePurchaseOrder,
  generateOneClickPO,
} from '../controllers/supplierController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

// Protect all purchase order routes for admin only
router.use(protect, adminOnly);

router.get('/', getPurchaseOrders);
router.post('/', createPurchaseOrder);
router.post('/one-click-auto', generateOneClickPO);
router.get('/:id', getPurchaseOrderById);
router.post('/:id/receive', receivePurchaseOrder);

export default router;
