import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminAccessLog extends Document {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  flag?: {
    img?: string;
    emoji?: string;
  };
  latitude?: number;
  longitude?: number;
  isp?: string;
  org?: string;
  asn?: string;
  timezone?: string;
  userAgent?: string;
  screenResolution?: string;
  attemptedEmail?: string;
  action: 'Navbar Admin Click' | 'Login Attempt' | 'Login Success' | 'Login Failed' | string;
  status: 'Info' | 'Warning' | 'Success' | 'Danger';
  createdAt: Date;
  updatedAt: Date;
}

const AdminAccessLogSchema = new Schema<IAdminAccessLog>(
  {
    ip: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      default: 'Unknown City',
    },
    region: {
      type: String,
      default: 'Unknown Region',
    },
    country: {
      type: String,
      default: 'Unknown Country',
    },
    countryCode: {
      type: String,
      default: '',
    },
    flag: {
      img: { type: String, default: '' },
      emoji: { type: String, default: '🌐' },
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    isp: {
      type: String,
      default: 'Unknown ISP',
    },
    org: {
      type: String,
      default: '',
    },
    asn: {
      type: String,
      default: '',
    },
    timezone: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    screenResolution: {
      type: String,
      default: '',
    },
    attemptedEmail: {
      type: String,
      default: '',
    },
    action: {
      type: String,
      required: true,
      default: 'Navbar Admin Click',
    },
    status: {
      type: String,
      enum: ['Info', 'Warning', 'Success', 'Danger'],
      default: 'Info',
    },
  },
  {
    timestamps: true,
  }
);

export const AdminAccessLog = mongoose.model<IAdminAccessLog>(
  'AdminAccessLog',
  AdminAccessLogSchema
);
