import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { AuthRequest } from '../types';

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

    if (!orderItems || orderItems.length === 0) {
      res.status(400).json({ success: false, message: 'No order items specified' });
      return;
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street) {
      res.status(400).json({ success: false, message: 'Please provide full name, contact phone number, and address' });
      return;
    }

    // Check inventory stock and decrement
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        if (product.stock < item.quantity) {
          res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.title}. Only ${product.stock} units available.`,
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
      res.status(404).json({ success: false, message: 'Order not found' });
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
      res.status(404).json({ success: false, message: 'Order not found' });
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

    if (!customerName || !customerPhone) {
      res.status(400).json({ success: false, message: 'Customer name and phone are required' });
      return;
    }

    if (!orderItems || orderItems.length === 0) {
      res.status(400).json({ success: false, message: 'At least one order item is required' });
      return;
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      res.status(400).json({ success: false, message: 'Shipping address (street + city) is required' });
      return;
    }

    // Optionally decrement stock for each item if product exists
    for (const item of orderItems) {
      if (item.product) {
        const product = await Product.findById(item.product);
        if (product && product.stock >= item.quantity) {
          product.stock = Math.max(0, product.stock - item.quantity);
          await product.save();
        }
      }
    }

    const computed = Number(itemsPrice) || 0;
    const tax     = Number(taxPrice)     || 0;
    const ship    = Number(shippingPrice) || 0;
    const total   = Number(totalPrice)   || computed + tax + ship;

    const order = await Order.create({
      user: null,
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      orderItems,
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
      isPaid: paymentMethod !== 'CashOnDelivery',
      paidAt: paymentMethod !== 'CashOnDelivery' ? new Date() : undefined,
      status: status || 'Processing',
      trackingNumber: trackingNumber || '',
      notes,
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

