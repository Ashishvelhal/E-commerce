import mongoose, { Schema } from 'mongoose';
import { IReview } from '../types';

const ReviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    customerName: {
      type: String,
      default: 'Verified Buyer',
    },
    customerAvatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product'],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: 1000,
    },
    modelAnnotation: {
      point: {
        type: [Number],
        default: undefined,
      },
      label: {
        type: String,
        default: '',
      },
    },
    verifiedPurchase: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Static method to calculate average rating of product
ReviewSchema.statics.calculateAverageRating = async function (productId: mongoose.Types.ObjectId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        ratingsCount: { $sum: 1 },
        ratingsAverage: { $avg: '$rating' },
      },
    },
  ]);

  const Product = mongoose.model('Product');
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: Math.round(stats[0].ratingsAverage * 10) / 10,
      ratingsCount: stats[0].ratingsCount,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsCount: 0,
    });
  }
};

ReviewSchema.post('save', async function () {
  const ReviewModel = this.constructor as any;
  await ReviewModel.calculateAverageRating(this.product);
});

ReviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    const ReviewModel = doc.constructor as any;
    await ReviewModel.calculateAverageRating(doc.product);
  }
});

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
