import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  QrCode,
  ShieldCheck,
  Sparkles,
  DollarSign,
  Building2,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { useVoiceStore } from '../../store/useVoiceStore';
import { useToastStore } from '../../store/useToastStore';

export interface InvoiceItem {
  name: string;
  category: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface StudioInvoiceData {
  documentType: 'quotation' | 'invoice';
  invoiceNumber: string;
  date: string;
  validUntil: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  productName: string;
  productDescription: string;
  items: InvoiceItem[];
  subtotal: number;
  discountPercent: number;
  taxPercent: number;
  shippingFee: number;
  grandTotal: number;
  notes: string;
  upiId: string;
}

interface StudioInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<StudioInvoiceData>;
}

export const StudioInvoiceModal: React.FC<StudioInvoiceModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { language } = useVoiceStore();
  const { addToast } = useToastStore();

  const [data, setData] = useState<StudioInvoiceData>({
    documentType: initialData?.documentType || 'quotation',
    invoiceNumber: initialData?.invoiceNumber || `KRW-${Date.now().toString().slice(-6)}`,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    validUntil:
      initialData?.validUntil ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clientName: initialData?.clientName || 'Valued Client',
    clientPhone: initialData?.clientPhone || '+91 98765 43210',
    clientEmail: initialData?.clientEmail || 'client@example.com',
    clientAddress: initialData?.clientAddress || 'Mumbai, Maharashtra',
    productName: initialData?.productName || 'Custom Handcrafted Resin Artwork',
    productDescription:
      initialData?.productDescription ||
      'Custom 2-part epoxy resin art with premium metallic pigments, gold leaf inclusions, and scratch-resistant gloss topcoat.',
    items: initialData?.items || [
      { name: 'Crystal Clear Epoxy Resin (Part A + B)', category: 'Raw Materials', qty: 160, unit: 'g', unitPrice: 0.8, total: 128 },
      { name: 'Aztec Gold & Sapphire Ocean Mica Inks', category: 'Pigments', qty: 1, unit: 'set', unitPrice: 45, total: 45 },
      { name: 'Artisan Pouring, Cell Creation & Finishing', category: 'Craftsmanship', qty: 45, unit: 'mins', unitPrice: 3.5, total: 157.5 },
      { name: 'Luxury Velvet Rigid Gift Box Packaging', category: 'Packaging', qty: 1, unit: 'pcs', unitPrice: 40, total: 40 },
      { name: 'Studio Electricity & Heat Gun Utility', category: 'Overhead', qty: 1, unit: 'job', unitPrice: 20, total: 20 },
    ],
    subtotal: initialData?.subtotal || 390.5,
    discountPercent: initialData?.discountPercent || 0,
    taxPercent: initialData?.taxPercent || 18,
    shippingFee: initialData?.shippingFee || 0,
    grandTotal: initialData?.grandTotal || 460,
    notes:
      initialData?.notes ||
      'Thank you for supporting authentic handcrafted resin art! Each piece is unique and made with love.',
    upiId: initialData?.upiId || 'artisan@upi',
  });

  if (!isOpen) return null;

  const recalculateTotals = (updatedItems: InvoiceItem[], disc: number, tax: number, ship: number) => {
    const sub = updatedItems.reduce((acc, item) => acc + item.total, 0);
    const afterDisc = sub * (1 - disc / 100);
    const taxAmt = afterDisc * (tax / 100);
    const grand = Math.round(afterDisc + taxAmt + ship);
    return { subtotal: Number(sub.toFixed(2)), grandTotal: grand };
  };

  const handlePrint = () => {
    window.print();
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    `upi://pay?pa=${data.upiId}&pn=Kalakar+Resin+Studio&am=${data.grandTotal}&cu=INR&tn=${encodeURIComponent(
      data.invoiceNumber
    )}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto font-poppins">
      {/* Container with Print CSS rules */}
      <div className="bg-white border border-art-800 rounded-2xl sm:rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl my-3 sm:my-6 flex flex-col max-h-[92vh]">
        {/* Modal Action Bar (Hidden on Print) */}
        <div className="print:hidden p-3.5 sm:p-4 border-b border-art-800 bg-art-950/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-rose-600 text-white shadow-md shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-art-300 truncate">
                {data.documentType === 'quotation' ? 'Client Quotation & Estimate Sheet' : 'Official Tax Invoice'}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-art-500 truncate">
                Branded printable invoice with live material breakdowns & UPI payment QR
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {/* Document Type Switcher */}
            <div className="flex rounded-xl bg-white border border-art-800 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setData({ ...data, documentType: 'quotation' })}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all text-xs ${
                  data.documentType === 'quotation'
                    ? 'bg-brand-500 text-white font-bold'
                    : 'text-art-400 hover:text-art-300'
                }`}
              >
                Quotation
              </button>
              <button
                onClick={() => setData({ ...data, documentType: 'invoice' })}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all text-xs ${
                  data.documentType === 'invoice'
                    ? 'bg-brand-500 text-white font-bold'
                    : 'text-art-400 hover:text-art-300'
                }`}
              >
                Tax Invoice
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md transition-all active:scale-95 shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden xs:inline">Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-art-500 hover:text-art-300 hover:bg-art-900 border border-art-800 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Invoice Content */}
        <div id="printable-invoice" className="p-4 sm:p-8 md:p-12 overflow-y-auto space-y-6 sm:space-y-8 bg-white text-slate-800 flex-1">
          {/* Top Header & Studio Branding */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6 border-b border-slate-200 pb-6 sm:pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-rose-600 to-purple-700 flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
                  K
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 uppercase">
                    Kalakar Resin Works
                  </h1>
                  <p className="text-[11px] sm:text-xs font-semibold text-amber-700 tracking-wider uppercase">
                    Handcrafted Resin Arts & Custom Studio
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Studio Workshop #4, Art District, Mumbai-Pune Expressway, MH 411045
                <br />
                GSTIN: <span className="font-mono font-bold text-slate-700">27AAACK1234F1Z5</span> • Email: studio@kalakarresin.com
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="inline-block px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-widest">
                {data.documentType === 'quotation' ? 'Client Quotation' : 'Tax Invoice'}
              </div>
              <div className="text-base font-mono font-bold text-slate-900">{data.invoiceNumber}</div>
              <div className="text-xs text-slate-500 font-medium">
                Date: <span className="font-mono text-slate-800">{data.date}</span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Valid Until: <span className="font-mono text-slate-800">{data.validUntil}</span>
              </div>
            </div>
          </div>

          {/* Client Details Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200/80">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Billed / Quoted To
              </span>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-600" />
                {data.clientName}
              </h3>
              <p className="text-xs text-slate-600 flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-slate-400" />
                {data.clientPhone}
              </p>
              <p className="text-xs text-slate-600 flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-slate-400" />
                {data.clientEmail}
              </p>
              <p className="text-xs text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                {data.clientAddress}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Artwork / Custom Project
              </span>
              <h4 className="text-sm font-bold text-slate-900">{data.productName}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{data.productDescription}</p>
            </div>
          </div>

          {/* Itemized Material & Craftsmanship Breakdown Table */}
          <div className="overflow-x-auto touch-pan-x">
            <table className="w-full min-w-[550px] text-xs text-left">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-2">#</th>
                  <th className="py-3 px-3">Item / Craftsmanship Stage</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Quantity</th>
                  <th className="py-3 px-3 text-right">Rate (₹)</th>
                  <th className="py-3 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-2 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{item.name}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {item.qty} {item.unit}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      ₹{item.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Totals & Payment QR Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-4 border-t border-slate-200">
            {/* Left: UPI Payment QR Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 border border-amber-200 flex flex-col xs:flex-row items-center xs:items-start text-center xs:text-left gap-3 sm:gap-4">
              <div className="bg-white p-2 rounded-xl border border-amber-300 shadow-sm shrink-0">
                <img
                  src={qrUrl}
                  alt="UPI QR Code"
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center justify-center xs:justify-start gap-1">
                  <QrCode className="w-3.5 h-3.5 text-amber-700" />
                  Instant UPI Payment
                </span>
                <p className="text-xs font-mono font-bold text-slate-900">{data.upiId}</p>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Scan via GPay, PhonePe, Paytm, or BHIM for direct studio confirmation.
                </p>
                <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Amount: ₹{data.grandTotal}
                </span>
              </div>
            </div>

            {/* Right: Financial Totals */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Material & Labor Subtotal:</span>
                <span className="font-mono font-semibold text-slate-900">₹{data.subtotal.toFixed(2)}</span>
              </div>
              {data.discountPercent > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Special Artisan Discount ({data.discountPercent}%):</span>
                  <span className="font-mono">-₹{((data.subtotal * data.discountPercent) / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>GST ({data.taxPercent}%):</span>
                <span className="font-mono font-semibold text-slate-900">
                  ₹{(((data.subtotal * (1 - data.discountPercent / 100)) * data.taxPercent) / 100).toFixed(2)}
                </span>
              </div>
              {data.shippingFee > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Insured Packaging & Courier:</span>
                  <span className="font-mono font-semibold text-slate-900">₹{data.shippingFee.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-center text-sm font-black text-slate-900">
                <span className="uppercase tracking-wider">Grand Total (INR):</span>
                <span className="text-lg font-mono text-amber-700">₹{data.grandTotal}</span>
              </div>
            </div>
          </div>

          {/* Resin Care Instructions Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Resin Art Aftercare & Maintenance Instructions</span>
            </div>
            <p className="leading-relaxed">
              1. <strong>Cleaning</strong>: Wipe gently with a soft microfiber cloth and warm mild soapy water. Never use harsh abrasive chemicals or acetone.
              <br />
              2. <strong>Heat Resistance</strong>: Handcrafted epoxy resin is heat-resistant up to 70°C. Do not place boiling pots directly without a hot pad.
              <br />
              3. <strong>Sunlight Exposure</strong>: While UV-stabilized, prolonged direct scorching sunlight should be avoided to preserve vibrant pigment clarity.
            </p>
          </div>

          {/* Footer Signature */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p className="text-center sm:text-left">{data.notes}</p>
            <div className="text-center sm:text-right">
              <div className="h-8 border-b border-dashed border-slate-400 w-40 mb-1 mx-auto sm:ml-auto" />
              <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
                Authorized Studio Artisan Signatory
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
