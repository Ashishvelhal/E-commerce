import { Router } from 'express';
import {
  getInventory,
  getInventoryStats,
  createInventoryItem,
  updateInventoryItem,
  quickAdjustStock,
  deleteInventoryItem,
  consumeBatchStock,
} from '../controllers/inventoryController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

// Apply auth & admin verification to all inventory routes
router.use(protect, adminOnly);

router.get('/', getInventory);
router.get('/stats', getInventoryStats);
router.post('/', createInventoryItem);
router.post('/consume-batch', consumeBatchStock);
router.put('/:id', updateInventoryItem);
router.patch('/:id/stock', quickAdjustStock);
router.delete('/:id', deleteInventoryItem);

export default router;
