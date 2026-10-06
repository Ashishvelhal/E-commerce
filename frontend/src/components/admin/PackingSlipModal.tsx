import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, PackageCheck, AlertTriangle, Truck, MapPin, Phone, CheckSquare } from 'lucide-react';
import { Order } from '../../types';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatDate } from '../../utils/formatters';

interface PackingSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const PackingSlipModal: React.FC<PackingSlipModalProps> = ({ isOpen, onClose, order }) => {
  const { settings } = useSettingsStore();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const orderShortId = order._id.slice(-8).toUpperCase();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-sm print:p-0 print:bg-white print:static">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 print:hidden"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200 z-10 print:border-none print:shadow-none print:w-full print:max-w-none print:m-0 print:rounded-none"
        >
          {/* Header Action Bar (Hidden on Print) */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white border-b border-slate-800 print:hidden">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <PackageCheck className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Workshop Packing Slip &amp; Shipping Label &bull; #{orderShortId}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Packing Slip</span>
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

          {/* Printable Packing Slip & Label Body */}
          <div ref={printRef} className="p-6 sm:p-8 font-sans text-xs space-y-5 bg-white print:p-6">
            {/* Top Shipping Label Section (Cut along dashed border to stick on parcel) */}
            <div className="border-2 border-dashed border-slate-400 rounded-2xl p-4 bg-slate-50 space-y-3 relative">
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-slate-900 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest inline-block mb-1">
                    PRIORITY HANDCRAFTED PARCEL
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Order Ref: #{orderShortId} &bull; {formatDate(order.createdAt, 'short')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-slate-900 font-mono">
                    {order.trackingNumber ? `TRK: ${order.trackingNumber}` : 'STANDARD EXPEDITED'}
                  </div>
                  <span className="text-[10px] text-emerald-800 font-bold">
                    {order.isPaid ? 'PREPAID - DO NOT COLLECT CASH' : 'CASH ON DELIVERY'}
                  </span>
                </div>
              </div>

              {/* Barcode Graphic */}
              <div className="flex flex-col items-center justify-center py-2 bg-white rounded-lg border border-slate-200">
                <div className="font-mono text-xl tracking-[0.35em] font-black text-slate-900 select-all">
                  ||||| | |||| ||| |||||| || ||||| |||
                </div>
                <div className="text-[10px] font-mono text-slate-500 font-bold mt-0.5">
                  *{order._id.toUpperCase()}*
                </div>
              </div>

              {/* Deliver To Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-500" />
                    DELIVER TO:
                  </span>
                  <div className="text-sm font-black text-slate-900">
                    {order.shippingAddress?.fullName || order.customerName}
                  </div>
                  <p className="text-[11px] text-slate-700 leading-snug">
                    {order.shippingAddress?.street}
                    <br />
                    <strong>{order.shippingAddress?.city}, {order.shippingAddress?.state}</strong>
                    <br />
                    PINCODE: <strong>{order.shippingAddress?.postalCode}</strong>
                  </p>
                  <div className="text-[11px] font-bold text-slate-900 pt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    {order.shippingAddress?.phone || order.customerPhone}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    RETURN / SHIPPER:
                  </span>
                  <div className="text-xs font-bold text-slate-900">
                    {settings.storeName || 'Rasin Arts Luxury 3D Studio'}
                  </div>
                  <p className="text-[10px] text-slate-600 leading-snug">
                    {settings.studioAddress || 'Studio #402, Artisans Galleria, Linking Road, Mumbai, MH 400050'}
                  </p>
                  <div className="text-[10px] text-slate-700 pt-0.5">
                    Helpline: {settings.whatsappNumber || '+91 98765 43210'}
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-100 text-[10px] font-bold text-amber-800 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>FRAGILE RESIN ART &bull; HANDLE WITH CARE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Workshop Packing Checklist Table */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>Workshop Packing Manifest &amp; Items Check</span>
                </h3>
                <span className="text-[10px] text-slate-500">
                  Total Items: <strong>{order.orderItems.reduce((acc, i) => acc + i.quantity, 0)} pcs</strong>
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-[10px] font-black uppercase text-slate-700 border-b border-slate-200">
                      <th className="p-2.5 text-center w-10">Packed?</th>
                      <th className="p-2.5">Item Name &amp; Colorway</th>
                      <th className="p-2.5 text-center w-16">Qty</th>
                      <th className="p-2.5">Workshop Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {order.orderItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 text-center">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-0"
                          />
                        </td>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900">{item.name}</div>
                          {item.selectedColor && (
                            <span className="text-[10px] text-amber-800 font-semibold block">
                              Color Swirl: {item.selectedColor}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-center font-bold text-slate-900">{item.quantity}</td>
                        <td className="p-2.5 text-[10px] text-slate-500 italic">
                          Inspect edges &bull; Wrap with velvet bag
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quality Sign-off Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-slate-600">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-800">1. Curing &amp; Demold</div>
                <div className="text-emerald-700 font-medium">&check; 100% Solid &amp; Cured</div>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-800">2. Protective Cushion</div>
                <div className="text-emerald-700 font-medium">&check; 3-Layer Bubble Wrap</div>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-800">3. Artisan Sign-off</div>
                <div className="font-mono text-slate-900 font-bold">Packer #1 &bull; OK</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
