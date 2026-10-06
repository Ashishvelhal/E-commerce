import { Request, Response } from 'express';
import { Recipe } from '../models/Recipe';
import { Inventory } from '../models/Inventory';
import { StudioNote } from '../models/StudioNote';

// Helper to calculate live recipe material cost
const calculateLiveCost = async (recipe: any) => {
  let totalMaterialCost = 0;
  const materialsWithLiveCost = [];

  for (const mat of recipe.materials) {
    let liveCostPerUnit = mat.costPerUnit || 0;

    if (mat.inventoryItem) {
      const inv = await Inventory.findById(mat.inventoryItem);
      if (inv && inv.costPerUnit > 0) {
        liveCostPerUnit = inv.costPerUnit;
      }
    } else {
      // Find inventory item by name if reference is not linked
      const inv = await Inventory.findOne({ name: new RegExp(mat.name, 'i') });
      if (inv && inv.costPerUnit > 0) {
        liveCostPerUnit = inv.costPerUnit;
      }
    }

    const lineCost = Number((liveCostPerUnit * mat.quantity).toFixed(2));
    totalMaterialCost += lineCost;

    materialsWithLiveCost.push({
      ...mat.toObject ? mat.toObject() : mat,
      costPerUnit: liveCostPerUnit,
      lineCost,
    });
  }

  const laborCost = Number(((recipe.laborMinutes / 60) * (recipe.laborRatePerHour || 180)).toFixed(2));
  const totalCost = Number(
    (totalMaterialCost + laborCost + (recipe.packagingCost || 25) + (recipe.studioOverhead || 15)).toFixed(2)
  );

  return {
    ...recipe.toObject ? recipe.toObject() : recipe,
    materials: materialsWithLiveCost,
    totalMaterialCost: Number(totalMaterialCost.toFixed(2)),
    laborCost,
    totalCost,
  };
};

// @desc    Get all BOM recipes with live costing
// @route   GET /api/recipes
// @access  Private/Admin
export const getRecipes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const recipes = await Recipe.find().sort({ name: 1 });
    const enriched = await Promise.all(recipes.map((r) => calculateLiveCost(r)));

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get single recipe by ID or slug
// @route   GET /api/recipes/:id
// @access  Private/Admin
export const getRecipeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let recipe = await Recipe.findById(id);
    if (!recipe) {
      recipe = await Recipe.findOne({ slug: id });
    }

    if (!recipe) {
      res.status(404).json({ success: false, message: 'Recipe not found' });
      return;
    }

    const enriched = await calculateLiveCost(recipe);

    res.json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Create new BOM recipe
// @route   POST /api/recipes
// @access  Private/Admin
export const createRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      productType,
      description,
      materials,
      laborMinutes,
      laborRatePerHour,
      packagingCost,
      studioOverhead,
      defaultCureHours,
      suggestedRetailPrice,
      tags,
    } = req.body;

    if (!name || !productType || !materials || !Array.isArray(materials) || materials.length === 0) {
      res.status(400).json({ success: false, message: 'Please provide recipe name, product type, and materials list' });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const recipe = await Recipe.create({
      name,
      slug,
      productType,
      description: description || '',
      materials,
      laborMinutes: laborMinutes || 30,
      laborRatePerHour: laborRatePerHour || 180,
      packagingCost: packagingCost || 25,
      studioOverhead: studioOverhead || 15,
      defaultCureHours: defaultCureHours || 24,
      suggestedRetailPrice: suggestedRetailPrice || 0,
      tags: tags || [],
    });

    const enriched = await calculateLiveCost(recipe);

    res.status(201).json({
      success: true,
      message: 'BOM recipe created successfully',
      data: enriched,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Update BOM recipe
// @route   PUT /api/recipes/:id
// @access  Private/Admin
export const updateRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      res.status(404).json({ success: false, message: 'Recipe not found' });
      return;
    }

    const fields = [
      'name',
      'productType',
      'description',
      'materials',
      'laborMinutes',
      'laborRatePerHour',
      'packagingCost',
      'studioOverhead',
      'defaultCureHours',
      'suggestedRetailPrice',
      'tags',
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        (recipe as any)[f] = req.body[f];
      }
    });

    if (req.body.name) {
      recipe.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    await recipe.save();
    const enriched = await calculateLiveCost(recipe);

    res.json({
      success: true,
      message: 'Recipe updated successfully',
      data: enriched,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Delete BOM recipe
// @route   DELETE /api/recipes/:id
// @access  Private/Admin
export const deleteRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findByIdAndDelete(id);

    if (!recipe) {
      res.status(404).json({ success: false, message: 'Recipe not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Recipe deleted successfully',
      data: { id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Consume BOM Recipe: Deducts all composite materials from inventory simultaneously
// @route   POST /api/recipes/consume
// @access  Private/Admin
export const consumeRecipeStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipeId, recipeSlug, productType, units = 1, batchNotes } = req.body;
    const multiplier = Math.max(1, Number(units) || 1);

    let recipe = null;
    if (recipeId) {
      recipe = await Recipe.findById(recipeId);
    }
    if (!recipe && recipeSlug) {
      recipe = await Recipe.findOne({ slug: recipeSlug });
    }
    if (!recipe && productType) {
      recipe = await Recipe.findOne({ productType });
    }

    if (!recipe) {
      // Fallback search by matching product name
      recipe = await Recipe.findOne({ name: new RegExp(productType || recipeSlug || '', 'i') });
    }

    if (!recipe) {
      res.status(404).json({ success: false, message: 'Specified recipe not found' });
      return;
    }

    const deductedItems: any[] = [];
    const lowStockAlerts: string[] = [];
    let totalBatchMaterialCost = 0;
    let totalResinGrams = 0;

    for (const mat of recipe.materials) {
      const requiredQty = mat.quantity * multiplier;
      let invItem = null;

      if (mat.inventoryItem) {
        invItem = await Inventory.findById(mat.inventoryItem);
      }
      if (!invItem) {
        invItem = await Inventory.findOne({ name: new RegExp(mat.name, 'i') });
      }

      if (invItem) {
        const lineCost = Number((invItem.costPerUnit * requiredQty).toFixed(2));
        totalBatchMaterialCost += lineCost;

        invItem.currentStock = Math.max(0, invItem.currentStock - requiredQty);
        await invItem.save();

        if (invItem.category === 'Resin & Hardener' && (invItem.unit === 'g' || invItem.unit === 'kg')) {
          totalResinGrams += invItem.unit === 'kg' ? requiredQty * 1000 : requiredQty;
        }

        deductedItems.push({
          name: invItem.name,
          deducted: requiredQty,
          unit: invItem.unit,
          remaining: invItem.currentStock,
          cost: lineCost,
        });

        if (invItem.currentStock <= invItem.minStockAlert) {
          lowStockAlerts.push(invItem.name);
        }
      } else {
        const estimatedLineCost = Number((mat.costPerUnit * requiredQty).toFixed(2));
        totalBatchMaterialCost += estimatedLineCost;
        deductedItems.push({
          name: mat.name,
          deducted: requiredQty,
          unit: mat.unit,
          remaining: 'Untracked',
          cost: estimatedLineCost,
        });
      }
    }

    totalBatchMaterialCost = Number(totalBatchMaterialCost.toFixed(2));

    // Auto-record Studio Note for batch traceability
    const noteContent = `📦 Executed ${multiplier}x "${recipe.name}" Recipe\n` +
      `• Materials Deducted:\n` +
      deductedItems.map((d) => `  - ${d.name}: ${d.deducted} ${d.unit} (₹${d.cost})`).join('\n') +
      `\n• Total Material Investment: ₹${totalBatchMaterialCost.toFixed(2)}` +
      (batchNotes ? `\n• Notes: ${batchNotes}` : '');

    await StudioNote.create({
      title: `Recipe Pour: ${multiplier}x ${recipe.name}`,
      content: noteContent,
      category: 'formula',
      productType: recipe.productType,
      rawResinGramsDeducted: totalResinGrams,
      materialCost: totalBatchMaterialCost,
      author: (req as any).user?.name || 'Admin Voice Engine',
    });

    res.json({
      success: true,
      message: `Successfully deducted all materials for ${multiplier}x ${recipe.name}`,
      data: {
        recipeName: recipe.name,
        multiplier,
        totalMaterialCost: totalBatchMaterialCost,
        totalResinGrams,
        cureTimeHours: recipe.defaultCureHours,
        deductedItems,
        lowStockAlerts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
