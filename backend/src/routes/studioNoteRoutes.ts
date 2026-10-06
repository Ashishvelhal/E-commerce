import { Router } from 'express';
import {
  createStudioNote,
  getStudioNotes,
  getLatestStudioNote,
  updateStudioNote,
  toggleNoteComplete,
  toggleNotePin,
  deleteStudioNote,
} from '../controllers/studioNoteController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

// Apply auth & admin verification to all studio note routes
router.use(protect, adminOnly);

router.get('/', getStudioNotes);
router.get('/latest', getLatestStudioNote);
router.post('/', createStudioNote);
router.put('/:id', updateStudioNote);
router.patch('/:id/toggle-complete', toggleNoteComplete);
router.patch('/:id/toggle-pin', toggleNotePin);
router.delete('/:id', deleteStudioNote);

export default router;
