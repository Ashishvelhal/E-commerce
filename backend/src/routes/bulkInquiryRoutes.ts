import { Router } from 'express';
import {
  createBulkInquiry,
  getBulkInquiries,
  updateBulkInquiry,
  deleteBulkInquiry,
} from '../controllers/bulkInquiryController';
import { protect, admin } from '../middleware/auth';

const router = Router();

// Public route to submit an inquiry
router.post('/', createBulkInquiry);

// Protected Admin routes
router.get('/', protect, admin, getBulkInquiries);
router.put('/:id', protect, admin, updateBulkInquiry);
router.delete('/:id', protect, admin, deleteBulkInquiry);

export default router;
