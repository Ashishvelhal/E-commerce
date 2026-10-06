import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryItem extends Document {
  name: string;
  category: 'Resin & Hardener' | 'Pigments & Inks' | 'Molds & Frames' | 'Hardware & Findings' | 'Packaging & Shipping' | 'Safety & Tools' | 'Other';
  type: 'Liquid' | 'Powder' | 'Solid' | 'Units/Pieces';
  unit: 'g' | 'kg' | 'ml' | 'L' | 'pcs' | 'pack' | 'set';
  currentStock: number;
  minStockAlert: number;
  purchasePrice: number;
  purchaseQuantity: number;
  costPerUnit: number;
  supplier?: string;
  location?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventoryItem>(
  {
    name: {
      type: String,
      required: [true, 'Please provide an inventory item name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Resin & Hardener',
        'Pigments & Inks',
        'Molds & Frames',
        'Hardware & Findings',
        'Packaging & Shipping',
        'Safety & Tools',
        'Other',
      ],
      default: 'Resin & Hardener',
    },
    type: {
      type: String,
      required: [true, 'Please select a physical form type'],
      enum: ['Liquid', 'Powder', 'Solid', 'Units/Pieces'],
      default: 'Liquid',
    },
    unit: {
      type: String,
      required: [true, 'Please select a measurement unit'],
      enum: ['g', 'kg', 'ml', 'L', 'pcs', 'pack', 'set'],
      default: 'g',
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    minStockAlert: {
      type: Number,
      required: true,
      default: 10,
      min: [0, 'Alert threshold cannot be negative'],
    },
    purchasePrice: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    purchaseQuantity: {
      type: Number,
      required: true,
      default: 1,
      min: [0.001, 'Quantity must be greater than zero'],
    },
    costPerUnit: {
      type: Number,
      required: true,
      default: 0,
    },
    supplier: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: 'Main Warehouse',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate costPerUnit automatically
InventorySchema.pre('save', function (next) {
  if (this.purchaseQuantity > 0) {
    this.costPerUnit = Number((this.purchasePrice / this.purchaseQuantity).toFixed(4));
  } else {
    this.costPerUnit = 0;
  }
  next();
});

// Performance indexes for warehouse queries and alerts
InventorySchema.index({ category: 1 });
InventorySchema.index({ type: 1 });
InventorySchema.index({ currentStock: 1 });

export const Inventory = mongoose.model<IInventoryItem>('Inventory', InventorySchema);
