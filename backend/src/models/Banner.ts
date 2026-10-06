import mongoose, { Schema } from 'mongoose';
import { IBanner } from '../types';

const BannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    badge: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      required: [true, 'Banner image URL is required'],
    },
    linkUrl: {
      type: String,
      default: '/shop',
    },
    buttonText: {
      type: String,
      default: 'Shop Collection',
    },
    position: {
      type: String,
      enum: ['hero', 'promo', 'popup'],
      default: 'hero',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Banner = mongoose.model<IBanner>('Banner', BannerSchema);
