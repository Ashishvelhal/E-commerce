import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';

interface WhatsAppSettingsTabProps {
  whatsappNumber: string;
  setWhatsappNumber: (val: string) => void;
  whatsappCheckoutEnabled: boolean;
  setWhatsappCheckoutEnabled: (val: boolean) => void;
  whatsappCustomMessage: string;
  setWhatsappCustomMessage: (val: string) => void;
}

export const WhatsAppSettingsTab: React.FC<WhatsAppSettingsTabProps> = ({
  whatsappNumber,
  setWhatsappNumber,
  whatsappCheckoutEnabled,
  setWhatsappCheckoutEnabled,
  whatsappCustomMessage,
  setWhatsappCustomMessage,
}) => {
  return (
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
  );
};
