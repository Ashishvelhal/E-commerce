import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { AuthRequest } from '../types';

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get all reviews for Admin moderation
// @route   GET /api/reviews/admin
// @access  Private/Admin
export const getAllReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email avatar')
      .populate('product', 'title slug thumbnail')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Create a new product review (Guest or User)
// @route   POST /api/reviews
// @access  Public
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, rating, title, comment, customerName, modelAnnotation } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const review = await Review.create({
      user: req.user?._id || null,
      customerName: customerName || (req.user ? req.user.name : 'Verified Customer'),
      customerAvatar: req.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      product: productId,
      rating: Number(rating) || 5,
      title,
      comment,
      modelAnnotation: modelAnnotation && modelAnnotation.point ? modelAnnotation : undefined,
      verifiedPurchase: true,
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Delete a review (Admin)
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
