import { Router } from 'express';
import {
  getPosts,
  getPostByIdentifier,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/postController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', getPosts);
router.get('/:identifier', getPostByIdentifier);

// Admin-protected routes
router.post('/', protect, adminOnly, createPost);
router.put('/:id', protect, adminOnly, updatePost);
router.delete('/:id', protect, adminOnly, deletePost);

export default router;
