import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { AuthRequest } from '../types';
import { validatePayload, sendValidationError, sendNotFound } from '../utils/responseHelper';

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
    const validation = validatePayload(req.body, [
      {
        field: 'productId',
        label: 'Product ID',
        type: 'string',
        customErrorMessage: 'Product ID is required to submit a review.',
      },
      {
        field: 'rating',
        label: 'Rating',
        type: 'number',
        min: 1,
        max: 5,
        customErrorMessage: 'Rating must be a number between 1 and 5 stars.',
      },
      {
        field: 'comment',
        label: 'Review Comment',
        type: 'string',
        min: 3,
        customErrorMessage: 'Review comment is required and must be at least 3 characters.',
      },
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

    const { productId, rating, title, comment, customerName, modelAnnotation } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      sendNotFound(res, 'Product', productId);
      return;
    }

    const review = await Review.create({
      user: req.user?._id || null,
      customerName: customerName || (req.user ? req.user.name : 'Verified Customer'),
      customerAvatar: req.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      product: productId,
      rating: Number(rating) || 5,
      title: title ? String(title).trim() : '',
      comment: String(comment).trim(),
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
      sendNotFound(res, 'Review', req.params.id);
      return;
    }

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
