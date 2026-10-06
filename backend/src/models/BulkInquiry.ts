import mongoose, { Document, Schema } from 'mongoose';

export interface IBulkInquiry extends Document {
  name: string;
  email: string;
  phone: string;
  companyOrEvent: string;
  eventType: string;
  productInterest: string;
  estimatedQuantity: number;
  targetDate?: string;
  budgetRange?: string;
  customizationDetails: string;
  status: 'New' | 'Contacted' | 'Quoted' | 'In Production' | 'Completed' | 'Declined';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BulkInquirySchema = new Schema<IBulkInquiry>(
  {
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    companyOrEvent: {
      type: String,
      required: [true, 'Company, Organization, or Event name is required'],
      trim: true,
    },
    eventType: {
      type: String,
      enum: [
        'Corporate Event / Employee Gifting',
        'Wedding Favors & Return Gifts',
        'Diwali & Festive Hampers',
        'Housewarming / Luxury Mementos',
        'Brand Promotional Merch',
        'VIP Client Appreciation',
        'Other',
      ],
      default: 'Corporate Event / Employee Gifting',
    },
    productInterest: {
      type: String,
      enum: [
        'Custom Initial/Logo Resin Keychains',
        'Agate Geode Coasters Set (Gold Foil Edge)',
        'Bespoke Resin Desk Clocks',
        'Luxury Pooja Thalis / Serving Platters',
        'Memorial / Photo Preservation Keepsakes',
        'Curated Resin Gift Hamper Box',
        'Custom Art / Other',
      ],
      default: 'Custom Initial/Logo Resin Keychains',
    },
    estimatedQuantity: {
      type: Number,
      required: [true, 'Estimated quantity is required'],
      min: [10, 'Minimum bulk order quantity is 10 units'],
    },
    targetDate: {
      type: String,
      trim: true,
    },
    budgetRange: {
      type: String,
      trim: true,
      default: 'Flexible / Standard Tier',
    },
    customizationDetails: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Quoted', 'In Production', 'Completed', 'Declined'],
      default: 'New',
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

BulkInquirySchema.index({ createdAt: -1 });
BulkInquirySchema.index({ status: 1 });
BulkInquirySchema.index({ phone: 1 });
BulkInquirySchema.index({ email: 1 });

export const BulkInquiry = mongoose.model<IBulkInquiry>('BulkInquiry', BulkInquirySchema);
