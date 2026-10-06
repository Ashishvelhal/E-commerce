import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Truck } from 'lucide-react';
import { Order } from '../../types';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

interface OrderStatusModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const { addToast } = useToastStore();
  const [status, setStatus] = useState<Order['status']>(order?.status || 'Pending');
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (order) {
      setStatus(order.status);
      setTrackingNumber(order.trackingNumber || '');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/orders/${order._id}/status`, {
        status,
        trackingNumber: trackingNumber.trim(),
      });
      addToast(`Order #${order._id.slice(-6)} updated to ${status}`, 'success');
      onUpdated();
      onClose();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to update order status', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white border border-art-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 p-4 sm:p-6 my-4"
        >
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-art-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-50 text-brand-700">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-art-300">Update Fulfillment Status</h3>
                <p className="text-xs text-art-500">Order ID: #{order._id.slice(-8)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-art-500 hover:text-art-300 hover:bg-art-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1.5">
                Shipment / Order Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-semibold"
              >
                <option value="Pending">Pending (Processing Payment)</option>
                <option value="Processing">Processing (Packaging in Warehouse)</option>
                <option value="Shipped">Shipped (In Transit with Courier)</option>
                <option value="Delivered">Delivered (Successfully Handed Over)</option>
                <option value="Cancelled">Cancelled / Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1.5">
                Carrier Tracking Number
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. TRK-983427189"
                className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 font-mono placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-art-300 text-xs font-bold shadow-lg glow-brand flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Status Update</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
