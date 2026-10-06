import { Router } from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getProductByIdentifier,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getFrequentlyBoughtTogether,
} from '../controllers/productController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/:productId/frequently-bought-together', getFrequentlyBoughtTogether);
router.get('/:identifier', getProductByIdentifier);

// Category Admin routes
router.post('/categories', protect, adminOnly, createCategory);
router.put('/categories/:id', protect, adminOnly, updateCategory);
router.delete('/categories/:id', protect, adminOnly, deleteCategory);

// Product Admin routes
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
