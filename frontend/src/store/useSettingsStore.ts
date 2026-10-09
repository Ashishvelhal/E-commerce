import { create } from 'zustand';
import api from '../services/api';

export const ALL_CUSTOMIZER_PRODUCTS = [
  'keychain-initial',
  'nameplate-rect',
  'thali-puja',
  'frame-photo',
  'clock-round-12',
] as const;

export type CustomizerProductId = (typeof ALL_CUSTOMIZER_PRODUCTS)[number];

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

export interface StoreSettings {
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
  logoMode?: 'icon' | 'image';
  emailRoutingMode?: 'single' | 'multi';
  universalEmail?: string;
  navbarIconStyle?: string;
  navbarAnimation?: string;
  navbarIconAnimation?: string;
  navbarCustomIcons?: Record<string, string>;
  tabIcons?: Record<string, string>;
}

interface SettingsState {
  settings: StoreSettings;
  customizerEnabled: boolean;
  enabledCustomizerProducts: string[];
  whatsappNumber: string;
  whatsappCheckoutEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<boolean>;
  setCustomizerEnabled: (enabled: boolean) => Promise<boolean>;
  isProductEnabled: (productId: string) => boolean;
  toggleCustomizerProduct: (productId: string) => Promise<boolean>;
}

const DEFAULT_NAVBAR_CUSTOM_ICONS: Record<string, string> = {
  home: 'Home',
  shop: 'Compass',
  customizer: 'Sparkles',
  bulkGifting: 'Building2',
  blog: 'BookOpen',
  wishlist: 'Heart',
  cart: 'ShoppingBag',
};

const DEFAULT_CUSTOM_MAILBOXES: ICustomMailbox[] = [
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
];

const DEFAULT_EMAIL_TEMPLATES: IEmailTemplates = {
  orderConfirmationSubject: '🎉 Order Confirmation & Studio Invoice - [OrderNumber] | Rasin Arts',
  orderConfirmationGreeting: 'Thank you for choosing Rasin Arts Luxury Studio! Your bespoke handcrafted resin art piece is now scheduled in our curing queue.',
  orderConfirmationFooter: 'Our master artisans carefully pour each resin layer, de-bubble under vacuum, and cure for 48 hours for flawless optical clarity.',
  customInquirySubject: '✨ Bespoke 3D Resin Customization Inquiry Received | Rasin Arts',
  customInquiryGreeting: 'We have received your custom 3D design specifications. Our head artisan will review your dimensions, colors, and foil inlay requirements.',
  bulkQuoteSubject: '🎁 Luxury B2B & Bulk Gifting Quotation - Rasin Arts Studio',
  bulkQuoteGreeting: 'Thank you for considering Rasin Arts for your corporate event or wedding celebration. Below is your detailed quotation breakdown.',
  emailSignature: 'Warm Artisanal Regards,\nThe Master Artisans & Design Studio Team\nRasin Arts Luxury 3D Studio\nStudio #402, Artisans Galleria, Linking Road, Mumbai, MH 400050\nWhatsApp: +91 98765 43210 | www.rasinarts.com',
};

const DEFAULT_SMTP_CONFIG: ISmtpConfig = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  user: 'support@rasinarts.com',
  pass: '',
  senderName: 'Rasin Arts Luxury 3D Studio',
  senderEmail: 'support@rasinarts.com',
  enabled: false,
};

export const DEFAULT_SOCIAL_LINKS: ISocialLinks = {
  instagram: 'https://instagram.com/rasinarts',
  facebook: 'https://facebook.com/rasinarts',
  youtube: 'https://youtube.com/@rasinarts',
  pinterest: 'https://pinterest.com/rasinarts',
  twitter: 'https://twitter.com/rasinarts',
  whatsappCommunity: 'https://chat.whatsapp.com/rasinarts',
  linkedin: '',
  instagramHandle: '@rasinarts.studio',
  showSocialFeed: true,
};

const getInitialCustomizerState = (): boolean => {
  try {
    const saved = localStorage.getItem('rasin_customizer_enabled');
    if (saved !== null) {
      return saved === 'true';
    }
  } catch (e) {}
  return true;
};

const getInitialEnabledProducts = (): string[] => {
  try {
    const saved = localStorage.getItem('rasin_customizer_products');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return [...ALL_CUSTOMIZER_PRODUCTS];
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {
    storeName: 'Rasin Arts Luxury 3D Studio',
    supportEmail: 'support@rasinarts.com',
    salesEmail: 'sales@rasinarts.com',
    billingEmail: 'invoicing@rasinarts.com',
    orderNotificationEmail: 'orders@rasinarts.com',
    customMailboxes: DEFAULT_CUSTOM_MAILBOXES,
    emailTemplates: DEFAULT_EMAIL_TEMPLATES,
    smtpConfig: DEFAULT_SMTP_CONFIG,
    socialLinks: DEFAULT_SOCIAL_LINKS,
    whatsappNumber: '+91 98765 43210',
    whatsappCheckoutEnabled: true,
    whatsappCustomMessage: 'Hello Rasin Arts Studio! I would like to place an order for the following items:',
    freeShippingThreshold: 999,
    currencySymbol: 'INR (₹)',
    customizerEnabled: getInitialCustomizerState(),
    enabledCustomizerProducts: getInitialEnabledProducts(),
    maintenanceMode: false,
    gstin: '27AABCR1234F1Z5',
    studioAddress: 'Studio #402, Artisans Galleria, Linking Road, Mumbai, MH 400050, India',
    invoicePrefix: 'RA-',
    brandTitle: 'Rasin Arts',
    brandSubtitle: 'Luxury 3D Studio',
    logoIcon: 'Palette',
    logoImageUrl: '',
    logoBlobShape: 'resin-blob',
    logoGradient: 'amber-rose',
    navbarIconStyle: 'animated',
    navbarIconAnimation: 'float',
    navbarCustomIcons: DEFAULT_NAVBAR_CUSTOM_ICONS,
  },
  customizerEnabled: getInitialCustomizerState(),
  enabledCustomizerProducts: getInitialEnabledProducts(),
  whatsappNumber: '+91 98765 43210',
  whatsappCheckoutEnabled: true,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/settings');
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        const customizerEnabled =
          data.customizerEnabled !== undefined ? Boolean(data.customizerEnabled) : true;
        const enabledProducts: string[] =
          Array.isArray(data.enabledCustomizerProducts) && data.enabledCustomizerProducts.length > 0
            ? data.enabledCustomizerProducts
            : [...ALL_CUSTOMIZER_PRODUCTS];
        const whatsappNumber = data.whatsappNumber || '+91 98765 43210';
        const whatsappCheckoutEnabled =
          data.whatsappCheckoutEnabled !== undefined ? Boolean(data.whatsappCheckoutEnabled) : true;
        const whatsappCustomMessage =
          data.whatsappCustomMessage || 'Hello Rasin Arts Studio! I would like to place an order for the following items:';

        try {
          localStorage.setItem('rasin_customizer_enabled', String(customizerEnabled));
          localStorage.setItem('rasin_customizer_products', JSON.stringify(enabledProducts));
        } catch (e) {}

        set({
          settings: {
            storeName: data.storeName || 'Rasin Arts Luxury 3D Studio',
            supportEmail: data.supportEmail || 'support@rasinarts.com',
            salesEmail: data.salesEmail || 'sales@rasinarts.com',
            billingEmail: data.billingEmail || 'invoicing@rasinarts.com',
            orderNotificationEmail: data.orderNotificationEmail || 'orders@rasinarts.com',
            customMailboxes: data.customMailboxes || DEFAULT_CUSTOM_MAILBOXES,
            emailTemplates: data.emailTemplates || DEFAULT_EMAIL_TEMPLATES,
            smtpConfig: data.smtpConfig || DEFAULT_SMTP_CONFIG,
            socialLinks: data.socialLinks || DEFAULT_SOCIAL_LINKS,
            whatsappNumber,
            whatsappCheckoutEnabled,
            whatsappCustomMessage,
            freeShippingThreshold: data.freeShippingThreshold ?? 999,
            currencySymbol: data.currencySymbol || 'INR (₹)',
            customizerEnabled,
            enabledCustomizerProducts: enabledProducts,
            maintenanceMode: Boolean(data.maintenanceMode),
            gstin: data.gstin || '27AABCR1234F1Z5',
            studioAddress: data.studioAddress || 'Studio #402, Artisans Galleria, Linking Road, Mumbai, MH 400050, India',
            invoicePrefix: data.invoicePrefix || 'RA-',
            brandTitle: data.brandTitle || 'Rasin Arts',
            brandSubtitle: data.brandSubtitle || 'Luxury 3D Studio',
            logoIcon: data.logoIcon || 'Palette',
            logoImageUrl: data.logoImageUrl || '',
            logoBlobShape: data.logoBlobShape || 'resin-blob',
            logoGradient: data.logoGradient || 'amber-rose',
            navbarIconStyle: data.navbarIconStyle || 'animated',
            navbarIconAnimation: data.navbarIconAnimation || 'float',
            navbarCustomIcons: data.navbarCustomIcons || DEFAULT_NAVBAR_CUSTOM_ICONS,
          },
          customizerEnabled,
          enabledCustomizerProducts: enabledProducts,
          whatsappNumber,
          whatsappCheckoutEnabled,
          isLoading: false,
        });
      }
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to fetch settings' });
    }
  },

  updateSettings: async (newSettings: Partial<StoreSettings>) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.put('/settings', newSettings);
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        const customizerEnabled =
          data.customizerEnabled !== undefined
            ? Boolean(data.customizerEnabled)
            : get().customizerEnabled;
        const enabledProducts =
          Array.isArray(data.enabledCustomizerProducts) && data.enabledCustomizerProducts.length > 0
            ? data.enabledCustomizerProducts
            : get().enabledCustomizerProducts;
        const whatsappNumber = data.whatsappNumber || get().whatsappNumber;
        const whatsappCheckoutEnabled =
          data.whatsappCheckoutEnabled !== undefined
            ? Boolean(data.whatsappCheckoutEnabled)
            : get().whatsappCheckoutEnabled;
        const whatsappCustomMessage =
          data.whatsappCustomMessage || get().settings.whatsappCustomMessage;

        try {
          localStorage.setItem('rasin_customizer_enabled', String(customizerEnabled));
          localStorage.setItem('rasin_customizer_products', JSON.stringify(enabledProducts));
        } catch (e) {}

        set({
          settings: {
            storeName: data.storeName || get().settings.storeName,
            supportEmail: data.supportEmail || get().settings.supportEmail,
            salesEmail: data.salesEmail || get().settings.salesEmail,
            billingEmail: data.billingEmail || get().settings.billingEmail,
            orderNotificationEmail: data.orderNotificationEmail || get().settings.orderNotificationEmail,
            customMailboxes: data.customMailboxes || get().settings.customMailboxes || DEFAULT_CUSTOM_MAILBOXES,
            emailTemplates: data.emailTemplates || get().settings.emailTemplates || DEFAULT_EMAIL_TEMPLATES,
            smtpConfig: data.smtpConfig || get().settings.smtpConfig || DEFAULT_SMTP_CONFIG,
            socialLinks: data.socialLinks || get().settings.socialLinks || DEFAULT_SOCIAL_LINKS,
            whatsappNumber,
            whatsappCheckoutEnabled,
            whatsappCustomMessage,
            freeShippingThreshold: data.freeShippingThreshold ?? get().settings.freeShippingThreshold,
            currencySymbol: data.currencySymbol || get().settings.currencySymbol,
            customizerEnabled,
            enabledCustomizerProducts: enabledProducts,
            maintenanceMode: Boolean(data.maintenanceMode),
            gstin: data.gstin || get().settings.gstin,
            studioAddress: data.studioAddress || get().settings.studioAddress,
            invoicePrefix: data.invoicePrefix || get().settings.invoicePrefix,
            brandTitle: data.brandTitle || get().settings.brandTitle || 'Rasin Arts',
            brandSubtitle: data.brandSubtitle || get().settings.brandSubtitle || 'Luxury 3D Studio',
            logoIcon: data.logoIcon || get().settings.logoIcon || 'Palette',
            logoImageUrl: data.logoImageUrl !== undefined ? data.logoImageUrl : (get().settings.logoImageUrl || ''),
            logoBlobShape: data.logoBlobShape || get().settings.logoBlobShape || 'resin-blob',
            logoGradient: data.logoGradient || get().settings.logoGradient || 'amber-rose',
            navbarIconStyle: data.navbarIconStyle || get().settings.navbarIconStyle,
            navbarIconAnimation: data.navbarIconAnimation || get().settings.navbarIconAnimation,
            navbarCustomIcons: data.navbarCustomIcons || get().settings.navbarCustomIcons,
          },
          customizerEnabled,
          enabledCustomizerProducts: enabledProducts,
          whatsappNumber,
          whatsappCheckoutEnabled,
          isLoading: false,
        });
        return true;
      }
      return false;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to update settings' });
      return false;
    }
  },

  setCustomizerEnabled: async (enabled: boolean) => {
    set((state) => ({
      customizerEnabled: enabled,
      settings: { ...state.settings, customizerEnabled: enabled },
    }));

    try {
      localStorage.setItem('rasin_customizer_enabled', String(enabled));
    } catch (e) {}

    try {
      const res = await api.put('/settings', { customizerEnabled: enabled });
      return res.data?.success || false;
    } catch (err) {
      return false;
    }
  },

  isProductEnabled: (productId: string) => {
    const list = get().enabledCustomizerProducts;
    return list.includes(productId);
  },

  toggleCustomizerProduct: async (productId: string) => {
    const currentList = get().enabledCustomizerProducts;
    let newList: string[];
    if (currentList.includes(productId)) {
      newList = currentList.filter((id) => id !== productId);
    } else {
      newList = [...currentList, productId];
    }

    set((state) => ({
      enabledCustomizerProducts: newList,
      settings: { ...state.settings, enabledCustomizerProducts: newList },
    }));

    try {
      localStorage.setItem('rasin_customizer_products', JSON.stringify(newList));
    } catch (e) {}

    try {
      const res = await api.put('/settings', { enabledCustomizerProducts: newList });
      return res.data?.success || false;
    } catch (err) {
      return false;
    }
  },
}));
