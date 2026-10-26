import { Request, Response } from 'express';
import { StallSession } from '../models/StallSession';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { deductBOMForOrderItems } from './orderController';
import { AuthRequest } from '../types';
import { validatePayload, sendValidationError, sendNotFound } from '../utils/responseHelper';

// @desc    Get currently active stall / exhibition session
// @route   GET /api/stall-pos/session/active
// @access  Private/Admin
export const getActiveSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const active = await StallSession.findOne({ status: 'Active' }).sort({ startedAt: -1 });
    res.json({
      success: true,
      data: active || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Start a new exhibition / stall session
// @route   POST /api/stall-pos/session/start
// @access  Private/Admin
export const startSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validation = validatePayload(req.body, [
      { field: 'name', label: 'Exhibition / Stall Name', type: 'string', min: 2, customErrorMessage: 'Exhibition or Stall name is required.' },
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

    const { name, location = 'Exhibition Stall', notes } = req.body;

    // Close any previous active session automatically
    await StallSession.updateMany(
      { status: 'Active' },
      { $set: { status: 'Closed', closedAt: new Date() } }
    );

    const session = await StallSession.create({
      name,
      location,
      status: 'Active',
      startedAt: new Date(),
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: `Stall session "${session.name}" started successfully`,
      data: session,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Process Fast Kiosk Stall Checkout (Decrements stock, executes BOM, tracks session financial)
// @route   POST /api/stall-pos/orders
// @access  Private/Admin
export const createStallOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validation = validatePayload(req.body, [
      { field: 'orderItems', label: 'Order Items', type: 'array', customErrorMessage: 'Order must contain at least one item.' },
      { field: 'paymentMethod', label: 'Payment Method', type: 'string', customErrorMessage: 'Payment method (UPI, Cash, Card) is required.' },
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
      orderItems,
      paymentMethod = 'UPI',
      customerName = 'Walk-in Guest',
      customerPhone = '',
      discountAmount = 0,
      bundleApplied = '',
      sessionId,
      notes = '',
    } = req.body;

    // Retrieve active session
    let session = sessionId
      ? await StallSession.findById(sessionId)
      : await StallSession.findOne({ status: 'Active' }).sort({ startedAt: -1 });

    if (!session) {
      session = await StallSession.create({
        name: `Walk-in Stall (${new Date().toLocaleDateString('en-IN')})`,
        location: 'Exhibition Stall',
        status: 'Active',
        startedAt: new Date(),
      });
    }

    const enrichedItems: any[] = [];
    let orderCost = 0;
    let orderGrossSales = 0;

    for (const item of orderItems) {
      const qty = Number(item.quantity) || 1;
      const unitSoldPrice = Number(item.soldPrice) !== undefined ? Number(item.soldPrice) : Number(item.price);
      let unitCost = Number(item.costPrice) || 0;
      let title = item.title || item.name || 'Resin Art Product';
      let category = item.category || 'General';

      if (item.product) {
        const prod = await Product.findById(item.product);
        if (prod) {
          title = prod.title;
          category = prod.category;
          unitCost = unitCost || prod.costPrice || Number((prod.price * 0.45).toFixed(2));
          // Immediate live decrement of website product stock
          prod.stock = Math.max(0, prod.stock - qty);
          await prod.save();
        }
      }

      const itemTotal = Number((unitSoldPrice * qty).toFixed(2));
      const itemCostTotal = Number((unitCost * qty).toFixed(2));
      const itemProfit = Number((itemTotal - itemCostTotal).toFixed(2));

      orderGrossSales += itemTotal;
      orderCost += itemCostTotal;

      enrichedItems.push({
        product: item.product || null,
        name: title,
        quantity: qty,
        price: unitSoldPrice,
        soldPrice: unitSoldPrice,
        originalPrice: Number(item.originalPrice) || unitSoldPrice,
        costPrice: unitCost,
        profit: itemProfit,
        image: item.image || item.thumbnail || '',
        isBargained: Boolean(bundleApplied || discountAmount > 0),
      });

      // Update session itemsSold tally
      const existingTallyIndex = session.itemsSold.findIndex(
        (it) => it.title.toLowerCase() === title.toLowerCase()
      );
      if (existingTallyIndex > -1) {
        session.itemsSold[existingTallyIndex].quantity += qty;
        session.itemsSold[existingTallyIndex].revenue += itemTotal;
        session.itemsSold[existingTallyIndex].cost += itemCostTotal;
        session.itemsSold[existingTallyIndex].profit += itemProfit;
      } else {
        session.itemsSold.push({
          product: item.product || undefined,
          title,
          category,
          quantity: qty,
          revenue: itemTotal,
          cost: itemCostTotal,
          profit: itemProfit,
        });
      }
    }

    const discount = Number(discountAmount) || 0;
    const finalTotal = Math.max(0, Number((orderGrossSales - discount).toFixed(2)));
    const netOrderProfit = Number((finalTotal - orderCost).toFixed(2));

    // Create formal Order record in DB
    const orderNumber = `STALL-${Date.now().toString().slice(-6)}`;
    const order = await Order.create({
      user: null,
      customerName: customerName || 'Walk-in Guest',
      customerPhone: customerPhone || '9999999999',
      customerEmail: '',
      orderItems: enrichedItems,
      shippingAddress: {
        fullName: customerName || 'Walk-in Guest',
        street: 'Exhibition Stall Counter',
        city: session.location || 'Local Stall',
        state: 'Local',
        postalCode: '000000',
        country: 'India',
        phone: customerPhone || '9999999999',
      },
      paymentMethod: paymentMethod === 'Cash' ? 'CashOnDelivery' : 'CreditCard',
      itemsPrice: orderGrossSales,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: finalTotal,
      hasBargain: Boolean(bundleApplied || discount > 0),
      totalCost: orderCost,
      totalProfit: netOrderProfit,
      isPaid: true,
      paidAt: new Date(),
      status: 'Delivered', // Immediate counter handover
      deliveredAt: new Date(),
      notes: `Stall: ${session.name}${bundleApplied ? ` | Bundle: ${bundleApplied}` : ''} | Mode: ${paymentMethod} ${notes}`,
    });

    // Auto-deduct raw materials from warehouse BOM
    deductBOMForOrderItems(
      enrichedItems,
      `Stall #${orderNumber}`,
      `Stall Kiosk (${session.name})`
    ).catch((err) => console.error('Stall BOM deduction error:', err));

    // Update session metrics
    session.totalRevenue = Number((session.totalRevenue + finalTotal).toFixed(2));
    session.totalProfit = Number((session.totalProfit + netOrderProfit).toFixed(2));
    session.ordersCount += 1;

    if (paymentMethod === 'Cash') {
      session.totalCash = Number((session.totalCash + finalTotal).toFixed(2));
    } else if (paymentMethod === 'Card') {
      session.totalCard = Number((session.totalCard + finalTotal).toFixed(2));
    } else {
      session.totalUpi = Number((session.totalUpi + finalTotal).toFixed(2));
    }

    // Save customer lead if phone provided
    if (customerPhone && customerPhone.trim().length >= 7) {
      session.leads.push({
        customerName: customerName || 'Walk-in Guest',
        customerPhone: customerPhone.trim(),
        totalSpent: finalTotal,
        orderId: order._id,
        purchasedAt: new Date(),
      });
    }

    await session.save();

    res.status(201).json({
      success: true,
      message: `Order #${orderNumber} processed successfully via ${paymentMethod}`,
      data: {
        order,
        orderNumber,
        session: {
          id: session._id,
          name: session.name,
          totalRevenue: session.totalRevenue,
          ordersCount: session.ordersCount,
          totalUpi: session.totalUpi,
          totalCash: session.totalCash,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get End-of-Day Financial Summary & Lead Reconciliation for a session
// @route   GET /api/stall-pos/session/:id/summary
// @access  Private/Admin
export const getStallSessionSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const session = await StallSession.findById(id);

    if (!session) {
      sendNotFound(res, 'Stall Session', id);
      return;
    }

    const totalRevenue = session.totalRevenue || 0;
    const upiShare = totalRevenue > 0 ? Number(((session.totalUpi / totalRevenue) * 100).toFixed(1)) : 0;
    const cashShare = totalRevenue > 0 ? Number(((session.totalCash / totalRevenue) * 100).toFixed(1)) : 0;
    const cardShare = totalRevenue > 0 ? Number(((session.totalCard / totalRevenue) * 100).toFixed(1)) : 0;
    const profitMargin = totalRevenue > 0 ? Number(((session.totalProfit / totalRevenue) * 100).toFixed(1)) : 0;

    // Sort items sold by revenue descending
    const topProducts = [...session.itemsSold].sort((a, b) => b.revenue - a.revenue);

    // Group items sold by category
    const categoryBreakdown: Record<string, { quantity: number; revenue: number }> = {};
    session.itemsSold.forEach((item) => {
      const cat = item.category || 'General';
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { quantity: 0, revenue: 0 };
      }
      categoryBreakdown[cat].quantity += item.quantity;
      categoryBreakdown[cat].revenue = Number((categoryBreakdown[cat].revenue + item.revenue).toFixed(2));
    });

    const totalUnitsSold = session.itemsSold.reduce((acc, it) => acc + it.quantity, 0);

    res.json({
      success: true,
      data: {
        session,
        financial: {
          totalRevenue,
          totalProfit: session.totalProfit,
          profitMargin,
          totalUpi: session.totalUpi,
          upiShare,
          totalCash: session.totalCash,
          cashShare,
          totalCard: session.totalCard,
          cardShare,
          ordersCount: session.ordersCount,
          totalUnitsSold,
        },
        topProducts,
        categoryBreakdown,
        leadsCount: session.leads.length,
        leads: session.leads,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Close exhibition stall day and finalize reconciliation
// @route   POST /api/stall-pos/session/:id/close
// @access  Private/Admin
export const closeStallSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const session = await StallSession.findById(id);

    if (!session) {
      sendNotFound(res, 'Stall Session', id);
      return;
    }

    session.status = 'Closed';
    session.closedAt = new Date();
    await session.save();

    res.json({
      success: true,
      message: `Stall session "${session.name}" successfully closed and reconciled`,
      data: session,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get all historical stall sessions
// @route   GET /api/stall-pos/sessions
// @access  Private/Admin
export const getStallSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessions = await StallSession.find().sort({ startedAt: -1 });
    res.json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
