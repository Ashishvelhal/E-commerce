import React, { useState } from 'react';
import {
  Mail,
  Sparkles,
  AtSign,
  Headphones,
  FileText,
  Truck,
  Globe,
  Send,
  Inbox,
  Layers,
  Plus,
  Trash2,
  Eye,
  Server,
  Palette,
} from 'lucide-react';
import { ICustomMailbox, IEmailTemplates, ISmtpConfig } from '../../../store/useSettingsStore';
import { getLogoGradientClass } from '../../../utils/iconHelper';

interface EmailSettingsTabProps {
  emailRoutingMode: 'single' | 'multi';
  setEmailRoutingMode: (val: 'single' | 'multi') => void;
  universalEmail: string;
  setUniversalEmail: (val: string) => void;
  supportEmail: string;
  setSupportEmail: (val: string) => void;
  salesEmail: string;
  setSalesEmail: (val: string) => void;
  billingEmail: string;
  setBillingEmail: (val: string) => void;
  orderNotificationEmail: string;
  setOrderNotificationEmail: (val: string) => void;
  customMailboxes: ICustomMailbox[];
  setCustomMailboxes: React.Dispatch<React.SetStateAction<ICustomMailbox[]>>;
  emailTemplates: IEmailTemplates;
  setEmailTemplates: React.Dispatch<React.SetStateAction<IEmailTemplates>>;
  smtpConfig: ISmtpConfig;
  setSmtpConfig: React.Dispatch<React.SetStateAction<ISmtpConfig>>;
  brandTitle: string;
  brandSubtitle: string;
  logoGradient: string;
  onApplyUniversalEmail: (email?: string) => void;
}

export const EmailSettingsTab: React.FC<EmailSettingsTabProps> = ({
  emailRoutingMode,
  setEmailRoutingMode,
  universalEmail,
  setUniversalEmail,
  supportEmail,
  setSupportEmail,
  salesEmail,
  setSalesEmail,
  billingEmail,
  setBillingEmail,
  orderNotificationEmail,
  setOrderNotificationEmail,
  customMailboxes,
  setCustomMailboxes,
  emailTemplates,
  setEmailTemplates,
  smtpConfig,
  setSmtpConfig,
  brandTitle,
  brandSubtitle,
  logoGradient,
  onApplyUniversalEmail,
}) => {
  const [activeTemplateTab, setActiveTemplateTab] = useState<'order' | 'custom' | 'bulk' | 'signature'>('order');
  const [isAddingMailbox, setIsAddingMailbox] = useState(false);
  const [newMailboxEmail, setNewMailboxEmail] = useState('');
  const [newMailboxDept, setNewMailboxDept] = useState('General Inquiries');
  const [newMailboxLabel, setNewMailboxLabel] = useState('Studio Specialist');
  const [newMailboxShowStorefront, setNewMailboxShowStorefront] = useState(true);

  const handleAddNewMailbox = () => {
    if (!newMailboxEmail.trim() || !newMailboxEmail.includes('@')) return;
    const newMbx: ICustomMailbox = {
      id: `mbx-${Date.now()}`,
      email: newMailboxEmail.trim().toLowerCase(),
      department: newMailboxDept.trim() || 'General Desk',
      label: newMailboxLabel.trim() || 'Specialist',
      isActive: true,
      showOnStorefront: newMailboxShowStorefront,
    };
    setCustomMailboxes((prev) => [...prev, newMbx]);
    setNewMailboxEmail('');
    setNewMailboxDept('General Inquiries');
    setNewMailboxLabel('Studio Specialist');
    setIsAddingMailbox(false);
  };

  const handleToggleMailboxActive = (id: string) => {
    setCustomMailboxes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m))
    );
  };

  const handleToggleMailboxStorefront = (id: string) => {
    setCustomMailboxes((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, showOnStorefront: !m.showOnStorefront } : m
      )
    );
  };

  const handleRemoveMailbox = (id: string) => {
    setCustomMailboxes((prev) => prev.filter((m) => m.id !== id));
  };

  return (
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
                onApplyUniversalEmail(universalEmail || supportEmail);
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
              onClick={() => onApplyUniversalEmail(universalEmail)}
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

      {/* B. Custom Studio Mailboxes */}
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

      {/* C. Automated Customer Email Templates */}
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

        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-stone-100 border border-stone-200">
          {[
            { id: 'order' as const, label: '🛒 Order Confirmation' },
            { id: 'custom' as const, label: '✨ 3D Customizer Inquiry' },
            { id: 'bulk' as const, label: '🎁 B2B Bulk Quote' },
            { id: 'signature' as const, label: '✍️ Studio Signature' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTemplateTab(tab.id)}
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

          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs font-bold text-stone-900">
            <span className="text-stone-500 font-normal">Subject: </span>
            {activeTemplateTab === 'order' && (emailTemplates.orderConfirmationSubject || '🎉 Order Confirmation & Studio Invoice')}
            {activeTemplateTab === 'custom' && (emailTemplates.customInquirySubject || '✨ Bespoke 3D Resin Customization Inquiry Received')}
            {activeTemplateTab === 'bulk' && (emailTemplates.bulkQuoteSubject || '🎁 Luxury B2B & Bulk Gifting Quotation')}
            {activeTemplateTab === 'signature' && 'Official Studio Correspondence'}
          </div>

          <div className="text-xs text-stone-700 leading-relaxed space-y-2">
            <p className="font-semibold text-stone-900">Dear Ananya Sharma,</p>
            <p>
              {activeTemplateTab === 'order' && (emailTemplates.orderConfirmationGreeting || 'Thank you for choosing Rasin Arts Luxury Studio!')}
              {activeTemplateTab === 'custom' && (emailTemplates.customInquiryGreeting || 'We have received your custom 3D design specifications.')}
              {activeTemplateTab === 'bulk' && (emailTemplates.bulkQuoteGreeting || 'Thank you for considering Rasin Arts for your corporate event.')}
              {activeTemplateTab === 'signature' && 'We are thrilled to work on your handcrafted resin art piece.'}
            </p>
          </div>

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

          {activeTemplateTab === 'order' && emailTemplates.orderConfirmationFooter && (
            <p className="text-[11px] text-stone-500 italic border-l-2 border-amber-400 pl-3 py-0.5">
              {emailTemplates.orderConfirmationFooter}
            </p>
          )}

          <div className="pt-3 border-t border-stone-200 text-[11px] text-stone-600 whitespace-pre-line font-serif leading-relaxed">
            {emailTemplates.emailSignature || 'Warm Artisanal Regards,\nThe Master Artisans & Design Studio Team\nRasin Arts Luxury 3D Studio'}
          </div>
        </div>
      </div>

      {/* E. SMTP Gateway */}
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
  );
};
