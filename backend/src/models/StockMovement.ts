import mongoose, { Document, Schema } from 'mongoose';

export type MovementType =
  | 'Purchase'
  | 'Customer Order'
  | 'Studio Production'
  | 'Spillage / Damage'
  | 'Audit Correction'
  | 'Return';

export interface IStockMovement extends Document {
  inventoryItem: mongoose.Types.ObjectId;
  itemName: string;
  category: string;
  movementType: MovementType;
  quantityChange: number; // e.g. +100 or -50
  previousStock: number;
  newStock: number;
  unit: string;
  referenceId?: string; // Order ID, PO ID, or Batch ID
  performedBy?: string; // Admin user name / system
  notes?: string;
  costImpact?: number; // Total cost associated with this movement
  createdAt: Date;
  updatedAt: Date;
}

const StockMovementSchema = new Schema<IStockMovement>(
  {
    inventoryItem: {
      type: Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
      index: true,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    movementType: {
      type: String,
      required: true,
      enum: [
        'Purchase',
        'Customer Order',
        'Studio Production',
        'Spillage / Damage',
        'Audit Correction',
        'Return',
      ],
      index: true,
    },
    quantityChange: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    referenceId: {
      type: String,
      trim: true,
      default: '',
    },
    performedBy: {
      type: String,
      trim: true,
      default: 'Admin',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    costImpact: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

StockMovementSchema.index({ createdAt: -1 });
StockMovementSchema.index({ inventoryItem: 1, createdAt: -1 });

export const StockMovement = mongoose.model<IStockMovement>('StockMovement', StockMovementSchema);
