import React from 'react';
import { Settings, Truck } from 'lucide-react';

interface ShippingTaxSettingsTabProps {
  storeName: string;
  setStoreName: (val: string) => void;
  supportEmail: string;
  setSupportEmail: (val: string) => void;
  freeShippingThreshold: number;
  setFreeShippingThreshold: (val: number) => void;
  currencySymbol: string;
  setCurrencySymbol: (val: string) => void;
  gstin: string;
  setGstin: (val: string) => void;
  invoicePrefix: string;
  setInvoicePrefix: (val: string) => void;
  studioAddress: string;
  setStudioAddress: (val: string) => void;
}

export const ShippingTaxSettingsTab: React.FC<ShippingTaxSettingsTabProps> = ({
  storeName,
  setStoreName,
  supportEmail,
  setSupportEmail,
  freeShippingThreshold,
  setFreeShippingThreshold,
  currencySymbol,
  setCurrencySymbol,
  gstin,
  setGstin,
  invoicePrefix,
  setInvoicePrefix,
  studioAddress,
  setStudioAddress,
}) => {
  return (
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
              onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
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
  );
};
