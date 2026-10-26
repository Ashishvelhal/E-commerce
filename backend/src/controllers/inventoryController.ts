import { Request, Response } from 'express';
import { Inventory } from '../models/Inventory';
import { StockMovement } from '../models/StockMovement';
import { Product } from '../models/Product';
import { AuthRequest } from '../types';
import { validatePayload, sendValidationError, sendNotFound } from '../utils/responseHelper';

const escapeRegex = (text: string) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

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
    const validation = validatePayload(req.body, [
      { field: 'name', label: 'Material Name', type: 'string', min: 2, customErrorMessage: 'Material name is required.' },
      { field: 'category', label: 'Category', type: 'string', min: 2, customErrorMessage: 'Category is required (e.g., "Resin & Hardener", "Pigments", "Hardware", "Molds").' },
      { field: 'type', label: 'Type', type: 'string', min: 2, customErrorMessage: 'Material type is required.' },
      { field: 'unit', label: 'Unit of Measure', type: 'string', min: 1, customErrorMessage: 'Unit is required (e.g., "g", "kg", "ml", "pcs").' },
    ]);

    if (!validation.isValid) {
      sendValidationError(res, {
        message: validation.summaryMessage,
        missingFields: validation.missingFields,
        fieldErrors: validation.fieldErrors,
        actionableSuggestion: validation.actionableSuggestion,
      });
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
      sendNotFound(res, 'Inventory item', id);
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

// @desc    Quick adjust stock quantity (+ / -) with automatic audit movement log
// @route   PATCH /api/inventory/:id/stock
// @access  Private/Admin
export const quickAdjustStock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { delta, newStock, movementType, notes, referenceId } = req.body;

    const item = await Inventory.findById(id);
    if (!item) {
      sendNotFound(res, 'Inventory item', id);
      return;
    }

    const prevStock = item.currentStock;
    let actualDelta = 0;

    if (newStock !== undefined) {
      const target = Math.max(0, Number(newStock));
      actualDelta = Number((target - prevStock).toFixed(2));
      item.currentStock = target;
    } else if (delta !== undefined) {
      actualDelta = Number(Number(delta).toFixed(2));
      item.currentStock = Math.max(0, Number((prevStock + actualDelta).toFixed(2)));
    } else {
      sendValidationError(res, {
        message: 'Missing adjustment parameter: Provide either "delta" (+/- quantity) or "newStock" (total count).',
        missingFields: ['delta', 'newStock'],
        actionableSuggestion: 'Provide a number for delta (e.g. { delta: 5 }) or newStock (e.g. { newStock: 100 }).',
      });
      return;
    }

    const updated = await item.save();

    // Automatically record movement audit log
    if (actualDelta !== 0) {
      const type = movementType || (actualDelta > 0 ? 'Purchase' : 'Audit Correction');
      await StockMovement.create({
        inventoryItem: item._id,
        itemName: item.name,
        category: item.category,
        movementType: type,
        quantityChange: actualDelta,
        previousStock: prevStock,
        newStock: item.currentStock,
        unit: item.unit,
        referenceId: referenceId || '',
        performedBy: req.user?.name || 'Admin',
        notes: notes || `Quick stock adjust: ${actualDelta > 0 ? '+' : ''}${actualDelta} ${item.unit}`,
        costImpact: Number((Math.abs(actualDelta) * (item.costPerUnit || 0)).toFixed(2)),
      });
    }

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
      sendNotFound(res, 'Inventory item', id);
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

// @desc    Automatically deduct resin & hardener stock for a workshop pour batch and log movement
// @route   POST /api/inventory/consume-batch
// @access  Private/Admin
export const consumeBatchStock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validation = validatePayload(req.body, [
      { field: 'totalGrams', label: 'Total Resin Weight (grams)', type: 'number', min: 1, customErrorMessage: 'Total resin weight in grams must be greater than 0.' },
    ]);

    if (!validation.isValid) {
      sendValidationError(res, {
        message: validation.summaryMessage,
        missingFields: validation.missingFields,
        fieldErrors: validation.fieldErrors,
        actionableSuggestion: 'Specify the total resin mix weight in grams (e.g., { totalGrams: 240 }).',
      });
      return;
    }

    const { totalGrams, ratioA = 2, ratioB = 1, productName, batchNotes } = req.body;
    const grams = Number(totalGrams);

    const totalRatio = Number(ratioA) + Number(ratioB);
    const partAGrams = Number(((grams * Number(ratioA)) / totalRatio).toFixed(1));
    const partBGrams = Number(((grams * Number(ratioB)) / totalRatio).toFixed(1));

    // Find Resin & Hardener stock items
    const allResinItems = await Inventory.find({ category: 'Resin & Hardener' });

    let partAItem = allResinItems.find((i) => /part\s*a|resin/i.test(i.name) && !/hardener/i.test(i.name));
    let partBItem = allResinItems.find((i) => /part\s*b|hardener/i.test(i.name));

    const deductedItems: any[] = [];
    const lowStockAlerts: string[] = [];
    const performer = req.user?.name || 'Studio Admin';

    if (partAItem && partBItem && partAItem._id.toString() !== partBItem._id.toString()) {
      // Deduct Part A
      const prevA = partAItem.currentStock;
      partAItem.currentStock = Math.max(0, Number((prevA - partAGrams).toFixed(2)));
      await partAItem.save();
      deductedItems.push({ name: partAItem.name, deducted: partAGrams, unit: partAItem.unit, remaining: partAItem.currentStock });
      if (partAItem.currentStock <= partAItem.minStockAlert) lowStockAlerts.push(partAItem.name);

      await StockMovement.create({
        inventoryItem: partAItem._id,
        itemName: partAItem.name,
        category: partAItem.category,
        movementType: 'Studio Production',
        quantityChange: -partAGrams,
        previousStock: prevA,
        newStock: partAItem.currentStock,
        unit: partAItem.unit,
        referenceId: productName || 'Studio Batch Pour',
        performedBy: performer,
        notes: batchNotes || `Batch pour Part A (${ratioA}:${ratioB})`,
        costImpact: Number((partAGrams * (partAItem.costPerUnit || 0)).toFixed(2)),
      });

      // Deduct Part B
      const prevB = partBItem.currentStock;
      partBItem.currentStock = Math.max(0, Number((prevB - partBGrams).toFixed(2)));
      await partBItem.save();
      deductedItems.push({ name: partBItem.name, deducted: partBGrams, unit: partBItem.unit, remaining: partBItem.currentStock });
      if (partBItem.currentStock <= partBItem.minStockAlert) lowStockAlerts.push(partBItem.name);

      await StockMovement.create({
        inventoryItem: partBItem._id,
        itemName: partBItem.name,
        category: partBItem.category,
        movementType: 'Studio Production',
        quantityChange: -partBGrams,
        previousStock: prevB,
        newStock: partBItem.currentStock,
        unit: partBItem.unit,
        referenceId: productName || 'Studio Batch Pour',
        performedBy: performer,
        notes: batchNotes || `Batch pour Part B (${ratioA}:${ratioB})`,
        costImpact: Number((partBGrams * (partBItem.costPerUnit || 0)).toFixed(2)),
      });
    } else if (allResinItems.length > 0) {
      const primaryResin = allResinItems[0];
      const prev = primaryResin.currentStock;
      primaryResin.currentStock = Math.max(0, Number((prev - grams).toFixed(2)));
      await primaryResin.save();
      deductedItems.push({ name: primaryResin.name, deducted: grams, unit: primaryResin.unit, remaining: primaryResin.currentStock });
      if (primaryResin.currentStock <= primaryResin.minStockAlert) lowStockAlerts.push(primaryResin.name);

      await StockMovement.create({
        inventoryItem: primaryResin._id,
        itemName: primaryResin.name,
        category: primaryResin.category,
        movementType: 'Studio Production',
        quantityChange: -grams,
        previousStock: prev,
        newStock: primaryResin.currentStock,
        unit: primaryResin.unit,
        referenceId: productName || 'Studio Batch Pour',
        performedBy: performer,
        notes: batchNotes || `Resin pour batch deduction`,
        costImpact: Number((grams * (primaryResin.costPerUnit || 0)).toFixed(2)),
      });
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

// @desc    Get stock movement audit history
// @route   GET /api/inventory/movements
// @access  Private/Admin
export const getStockMovements = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 25, movementType, search, inventoryItem } = req.query;
    const pageNumber = Math.max(1, Number(page));
    const pageSize = Math.max(1, Number(limit));
    const skip = (pageNumber - 1) * pageSize;

    const query: any = {};
    if (movementType && movementType !== 'All') {
      query.movementType = movementType;
    }
    if (inventoryItem) {
      query.inventoryItem = inventoryItem;
    }
    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = escapeRegex(search.trim());
      query.$or = [
        { itemName: { $regex: term, $options: 'i' } },
        { referenceId: { $regex: term, $options: 'i' } },
        { performedBy: { $regex: term, $options: 'i' } },
        { notes: { $regex: term, $options: 'i' } },
      ];
    }

    const total = await StockMovement.countDocuments(query);
    const movements = await StockMovement.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    res.json({
      success: true,
      data: movements,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
        limit: pageSize,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Record manual stock movement (spillage, correction, return, etc.)
// @route   POST /api/inventory/movements
// @access  Private/Admin
export const recordManualMovement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validation = validatePayload(req.body, [
      { field: 'inventoryItemId', label: 'Inventory Item', type: 'string', min: 5, customErrorMessage: 'Valid inventory item reference is required.' },
      { field: 'movementType', label: 'Movement Type', type: 'string', min: 2, customErrorMessage: 'Movement type (Purchase, Spillage / Damage, Audit Correction, etc.) is required.' },
      { field: 'quantityChange', label: 'Quantity Change', type: 'number', customErrorMessage: 'Quantity change is required.' },
    ]);

    if (!validation.isValid) {
      sendValidationError(res, {
        message: validation.summaryMessage,
        missingFields: validation.missingFields,
        fieldErrors: validation.fieldErrors,
        actionableSuggestion: validation.actionableSuggestion,
      });
      return;
    }

    const { inventoryItemId, movementType, quantityChange, notes, referenceId } = req.body;
    const item = await Inventory.findById(inventoryItemId);
    if (!item) {
      sendNotFound(res, 'Inventory item', inventoryItemId);
      return;
    }

    const prevStock = item.currentStock;
    const qtyChange = Number(Number(quantityChange).toFixed(2));
    const newStock = Math.max(0, Number((prevStock + qtyChange).toFixed(2)));

    item.currentStock = newStock;
    await item.save();

    const movement = await StockMovement.create({
      inventoryItem: item._id,
      itemName: item.name,
      category: item.category,
      movementType,
      quantityChange: qtyChange,
      previousStock: prevStock,
      newStock,
      unit: item.unit,
      referenceId: referenceId || '',
      performedBy: req.user?.name || 'Admin',
      notes: notes || '',
      costImpact: Number((Math.abs(qtyChange) * (item.costPerUnit || 0)).toFixed(2)),
    });

    res.status(201).json({
      success: true,
      message: `Recorded ${movementType} of ${qtyChange > 0 ? '+' : ''}${qtyChange} ${item.unit} for "${item.name}"`,
      data: movement,
      updatedStock: newStock,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get Inventory Capital Valuation & Dead-Stock Analytics
// @route   GET /api/inventory/analytics/dead-stock
// @access  Private/Admin
export const getInventoryValuationAndDeadStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawMaterials = await Inventory.find();
    const products = await Product.find();

    let rawMaterialsCapital = 0;
    const rawCategoryValuation: Record<string, number> = {};

    rawMaterials.forEach((item) => {
      const val = Number((item.currentStock * (item.costPerUnit || 0)).toFixed(2));
      rawMaterialsCapital += val;
      rawCategoryValuation[item.category] = Number(((rawCategoryValuation[item.category] || 0) + val).toFixed(2));
    });

    let finishedGoodsCapital = 0;
    let finishedGoodsRetailValue = 0;

    products.forEach((prod) => {
      const estimatedCost = prod.costPrice || Number((prod.price * 0.45).toFixed(2));
      const val = Number((prod.stock * estimatedCost).toFixed(2));
      finishedGoodsCapital += val;
      finishedGoodsRetailValue += Number((prod.stock * (prod.discountPrice || prod.price)).toFixed(2));
    });

    const now = new Date();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Dead-stock for finished products
    const deadStockProducts = products
      .filter((p) => p.stock > 0 && new Date(p.updatedAt) < sixtyDaysAgo)
      .map((p) => {
        const daysOld = Math.floor((now.getTime() - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
        const isCritical = new Date(p.updatedAt) < ninetyDaysAgo;
        const estCost = p.costPrice || Number((p.price * 0.45).toFixed(2));
        return {
          id: p._id,
          title: p.title,
          category: p.category,
          thumbnail: p.thumbnail,
          stock: p.stock,
          unitCost: estCost,
          lockedCapital: Number((p.stock * estCost).toFixed(2)),
          sellingPrice: p.price,
          daysInactive: daysOld,
          status: isCritical ? 'Critical Dead Stock' : 'Slow Moving',
          recommendation: isCritical
            ? 'Action needed: Apply 25-35% clearance discount or bundle as bonus gift with top sellers.'
            : 'Consider featuring in weekly promotional banner or social showcase.',
        };
      })
      .sort((a, b) => b.lockedCapital - a.lockedCapital);

    // Dead-stock for raw materials
    const deadStockRawMaterials = rawMaterials
      .filter((m) => m.currentStock > 0 && new Date(m.updatedAt) < sixtyDaysAgo)
      .map((m) => {
        const daysOld = Math.floor((now.getTime() - new Date(m.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
        const isCritical = new Date(m.updatedAt) < ninetyDaysAgo;
        return {
          id: m._id,
          name: m.name,
          category: m.category,
          currentStock: m.currentStock,
          unit: m.unit,
          costPerUnit: m.costPerUnit,
          lockedCapital: Number((m.currentStock * m.costPerUnit).toFixed(2)),
          daysInactive: daysOld,
          status: isCritical ? 'Critical Dormant' : 'Low Velocity',
          recommendation: isCritical
            ? 'Check chemical shelf-life / shelf crystallization; prioritize for upcoming custom workshop pours.'
            : 'Evaluate current BOM recipes to increase utilization.',
        };
      })
      .sort((a, b) => b.lockedCapital - a.lockedCapital);

    const totalLockedDeadCapital =
      deadStockProducts.reduce((sum, p) => sum + p.lockedCapital, 0) +
      deadStockRawMaterials.reduce((sum, m) => sum + m.lockedCapital, 0);

    res.json({
      success: true,
      data: {
        valuation: {
          rawMaterialsCapital: Math.round(rawMaterialsCapital * 100) / 100,
          finishedGoodsCapital: Math.round(finishedGoodsCapital * 100) / 100,
          finishedGoodsRetailValue: Math.round(finishedGoodsRetailValue * 100) / 100,
          totalCombinedCapital: Math.round((rawMaterialsCapital + finishedGoodsCapital) * 100) / 100,
          rawCategoryValuation,
        },
        deadStock: {
          totalLockedDeadCapital: Math.round(totalLockedDeadCapital * 100) / 100,
          totalDeadProductsCount: deadStockProducts.length,
          totalDeadRawMaterialsCount: deadStockRawMaterials.length,
          products: deadStockProducts,
          rawMaterials: deadStockRawMaterials,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};


