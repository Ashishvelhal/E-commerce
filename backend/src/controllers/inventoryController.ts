import { Request, Response } from 'express';
import { Inventory } from '../models/Inventory';

// @desc    Get all inventory items with optional filters
// @route   GET /api/inventory
// @access  Private/Admin
export const getInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, type, lowStock, search, sort } = req.query;

    const query: any = {};

    if (category && typeof category === 'string' && category !== 'All') {
      query.category = category;
    }

    if (type && typeof type === 'string' && type !== 'All') {
      query.type = type;
    }

    if (lowStock === 'true') {
      query.$expr = { $lte: ['$currentStock', '$minStockAlert'] };
    }

// Helper to escape regex special characters
const escapeRegex = (text: string) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = escapeRegex(search.trim());
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { supplier: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } },
        { notes: { $regex: term, $options: 'i' } },
      ];
    }

    let sortOptions: any = { createdAt: -1 };
    if (sort === 'name_asc') sortOptions = { name: 1 };
    else if (sort === 'name_desc') sortOptions = { name: -1 };
    else if (sort === 'stock_asc') sortOptions = { currentStock: 1 };
    else if (sort === 'stock_desc') sortOptions = { currentStock: -1 };
    else if (sort === 'cost_asc') sortOptions = { costPerUnit: 1 };
    else if (sort === 'cost_desc') sortOptions = { costPerUnit: -1 };

    const items = await Inventory.find(query).sort(sortOptions);

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get inventory summary statistics (total items, low stock alerts, valuation)
// @route   GET /api/inventory/stats
// @access  Private/Admin
export const getInventoryStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await Inventory.find();

    const totalItems = items.length;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalValuation = 0;

    const categoryBreakdown: Record<string, number> = {};

    items.forEach((item) => {
      if (item.currentStock === 0) {
        outOfStockCount++;
      } else if (item.currentStock <= item.minStockAlert) {
        lowStockCount++;
      }

      totalValuation += item.currentStock * item.costPerUnit;

      categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalItems,
        lowStockCount,
        outOfStockCount,
        totalValuation: Math.round(totalValuation * 100) / 100,
        categoryBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private/Admin
export const createInventoryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      category,
      type,
      unit,
      currentStock,
      minStockAlert,
      purchasePrice,
      purchaseQuantity,
      supplier,
      location,
      notes,
    } = req.body;

    if (!name || !category || !type || !unit) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' });
      return;
    }

    const costPerUnit =
      purchaseQuantity && Number(purchaseQuantity) > 0
        ? Number((Number(purchasePrice || 0) / Number(purchaseQuantity)).toFixed(4))
        : 0;

    const item = await Inventory.create({
      name,
      category,
      type,
      unit,
      currentStock: Number(currentStock || 0),
      minStockAlert: Number(minStockAlert || 10),
      purchasePrice: Number(purchasePrice || 0),
      purchaseQuantity: Number(purchaseQuantity || 1),
      costPerUnit,
      supplier: supplier || '',
      location: location || 'Main Warehouse',
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: item,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private/Admin
export const updateInventoryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await Inventory.findById(id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Inventory item not found' });
      return;
    }

    const {
      name,
      category,
      type,
      unit,
      currentStock,
      minStockAlert,
      purchasePrice,
      purchaseQuantity,
      supplier,
      location,
      notes,
    } = req.body;

    if (name !== undefined) existing.name = name;
    if (category !== undefined) existing.category = category;
    if (type !== undefined) existing.type = type;
    if (unit !== undefined) existing.unit = unit;
    if (currentStock !== undefined) existing.currentStock = Math.max(0, Number(currentStock));
    if (minStockAlert !== undefined) existing.minStockAlert = Math.max(0, Number(minStockAlert));
    if (purchasePrice !== undefined) existing.purchasePrice = Math.max(0, Number(purchasePrice));
    if (purchaseQuantity !== undefined) existing.purchaseQuantity = Math.max(0.001, Number(purchaseQuantity));
    if (supplier !== undefined) existing.supplier = supplier;
    if (location !== undefined) existing.location = location;
    if (notes !== undefined) existing.notes = notes;

    existing.costPerUnit = Number((existing.purchasePrice / existing.purchaseQuantity).toFixed(4));

    const updated = await existing.save();

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Quick adjust stock quantity (+ / -)
// @route   PATCH /api/inventory/:id/stock
// @access  Private/Admin
export const quickAdjustStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { delta, newStock } = req.body;

    const item = await Inventory.findById(id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Inventory item not found' });
      return;
    }

    if (newStock !== undefined) {
      item.currentStock = Math.max(0, Number(newStock));
    } else if (delta !== undefined) {
      item.currentStock = Math.max(0, item.currentStock + Number(delta));
    } else {
      res.status(400).json({ success: false, message: 'Please provide delta or newStock value' });
      return;
    }

    const updated = await item.save();

    res.json({
      success: true,
      message: `Stock updated to ${updated.currentStock} ${updated.unit}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private/Admin
export const deleteInventoryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await Inventory.findByIdAndDelete(id);

    if (!item) {
      res.status(404).json({ success: false, message: 'Inventory item not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Inventory item deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Automatically deduct resin & hardener stock for a workshop pour batch
// @route   POST /api/inventory/consume-batch
// @access  Private/Admin
export const consumeBatchStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { totalGrams, ratioA = 2, ratioB = 1, productName, batchNotes } = req.body;

    const grams = Number(totalGrams);
    if (!grams || grams <= 0) {
      res.status(400).json({ success: false, message: 'Please specify a valid total resin weight in grams' });
      return;
    }

    const totalRatio = Number(ratioA) + Number(ratioB);
    const partAGrams = Number(((grams * Number(ratioA)) / totalRatio).toFixed(1));
    const partBGrams = Number(((grams * Number(ratioB)) / totalRatio).toFixed(1));

    // Find Resin & Hardener stock items
    const allResinItems = await Inventory.find({ category: 'Resin & Hardener' });

    let partAItem = allResinItems.find((i) => /part\s*a|resin/i.test(i.name) && !/hardener/i.test(i.name));
    let partBItem = allResinItems.find((i) => /part\s*b|hardener/i.test(i.name));

    const deductedItems: any[] = [];
    const lowStockAlerts: string[] = [];

    if (partAItem && partBItem && partAItem._id.toString() !== partBItem._id.toString()) {
      // Deduct from separate Part A and Part B records
      partAItem.currentStock = Math.max(0, partAItem.currentStock - partAGrams);
      await partAItem.save();
      deductedItems.push({ name: partAItem.name, deducted: partAGrams, unit: partAItem.unit, remaining: partAItem.currentStock });
      if (partAItem.currentStock <= partAItem.minStockAlert) lowStockAlerts.push(partAItem.name);

      partBItem.currentStock = Math.max(0, partBItem.currentStock - partBGrams);
      await partBItem.save();
      deductedItems.push({ name: partBItem.name, deducted: partBGrams, unit: partBItem.unit, remaining: partBItem.currentStock });
      if (partBItem.currentStock <= partBItem.minStockAlert) lowStockAlerts.push(partBItem.name);
    } else if (allResinItems.length > 0) {
      // Deduct total grams from the first available resin kit
      const primaryResin = allResinItems[0];
      primaryResin.currentStock = Math.max(0, primaryResin.currentStock - grams);
      await primaryResin.save();
      deductedItems.push({ name: primaryResin.name, deducted: grams, unit: primaryResin.unit, remaining: primaryResin.currentStock });
      if (primaryResin.currentStock <= primaryResin.minStockAlert) lowStockAlerts.push(primaryResin.name);
    } else {
      // Create a default inventory item if none existed
      const created = await Inventory.create({
        name: 'Standard Epoxy Art Resin Kit (2:1)',
        category: 'Resin & Hardener',
        type: 'Liquid',
        unit: 'g',
        currentStock: Math.max(0, 1500 - grams),
        minStockAlert: 200,
        purchasePrice: 1200,
        purchaseQuantity: 1500,
        costPerUnit: 0.8,
        supplier: 'Artisans Choice',
      });
      deductedItems.push({ name: created.name, deducted: grams, unit: 'g', remaining: created.currentStock });
    }

    res.json({
      success: true,
      message: `Successfully deducted ${grams}g total resin for ${productName || 'workshop batch'}`,
      data: {
        totalGrams: grams,
        partAGrams,
        partBGrams,
        deductedItems,
        lowStockAlerts,
        productName: productName || 'Custom Pour',
        batchNotes: batchNotes || '',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

