import mongoose, { Document, Schema } from 'mongoose';

export interface IPurchaseOrderItem {
  inventoryItem?: mongoose.Types.ObjectId;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity?: number;
}

export interface IPurchaseOrder extends Document {
  poNumber: string;
  supplier: mongoose.Types.ObjectId;
  supplierName: string;
  items: IPurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  grandTotal: number;
  status: 'Draft' | 'Sent' | 'Partially Received' | 'Received' | 'Cancelled';
  expectedDeliveryDate?: Date;
  receivedAt?: Date;
  notes?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseOrderItemSchema = new Schema<IPurchaseOrderItem>(
  {
    inventoryItem: {
      type: Schema.Types.ObjectId,
      ref: 'Inventory',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      required: true,
      default: 'pcs',
    },
    quantity: {
      type: Number,
      required: true,
      min: [0.001, 'Quantity must be positive'],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative'],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative'],
    },
    receivedQuantity: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const PurchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier reference is required'],
    },
    supplierName: {
      type: String,
      required: true,
      trim: true,
    },
    items: [PurchaseOrderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ['Draft', 'Sent', 'Partially Received', 'Received', 'Cancelled'],
      default: 'Draft',
    },
    expectedDeliveryDate: {
      type: Date,
    },
    receivedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: String,
      trim: true,
      default: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

PurchaseOrderSchema.index({ poNumber: 1 });
PurchaseOrderSchema.index({ status: 1 });
PurchaseOrderSchema.index({ supplier: 1 });
PurchaseOrderSchema.index({ createdAt: -1 });

export const PurchaseOrder = mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);
