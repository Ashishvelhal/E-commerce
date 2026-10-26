import { Request, Response } from 'express';
import { Supplier } from '../models/Supplier';
import { PurchaseOrder } from '../models/PurchaseOrder';
import { Inventory } from '../models/Inventory';
import { StockMovement } from '../models/StockMovement';
import { AuthRequest } from '../types';
import { validatePayload, sendValidationError, sendNotFound } from '../utils/responseHelper';

const escapeRegex = (text: string) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// ==========================================
// SUPPLIER CRUD CONTROLLERS
// ==========================================

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private/Admin
export const getSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, active } = req.query;
    const query: any = {};

    if (active === 'true') {
      query.isActive = true;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = escapeRegex(search.trim());
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { contactPerson: { $regex: term, $options: 'i' } },
        { phone: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { city: { $regex: term, $options: 'i' } },
        { gstNumber: { $regex: term, $options: 'i' } },
      ];
    }

    const suppliers = await Supplier.find(query).sort({ name: 1 });
    res.json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Create new supplier
// @route   POST /api/suppliers
// @access  Private/Admin
export const createSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = validatePayload(req.body, [
      { field: 'name', label: 'Supplier Name', type: 'string', min: 2, customErrorMessage: 'Supplier company/vendor name is required.' },
      { field: 'phone', label: 'Phone Number', type: 'string', min: 5, customErrorMessage: 'Supplier contact phone number is required.' },
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
      contactPerson,
      email,
      phone,
      address,
      city,
      gstNumber,
      leadTimeDays,
      paymentTerms,
      suppliedCategories,
      notes,
      rating,
    } = req.body;

    const supplier = await Supplier.create({
      name,
      contactPerson: contactPerson || '',
      email: email || '',
      phone,
      address: address || '',
      city: city || '',
      gstNumber: gstNumber ? gstNumber.toUpperCase() : '',
      leadTimeDays: Number(leadTimeDays || 5),
      paymentTerms: paymentTerms || 'Net 30',
      suppliedCategories: Array.isArray(suppliedCategories) ? suppliedCategories : [],
      notes: notes || '',
      rating: rating ? Number(rating) : 5,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private/Admin
export const updateSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);

    if (!supplier) {
      sendNotFound(res, 'Supplier', id);
      return;
    }

    const updated = await Supplier.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
export const deleteSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByIdAndDelete(id);

    if (!supplier) {
      sendNotFound(res, 'Supplier', id);
      return;
    }

    res.json({
      success: true,
      message: 'Supplier deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// ==========================================
// PURCHASE ORDER CONTROLLERS
// ==========================================

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Private/Admin
export const getPurchaseOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, supplier, search, page = 1, limit = 20 } = req.query;
    const pageNumber = Math.max(1, Number(page));
    const pageSize = Math.max(1, Number(limit));
    const skip = (pageNumber - 1) * pageSize;

    const query: any = {};
    if (status && status !== 'All') {
      query.status = status;
    }
    if (supplier) {
      query.supplier = supplier;
    }
    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = escapeRegex(search.trim());
      query.$or = [
        { poNumber: { $regex: term, $options: 'i' } },
        { supplierName: { $regex: term, $options: 'i' } },
        { notes: { $regex: term, $options: 'i' } },
      ];
    }

    const total = await PurchaseOrder.countDocuments(query);
    const orders = await PurchaseOrder.find(query)
      .populate('supplier')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    res.json({
      success: true,
      data: orders,
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

// @desc    Get single purchase order
// @route   GET /api/purchase-orders/:id
// @access  Private/Admin
export const getPurchaseOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await PurchaseOrder.findById(req.params.id).populate('supplier');
    if (!order) {
      sendNotFound(res, 'Purchase Order', req.params.id);
      return;
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Create purchase order
// @route   POST /api/purchase-orders
// @access  Private/Admin
export const createPurchaseOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validation = validatePayload(req.body, [
      { field: 'supplierId', label: 'Supplier', type: 'string', min: 5, customErrorMessage: 'Please select a supplier.' },
      { field: 'items', label: 'PO Items', type: 'array', customErrorMessage: 'At least one item must be added to the purchase order.' },
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

    const { supplierId, items, taxAmount = 0, shippingCost = 0, expectedDeliveryDate, notes } = req.body;
    const supplier = await Supplier.findById(supplierId);

    if (!supplier) {
      sendNotFound(res, 'Supplier', supplierId);
      return;
    }

    const processedItems = items.map((item: any) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || 0;
      return {
        inventoryItem: item.inventoryItem || null,
        name: item.name,
        unit: item.unit || 'pcs',
        quantity: qty,
        unitPrice: price,
        totalPrice: Number((qty * price).toFixed(2)),
        receivedQuantity: 0,
      };
    });

    const subtotal = processedItems.reduce((acc: number, item: any) => acc + item.totalPrice, 0);
    const tax = Number(taxAmount) || 0;
    const shipping = Number(shippingCost) || 0;
    const grandTotal = Number((subtotal + tax + shipping).toFixed(2));

    const poNumber = `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const po = await PurchaseOrder.create({
      poNumber,
      supplier: supplier._id,
      supplierName: supplier.name,
      items: processedItems,
      subtotal,
      taxAmount: tax,
      shippingCost: shipping,
      grandTotal,
      status: 'Sent',
      expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : new Date(Date.now() + (supplier.leadTimeDays || 5) * 86400000),
      notes: notes || '',
      createdBy: req.user?.name || 'Admin',
    });

    res.status(201).json({
      success: true,
      message: `Purchase Order ${po.poNumber} generated successfully`,
      data: po,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Receive Purchase Order (Auto increments inventory and creates StockMovements)
// @route   POST /api/purchase-orders/:id/receive
// @access  Private/Admin
export const receivePurchaseOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { receivedItems } = req.body; // Array of { inventoryItemId, receivedQuantity }

    const po = await PurchaseOrder.findById(id);
    if (!po) {
      sendNotFound(res, 'Purchase Order', id);
      return;
    }

    if (po.status === 'Received') {
      res.status(400).json({ success: false, message: 'This purchase order has already been marked as fully received.' });
      return;
    }

    const performer = req.user?.name || 'Warehouse Admin';
    let allCompleted = true;

    for (const poItem of po.items) {
      const receivedInfo = receivedItems && Array.isArray(receivedItems)
        ? receivedItems.find((r: any) => String(r.inventoryItemId) === String(poItem.inventoryItem) || r.name === poItem.name)
        : null;

      const qtyToReceive = receivedInfo ? Number(receivedInfo.receivedQuantity) : poItem.quantity;

      if (poItem.inventoryItem) {
        const inventoryItem = await Inventory.findById(poItem.inventoryItem);
        if (inventoryItem) {
          const prevStock = inventoryItem.currentStock;
          const newStock = Number((prevStock + qtyToReceive).toFixed(2));
          inventoryItem.currentStock = newStock;

          // Update purchasePrice and unit cost if applicable
          if (poItem.unitPrice > 0) {
            inventoryItem.purchasePrice = poItem.unitPrice;
            inventoryItem.costPerUnit = poItem.unitPrice;
          }
          await inventoryItem.save();

          await StockMovement.create({
            inventoryItem: inventoryItem._id,
            itemName: inventoryItem.name,
            category: inventoryItem.category,
            movementType: 'Purchase',
            quantityChange: qtyToReceive,
            previousStock: prevStock,
            newStock,
            unit: inventoryItem.unit,
            referenceId: po.poNumber,
            performedBy: performer,
            notes: `Received from PO ${po.poNumber} (${po.supplierName})`,
            costImpact: Number((qtyToReceive * poItem.unitPrice).toFixed(2)),
          });
        }
      }

      poItem.receivedQuantity = (poItem.receivedQuantity || 0) + qtyToReceive;
      if (poItem.receivedQuantity < poItem.quantity) {
        allCompleted = false;
      }
    }

    po.status = allCompleted ? 'Received' : 'Partially Received';
    po.receivedAt = new Date();
    await po.save();

    res.json({
      success: true,
      message: `Purchase Order ${po.poNumber} received. Stock has been incremented and logged in audit movement history.`,
      data: po,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    One-Click Auto PO Generator from Low Stock Materials
// @route   POST /api/purchase-orders/one-click-auto
// @access  Private/Admin
export const generateOneClickPO = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Find all raw materials where currentStock <= minStockAlert
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$currentStock', '$minStockAlert'] },
    });

    if (lowStockItems.length === 0) {
      res.json({
        success: true,
        message: 'All inventory stock levels are healthy. No replenishment purchase orders needed at this time.',
        generatedPOs: [],
      });
      return;
    }

    // Fetch active suppliers
    const suppliers = await Supplier.find({ isActive: true });
    let defaultSupplier = suppliers[0];

    if (!defaultSupplier) {
      defaultSupplier = await Supplier.create({
        name: 'Master Resin Supplies Ltd.',
        phone: '+91 98765 43210',
        email: 'orders@masterresinsupplies.com',
        city: 'Mumbai',
        leadTimeDays: 4,
        paymentTerms: 'Net 30',
        suppliedCategories: ['Resin & Hardener', 'Pigments & Inks', 'Molds & Frames'],
      });
    }

    // Group low-stock items by supplier if assigned, otherwise assign to defaultSupplier
    const supplierGroups: Record<string, typeof lowStockItems> = {};

    lowStockItems.forEach((item) => {
      let matchedSupplierId = defaultSupplier._id.toString();
      if (item.supplier) {
        const found = suppliers.find((s) => s.name.toLowerCase().includes(item.supplier!.toLowerCase()) || item.supplier!.toLowerCase().includes(s.name.toLowerCase()));
        if (found) {
          matchedSupplierId = found._id.toString();
        }
      }
      if (!supplierGroups[matchedSupplierId]) {
        supplierGroups[matchedSupplierId] = [];
      }
      supplierGroups[matchedSupplierId].push(item);
    });

    const generatedPOs = [];

    for (const [supId, items] of Object.entries(supplierGroups)) {
      const currentSupplier = suppliers.find((s) => s._id.toString() === supId) || defaultSupplier;

      const poItems = items.map((item) => {
        const suggestedReorderQty = Math.max(
          item.minStockAlert * 2 - item.currentStock,
          item.purchaseQuantity || item.minStockAlert || 10
        );
        const unitPrice = item.costPerUnit || (item.purchasePrice ? item.purchasePrice / (item.purchaseQuantity || 1) : 100);
        return {
          inventoryItem: item._id,
          name: item.name,
          unit: item.unit,
          quantity: Math.ceil(suggestedReorderQty),
          unitPrice: Number(unitPrice.toFixed(2)),
          totalPrice: Number((Math.ceil(suggestedReorderQty) * unitPrice).toFixed(2)),
          receivedQuantity: 0,
        };
      });

      const subtotal = poItems.reduce((acc, it) => acc + it.totalPrice, 0);
      const taxAmount = Number((subtotal * 0.18).toFixed(2)); // Standard 18% GST estimate
      const grandTotal = Number((subtotal + taxAmount).toFixed(2));

      const poNumber = `AUTO-PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const po = await PurchaseOrder.create({
        poNumber,
        supplier: currentSupplier._id,
        supplierName: currentSupplier.name,
        items: poItems,
        subtotal,
        taxAmount,
        shippingCost: 0,
        grandTotal,
        status: 'Draft',
        expectedDeliveryDate: new Date(Date.now() + (currentSupplier.leadTimeDays || 5) * 86400000),
        notes: `Auto-generated One-Click PO for ${items.length} depleted raw materials`,
        createdBy: req.user?.name || 'One-Click AI Replenisher',
      });

      generatedPOs.push(po);
    }

    res.status(201).json({
      success: true,
      message: `Generated ${generatedPOs.length} Purchase Order(s) for ${lowStockItems.length} low-stock material(s)`,
      generatedPOs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
