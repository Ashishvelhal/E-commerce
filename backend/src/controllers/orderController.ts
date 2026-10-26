import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Recipe } from '../models/Recipe';
import { Inventory } from '../models/Inventory';
import { StockMovement } from '../models/StockMovement';
import { AuthRequest } from '../types';
import { validatePayload, sendValidationError, sendNotFound } from '../utils/responseHelper';

/**
 * Deduct Raw Materials from Warehouse Inventory based on Product's linked BOM Recipe
 */
export const deductBOMForOrderItems = async (
  items: Array<{ product: any; quantity: number }>,
  referenceId: string,
  performedBy: string
): Promise<void> => {
  for (const item of items) {
    try {
      const productId = item.product?._id || item.product;
      const product = await Product.findById(productId);
      if (!product || !product.recipeId) continue;

      const recipe = await Recipe.findById(product.recipeId);
      if (!recipe || !recipe.materials || recipe.materials.length === 0) continue;

      const orderQty = Number(item.quantity) || 1;

      for (const mat of recipe.materials) {
        const requiredGramsOrUnits = Number((Number(mat.quantity) * orderQty).toFixed(2));
        let inventoryItem = null;

        if (mat.inventoryItem) {
          inventoryItem = await Inventory.findById(mat.inventoryItem);
        }
        if (!inventoryItem && mat.name) {
          inventoryItem = await Inventory.findOne({ name: { $regex: new RegExp(`^${mat.name}$`, 'i') } });
        }

        if (inventoryItem) {
          const prevStock = inventoryItem.currentStock;
          const newStock = Math.max(0, Number((prevStock - requiredGramsOrUnits).toFixed(2)));
          inventoryItem.currentStock = newStock;
          await inventoryItem.save();

          await StockMovement.create({
            inventoryItem: inventoryItem._id,
            itemName: inventoryItem.name,
            category: inventoryItem.category,
            movementType: 'Customer Order',
            quantityChange: -requiredGramsOrUnits,
            previousStock: prevStock,
            newStock: newStock,
            unit: inventoryItem.unit,
            referenceId,
            performedBy,
            notes: `Auto-deducted BOM for "${product.title}" (${orderQty} sold)`,
            costImpact: Number((requiredGramsOrUnits * (inventoryItem.costPerUnit || mat.costPerUnit || 0)).toFixed(2)),
          });
        }
      }
    } catch (err) {
      console.error(`Failed to deduct BOM for order item:`, err);
    }
  }
};


// @desc    Create new order (Guest or Authenticated)
// @route   POST /api/orders
// @access  Public
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    const validation = validatePayload(req.body, [
      { field: 'orderItems', label: 'Order Items', type: 'array', customErrorMessage: 'Order must include at least one product item.' },
      { field: 'shippingAddress', label: 'Shipping Address', customValidator: (val) => val && typeof val === 'object' && Boolean(val.fullName && val.phone && val.street && val.city), customErrorMessage: 'Shipping address must include fullName, phone, street address, and city.' },
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

    // Check inventory stock and decrement
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        if (product.stock < item.quantity) {
          sendValidationError(res, {
            message: `Insufficient stock for "${product.title}". Requested: ${item.quantity}, Available: ${product.stock}.`,
            fieldErrors: {
              [item.product]: `Only ${product.stock} units available in studio inventory.`,
            },
            actionableSuggestion: `Please reduce the quantity of "${product.title}" to ${product.stock} or fewer.`,
          });
          return;
        }
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }

    const order = await Order.create({
      user: req.user?._id || null,
      customerName: shippingAddress.fullName,
      customerPhone: shippingAddress.phone,
      customerEmail: shippingAddress.email || '',
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'CreditCard',
      itemsPrice: Number(itemsPrice) || 0,
      taxPrice: Number(taxPrice) || 0,
      shippingPrice: Number(shippingPrice) || 0,
      totalPrice: Number(totalPrice) || 0,
      isPaid: true,
      paidAt: new Date(),
      status: 'Processing',
    });

    // Trigger automatic BOM deduction for raw materials
    deductBOMForOrderItems(orderItems, `Order #${order._id.toString().slice(-6).toUpperCase()}`, 'Customer Checkout (BOM)').catch((err) => {
      console.error('BOM auto-deduction error:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get order by ID (Public for confirmation & tracking)
// @route   GET /api/orders/:id
// @access  Public
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('orderItems.product', 'title slug images thumbnail');

    if (!order) {
      sendNotFound(res, 'Order', req.params.id);
      return;
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// Helper to escape regex special characters
const escapeRegex = (text: string) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const pageNumber = Math.max(1, Number(page));
    const pageSize = Math.max(1, Number(limit));
    const skip = (pageNumber - 1) * pageSize;

    const query: any = {};

    if (status && typeof status === 'string' && status !== 'All') {
      query.status = status;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = escapeRegex(search.trim());
      query.$or = [
        { customerName: { $regex: term, $options: 'i' } },
        { customerPhone: { $regex: term, $options: 'i' } },
        { customerEmail: { $regex: term, $options: 'i' } },
        { trackingNumber: { $regex: term, $options: 'i' } },
        { 'shippingAddress.city': { $regex: term, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: term, $options: 'i' } },
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
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

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      sendNotFound(res, 'Order', req.params.id);
      return;
    }

    if (status) {
      order.status = status;
      if (status === 'Delivered') {
        order.deliveredAt = new Date();
      }
    }

    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber;
    }

    const updatedOrder = await order.save();
    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Admin manually creates an order (phone / walk-in orders)
// @route   POST /api/orders/admin
// @access  Private/Admin
export const createOrderByAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validation = validatePayload(req.body, [
      { field: 'customerName', label: 'Customer Full Name', type: 'string', min: 2, customErrorMessage: 'Customer full name is required.' },
      { field: 'customerPhone', label: 'Customer Phone', type: 'string', min: 7, customErrorMessage: 'Valid customer phone number is required.' },
      { field: 'orderItems', label: 'Order Items', type: 'array', customErrorMessage: 'At least one order item is required.' },
      { field: 'shippingAddress', label: 'Shipping Address', customValidator: (val) => val && typeof val === 'object' && Boolean(val.street && val.city), customErrorMessage: 'Shipping address (street and city) is required.' },
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
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      orderItems,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      status,
      trackingNumber,
      notes,
    } = req.body;

    // Process and enrich order items with cost price, profit, and bargain status
    const enrichedItems = [];
    let calculatedTotalCost = 0;
    let calculatedTotalProfit = 0;
    let orderHasBargain = false;

    for (const item of orderItems) {
      let unitCost = Number(item.costPrice) || 0;
      let originalCatalogPrice = Number(item.originalPrice) || Number(item.price);
      let appliedSoldPrice = Number(item.soldPrice) !== undefined && item.soldPrice !== null && !isNaN(Number(item.soldPrice))
        ? Number(item.soldPrice)
        : Number(item.price);
      const isItemBargained = Boolean(item.isBargained);

      if (item.product) {
        const product = await Product.findById(item.product);
        if (product) {
          if (!unitCost && product.costPrice) {
            unitCost = product.costPrice;
          }
          if (!originalCatalogPrice) {
            originalCatalogPrice = product.discountPrice || product.price;
          }
          if (product.stock >= item.quantity) {
            product.stock = Math.max(0, product.stock - item.quantity);
            await product.save();
          }
        }
      }

      if (isItemBargained) {
        orderHasBargain = true;
      }

      const itemQty = Number(item.quantity) || 1;
      const itemProfit = (appliedSoldPrice - unitCost) * itemQty;
      calculatedTotalCost += unitCost * itemQty;
      calculatedTotalProfit += itemProfit;

      enrichedItems.push({
        ...item,
        price: appliedSoldPrice,
        soldPrice: appliedSoldPrice,
        originalPrice: originalCatalogPrice,
        costPrice: unitCost,
        profit: itemProfit,
        isBargained: isItemBargained,
      });
    }

    const computed = Number(itemsPrice) || enrichedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const tax     = Number(taxPrice)     || 0;
    const ship    = Number(shippingPrice) || 0;
    const total   = Number(totalPrice)   || computed + tax + ship;

    const order = await Order.create({
      user: null,
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      orderItems: enrichedItems,
      shippingAddress: {
        fullName:   customerName,
        street:     shippingAddress.street,
        city:       shippingAddress.city,
        state:      shippingAddress.state      || '',
        postalCode: shippingAddress.postalCode || '',
        country:    shippingAddress.country    || 'India',
        phone:      customerPhone,
        email:      customerEmail              || '',
      },
      paymentMethod: paymentMethod || 'CashOnDelivery',
      itemsPrice: computed,
      taxPrice:   tax,
      shippingPrice: ship,
      totalPrice: total,
      hasBargain: orderHasBargain,
      totalCost: calculatedTotalCost,
      totalProfit: calculatedTotalProfit,
      isPaid: paymentMethod !== 'CashOnDelivery',
      paidAt: paymentMethod !== 'CashOnDelivery' ? new Date() : undefined,
      status: status || 'Processing',
      trackingNumber: trackingNumber || '',
      notes,
    });

    // Trigger automatic BOM deduction for raw materials
    const adminLabel = req.user?.name ? `Admin (${req.user.name})` : 'Admin Walk-in/Phone';
    deductBOMForOrderItems(enrichedItems, `Admin #${order._id.toString().slice(-6).toUpperCase()}`, adminLabel).catch((err) => {
      console.error('Admin BOM auto-deduction error:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully by admin',
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

