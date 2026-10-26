import mongoose, { Document, Schema } from 'mongoose';

export interface IStallItemSold {
  product?: mongoose.Types.ObjectId;
  title: string;
  category: string;
  quantity: number;
  revenue: number;
  cost: number;
  profit: number;
}

export interface IStallCustomerLead {
  customerName: string;
  customerPhone: string;
  totalSpent: number;
  orderId?: mongoose.Types.ObjectId;
  purchasedAt: Date;
}

export interface IStallSession extends Document {
  name: string;
  location: string;
  status: 'Active' | 'Closed';
  startedAt: Date;
  closedAt?: Date;
  totalRevenue: number;
  totalUpi: number;
  totalCash: number;
  totalCard: number;
  totalProfit: number;
  ordersCount: number;
  itemsSold: IStallItemSold[];
  leads: IStallCustomerLead[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StallItemSoldSchema = new Schema<IStallItemSold>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    quantity: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    cost: {
      type: Number,
      default: 0,
    },
    profit: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const StallCustomerLeadSchema = new Schema<IStallCustomerLead>(
  {
    customerName: {
      type: String,
      trim: true,
      default: 'Walk-in Guest',
    },
    customerPhone: {
      type: String,
      trim: true,
      default: '',
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const StallSessionSchema = new Schema<IStallSession>(
  {
    name: {
      type: String,
      required: [true, 'Exhibition session name is required'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: 'Exhibition Stall',
    },
    status: {
      type: String,
      enum: ['Active', 'Closed'],
      default: 'Active',
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    closedAt: {
      type: Date,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    totalUpi: {
      type: Number,
      default: 0,
    },
    totalCash: {
      type: Number,
      default: 0,
    },
    totalCard: {
      type: Number,
      default: 0,
    },
    totalProfit: {
      type: Number,
      default: 0,
    },
    ordersCount: {
      type: Number,
      default: 0,
    },
    itemsSold: [StallItemSoldSchema],
    leads: [StallCustomerLeadSchema],
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

StallSessionSchema.index({ status: 1, startedAt: -1 });

export const StallSession = mongoose.model<IStallSession>('StallSession', StallSessionSchema);
