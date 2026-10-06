import mongoose, { Document, Schema } from 'mongoose';

export interface IStudioNote extends Document {
  title: string;
  content: string;
  category: 'formula' | 'order_customization' | 'todo' | 'idea' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isCompleted: boolean;
  isPinned: boolean;
  tags: string[];
  productType?: string;
  rawResinGramsDeducted?: number;
  materialCost?: number;
  author?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudioNoteSchema = new Schema<IStudioNote>(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['formula', 'order_customization', 'todo', 'idea', 'general'],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    productType: {
      type: String,
      default: '',
    },
    rawResinGramsDeducted: {
      type: Number,
      default: 0,
    },
    materialCost: {
      type: Number,
      default: 0,
    },
    author: {
      type: String,
      default: 'Admin Partner',
    },
  },
  {
    timestamps: true,
  }
);

StudioNoteSchema.index({ createdAt: -1 });
StudioNoteSchema.index({ category: 1, isCompleted: 1 });
StudioNoteSchema.index({ isPinned: -1, createdAt: -1 });

export const StudioNote = mongoose.model<IStudioNote>('StudioNote', StudioNoteSchema);
