import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Truck,
  Sparkles,
  Eye,
  EyeOff,
  ExternalLink,
  Sliders,
  Check,
  MessageCircle,
  Phone,
  Palette,
  Image as ImageIcon,
  Type,
  Mail,
  Plus,
  Trash2,
  Inbox,
  Server,
  FileText,
  Send,
  Globe,
  AtSign,
  Layers,
  Headphones,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminNavbar } from '../../components/admin/AdminNavbar';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { useSettingsStore, ICustomMailbox, IEmailTemplates, ISmtpConfig } from '../../store/useSettingsStore';
import api from '../../services/api';
import {
  getIconComponent,
  AVAILABLE_ICON_NAMES,
  LOGO_GRADIENT_OPTIONS,
  LOGO_SHAPE_OPTIONS,
  getLogoGradientClass,
  getLogoShapeClass,
} from '../../utils/iconHelper';

export const AdminSettingsPage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const { addToast } = useToastStore();
  const {
    settings,
    customizerEnabled,
    fetchSettings,
    updateSettings,
    setCustomizerEnabled,
  } = useSettingsStore();

  const [adminName, setAdminName] = useState(user?.name || 'System Administrator');
  const [adminPassword, setAdminPassword] = useState('');
  const [storeName, setStoreName] = useState('Rasin Arts Luxury 3D Studio');
  const [brandTitle, setBrandTitle] = useState('Rasin Arts');
  const [brandSubtitle, setBrandSubtitle] = useState('Luxury 3D Studio');
  const [logoIcon, setLogoIcon] = useState('Palette');
  const [logoImageUrl, setLogoImageUrl] = useState('');
  const [logoBlobShape, setLogoBlobShape] = useState('resin-blob');
  const [logoGradient, setLogoGradient] = useState('amber-rose');
  const [logoMode, setLogoMode] = useState<'icon' | 'image'>('icon');
  const [supportEmail, setSupportEmail] = useState('support@rasinarts.com');
  const [salesEmail, setSalesEmail] = useState('sales@rasinarts.com');
  const [billingEmail, setBillingEmail] = useState('invoicing@rasinarts.com');
  const [orderNotificationEmail, setOrderNotificationEmail] = useState('orders@rasinarts.com');

  // Email Routing Architecture Mode: 'single' (1 Universal Email everywhere) vs 'multi' (Advanced separate inboxes)
  const [emailRoutingMode, setEmailRoutingMode] = useState<'single' | 'multi'>('single');
  const [universalEmail, setUniversalEmail] = useState('support@rasinarts.com');

  // Custom Mailboxes
  const [customMailboxes, setCustomMailboxes] = useState<ICustomMailbox[]>([
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
  ]);

  // New mailbox creation form state
  const [newMailboxEmail, setNewMailboxEmail] = useState('');
  const [newMailboxDept, setNewMailboxDept] = useState('General Inquiries');
  const [newMailboxLabel, setNewMailboxLabel] = useState('Studio Specialist');
  const [newMailboxShowStorefront, setNewMailboxShowStorefront] = useState(true);
  const [isAddingMailbox, setIsAddingMailbox] = useState(false);

  // Email Templates & Message Content
  const [emailTemplates, setEmailTemplates] = useState<IEmailTemplates>({
    orderConfirmationSubject: '🎉 Order Confirmation & Studio Invoice - [OrderNumber] | Rasin Arts',
    orderConfirmationGreeting: 'Thank you for choosing Rasin Arts Luxury Studio! Your bespoke handcrafted resin art piece is now scheduled in our curing queue.',
    orderConfirmationFooter: 'Our master artisans carefully pour each resin layer, de-bubble under vacuum, and cure for 48 hours for flawless optical clarity.',
    customInquirySubject: '✨ Bespoke 3D Resin Customization Inquiry Received | Rasin Arts',
    customInquiryGreeting: 'We have received your custom 3D design specifications. Our head artisan will review your dimensions, colors, and foil inlay requirements.',
    bulkQuoteSubject: '🎁 Luxury B2B & Bulk Gifting Quotation - Rasin Arts Studio',
    bulkQuoteGreeting: 'Thank you for considering Rasin Arts for your corporate event or wedding celebration. Below is your detailed quotation breakdown.',
    emailSignature: 'Warm Artisanal Regards,\nThe Master Artisans & Design Studio Team\nRasin Arts Luxury 3D Studio\nStudio #402, Artisans Galleria, Linking Road, Mumbai, MH 400050\nWhatsApp: +91 98765 43210 | www.rasinarts.com',
  });
  const [activeTemplateTab, setActiveTemplateTab] = useState<'order' | 'custom' | 'bulk' | 'signature'>('order');

  // SMTP Server Configuration
  const [smtpConfig, setSmtpConfig] = useState<ISmtpConfig>({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    user: 'support@rasinarts.com',
    pass: '',
    senderName: 'Rasin Arts Luxury 3D Studio',
    senderEmail: 'support@rasinarts.com',
    enabled: false,
  });

  const [whatsappNumber, setWhatsappNumber] = useState('+91 98765 43210');
  const [whatsappCheckoutEnabled, setWhatsappCheckoutEnabled] = useState(true);
  const [whatsappCustomMessage, setWhatsappCustomMessage] = useState(
    'Hello Rasin Arts Studio! I would like to place an order for the following items:'
  );
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('999');
  const [currencySymbol, setCurrencySymbol] = useState('INR (₹)');
  const [gstin, setGstin] = useState('27AABCR1234F1Z5');
  const [studioAddress, setStudioAddress] = useState('Studio #402, Artisans Galleria, Linking Road, Mumbai, MH 400050, India');
  const [invoicePrefix, setInvoicePrefix] = useState('RA-');
  const [navbarIconStyle, setNavbarIconStyle] = useState('animated');
  const [navbarIconAnimation, setNavbarIconAnimation] = useState('float');
  const [navbarCustomIcons, setNavbarCustomIcons] = useState<Record<string, string>>({
    home: 'Home',
    shop: 'Compass',
    customizer: 'Sparkles',
    bulkGifting: 'Building2',
    blog: 'BookOpen',
    wishlist: 'Heart',
    cart: 'ShoppingBag',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingCustomizer, setIsTogglingCustomizer] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      if (settings.storeName) setStoreName(settings.storeName);
      if (settings.brandTitle) setBrandTitle(settings.brandTitle);
      if (settings.brandSubtitle) setBrandSubtitle(settings.brandSubtitle);
      if (settings.logoIcon) setLogoIcon(settings.logoIcon);
      if (settings.logoImageUrl !== undefined) {
        setLogoImageUrl(settings.logoImageUrl);
        if (settings.logoImageUrl) setLogoMode('image');
      }
      if (settings.logoBlobShape) setLogoBlobShape(settings.logoBlobShape);
      if (settings.logoGradient) setLogoGradient(settings.logoGradient);
      if (settings.supportEmail) {
        setSupportEmail(settings.supportEmail);
        setUniversalEmail(settings.supportEmail);
      }
      if (settings.salesEmail) setSalesEmail(settings.salesEmail);
      if (settings.billingEmail) setBillingEmail(settings.billingEmail);
      if (settings.orderNotificationEmail) setOrderNotificationEmail(settings.orderNotificationEmail);
      if (settings.customMailboxes && settings.customMailboxes.length > 0) {
        setCustomMailboxes(settings.customMailboxes);
      }
      if (settings.emailTemplates) {
        setEmailTemplates({
          ...emailTemplates,
          ...settings.emailTemplates,
        });
      }
      if (settings.smtpConfig) {
        setSmtpConfig({
          ...smtpConfig,
          ...settings.smtpConfig,
        });
      }
      if (settings.whatsappNumber) setWhatsappNumber(settings.whatsappNumber);
      if (settings.whatsappCheckoutEnabled !== undefined)
        setWhatsappCheckoutEnabled(settings.whatsappCheckoutEnabled);
      if (settings.whatsappCustomMessage)
        setWhatsappCustomMessage(settings.whatsappCustomMessage);
      if (settings.freeShippingThreshold !== undefined)
        setFreeShippingThreshold(String(settings.freeShippingThreshold));
      if (settings.currencySymbol) setCurrencySymbol(settings.currencySymbol);
      if (settings.gstin) setGstin(settings.gstin);
      if (settings.studioAddress) setStudioAddress(settings.studioAddress);
      if (settings.invoicePrefix) setInvoicePrefix(settings.invoicePrefix);
      if (settings.navbarIconStyle) setNavbarIconStyle(settings.navbarIconStyle);
      if (settings.navbarIconAnimation) setNavbarIconAnimation(settings.navbarIconAnimation);
      if (settings.navbarCustomIcons) setNavbarCustomIcons(settings.navbarCustomIcons);
    }
  }, [settings]);

  const handleToggleCustomizer = async () => {
    setIsTogglingCustomizer(true);
    const newState = !customizerEnabled;
    const success = await setCustomizerEnabled(newState);
    if (success) {
      addToast(
        newState
          ? '✨ 3D Live Customizer Tab is now ENABLED & visible across the storefront!'
          : '🔒 3D Live Customizer Tab is now DISABLED & hidden from customers.',
        newState ? 'success' : 'info'
      );
    } else {
      addToast('Failed to update 3D Customizer status', 'error');
    }
    setIsTogglingCustomizer(false);
  };

  // 1-Click Universal Single Email Synchronization
  const handleApplyUniversalEmail = (emailVal?: string) => {
    const target = (emailVal !== undefined ? emailVal : universalEmail).trim().toLowerCase();
    if (!target || !target.includes('@')) {
      addToast('Please enter a valid email address (e.g. rasinarts.studio@gmail.com)', 'error');
      return;
    }
    setUniversalEmail(target);
    setSupportEmail(target);
    setSalesEmail(target);
    setBillingEmail(target);
    setOrderNotificationEmail(target);
    setSmtpConfig((prev) => ({
      ...prev,
      senderEmail: target,
      user: prev.user || target,
    }));
    setCustomMailboxes([
      {
        id: 'mbx-universal',
        email: target,
        department: 'All Departments (Universal Inbox)',
        label: 'Primary Studio Contact',
        isActive: true,
        showOnStorefront: true,
      },
    ]);
    addToast(`⚡ 1-Click Sync Complete! "${target}" is now active across all 6 store channels. Remember to click "Save All Settings" below.`, 'success');
  };

  // Custom Mailbox Handlers
  const handleAddNewMailbox = () => {
    if (!newMailboxEmail.trim() || !newMailboxEmail.includes('@')) {
      addToast('Please enter a valid email address (e.g. sales@yourdomain.com)', 'error');
      return;
    }
    const newMailbox: ICustomMailbox = {
      id: `mbx-${Date.now()}`,
      email: newMailboxEmail.trim().toLowerCase(),
      department: newMailboxDept.trim() || 'General Support',
      label: newMailboxLabel.trim() || 'Studio Desk',
      isActive: true,
      showOnStorefront: newMailboxShowStorefront,
    };
    setCustomMailboxes((prev) => [...prev, newMailbox]);
    setNewMailboxEmail('');
    setNewMailboxDept('General Inquiries');
    setNewMailboxLabel('Studio Specialist');
    setIsAddingMailbox(false);
    addToast(`📬 Mailbox "${newMailbox.email}" added successfully! Remember to save settings.`, 'success');
  };

  const handleRemoveMailbox = (id: string) => {
    setCustomMailboxes((prev) => prev.filter((m) => m.id !== id));
    addToast('Mailbox removed. Click "Save All Settings" to commit.', 'info');
  };

  const handleToggleMailboxActive = (id: string) => {
    setCustomMailboxes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m))
    );
  };

  const handleToggleMailboxStorefront = (id: string) => {
    setCustomMailboxes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, showOnStorefront: !m.showOnStorefront } : m))
    );
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 1. Update Admin Profile & Password if changed
      const payload: any = { name: adminName };
      if (adminPassword.trim().length >= 6) {
        payload.password = adminPassword.trim();
      }
      const res = await api.put('/auth/profile', payload);
      updateUser(res.data.data);
      setAdminPassword('');

      // 2. Update Global Store Settings
      await updateSettings({
        storeName,
        supportEmail,
        salesEmail,
        billingEmail,
        orderNotificationEmail,
        customMailboxes,
        emailTemplates,
        smtpConfig,
        whatsappNumber,
        whatsappCheckoutEnabled,
        whatsappCustomMessage,
        freeShippingThreshold: parseFloat(freeShippingThreshold) || 999,
        currencySymbol,
        gstin,
        studioAddress,
        invoicePrefix,
        customizerEnabled,
        brandTitle,
        brandSubtitle,
        logoIcon,
        logoImageUrl: logoMode === 'image' ? logoImageUrl : '',
        logoBlobShape,
        logoGradient,
        navbarIconStyle,
        navbarIconAnimation,
        navbarCustomIcons,
      });

      addToast('All store branding, mailboxes, templates, WhatsApp & admin settings saved successfully!', 'success');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to update settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <AdminNavbar
        title="Store & System Settings"
        subtitle="Manage 3D Customizer feature access, store rules, and administrator credentials"
      />

      <div className="p-3 xs:p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-4xl mx-auto">
        <form onSubmit={handleSaveAll} className="space-y-4 sm:space-y-6">
          {/* 1. 🎨 3D LIVE CUSTOMIZER FEATURE TOGGLE (ADMIN CONTROL) */}
          <div className="p-4 sm:p-6 rounded-3xl bg-art-900/90 border border-art-800 space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-brand-500/10 via-rose-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-500 mb-1">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Interactive Customer Experience</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-art-200 flex items-center gap-2">
                  <span>3D Live Customizer &amp; Co-Creator Studio</span>
                </h2>
                <p className="text-xs text-art-400 mt-1 max-w-xl">
                  Control whether the 3D Customizer tab is shown to storefront visitors. When disabled, the tab is completely hidden from navigation, and direct visits automatically redirect to the shop.
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    customizerEnabled
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-950'
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-sm shadow-rose-950'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      customizerEnabled ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
                    }`}
                  />
                  <span>{customizerEnabled ? '🟢 Visible on Store' : '🔴 Hidden / Closed'}</span>
                </span>
              </div>
            </div>

            {/* Toggle Switch Card */}
            <div className="p-4 rounded-2xl bg-art-950/80 border border-art-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    customizerEnabled
                      ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                      : 'bg-art-900 border-art-800 text-art-500'
                  }`}
                >
                  {customizerEnabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-art-200">
                    {customizerEnabled
                      ? 'Customizer Tab is Currently ENABLED'
                      : 'Customizer Tab is Currently DISABLED'}
                  </h3>
                  <p className="text-[11px] text-art-500">
                    {customizerEnabled
                      ? 'Customers can browse and design keychains, nameplates, thalis, frames, and clocks in real-time.'
                      : 'Navigation link is hidden across desktop & mobile navbar. Custom orders are paused.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Link
                  to="/customizer"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl text-xs font-bold text-art-400 hover:text-art-200 bg-art-900 hover:bg-art-850 border border-art-800 transition-all flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Preview 3D</span>
                </Link>

                <button
                  type="button"
                  disabled={isTogglingCustomizer}
                  onClick={handleToggleCustomizer}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    customizerEnabled
                      ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {customizerEnabled ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Disable Customizer</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Enable Customizer</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Individual Product Toggles Section */}
            <div className="pt-3 border-t border-art-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-art-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-brand-500" />
                    <span>Individual Product Category Controls</span>
                  </h3>
                  <p className="text-[11px] text-art-500 mt-0.5">
                    Selectively turn specific products ON or OFF in the 3D Customizer studio (e.g. turn off Keychains during mold maintenance).
                  </p>
                </div>
                <span className="text-[10px] font-mono text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/30">
                  {settings.enabledCustomizerProducts?.length ?? 5} of 5 Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {[
                  {
                    id: 'keychain-initial',
                    name: 'Custom Initial Keychains',
                    icon: '🔑',
                    price: '₹299',
                    desc: 'Initial letter & name keychains with 24K gold foil & suede tassel.',
                  },
                  {
                    id: 'nameplate-rect',
                    name: 'Luxury Custom Nameplates',
                    icon: '🏡',
                    price: '₹1,899',
                    desc: 'Architectural slabs with 3D embossed name, bungalow no. & brass standoffs.',
                  },
                  {
                    id: 'thali-puja',
                    name: 'Royal Pooja & Wedding Thalis',
                    icon: '🪔',
                    price: '₹2,299',
                    desc: 'Festive thalis with 2 brass katoris, illuminated diya & pearl border.',
                  },
                  {
                    id: 'frame-photo',
                    name: 'Flower & Photo Preservation Frames',
                    icon: '🖼️',
                    price: '₹1,999',
                    desc: 'Photo window with real wedding flower petals & fairy LEDs.',
                  },
                  {
                    id: 'clock-round-12',
                    name: '12" Geode Wall Clocks',
                    icon: '⏱️',
                    price: '₹2,499',
                    desc: '12-inch radial clocks with raw quartz crystal border & sweep quartz machine.',
                  },
                ].map((item) => {
                  const isEnabled = (settings.enabledCustomizerProducts ?? [
                    'keychain-initial',
                    'nameplate-rect',
                    'thali-puja',
                    'frame-photo',
                    'clock-round-12',
                  ]).includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isEnabled
                          ? 'bg-art-950/80 border-art-800'
                          : 'bg-art-950/40 border-art-900 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0">{item.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-art-200 truncate">{item.name}</h4>
                            <span className="text-[10px] text-brand-400 font-bold shrink-0">{item.price}</span>
                          </div>
                          <p className="text-[10px] text-art-500 truncate">{item.desc}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          const currentList = settings.enabledCustomizerProducts ?? [
                            'keychain-initial',
                            'nameplate-rect',
                            'thali-puja',
                            'frame-photo',
                            'clock-round-12',
                          ];
                          let newList: string[];
                          if (currentList.includes(item.id)) {
                            newList = currentList.filter((id) => id !== item.id);
                          } else {
                            newList = [...currentList, item.id];
                          }
                          await updateSettings({ enabledCustomizerProducts: newList });
                          addToast(
                            `${item.icon} ${item.name} is now ${
                              newList.includes(item.id) ? 'ENABLED' : 'DISABLED'
                            } in 3D Customizer`,
                            newList.includes(item.id) ? 'success' : 'info'
                          );
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                          isEnabled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isEnabled ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        <span>{isEnabled ? 'Active' : 'Off'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. 📱 WHATSAPP 1-CLICK DIRECT ORDERING & REDIRECTION SETTINGS */}
          <div className="p-4 sm:p-6 rounded-3xl bg-art-900/90 border border-art-800 space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>Instant WhatsApp Commerce</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-art-200 flex items-center gap-2">
                  <span>1-Click WhatsApp Order Redirection</span>
                </h2>
                <p className="text-xs text-art-400 mt-1 max-w-xl">
                  When enabled, customers can click &quot;Buy via WhatsApp&quot; from their cart or checkout. The app automatically compiles all items, customized 3D names/options, and prices into a pre-filled WhatsApp message.
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    whatsappCheckoutEnabled
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-950'
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-sm shadow-rose-950'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      whatsappCheckoutEnabled ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
                    }`}
                  />
                  <span>{whatsappCheckoutEnabled ? '🟢 Active in Cart' : '🔴 Disabled'}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-art-300 mb-1">
                  Studio WhatsApp Number (with Country Code) *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+91 98765 43210 or 919876543210"
                    required
                    className="w-full bg-art-950 border border-art-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-art-200 placeholder-art-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-art-500 mt-1">
                  Format: Include country code (e.g. +91 98765 43210 or 919876543210).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-300 mb-1">
                  WhatsApp Checkout Enable / Disable
                </label>
                <button
                  type="button"
                  onClick={() => setWhatsappCheckoutEnabled(!whatsappCheckoutEnabled)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-between cursor-pointer ${
                    whatsappCheckoutEnabled
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                  }`}
                >
                  <span>
                    {whatsappCheckoutEnabled
                      ? '✅ WhatsApp Checkout is ENABLED'
                      : '❌ WhatsApp Checkout is DISABLED'}
                  </span>
                  <span className="text-[10px] underline">Click to Toggle</span>
                </button>
                <p className="text-[11px] text-art-500 mt-1">
                  Displays green &quot;Order via WhatsApp&quot; button in Cart Drawer &amp; Checkout page.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-art-300 mb-1">
                  Custom Order Greeting Message
                </label>
                <textarea
                  rows={2}
                  value={whatsappCustomMessage}
                  onChange={(e) => setWhatsappCustomMessage(e.target.value)}
                  placeholder="Hello Rasin Arts Studio! I would like to place an order for the following items:"
                  className="w-full bg-art-950 border border-art-800 rounded-xl px-3.5 py-2 text-xs text-art-200 placeholder-art-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* 3. 🎨 STOREFRONT BRAND NAME, TAGLINE & LOGO CUSTOMIZER */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-art-800 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-art-800">
              <div>
                <h2 className="text-sm font-bold text-art-300 uppercase tracking-wider flex items-center gap-2">
                  <Palette className="w-4 h-4 text-brand-600" />
                  <span>Storefront Brand Name, Tagline &amp; Logo Customizer</span>
                </h2>
                <p className="text-xs text-art-500 mt-0.5">
                  Change the main store brand name, subtitle tagline, and visual logo displayed on your storefront header, footer, and invoices.
                </p>
              </div>

              <div className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-[11px] font-bold border border-brand-200 shrink-0">
                Live Store Branding
              </div>
            </div>

            {/* Live Real-Time Header Brand Preview Card */}
            <div className="p-4 rounded-2xl bg-art-950 border border-art-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-art-400">
                <span>Live Navbar Header Preview</span>
                <span className="text-[10px] text-brand-600 font-mono">Updates in real-time</span>
              </div>

              <div className="p-4 rounded-xl bg-art-900/90 border border-art-800/80 flex items-center gap-3">
                <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                  {logoMode === 'image' && logoImageUrl ? (
                    <img
                      src={logoImageUrl}
                      alt={brandTitle}
                      className="w-11 h-11 object-contain rounded-xl shadow-md"
                    />
                  ) : (
                    <>
                      <div
                        className={`absolute inset-0 ${getLogoShapeClass(logoBlobShape)} ${getLogoGradientClass(
                          logoGradient
                        )} shadow-md glow-gold`}
                      />
                      {(() => {
                        const PreviewIcon = getIconComponent(logoIcon, Palette);
                        return <PreviewIcon className="relative w-5 h-5 text-white z-10 drop-shadow" />;
                      })()}
                    </>
                  )}
                </div>
                <div>
                  <span
                    className="font-bold text-art-300 tracking-tight text-xl block leading-none"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {brandTitle || 'Rasin Arts'}
                  </span>
                  <span className="text-[9px] font-bold tracking-[0.25em] text-brand-700 uppercase font-sans">
                    {brandSubtitle || 'Luxury 3D Studio'}
                  </span>
                </div>
              </div>
            </div>

            {/* Brand Name & Tagline Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1.5 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-brand-600" />
                  <span>Brand Main Title (e.g. Rasin Arts)</span>
                </label>
                <input
                  type="text"
                  value={brandTitle}
                  onChange={(e) => setBrandTitle(e.target.value)}
                  placeholder="Rasin Arts"
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 font-semibold focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span>Brand Subtitle / Tagline (e.g. Luxury 3D Studio)</span>
                </label>
                <input
                  type="text"
                  value={brandSubtitle}
                  onChange={(e) => setBrandSubtitle(e.target.value)}
                  placeholder="Luxury 3D Studio"
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 font-semibold focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Logo Configuration Mode Selector */}
            <div className="space-y-3 pt-2 border-t border-art-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-art-400">
                Storefront Logo Type &amp; Artwork
              </label>

              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => setLogoMode('icon')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                    logoMode === 'icon'
                      ? 'bg-brand-500 text-white border-brand-500 shadow-md glow-gold'
                      : 'bg-art-950 text-art-400 border-art-800 hover:bg-art-900'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  <span>Artisan Preset Icon</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLogoMode('image')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                    logoMode === 'image'
                      ? 'bg-brand-500 text-white border-brand-500 shadow-md glow-gold'
                      : 'bg-art-950 text-art-400 border-art-800 hover:bg-art-900'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Custom Image URL</span>
                </button>
              </div>

              {logoMode === 'icon' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-art-400 mb-1.5">
                      Logo Center Icon
                    </label>
                    <select
                      value={logoIcon}
                      onChange={(e) => setLogoIcon(e.target.value)}
                      className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-semibold"
                    >
                      {AVAILABLE_ICON_NAMES.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-art-400 mb-1.5">
                      Logo Badge Shape
                    </label>
                    <select
                      value={logoBlobShape}
                      onChange={(e) => setLogoBlobShape(e.target.value)}
                      className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-semibold"
                    >
                      {LOGO_SHAPE_OPTIONS.map((shape) => (
                        <option key={shape.id} value={shape.id}>
                          {shape.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-art-400 mb-1.5">
                      Logo Color Gradient
                    </label>
                    <select
                      value={logoGradient}
                      onChange={(e) => setLogoGradient(e.target.value)}
                      className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-semibold"
                    >
                      {LOGO_GRADIENT_OPTIONS.map((grad) => (
                        <option key={grad.id} value={grad.id}>
                          {grad.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-art-400">
                    Custom Logo Image URL (.png / .svg / .jpg)
                  </label>
                  <input
                    type="url"
                    value={logoImageUrl}
                    onChange={(e) => setLogoImageUrl(e.target.value)}
                    placeholder="https://example.com/your-logo.png"
                    className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 font-mono focus:outline-none focus:border-brand-500"
                  />
                  <p className="text-[11px] text-art-500">
                    Provide a transparent background PNG or SVG URL for the best aesthetic appearance.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 4. 🎨 STOREFRONT NAVBAR TABS: CUSTOM ICONS & MOTION EFFECTS */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-art-800 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-art-800">
              <div>
                <h2 className="text-sm font-bold text-art-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <span>Storefront Navbar Tabs: Custom Icons &amp; Motion Effects</span>
                </h2>
                <p className="text-xs text-art-500 mt-0.5">
                  Pick individual custom icons, visual theme palettes, and live motion animations for every storefront navigation tab.
                </p>
              </div>

              <div className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-[11px] font-bold border border-brand-200 shrink-0">
                Live Tab Icons
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1.5">
                  Navigation Tabs Visual Theme Palette
                </label>
                <select
                  value={navbarIconStyle}
                  onChange={(e) => setNavbarIconStyle(e.target.value)}
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-semibold"
                >
                  <option value="animated">✨ Golden Amber Resin (Gradient Glow)</option>
                  <option value="rose">🌹 Rose Gold Elegance (Soft Rose)</option>
                  <option value="cyber">⚡ Cyber Neon Cyan (Vibrant Glow)</option>
                  <option value="emerald">🌿 Royal Emerald Studio (Artisan Green)</option>
                  <option value="minimal">🖤 Minimalist Charcoal (Clean Classic)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1.5">
                  Navigation Tabs Idle Motion Animation
                </label>
                <select
                  value={navbarIconAnimation}
                  onChange={(e) => setNavbarIconAnimation(e.target.value)}
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-semibold"
                >
                  <option value="float">🎈 Floating Motion (Subtle Idle Float)</option>
                  <option value="pulse">💓 Pulse Glow (Soft Pulse)</option>
                  <option value="bounce">🦘 Gentle Bounce (Interactive Micro Bounce)</option>
                  <option value="spin-slow">🌀 Shimmer Spin (Slow 3D Spin)</option>
                  <option value="none">🛑 Classic Static (No Animation)</option>
                </select>
              </div>
            </div>

            {/* Per-Link Custom Icon Selection Grid */}
            <div className="space-y-3 pt-2 border-t border-art-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-art-400">
                Choose Custom Icon for Each Navigation Tab
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: 'home', label: 'Home Page Tab' },
                  { key: 'shop', label: 'Gallery / Shop Tab' },
                  { key: 'customizer', label: '3D Workshop Tab' },
                  { key: 'bulkGifting', label: 'Corporate Gifting Tab' },
                  { key: 'blog', label: 'Stories & News Tab' },
                  { key: 'wishlist', label: 'Saved Wishlist Icon' },
                  { key: 'cart', label: 'Shopping Cart Icon' },
                ].map(({ key, label }) => {
                  const currentIconName = navbarCustomIcons[key] || 'Compass';
                  const CurrentIconComp = getIconComponent(currentIconName);

                  return (
                    <div key={key} className="p-3 rounded-xl bg-art-950 border border-art-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-art-300">{label}</span>
                        <div className="p-1.5 rounded-lg bg-brand-50 text-brand-700 border border-brand-200">
                          <CurrentIconComp className="w-4 h-4" />
                        </div>
                      </div>

                      <select
                        value={currentIconName}
                        onChange={(e) =>
                          setNavbarCustomIcons((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        className="w-full bg-white border border-art-800 rounded-lg px-2.5 py-1.5 text-[11px] text-art-300 font-semibold focus:outline-none focus:border-brand-500"
                      >
                        {AVAILABLE_ICON_NAMES.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. Studio Email & Communication Command Center */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-stone-200 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
              <div>
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-600" />
                  <span>Studio Email &amp; Communications Command Center</span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Manage custom studio email accounts, automated customer email templates, live message preview, and SMTP mail servers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200 shrink-0 shadow-sm">
                  {customMailboxes.filter((m) => m.isActive).length} of {customMailboxes.length} Mailboxes Active
                </span>
              </div>
            </div>

            {/* Routing Architecture Mode Switcher */}
            <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 border border-amber-200/80 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                    Choose Your Email Architecture Setup
                  </label>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Select how your studio handles emails: 1 single universal email for everything, or multi-inbox routing.
                  </p>
                </div>

                <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailRoutingMode('single');
                      handleApplyUniversalEmail(universalEmail || supportEmail);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      emailRoutingMode === 'single'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <span>⚡ 1 Universal Email (All-in-One)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEmailRoutingMode('multi')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      emailRoutingMode === 'multi'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <span>🏢 Advanced Multi-Department</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mode 1: Universal Single Email (All-in-One Channel) */}
            {emailRoutingMode === 'single' ? (
              <div className="space-y-4 p-5 rounded-2xl bg-amber-50/40 border border-amber-200/70 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <AtSign className="w-4 h-4 text-amber-600" />
                      <span>Single Universal Studio Email Address</span>
                    </h3>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      You only need 1 email! All customer inquiries, order notifications, 3D customizer submissions, invoices, and footer contact links will automatically route through this single address.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600" />
                    <input
                      type="email"
                      value={universalEmail}
                      onChange={(e) => {
                        setUniversalEmail(e.target.value);
                        setSupportEmail(e.target.value);
                        setSalesEmail(e.target.value);
                        setBillingEmail(e.target.value);
                        setOrderNotificationEmail(e.target.value);
                      }}
                      placeholder="e.g. rasinarts.studio@gmail.com or support@rasinarts.com"
                      required
                      className="w-full bg-white border border-stone-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 font-bold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-sm"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyUniversalEmail(universalEmail)}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Sync &amp; Apply Everywhere</span>
                  </button>
                </div>

                {/* 6-Channel Live Confirmation Grid */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-stone-700 block mb-2">
                    Active Channels Routing Through This 1 Email:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {[
                      { icon: Headphones, label: 'Customer Support Desk', desc: 'Footer, contact links & inquiry buttons' },
                      { icon: Sparkles, label: '3D Customizer Inquiries', desc: 'Live co-creator studio requests' },
                      { icon: FileText, label: 'GST Invoices & Receipts', desc: 'Tax invoices & billing receipts' },
                      { icon: Truck, label: 'Order Dispatch Alerts', desc: 'Instant production notifications' },
                      { icon: Globe, label: 'Storefront Footer Links', desc: 'Visible mailto: link for shoppers' },
                      { icon: Send, label: 'Outbound Mail Sender', desc: 'Customer confirmation emails' },
                    ].map((ch, idx) => {
                      const Icon = ch.icon;
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-white border border-amber-200/60 shadow-sm flex items-start gap-2.5"
                        >
                          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-stone-900 truncate">{ch.label}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            </div>
                            <p className="text-[10px] text-stone-500 truncate font-mono mt-0.5">
                              &rarr; {universalEmail || 'support@rasinarts.com'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Mode 2: Multi-Department Advanced Routing */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Inbox className="w-3.5 h-3.5 text-amber-600" />
                    <span>Individual Department Inboxes</span>
                  </h3>
                  <span className="text-[10px] text-stone-400">Custom email address for each specific team</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                      <AtSign className="w-3.5 h-3.5 text-amber-600" />
                      <span>Customer Support &amp; Helpdesk Email *</span>
                    </label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="support@rasinarts.com"
                      required
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                    />
                    <p className="text-[10px] text-stone-400 mt-0.5">Appears in footer, order invoices &amp; contact buttons</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                      <AtSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Sales &amp; Bespoke Inquiries Email</span>
                    </label>
                    <input
                      type="email"
                      value={salesEmail}
                      onChange={(e) => setSalesEmail(e.target.value)}
                      placeholder="sales@rasinarts.com"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                    />
                    <p className="text-[10px] text-stone-400 mt-0.5">Receives 3D customizer submissions &amp; inquiries</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                      <AtSign className="w-3.5 h-3.5 text-indigo-600" />
                      <span>GST Invoicing &amp; Accounts Email</span>
                    </label>
                    <input
                      type="email"
                      value={billingEmail}
                      onChange={(e) => setBillingEmail(e.target.value)}
                      placeholder="invoicing@rasinarts.com"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                    />
                    <p className="text-[10px] text-stone-400 mt-0.5">Sent with B2B bulk tax receipts &amp; credit notes</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                      <AtSign className="w-3.5 h-3.5 text-rose-600" />
                      <span>Order Dispatch &amp; Production Alerts Email</span>
                    </label>
                    <input
                      type="email"
                      value={orderNotificationEmail}
                      onChange={(e) => setOrderNotificationEmail(e.target.value)}
                      placeholder="orders@rasinarts.com"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                    />
                    <p className="text-[10px] text-stone-400 mt-0.5">Receives instant alerts whenever customers place orders</p>
                  </div>
                </div>
              </div>
            )}

            {/* B. Custom Studio Mailboxes (Add, Edit, Remove, Department Routing) */}
            <div className="space-y-3 pt-4 border-t border-stone-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    <span>2. Custom Studio Mailboxes &amp; Department Routing</span>
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Add or remove dedicated email addresses for team members, departments, or partner studios.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingMailbox(!isAddingMailbox)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingMailbox ? 'Close Form' : 'Add Custom Mailbox'}</span>
                </button>
              </div>

              {/* Add New Mailbox Inline Form */}
              {isAddingMailbox && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-300/80 space-y-3 shadow-inner">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Configure New Mailbox</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={newMailboxEmail}
                        onChange={(e) => setNewMailboxEmail(e.target.value)}
                        placeholder="e.g. vip@rasinarts.com"
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Department / Function
                      </label>
                      <input
                        type="text"
                        value={newMailboxDept}
                        onChange={(e) => setNewMailboxDept(e.target.value)}
                        placeholder="e.g. VIP Concierge / Workshops"
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Display Handler Name
                      </label>
                      <input
                        type="text"
                        value={newMailboxLabel}
                        onChange={(e) => setNewMailboxLabel(e.target.value)}
                        placeholder="e.g. Lead Artisan / Master Studio"
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
                      <input
                        type="checkbox"
                        checked={newMailboxShowStorefront}
                        onChange={(e) => setNewMailboxShowStorefront(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>Show in Storefront Contact Drawer &amp; Invoices</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingMailbox(false)}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddNewMailbox}
                        className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Save &amp; Add Mailbox</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mailbox List */}
              <div className="grid grid-cols-1 gap-2.5">
                {customMailboxes.map((mbx) => (
                  <div
                    key={mbx.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      mbx.isActive
                        ? 'bg-stone-50/80 border-stone-200 hover:border-amber-300'
                        : 'bg-stone-100/60 border-stone-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-stone-900 font-mono">
                            {mbx.email}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 text-[10px] font-semibold">
                            {mbx.department}
                          </span>
                          <span className="text-[11px] text-stone-500 font-medium truncate">
                            &bull; {mbx.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                          <span>{mbx.showOnStorefront ? '🌐 Visible on Storefront' : '🔒 Internal Routing Only'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleToggleMailboxStorefront(mbx.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-colors cursor-pointer ${
                          mbx.showOnStorefront
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-stone-100 text-stone-500 border-stone-200'
                        }`}
                        title="Toggle storefront visibility"
                      >
                        {mbx.showOnStorefront ? 'Public' : 'Internal'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleMailboxActive(mbx.id)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                          mbx.isActive
                            ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                            : 'bg-stone-200 text-stone-600 border-stone-300 hover:bg-stone-300'
                        }`}
                      >
                        {mbx.isActive ? 'Active' : 'Disabled'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveMailbox(mbx.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                        title="Delete mailbox"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* C. Automated Customer Email Templates & Message Customizer */}
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>3. Automated Email Templates &amp; Content Customizer</span>
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Customize the subject lines, personalized greetings, and signature for each email event.
                  </p>
                </div>
              </div>

              {/* Template Tabs */}
              <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-stone-100 border border-stone-200">
                {[
                  { id: 'order', label: '🛒 Order Confirmation' },
                  { id: 'custom', label: '✨ 3D Customizer Inquiry' },
                  { id: 'bulk', label: '🎁 B2B Bulk Quote' },
                  { id: 'signature', label: '✍️ Studio Signature' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTemplateTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTemplateTab === tab.id
                        ? 'bg-white text-stone-900 shadow-sm border border-stone-200 font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Order Confirmation */}
              {activeTemplateTab === 'order' && (
                <div className="space-y-3 p-4 rounded-2xl bg-stone-50/60 border border-stone-200">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Email Subject Line
                    </label>
                    <input
                      type="text"
                      value={emailTemplates.orderConfirmationSubject || ''}
                      onChange={(e) =>
                        setEmailTemplates((prev) => ({
                          ...prev,
                          orderConfirmationSubject: e.target.value,
                        }))
                      }
                      placeholder="🎉 Order Confirmation - [OrderNumber] | Rasin Arts"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Opening Customer Greeting Message
                    </label>
                    <textarea
                      rows={2}
                      value={emailTemplates.orderConfirmationGreeting || ''}
                      onChange={(e) =>
                        setEmailTemplates((prev) => ({
                          ...prev,
                          orderConfirmationGreeting: e.target.value,
                        }))
                      }
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Studio Guarantee &amp; Quality Footnote
                    </label>
                    <textarea
                      rows={2}
                      value={emailTemplates.orderConfirmationFooter || ''}
                      onChange={(e) =>
                        setEmailTemplates((prev) => ({
                          ...prev,
                          orderConfirmationFooter: e.target.value,
                        }))
                      }
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500 leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: 3D Customizer Inquiry */}
              {activeTemplateTab === 'custom' && (
                <div className="space-y-3 p-4 rounded-2xl bg-stone-50/60 border border-stone-200">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Custom 3D Inquiry Subject Line
                    </label>
                    <input
                      type="text"
                      value={emailTemplates.customInquirySubject || ''}
                      onChange={(e) =>
                        setEmailTemplates((prev) => ({
                          ...prev,
                          customInquirySubject: e.target.value,
                        }))
                      }
                      placeholder="✨ Bespoke 3D Resin Customization Inquiry Received | Rasin Arts"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Custom 3D Design Acknowledgement Message
                    </label>
                    <textarea
                      rows={3}
                      value={emailTemplates.customInquiryGreeting || ''}
                      onChange={(e) =>
                        setEmailTemplates((prev) => ({
                          ...prev,
                          customInquiryGreeting: e.target.value,
                        }))
                      }
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500 leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: B2B Bulk Quote */}
              {activeTemplateTab === 'bulk' && (
                <div className="space-y-3 p-4 rounded-2xl bg-stone-50/60 border border-stone-200">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Bulk Gifting Quotation Subject Line
                    </label>
                    <input
                      type="text"
                      value={emailTemplates.bulkQuoteSubject || ''}
                      onChange={(e) =>
                        setEmailTemplates((prev) => ({
                          ...prev,
                          bulkQuoteSubject: e.target.value,
                        }))
                      }
                      placeholder="🎁 Luxury B2B & Bulk Gifting Quotation - Rasin Arts Studio"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      B2B Corporate Proposal Greeting Message
                    </label>
                    <textarea
                      rows={3}
                      value={emailTemplates.bulkQuoteGreeting || ''}
                      onChange={(e) =>
                        setEmailTemplates((prev) => ({
                          ...prev,
                          bulkQuoteGreeting: e.target.value,
                        }))
                      }
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500 leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Tab 4: Studio Signature */}
              {activeTemplateTab === 'signature' && (
                <div className="space-y-3 p-4 rounded-2xl bg-stone-50/60 border border-stone-200">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Universal Multi-line Studio Email Signature
                    </label>
                    <textarea
                      rows={4}
                      value={emailTemplates.emailSignature || ''}
                      onChange={(e) =>
                        setEmailTemplates((prev) => ({
                          ...prev,
                          emailSignature: e.target.value,
                        }))
                      }
                      placeholder="Warm Artisanal Regards,&#10;Rasin Arts Luxury 3D Studio Team..."
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500 leading-relaxed font-mono"
                    />
                    <p className="text-[10px] text-stone-400 mt-1">
                      Automatically appended to the bottom of all outbound transactional emails.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* D. Live Interactive Email Preview */}
            <div className="space-y-2 pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-600" />
                  <span>4. Real-Time Customer Email Live Preview</span>
                </span>
                <span className="text-[10px] font-mono text-amber-700 font-normal">
                  Rendering: {activeTemplateTab.toUpperCase()} TEMPLATE
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-md space-y-4 max-w-2xl mx-auto">
                {/* Email Header */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${getLogoGradientClass(logoGradient)}`}>
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900">{brandTitle || 'Rasin Arts'}</div>
                      <div className="text-[9px] uppercase tracking-widest text-amber-700 font-bold">{brandSubtitle || 'Luxury 3D Studio'}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">Invoice #RA-84920</span>
                </div>

                {/* Email Subject preview */}
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs font-bold text-stone-900">
                  <span className="text-stone-500 font-normal">Subject: </span>
                  {activeTemplateTab === 'order' && (emailTemplates.orderConfirmationSubject || '🎉 Order Confirmation & Studio Invoice')}
                  {activeTemplateTab === 'custom' && (emailTemplates.customInquirySubject || '✨ Bespoke 3D Resin Customization Inquiry Received')}
                  {activeTemplateTab === 'bulk' && (emailTemplates.bulkQuoteSubject || '🎁 Luxury B2B & Bulk Gifting Quotation')}
                  {activeTemplateTab === 'signature' && 'Official Studio Correspondence'}
                </div>

                {/* Greeting Body preview */}
                <div className="text-xs text-stone-700 leading-relaxed space-y-2">
                  <p className="font-semibold text-stone-900">Dear Ananya Sharma,</p>
                  <p>
                    {activeTemplateTab === 'order' && (emailTemplates.orderConfirmationGreeting || 'Thank you for choosing Rasin Arts Luxury Studio!')}
                    {activeTemplateTab === 'custom' && (emailTemplates.customInquiryGreeting || 'We have received your custom 3D design specifications.')}
                    {activeTemplateTab === 'bulk' && (emailTemplates.bulkQuoteGreeting || 'Thank you for considering Rasin Arts for your corporate event.')}
                    {activeTemplateTab === 'signature' && 'We are thrilled to work on your handcrafted resin art piece.'}
                  </p>
                </div>

                {/* Mock item card */}
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">⏱️</span>
                    <div>
                      <div className="font-bold text-stone-900">12" Geode Raw Quartz Wall Clock</div>
                      <div className="text-[10px] text-stone-500">Custom Emerald &amp; 24K Gold Foil Leafing</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-stone-900">₹2,499</span>
                </div>

                {/* Footer Assurance */}
                {activeTemplateTab === 'order' && emailTemplates.orderConfirmationFooter && (
                  <p className="text-[11px] text-stone-500 italic border-l-2 border-amber-400 pl-3 py-0.5">
                    {emailTemplates.orderConfirmationFooter}
                  </p>
                )}

                {/* Rendered Signature */}
                <div className="pt-3 border-t border-stone-200 text-[11px] text-stone-600 whitespace-pre-line font-serif leading-relaxed">
                  {emailTemplates.emailSignature || 'Warm Artisanal Regards,\nThe Master Artisans & Design Studio Team\nRasin Arts Luxury 3D Studio'}
                </div>
              </div>
            </div>

            {/* E. SMTP Gateway / Custom Mail Server Setup */}
            <div className="space-y-3 pt-4 border-t border-stone-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-amber-600" />
                    <span>5. Custom SMTP Mail Server Gateway (Optional)</span>
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Connect your own custom business email domain (e.g. Gmail Workspace, Zoho, PrivateEmail, SendGrid).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSmtpConfig((prev) => ({ ...prev, enabled: !prev.enabled }))
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    smtpConfig.enabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-stone-100 text-stone-600 border-stone-200'
                  }`}
                >
                  {smtpConfig.enabled ? '✅ SMTP Gateway Active' : '⚙️ Custom SMTP Disabled'}
                </button>
              </div>

              {smtpConfig.enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-stone-50/70 border border-stone-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={smtpConfig.host || ''}
                      onChange={(e) =>
                        setSmtpConfig((prev) => ({ ...prev, host: e.target.value }))
                      }
                      placeholder="smtp.gmail.com"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={smtpConfig.port || 465}
                      onChange={(e) =>
                        setSmtpConfig((prev) => ({
                          ...prev,
                          port: parseInt(e.target.value) || 465,
                        }))
                      }
                      placeholder="465 or 587"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Sender Display Name
                    </label>
                    <input
                      type="text"
                      value={smtpConfig.senderName || ''}
                      onChange={(e) =>
                        setSmtpConfig((prev) => ({
                          ...prev,
                          senderName: e.target.value,
                        }))
                      }
                      placeholder="Rasin Arts Studio"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      SMTP Username / Email
                    </label>
                    <input
                      type="email"
                      value={smtpConfig.user || ''}
                      onChange={(e) =>
                        setSmtpConfig((prev) => ({ ...prev, user: e.target.value }))
                      }
                      placeholder="support@rasinarts.com"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      SMTP App Password
                    </label>
                    <input
                      type="password"
                      value={smtpConfig.pass || ''}
                      onChange={(e) =>
                        setSmtpConfig((prev) => ({ ...prev, pass: e.target.value }))
                      }
                      placeholder="••••••••••••••••"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Sender From Email
                    </label>
                    <input
                      type="email"
                      value={smtpConfig.senderEmail || ''}
                      onChange={(e) =>
                        setSmtpConfig((prev) => ({
                          ...prev,
                          senderEmail: e.target.value,
                        }))
                      }
                      placeholder="support@rasinarts.com"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 6. Administrator Account & Credentials */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-stone-200 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-art-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Administrator Account &amp; Credentials</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1">
                  Admin Name
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1">
                  Admin Login Email
                </label>
                <input
                  type="email"
                  value={user?.email || 'admin@ecommerce.com'}
                  disabled
                  className="w-full bg-white border border-art-800/80 rounded-xl px-3.5 py-2.5 text-xs text-art-600 cursor-not-allowed font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-art-400 mb-1">
                  Change Security Password (leave blank to retain current)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-art-600" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter new 6+ character password"
                    className="w-full bg-white border border-art-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Store Logistics & Business Rules */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-art-800 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-art-400 uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4 text-plum-600" />
              <span>Store Logistics &amp; Business Rules</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1">
                  Store Display Name
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1">
                  Customer Support Email
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1">
                  Free Shipping Minimum Threshold (₹)
                </label>
                <div className="relative">
                  <Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-art-600" />
                  <input
                    type="number"
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(e.target.value)}
                    className="w-full bg-white border border-art-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1">
                  Currency Format
                </label>
                <select
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
                >
                  <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                  <option value="USD ($)">USD ($) - United States Dollar</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                  <option value="GBP (£)">GBP (£) - British Pound</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1">
                  Studio Registered GSTIN
                </label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="27AABCR1234F1Z5"
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1">
                  Tax Invoice Number Prefix
                </label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  placeholder="RA-"
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-art-400 mb-1">
                  Studio Billing &amp; Dispatch Address (Appears on Invoices &amp; Packing Slips)
                </label>
                <textarea
                  rows={2}
                  value={studioAddress}
                  onChange={(e) => setStudioAddress(e.target.value)}
                  placeholder="Studio #402, Artisans Galleria, Linking Road, Mumbai, MH 400050, India"
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2 text-xs text-art-300 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-art-300 text-xs font-bold shadow-lg glow-brand flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Updating Settings...' : 'Save All Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

