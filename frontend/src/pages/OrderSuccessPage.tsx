import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, ShoppingBag, Truck, Sparkles, FileText } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { InvoiceModal } from '../components/common/InvoiceModal';
import { Order } from '../types';
import api from '../services/api';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    if (id) {
      api.get(`/orders/${id}`)
        .then((res) => {
          if (res.data?.data) {
            setOrder(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xl animate-bounce">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Payment Authorized &bull; Order Confirmed</span>
        </div>
        <h1
          className="text-3xl sm:text-4xl font-bold text-art-300"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Thank You for Your Order!
        </h1>
        <p className="text-xs sm:text-sm text-art-500 max-w-md mx-auto">
          We have received your order and our artisan studio is casting and preparing your handcrafted resin art piece.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-art-800 max-w-md mx-auto text-left space-y-3.5 shadow-sm">
        <div className="flex justify-between text-xs">
          <span className="text-art-500 font-medium">Order Reference:</span>
          <span className="font-mono font-bold text-art-300">#{id ? id.slice(-8) : '29384719'}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-art-500 font-medium">Order Status:</span>
          <StatusBadge type="order" status={order?.status || 'Processing'} size="sm" />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-art-500 font-medium">Estimated Delivery:</span>
          <span className="font-semibold text-art-400">2-4 Business Days (Express)</span>
        </div>
        {order && (
          <div className="pt-2 border-t border-art-800/60 flex justify-end">
            <button
              type="button"
              onClick={() => setIsInvoiceOpen(true)}
              className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download / Print Tax Invoice</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          to="/orders"
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg glow-brand flex items-center justify-center gap-2 transition-all"
        >
          <Truck className="w-4 h-4" />
          <span>Track Order Status</span>
        </Link>
        <Link
          to="/shop"
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-art-900 text-art-400 border border-art-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {order && (
        <InvoiceModal
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
          order={order}
        />
      )}
    </div>
  );
};
