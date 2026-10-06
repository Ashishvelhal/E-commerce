import { Request, Response } from 'express';
import { BulkInquiry } from '../models/BulkInquiry';
import { AuthRequest } from '../types';

/**
 * @desc    Submit a new bulk corporate / wedding inquiry (Public)
 * @route   POST /api/bulk-inquiries
 * @access  Public
 */
export const createBulkInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      phone,
      companyOrEvent,
      eventType,
      productInterest,
      estimatedQuantity,
      targetDate,
      budgetRange,
      customizationDetails,
    } = req.body;

    if (!name || !email || !phone || !companyOrEvent || !estimatedQuantity) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields (Name, Email, Phone, Company/Event, and Quantity).',
      });
      return;
    }

    const inquiry = await BulkInquiry.create({
      name,
      email,
      phone,
      companyOrEvent,
      eventType: eventType || 'Corporate Event / Employee Gifting',
      productInterest: productInterest || 'Custom Initial/Logo Resin Keychains',
      estimatedQuantity: Number(estimatedQuantity),
      targetDate: targetDate || '',
      budgetRange: budgetRange || 'Flexible / Standard Tier',
      customizationDetails: customizationDetails || '',
      status: 'New',
    });

    res.status(201).json({
      success: true,
      message: 'Bulk inquiry submitted successfully! Our studio artisan will review and contact you shortly.',
      data: inquiry,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit bulk inquiry',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all bulk inquiries with pagination & status filters (Admin)
 * @route   GET /api/bulk-inquiries
 * @access  Private/Admin
 */
export const getBulkInquiries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const query: any = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { companyOrEvent: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [inquiries, total, totalNew, totalQuoted, totalProduction] = await Promise.all([
      BulkInquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      BulkInquiry.countDocuments(query),
      BulkInquiry.countDocuments({ status: 'New' }),
      BulkInquiry.countDocuments({ status: 'Quoted' }),
      BulkInquiry.countDocuments({ status: 'In Production' }),
    ]);

    res.status(200).json({
      success: true,
      data: inquiries,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
      stats: {
        totalNew,
        totalQuoted,
        totalProduction,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bulk inquiries',
      error: error.message,
    });
  }
};

/**
 * @desc    Update bulk inquiry status and internal workshop notes (Admin)
 * @route   PUT /api/bulk-inquiries/:id
 * @access  Private/Admin
 */
export const updateBulkInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes, budgetRange, targetDate } = req.body;

    const inquiry = await BulkInquiry.findById(id);
    if (!inquiry) {
      res.status(404).json({
        success: false,
        message: 'Bulk inquiry not found',
      });
      return;
    }

    if (status !== undefined) inquiry.status = status;
    if (notes !== undefined) inquiry.notes = notes;
    if (budgetRange !== undefined) inquiry.budgetRange = budgetRange;
    if (targetDate !== undefined) inquiry.targetDate = targetDate;

    await inquiry.save();

    res.status(200).json({
      success: true,
      message: 'Bulk inquiry updated successfully',
      data: inquiry,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update bulk inquiry',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a bulk inquiry (Admin)
 * @route   DELETE /api/bulk-inquiries/:id
 * @access  Private/Admin
 */
export const deleteBulkInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const inquiry = await BulkInquiry.findByIdAndDelete(id);

    if (!inquiry) {
      res.status(404).json({
        success: false,
        message: 'Bulk inquiry not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Bulk inquiry deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete bulk inquiry',
      error: error.message,
    });
  }
};
