import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomMailbox {
  id: string;
  email: string;
  department: string;
  label: string;
  isActive: boolean;
  showOnStorefront: boolean;
}

export interface IEmailTemplates {
  orderConfirmationSubject?: string;
  orderConfirmationGreeting?: string;
  orderConfirmationFooter?: string;
  customInquirySubject?: string;
  customInquiryGreeting?: string;
  bulkQuoteSubject?: string;
  bulkQuoteGreeting?: string;
  emailSignature?: string;
}

export interface ISmtpConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  senderName?: string;
  senderEmail?: string;
  enabled?: boolean;
}

export interface ISocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  pinterest?: string;
  twitter?: string;
  whatsappCommunity?: string;
  linkedin?: string;
  instagramHandle?: string;
  showSocialFeed?: boolean;
}

export interface ISetting extends Document {
  key: string;
  storeName: string;
  supportEmail: string;
  salesEmail?: string;
  billingEmail?: string;
  orderNotificationEmail?: string;
  customMailboxes?: ICustomMailbox[];
  emailTemplates?: IEmailTemplates;
  smtpConfig?: ISmtpConfig;
  socialLinks?: ISocialLinks;
  whatsappNumber: string;
  whatsappCheckoutEnabled: boolean;
  whatsappCustomMessage: string;
  freeShippingThreshold: number;
  currencySymbol: string;
  customizerEnabled: boolean;
  enabledCustomizerProducts: string[];
  maintenanceMode: boolean;
  gstin: string;
  studioAddress: string;
  invoicePrefix: string;
  brandTitle?: string;
  brandSubtitle?: string;
  logoIcon?: string;
  logoImageUrl?: string;
  logoBlobShape?: string;
  logoGradient?: string;
  navbarIconStyle?: string;
  navbarIconAnimation?: string;
  navbarCustomIcons?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    key: {
      type: String,
      default: 'global_settings',
      unique: true,
      required: true,
    },
    storeName: {
      type: String,
      default: 'Rasin Arts Luxury 3D Studio',
      trim: true,
    },
    supportEmail: {
      type: String,
      default: 'support@rasinarts.com',
      trim: true,
    },
    salesEmail: {
      type: String,
      default: 'sales@rasinarts.com',
      trim: true,
    },
    billingEmail: {
      type: String,
      default: 'invoicing@rasinarts.com',
      trim: true,
    },
    orderNotificationEmail: {
      type: String,
      default: 'orders@rasinarts.com',
      trim: true,
    },
    customMailboxes: {
      type: [
        {
          id: { type: String, required: true },
          email: { type: String, required: true },
          department: { type: String, default: 'General Support' },
          label: { type: String, default: 'Studio Team' },
          isActive: { type: Boolean, default: true },
          showOnStorefront: { type: Boolean, default: true },
        },
      ],
      default: [
        {
          id: 'mbx-1',
          email: 'support@rasinarts.com',
          department: 'Customer Care & Helpdesk',
          label: 'Support Desk',
          isActive: true,
          showOnStorefront: true,
        },
        {
          id: 'mbx-2',
          email: 'custom@rasinarts.com',
          department: '3D Customizer & Bespoke Projects',
          label: 'Artisan Studio',
          isActive: true,
          showOnStorefront: true,
        },
        {
          id: 'mbx-3',
          email: 'corporate@rasinarts.com',
          department: 'B2B Bulk Gifting & Wedding Favors',
          label: 'Corporate Desk',
          isActive: true,
          showOnStorefront: true,
        },
        {
          id: 'mbx-4',
          email: 'accounts@rasinarts.com',
          department: 'GST Billing & Invoices',
          label: 'Finance & Invoicing',
          isActive: true,
          showOnStorefront: false,
        },
      ],
    },
    emailTemplates: {
      type: Schema.Types.Mixed,
      default: {
        orderConfirmationSubject: '🎉 Order Confirmation & Studio Invoice - [OrderNumber] | Rasin Arts',
        orderConfirmationGreeting: 'Thank you for choosing Rasin Arts Luxury Studio! Your bespoke handcrafted resin art piece is now scheduled in our curing queue.',
        orderConfirmationFooter: 'Our master artisans carefully pour each resin layer, de-bubble under vacuum, and cure for 48 hours for flawless optical clarity.',
        customInquirySubject: '✨ Bespoke 3D Resin Customization Inquiry Received | Rasin Arts',
        customInquiryGreeting: 'We have received your custom 3D design specifications. Our head artisan will review your dimensions, colors, and foil inlay requirements.',
        bulkQuoteSubject: '🎁 Luxury B2B & Bulk Gifting Quotation - Rasin Arts Studio',
        bulkQuoteGreeting: 'Thank you for considering Rasin Arts for your corporate event or wedding celebration. Below is your detailed quotation breakdown.',
        emailSignature: 'Warm Artisanal Regards,\nThe Master Artisans & Design Studio Team\nRasin Arts Luxury 3D Studio\nStudio #402, Artisans Galleria, Linking Road, Mumbai, MH 400050\nWhatsApp: +91 98765 43210 | www.rasinarts.com',
      },
    },
    smtpConfig: {
      type: Schema.Types.Mixed,
      default: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        user: 'support@rasinarts.com',
        pass: '',
        senderName: 'Rasin Arts Luxury 3D Studio',
        senderEmail: 'support@rasinarts.com',
        enabled: false,
      },
    },
    socialLinks: {
      type: Schema.Types.Mixed,
      default: {
        instagram: 'https://instagram.com/rasinarts',
        facebook: 'https://facebook.com/rasinarts',
        youtube: 'https://youtube.com/@rasinarts',
        pinterest: 'https://pinterest.com/rasinarts',
        twitter: 'https://twitter.com/rasinarts',
        whatsappCommunity: 'https://chat.whatsapp.com/rasinarts',
        linkedin: '',
        instagramHandle: '@rasinarts.studio',
        showSocialFeed: true,
      },
    },
    whatsappNumber: {
      type: String,
      default: '+91 98765 43210',
      trim: true,
    },
    whatsappCheckoutEnabled: {
      type: Boolean,
      default: true,
    },
    whatsappCustomMessage: {
      type: String,
      default: 'Hello Rasin Arts Studio! I would like to place an order for the following items:',
      trim: true,
    },
    freeShippingThreshold: {
      type: Number,
      default: 999,
    },
    currencySymbol: {
      type: String,
      default: 'INR (₹)',
      trim: true,
    },
    customizerEnabled: {
      type: Boolean,
      default: true,
    },
    enabledCustomizerProducts: {
      type: [String],
      default: [
        'keychain-initial',
        'nameplate-rect',
        'thali-puja',
        'frame-photo',
        'clock-round-12',
      ],
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    gstin: {
      type: String,
      default: '27AABCR1234F1Z5',
      trim: true,
    },
    studioAddress: {
      type: String,
      default: 'Studio #402, Artisans Galleria, Linking Road, Mumbai, MH 400050, India',
      trim: true,
    },
    invoicePrefix: {
      type: String,
      default: 'RA-',
      trim: true,
    },
    brandTitle: {
      type: String,
      default: 'Rasin Arts',
      trim: true,
    },
    brandSubtitle: {
      type: String,
      default: 'Luxury 3D Studio',
      trim: true,
    },
    logoIcon: {
      type: String,
      default: 'Palette',
      trim: true,
    },
    logoImageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    logoBlobShape: {
      type: String,
      default: 'resin-blob',
      trim: true,
    },
    logoGradient: {
      type: String,
      default: 'amber-rose',
      trim: true,
    },
    navbarIconStyle: {
      type: String,
      default: 'animated',
    },
    navbarIconAnimation: {
      type: String,
      default: 'float',
    },
    navbarCustomIcons: {
      type: Schema.Types.Mixed,
      default: {
        home: 'Home',
        shop: 'Compass',
        customizer: 'Sparkles',
        bulkGifting: 'Building2',
        blog: 'BookOpen',
        wishlist: 'Heart',
        cart: 'ShoppingBag',
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Setting = mongoose.model<ISetting>('Setting', SettingSchema);
