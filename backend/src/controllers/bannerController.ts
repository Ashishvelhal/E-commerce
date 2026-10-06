import { Request, Response } from 'express';
import { Banner } from '../models/Banner';

// @desc    Get all active banners for storefront
// @route   GET /api/banners
// @access  Public
export const getActiveBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const { position } = req.query;
    const query: any = { isActive: true };
    if (position) {
      query.position = position;
    }

    const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 });
    res.json({
      success: true,
      count: banners.length,
      data: banners,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get all banners including inactive (Admin only)
// @route   GET /api/banners/admin
// @access  Private/Admin
export const getAllBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json({
      success: true,
      count: banners.length,
      data: banners,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Create a new banner (Admin only)
// @route   POST /api/banners
// @access  Private/Admin
export const createBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, subtitle, badge, image, linkUrl, buttonText, position, isActive, order } =
      req.body;

    if (!title || !image) {
      res.status(400).json({ success: false, message: 'Title and image URL are required' });
      return;
    }

    const banner = await Banner.create({
      title,
      subtitle: subtitle || '',
      badge: badge || '',
      image,
      linkUrl: linkUrl || '/shop',
      buttonText: buttonText || 'Explore Collection',
      position: position || 'hero',
      isActive: isActive !== undefined ? isActive : true,
      order: order !== undefined ? Number(order) : 0,
    });

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: banner,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Update banner (Admin only)
// @route   PUT /api/banners/:id
// @access  Private/Admin
export const updateBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!banner) {
      res.status(404).json({ success: false, message: 'Banner not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Banner updated successfully',
      data: banner,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Delete banner (Admin only)
// @route   DELETE /api/banners/:id
// @access  Private/Admin
export const deleteBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      res.status(404).json({ success: false, message: 'Banner not found' });
      return;
    }
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
