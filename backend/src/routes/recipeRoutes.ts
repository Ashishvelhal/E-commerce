import express from 'express';
import {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  consumeRecipeStock,
} from '../controllers/recipeController';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

router.route('/').get(getRecipes).post(protect, adminOnly, createRecipe);
router.route('/consume').post(protect, adminOnly, consumeRecipeStock);
router
  .route('/:id')
  .get(getRecipeById)
  .put(protect, adminOnly, updateRecipe)
  .delete(protect, adminOnly, deleteRecipe);

export default router;
