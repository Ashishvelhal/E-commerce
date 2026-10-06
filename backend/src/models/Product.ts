import mongoose, { Schema } from 'mongoose';
import { IProduct } from '../types';

const Model3DConfigSchema = new Schema(
  {
    url: { type: String, required: true },
    initialScale: { type: Number, default: 1 },
    cameraPosition: { type: [Number], default: [0, 0, 4] },
    availableColors: [
      {
        name: { type: String, required: true },
        hex: { type: String, required: true },
        meshTarget: { type: String },
      },
    ],
    interactiveNodes: [
      {
        name: { type: String, required: true },
        description: { type: String, required: true },
        position: { type: [Number], required: true },
      },
    ],
  },
  { _id: false }
);

const SpecificationSchema = new Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    richDetails: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      default: null,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    brand: {
      type: String,
      default: 'Rasin Arts',
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    images: {
      type: [String],
      required: [true, 'At least one image is required'],
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail image is required'],
    },
    model3d: {
      type: Model3DConfigSchema,
      default: null,
    },
    specifications: [SpecificationSchema],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual index for text search
ProductSchema.index({ title: 'text', description: 'text', category: 'text' });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
