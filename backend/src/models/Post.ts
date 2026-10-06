import mongoose, { Schema } from 'mongoose';
import { IPost } from '../types';

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
    },
    summary: {
      type: String,
      default: '',
    },
    bannerImage: {
      type: String,
      required: [true, 'Banner image is required'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      default: 'Updates',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
    },
    featuredProduct: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Post = mongoose.model<IPost>('Post', PostSchema);
