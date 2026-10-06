import mongoose, { Schema } from 'mongoose';
import { IOrder } from '../types';

const OrderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    selectedColor: { type: String, default: '' },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema(
  {
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone number is required'],
    },
    customerEmail: {
      type: String,
      default: '',
    },
    orderItems: [OrderItemSchema],
    shippingAddress: ShippingAddressSchema,
    paymentMethod: {
      type: String,
      enum: ['CreditCard', 'PayPal', 'Stripe', 'CashOnDelivery'],
      default: 'CreditCard',
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: true },
    paidAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing',
    },
    deliveredAt: { type: Date },
    trackingNumber: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// Performance indexes for rapid aggregation and lookup
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ user: 1 });
OrderSchema.index({ customerPhone: 1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
