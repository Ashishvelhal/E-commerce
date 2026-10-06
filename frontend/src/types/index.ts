export interface User {
  _id: string;
  name: string;
  email: string;
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
  wishlist?: string[] | Product[];
  token?: string;
  refreshToken?: string;
}

export interface ModelColorVariant {
  name: string;
  hex: string;
  meshTarget?: string;
}

export interface InteractiveNode {
  name: string;
  description: string;
  position: [number, number, number];
}

export interface Model3DConfig {
  url: string;
  initialScale?: number;
  cameraPosition?: [number, number, number];
  availableColors?: ModelColorVariant[];
  interactiveNodes?: InteractiveNode[];
}

export interface Specification {
  key: string;
  value: string;
}

export interface Product {
  _id: string;
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
  model3d?: Model3DConfig;
  specifications: Specification[];
  isFeatured: boolean;
  isTrending: boolean;
  ratingsAverage: number;
  ratingsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  user?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  customerName?: string;
  customerAvatar?: string;
  product: string | Product;
  rating: number;
  title: string;
  comment: string;
  modelAnnotation?: {
    point: [number, number, number];
    label: string;
  };
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email?: string;
}

export interface Order {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderItems: {
    product: Product | string;
    name: string;
    quantity: number;
    price: number;
    image: string;
    selectedColor?: string;
  }[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  deliveredAt?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  bannerImage: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  isPublished: boolean;
  featuredProduct?: Product;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  createdAt?: string;
}

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  image: string;
  linkUrl?: string;
  buttonText?: string;
  position: 'hero' | 'promo' | 'popup';
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAnalyticsSummary {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    totalReviews: number;
    totalPosts: number;
  };
  ordersByStatus: { _id: string; count: number }[];
  lowStockProducts: { _id: string; title: string; stock: number; price: number; thumbnail: string }[];
  recentOrders: Order[];
  salesChart: { _id: { year: number; month: number }; revenue: number; orders: number }[];
}

export interface InventoryItem {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStats {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValuation: number;
  categoryBreakdown: Record<string, number>;
}

export interface AdminAccessLog {
  _id: string;
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
  action: string;
  status: 'Info' | 'Warning' | 'Success' | 'Danger';
  createdAt: string;
  updatedAt: string;
}

export interface AdminAccessLogMetrics {
  totalLogs: number;
  failedLogins: number;
  uniqueIpsCount: number;
  uniqueCountriesCount: number;
}

export interface BulkInquiry {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}


