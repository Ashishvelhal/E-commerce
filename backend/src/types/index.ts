import { Request } from 'express';
import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  avatar?: string;
  phone?: string;
  addresses?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
  }[];
  wishlist: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface IModel3DConfig {
  url: string;
  initialScale?: number;
  cameraPosition?: [number, number, number];
  availableColors?: {
    name: string;
    hex: string;
    meshTarget?: string;
  }[];
  interactiveNodes?: {
    name: string;
    description: string;
    position: [number, number, number];
  }[];
}

export interface ISpecification {
  key: string;
  value: string;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  richDetails?: string;
  price: number;
  discountPrice?: number;
  category: string;
  brand?: string;
  stock: number;
  images: string[];
  thumbnail: string;
  model3d?: IModel3DConfig;
  specifications: ISpecification[];
  isFeatured: boolean;
  isTrending: boolean;
  ratingsAverage: number;
  ratingsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReview extends Document {
  _id: Types.ObjectId;
  user?: Types.ObjectId | IUser;
  customerName?: string;
  customerAvatar?: string;
  product: Types.ObjectId | IProduct;
  rating: number;
  title: string;
  comment: string;
  modelAnnotation?: {
    point: [number, number, number];
    label: string;
  };
  verifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  product: Types.ObjectId | IProduct;
  name: string;
  quantity: number;
  price: number;
  image: string;
  selectedColor?: string;
}

export interface IShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email?: string;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  user?: Types.ObjectId | IUser;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderItems: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: 'CreditCard' | 'PayPal' | 'Stripe' | 'CashOnDelivery';
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address?: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  deliveredAt?: Date;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPost extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  bannerImage: string;
  author: Types.ObjectId | IUser;
  category: string;
  tags: string[];
  isPublished: boolean;
  featuredProduct?: Types.ObjectId | IProduct;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBanner extends Document {
  _id: Types.ObjectId;
  title: string;
  subtitle?: string;
  badge?: string;
  image: string;
  linkUrl?: string;
  buttonText?: string;
  position: 'hero' | 'promo' | 'popup';
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
}
