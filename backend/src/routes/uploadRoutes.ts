import { Router } from 'express';
import { uploadFile } from '../controllers/uploadController';
import { upload } from '../middleware/upload';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.post('/', protect, adminOnly, upload.single('file'), uploadFile);
router.post('/multiple', protect, adminOnly, upload.array('files', 10), uploadFile);

export default router;
