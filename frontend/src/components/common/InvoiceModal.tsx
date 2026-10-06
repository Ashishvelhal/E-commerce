import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Download, Sparkles, CheckCircle2, ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';
import { Order } from '../../types';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatINR, formatDate } from '../../utils/formatters';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, order }) => {
  const { settings } = useSettingsStore();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const invoiceNumber = `${settings.invoicePrefix || 'RA-'}${order._id.slice(-8).toUpperCase()}`;
  const invoiceDate = formatDate(order.createdAt, 'full');
  const subtotal = order.itemsPrice || order.orderItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const shipping = order.shippingPrice || 0;
  const tax = order.taxPrice || 0;
  const grandTotal = order.totalPrice;

  // Split Tax into CGST (9%) + SGST (9%) or IGST (18%)
  const isInterState = order.shippingAddress?.state?.toLowerCase().trim() !== 'maharashtra';
  const cgst = isInterState ? 0 : tax / 2;
  const sgst = isInterState ? 0 : tax / 2;
  const igst = isInterState ? tax : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-sm print:p-0 print:bg-white print:static">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 print:hidden"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-white text-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200 z-10 print:border-none print:shadow-none print:w-full print:max-w-none print:m-0 print:rounded-none"
        >
          {/* Top Floating Action Bar (Hidden on Print) */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white border-b border-slate-800 print:hidden">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-brand-500/20 text-brand-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Tax Invoice Preview &bull; {invoiceNumber}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable Invoice Sheet */}
          <div ref={printRef} className="p-6 sm:p-10 font-sans text-xs space-y-6 bg-white print:p-8">
            {/* Header: Studio Branding & Tax Details */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-slate-900">
              <div className="space-y-1 max-w-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                    RA
                  </div>
                  <div>
                    <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase">
                      {settings.storeName || 'Rasin Arts Luxury 3D Studio'}
                    </h1>
                    <p className="text-[10px] font-semibold text-amber-700 tracking-widest uppercase">
                      Bespoke Handcrafted Resin Art &amp; Decor
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                  {settings.studioAddress || 'Studio #402, Artisans Galleria, Linking Road, Mumbai, MH 400050, India'}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-700 pt-1">
                  <span><strong>GSTIN:</strong> {settings.gstin || '27AABCR1234F1Z5'}</span>
                  <span>&bull;</span>
                  <span><strong>Email:</strong> {settings.supportEmail || 'support@rasinarts.com'}</span>
                  <span>&bull;</span>
                  <span><strong>WhatsApp:</strong> {settings.whatsappNumber || '+91 98765 43210'}</span>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1 sm:self-start">
                <span className="inline-block px-3 py-1 rounded bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest">
                  TAX INVOICE
                </span>
                <div className="text-xs font-mono font-bold text-slate-900 pt-1">
                  Invoice No: <span className="text-amber-800">{invoiceNumber}</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Date: {invoiceDate}
                </div>
                <div className="text-[11px] text-slate-600">
                  Order ID: <span className="font-mono">#{order._id.slice(-8)}</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Place of Supply: {order.shippingAddress?.state || 'Maharashtra'} (Code: 27)
                </div>
              </div>
            </div>

            {/* Bill To & Ship To Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Billed &amp; Shipped To:
                </span>
                <div className="text-xs font-bold text-slate-900">
                  {order.shippingAddress?.fullName || order.customerName || 'Customer'}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {order.shippingAddress?.street}
                  <br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                  <br />
                  {order.shippingAddress?.country || 'India'}
                </p>
                <div className="text-[11px] text-slate-700 pt-0.5">
                  <strong>Phone:</strong> {order.shippingAddress?.phone || order.customerPhone}
                </div>
              </div>

              <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Payment &amp; Logistics:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-700">Payment Method:</span>
                  <span className="text-[11px] font-bold text-slate-900">{order.paymentMethod || 'Prepaid / Online'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-700">Payment Status:</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${order.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {order.isPaid ? 'PAID & VERIFIED' : 'PAYMENT PENDING / COD'}
                  </span>
                </div>
                {order.trackingNumber && (
                  <div className="flex items-center gap-2 pt-1 text-[11px]">
                    <span className="text-slate-700">Courier Tracking:</span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-200 px-1.5 py-0.5 rounded">
                      {order.trackingNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-[10px] font-black uppercase tracking-wider text-slate-900 bg-slate-100">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Handcrafted Item &amp; Custom Specs</th>
                    <th className="py-2.5 px-3 text-center">HSN/SAC</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Taxable Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {order.orderItems.map((item, index) => {
                    const itemTotal = item.price * item.quantity;
                    return (
                      <tr key={index} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-mono text-slate-500">{index + 1}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{item.name}</div>
                          {item.selectedColor && (
                            <div className="text-[10px] text-amber-800 font-medium">
                              Resin Color Swirl: {item.selectedColor}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-500 italic">
                            Hand-poured UV epoxy resin with high-gloss finish
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-600">9701</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-900">{item.quantity}</td>
                        <td className="py-3 px-3 text-right font-mono text-slate-700">{formatINR(item.price)}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {formatINR(itemTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Calculations & Summary Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4 border-t border-slate-200">
              <div className="space-y-2 max-w-sm text-[11px] text-slate-600">
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 space-y-1">
                  <div className="font-bold text-amber-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                    <span>Resin Studio Quality Guarantee:</span>
                  </div>
                  <p className="text-[10px] text-amber-900/80 leading-relaxed">
                    All items are made with food-safe, non-yellowing UV stabilized resin. Wipe with a microfiber cloth; keep away from direct open flames.
                  </p>
                </div>
                <div className="text-[10px] text-slate-500">
                  This is a computer-generated tax invoice and requires no physical signature under the Information Technology Act.
                </div>
              </div>

              <div className="w-full sm:w-72 space-y-1.5 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Subtotal (Taxable Value):</span>
                  <span className="font-mono">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Shipping &amp; Protective Crating:</span>
                  <span className="font-mono font-medium">
                    {shipping === 0 ? 'FREE (Store Perk)' : formatINR(shipping)}
                  </span>
                </div>

                {!isInterState ? (
                  <>
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>CGST (9%):</span>
                      <span className="font-mono">{formatINR(cgst)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>SGST (9%):</span>
                      <span className="font-mono">{formatINR(sgst)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>IGST (18%):</span>
                    <span className="font-mono">{formatINR(igst)}</span>
                  </div>
                )}

                <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-baseline">
                  <span className="font-black text-slate-900 text-sm">Grand Total:</span>
                  <span className="font-black text-amber-900 text-base font-mono">
                    {formatINR(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer with Verification Barcode / Seal */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-slate-900 flex items-center justify-center p-1 text-white font-mono text-[9px] text-center leading-none">
                  QR VERIFIED
                </div>
                <div className="text-[10px] text-slate-500">
                  <span className="font-bold text-slate-700 block">Verified Artisan Handcrafted Order</span>
                  <span>Invoice Token: {order._id.slice(0, 16)}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-black text-slate-900 tracking-wider font-serif italic">
                  Rasin Arts Studio &bull; Mumbai
                </div>
                <span className="text-[10px] text-slate-500">Authorized Signatory</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
