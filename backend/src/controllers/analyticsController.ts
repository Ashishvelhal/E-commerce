import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { Review } from '../models/Review';
import { Post } from '../models/Post';
import { AdminAccessLog } from '../models/AdminAccessLog';

// @desc    Get admin analytics overview
// @route   GET /api/analytics
// @access  Private/Admin
export const getAdminAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalReviews = await Review.countDocuments();
    const totalPosts = await Post.countDocuments();

    // Total Revenue calculation
    const revenueData = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Order status breakdown
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Low stock products (less than 5 units left)
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
      .select('title stock price thumbnail')
      .limit(5);

    // Recent 5 orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly Sales aggregation for Chart
    const salesChart = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalOrders,
          totalProducts,
          totalUsers,
          totalReviews,
          totalPosts,
        },
        ordersByStatus,
        lowStockProducts,
        recentOrders,
        salesChart,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Record admin access or login attempt (from https://ipwho.is/)
// @route   POST /api/analytics/admin-access-log
// @access  Public
export const logAdminAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      ip,
      city,
      region,
      country,
      countryCode,
      flag,
      latitude,
      longitude,
      isp,
      org,
      asn,
      timezone,
      userAgent,
      screenResolution,
      attemptedEmail,
      action,
      status,
    } = req.body;

    const detectedIp =
      ip ||
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'Unknown IP';

    let logStatus: 'Info' | 'Warning' | 'Success' | 'Danger' = status || 'Info';
    if (action === 'Login Failed') logStatus = 'Danger';
    else if (action === 'Login Success') logStatus = 'Success';
    else if (action === 'Login Attempt') logStatus = 'Warning';

    const logEntry = await AdminAccessLog.create({
      ip: detectedIp,
      city: city || 'Unknown City',
      region: region || 'Unknown Region',
      country: country || 'Unknown Country',
      countryCode: countryCode || '',
      flag: {
        img: flag?.img || '',
        emoji: flag?.emoji || '🌐',
      },
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      isp: isp || org || 'Unknown ISP',
      org: org || '',
      asn: asn ? String(asn) : '',
      timezone: timezone || '',
      userAgent: userAgent || req.headers['user-agent'] || '',
      screenResolution: screenResolution || '',
      attemptedEmail: attemptedEmail || '',
      action: action || 'Navbar Admin Click',
      status: logStatus,
    });

    res.status(201).json({
      success: true,
      message: 'Admin access log recorded',
      data: logEntry,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get all admin access and security geolocation logs
// @route   GET /api/analytics/admin-access-logs
// @access  Private/Admin
export const getAdminAccessLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(100, Number(req.query.limit) || 30);
    const logs = await AdminAccessLog.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    const totalLogs = await AdminAccessLog.countDocuments();
    const failedLogins = await AdminAccessLog.countDocuments({ action: 'Login Failed' });
    const uniqueIps = await AdminAccessLog.distinct('ip');
    const uniqueCountries = await AdminAccessLog.distinct('country');

    res.json({
      success: true,
      count: logs.length,
      data: {
        logs,
        metrics: {
          totalLogs,
          failedLogins,
          uniqueIpsCount: uniqueIps.length,
          uniqueCountriesCount: uniqueCountries.length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Clear admin access logs
// @route   DELETE /api/analytics/admin-access-logs
// @access  Private/Admin
export const clearAdminAccessLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    await AdminAccessLog.deleteMany({});
    res.json({
      success: true,
      message: 'Admin security & access logs cleared successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
