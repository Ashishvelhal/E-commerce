import React, { useState, useEffect } from 'react';
import {
  Palette,
  Sparkles,
  MessageCircle,
  Truck,
  Mail,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { AdminNavbar } from '../../components/admin/AdminNavbar';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import {
  useSettingsStore,
  ICustomMailbox,
  IEmailTemplates,
  ISmtpConfig,
  ISocialLinks,
  DEFAULT_SOCIAL_LINKS,
} from '../../store/useSettingsStore';
import api from '../../services/api';

import { BrandSettingsTab } from '../../components/admin/settings/BrandSettingsTab';
import { CustomizerSettingsTab } from '../../components/admin/settings/CustomizerSettingsTab';
import { WhatsAppSettingsTab } from '../../components/admin/settings/WhatsAppSettingsTab';
import { ShippingTaxSettingsTab } from '../../components/admin/settings/ShippingTaxSettingsTab';
import { EmailSettingsTab } from '../../components/admin/settings/EmailSettingsTab';
import { SocialSettingsTab } from '../../components/admin/settings/SocialSettingsTab';
import { SecuritySettingsTab } from '../../components/admin/settings/SecuritySettingsTab';

export type SettingsTabId =
  | 'brand'
  | 'customizer'
  | 'whatsapp'
  | 'shipping'
  | 'email'
  | 'social'
  | 'security'
  | 'all';

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
  const [emailRoutingMode, setEmailRoutingMode] = useState<'single' | 'multi'>('single');
  const [universalEmail, setUniversalEmail] = useState('support@rasinarts.com');

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

  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1499);
  const [currencySymbol, setCurrencySymbol] = useState('INR (₹)');
  const [gstin, setGstin] = useState('27AABCR1234F1Z5');
  const [invoicePrefix, setInvoicePrefix] = useState('RA-');
  const [studioAddress, setStudioAddress] = useState(
    'Studio #402, Artisans Galleria, Linking Road, Mumbai, MH 400050, India'
  );

  const [navbarIconStyle, setNavbarIconStyle] = useState('animated');
  const [navbarAnimation, setNavbarAnimation] = useState('float');
  const [tabIcons, setTabIcons] = useState({
    home: 'Sparkles',
    shop: 'ShoppingBag',
    customizer: 'Box',
    bulk: 'Package',
    blog: 'BookOpen',
    about: 'Palette',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingCustomizer, setIsTogglingCustomizer] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTabId>('brand');
  const [socialLinks, setSocialLinks] = useState<ISocialLinks>(DEFAULT_SOCIAL_LINKS);

  const SETTINGS_TABS: { id: SettingsTabId; label: string; sub: string; icon: any; countBadge?: string }[] = [
    { id: 'brand', label: 'Brand & Visuals', sub: 'Logo, Tagline, Navbar & Themes', icon: Palette },
    { id: 'customizer', label: '3D Co-Creator Studio', sub: '3D Models & Product Catalog', icon: Sparkles, countBadge: customizerEnabled ? 'Live' : 'Off' },
    { id: 'whatsapp', label: 'WhatsApp Direct Orders', sub: '1-Click Checkout & Message', icon: MessageCircle, countBadge: whatsappCheckoutEnabled ? 'Live' : 'Off' },
    { id: 'shipping', label: 'Shipping, Tax & Studio', sub: 'Free Shipping, GSTIN & Address', icon: Truck },
    { id: 'email', label: 'Mail & Communications', sub: 'Universal Email, Mailboxes & SMTP', icon: Mail, countBadge: customMailboxes.length > 0 ? `${customMailboxes.length}` : undefined },
    { id: 'social', label: 'Social Media & Community', sub: 'Instagram, YouTube, Pinterest & Feeds', icon: Share2, countBadge: 'Connected' },
    { id: 'security', label: 'Admin Security', sub: 'Account Name & Password', icon: ShieldCheck },
  ];

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      if (settings.storeName) setStoreName(settings.storeName);
      if (settings.brandTitle) setBrandTitle(settings.brandTitle);
      if (settings.brandSubtitle) setBrandSubtitle(settings.brandSubtitle);
      if (settings.logoIcon) setLogoIcon(settings.logoIcon);
      if (settings.logoImageUrl) setLogoImageUrl(settings.logoImageUrl);
      if (settings.logoBlobShape) setLogoBlobShape(settings.logoBlobShape);
      if (settings.logoGradient) setLogoGradient(settings.logoGradient);
      if (settings.logoMode) setLogoMode(settings.logoMode);
      if (settings.supportEmail) setSupportEmail(settings.supportEmail);
      if (settings.salesEmail) setSalesEmail(settings.salesEmail);
      if (settings.billingEmail) setBillingEmail(settings.billingEmail);
      if (settings.orderNotificationEmail) setOrderNotificationEmail(settings.orderNotificationEmail);
      if (settings.emailRoutingMode) setEmailRoutingMode(settings.emailRoutingMode);
      if (settings.universalEmail) setUniversalEmail(settings.universalEmail);
      if (settings.customMailboxes && settings.customMailboxes.length > 0) {
        setCustomMailboxes(settings.customMailboxes);
      }
      if (settings.emailTemplates) {
        setEmailTemplates((prev) => ({ ...prev, ...settings.emailTemplates }));
      }
      if (settings.smtpConfig) {
        setSmtpConfig((prev) => ({ ...prev, ...settings.smtpConfig }));
      }
      if (settings.whatsappNumber) setWhatsappNumber(settings.whatsappNumber);
      if (settings.whatsappCheckoutEnabled !== undefined) {
        setWhatsappCheckoutEnabled(settings.whatsappCheckoutEnabled);
      }
      if (settings.whatsappCustomMessage) setWhatsappCustomMessage(settings.whatsappCustomMessage);
      if (settings.freeShippingThreshold) setFreeShippingThreshold(settings.freeShippingThreshold);
      if (settings.currencySymbol) setCurrencySymbol(settings.currencySymbol);
      if (settings.gstin) setGstin(settings.gstin);
      if (settings.invoicePrefix) setInvoicePrefix(settings.invoicePrefix);
      if (settings.studioAddress) setStudioAddress(settings.studioAddress);
      if (settings.navbarIconStyle) setNavbarIconStyle(settings.navbarIconStyle);
      if (settings.navbarAnimation) setNavbarAnimation(settings.navbarAnimation);
      if (settings.tabIcons) setTabIcons((prev) => ({ ...prev, ...settings.tabIcons }));
      if (settings.socialLinks) setSocialLinks((prev) => ({ ...prev, ...settings.socialLinks }));
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

  const handleUpdateProductToggles = async (newList: string[]) => {
    await updateSettings({ enabledCustomizerProducts: newList });
    addToast('3D Customizer product catalog updated ✨', 'success');
  };

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
    addToast(
      `⚡ 1-Click Sync Complete! "${target}" is now active across all 6 store channels. Remember to click "Save All Settings" below.`,
      'success'
    );
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (adminName !== user?.name || adminPassword) {
        const updatePayload: any = { name: adminName };
        if (adminPassword) updatePayload.password = adminPassword;
        const res = await api.put('/auth/profile', updatePayload);
        updateUser(res.data.data);
        setAdminPassword('');
      }

      await updateSettings({
        storeName,
        brandTitle,
        brandSubtitle,
        logoIcon,
        logoImageUrl,
        logoBlobShape,
        logoGradient,
        logoMode,
        supportEmail,
        salesEmail,
        billingEmail,
        orderNotificationEmail,
        emailRoutingMode,
        universalEmail,
        customMailboxes,
        emailTemplates,
        smtpConfig,
        whatsappNumber,
        whatsappCheckoutEnabled,
        whatsappCustomMessage,
        freeShippingThreshold,
        currencySymbol,
        gstin,
        invoicePrefix,
        studioAddress,
        navbarIconStyle,
        navbarAnimation,
        tabIcons,
        socialLinks,
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

      <div className="p-3 xs:p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Mobile Horizontal Sub-Navigation Tabs */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-md'
                : 'bg-white border border-art-800 text-art-400 hover:text-art-300'
            }`}
          >
            📋 All Settings
          </button>
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSel
                    ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-md'
                    : 'bg-white border border-art-800 text-art-400 hover:text-art-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSaveAll} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Settings Sub-Sidebar (Sticky) */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-4 sticky top-24">
            <div className="p-3 bg-white rounded-2xl border border-art-800 shadow-md space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-art-500 font-mono">
                Store Settings
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'all'
                    ? 'bg-art-900 text-brand-700 border border-brand-300 shadow-sm'
                    : 'text-art-400 hover:text-art-300 hover:bg-art-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-brand-600" />
                  <div>
                    <div className="font-bold">All Settings</div>
                    <div className="text-[10px] text-art-500 font-normal">View everything in one page</div>
                  </div>
                </div>
              </button>
              <div className="h-px bg-art-800 my-1" />
              {SETTINGS_TABS.map((tab) => {
                const Icon = tab.icon;
                const isSel = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all text-left ${
                      isSel
                        ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-md glow-brand font-bold'
                        : 'text-art-400 hover:text-art-300 hover:bg-art-900 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <div className="min-w-0 truncate">
                        <div className="truncate">{tab.label}</div>
                        <div className={`text-[10px] truncate ${isSel ? 'text-white/80' : 'text-art-500'}`}>
                          {tab.sub}
                        </div>
                      </div>
                    </div>
                    {tab.countBadge && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                          isSel ? 'bg-white/20 text-white' : 'bg-art-800 text-art-400'
                        }`}
                      >
                        {tab.countBadge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sticky Save Card */}
            <div className="p-4 rounded-2xl bg-white border border-brand-200 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-700">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                <span>Save Store Configurations</span>
              </div>
              <p className="text-[11px] text-art-500 leading-relaxed">
                Applies changes across branding, WhatsApp direct checkout, customizer, email routing, and credentials.
              </p>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-rose-600 hover:from-brand-500 hover:to-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-md glow-brand flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save All Settings'}</span>
              </button>
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* 1. 🎨 3D LIVE CUSTOMIZER FEATURE TOGGLE */}
            {(activeTab === 'all' || activeTab === 'customizer') && (
              <CustomizerSettingsTab
                settings={settings}
                customizerEnabled={customizerEnabled}
                isTogglingCustomizer={isTogglingCustomizer}
                onToggleCustomizer={handleToggleCustomizer}
                onUpdateProductToggles={handleUpdateProductToggles}
              />
            )}

            {/* 2. 📱 WHATSAPP 1-CLICK DIRECT ORDERING */}
            {(activeTab === 'all' || activeTab === 'whatsapp') && (
              <WhatsAppSettingsTab
                whatsappNumber={whatsappNumber}
                setWhatsappNumber={setWhatsappNumber}
                whatsappCheckoutEnabled={whatsappCheckoutEnabled}
                setWhatsappCheckoutEnabled={setWhatsappCheckoutEnabled}
                whatsappCustomMessage={whatsappCustomMessage}
                setWhatsappCustomMessage={setWhatsappCustomMessage}
              />
            )}

            {/* 3. 🎨 STOREFRONT BRAND NAME, TAGLINE & LOGO */}
            {(activeTab === 'all' || activeTab === 'brand') && (
              <BrandSettingsTab
                brandTitle={brandTitle}
                setBrandTitle={setBrandTitle}
                brandSubtitle={brandSubtitle}
                setBrandSubtitle={setBrandSubtitle}
                logoMode={logoMode}
                setLogoMode={setLogoMode}
                logoIcon={logoIcon}
                setLogoIcon={setLogoIcon}
                logoBlobShape={logoBlobShape}
                setLogoBlobShape={setLogoBlobShape}
                logoGradient={logoGradient}
                setLogoGradient={setLogoGradient}
                logoImageUrl={logoImageUrl}
                setLogoImageUrl={setLogoImageUrl}
                navbarIconStyle={navbarIconStyle}
                setNavbarIconStyle={setNavbarIconStyle}
                navbarAnimation={navbarAnimation}
                setNavbarAnimation={setNavbarAnimation}
                tabIcons={tabIcons}
                setTabIcons={setTabIcons}
              />
            )}

            {/* 4. 📧 STUDIO EMAIL & COMMUNICATIONS COMMAND CENTER */}
            {(activeTab === 'all' || activeTab === 'email') && (
              <EmailSettingsTab
                emailRoutingMode={emailRoutingMode}
                setEmailRoutingMode={setEmailRoutingMode}
                universalEmail={universalEmail}
                setUniversalEmail={setUniversalEmail}
                supportEmail={supportEmail}
                setSupportEmail={setSupportEmail}
                salesEmail={salesEmail}
                setSalesEmail={setSalesEmail}
                billingEmail={billingEmail}
                setBillingEmail={setBillingEmail}
                orderNotificationEmail={orderNotificationEmail}
                setOrderNotificationEmail={setOrderNotificationEmail}
                customMailboxes={customMailboxes}
                setCustomMailboxes={setCustomMailboxes}
                emailTemplates={emailTemplates}
                setEmailTemplates={setEmailTemplates}
                smtpConfig={smtpConfig}
                setSmtpConfig={setSmtpConfig}
                brandTitle={brandTitle}
                brandSubtitle={brandSubtitle}
                logoGradient={logoGradient}
                onApplyUniversalEmail={handleApplyUniversalEmail}
              />
            )}

            {/* 5. 🛡️ ADMINISTRATOR ACCOUNT & CREDENTIALS */}
            {(activeTab === 'all' || activeTab === 'security') && (
              <SecuritySettingsTab
                adminName={adminName}
                setAdminName={setAdminName}
                adminPassword={adminPassword}
                setAdminPassword={setAdminPassword}
                user={user}
              />
            )}

            {/* 6. 🚚 STORE LOGISTICS & BUSINESS RULES */}
            {(activeTab === 'all' || activeTab === 'shipping') && (
              <ShippingTaxSettingsTab
                storeName={storeName}
                setStoreName={setStoreName}
                supportEmail={supportEmail}
                setSupportEmail={setSupportEmail}
                freeShippingThreshold={freeShippingThreshold}
                setFreeShippingThreshold={setFreeShippingThreshold}
                currencySymbol={currencySymbol}
                setCurrencySymbol={setCurrencySymbol}
                gstin={gstin}
                setGstin={setGstin}
                invoicePrefix={invoicePrefix}
                setInvoicePrefix={setInvoicePrefix}
                studioAddress={studioAddress}
                setStudioAddress={setStudioAddress}
              />
            )}

            {/* 7. 🌐 SOCIAL MEDIA & COMMUNITY CHANNELS */}
            {(activeTab === 'all' || activeTab === 'social') && (
              <SocialSettingsTab
                socialLinks={socialLinks}
                setSocialLinks={setSocialLinks}
              />
            )}

            {/* Bottom Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-rose-600 hover:from-brand-500 hover:to-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg glow-brand flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Updating Settings...' : 'Save All Settings'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
