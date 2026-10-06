import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, CheckCircle2, Clock, PackageCheck, AlertCircle, Loader2, FileText } from 'lucide-react';
import { Order } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { InvoiceModal } from '../components/common/InvoiceModal';
import { formatINR, formatDate } from '../utils/formatters';
import api from '../services/api';

export const OrdersHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/myorders');
        setOrders(res.data.data || []);
      } catch (err) {
        console.error('Error fetching orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getTimelineStep = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return 1;
      case 'Processing':
        return 2;
      case 'Shipped':
        return 3;
      case 'Delivered':
        return 4;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-brand-600">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest text-art-500">
          Loading Order History...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1
          className="text-3xl font-bold text-art-300"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          My Orders & Shipment Tracking
        </h1>
        <p className="text-xs text-art-500 mt-1">
          Monitor your shipments, past receipts, and delivery tracking in real-time.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-art-800 space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-art-900 flex items-center justify-center mx-auto text-art-600">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-art-300">No orders placed yet</h3>
          <p className="text-xs text-art-500 max-w-sm mx-auto">
            You have not placed any orders yet. Discover our handcrafted resin art pieces in the gallery.
          </p>
          <Link
            to="/shop"
            className="mt-3 inline-block px-5 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-lg glow-brand transition-all"
          >
            Start Exploring
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const step = getTimelineStep(order.status);

            return (
              <div
                key={order._id}
                className="p-6 sm:p-7 rounded-3xl bg-white border border-art-800 space-y-6 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-art-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-art-500 font-medium">Order ID:</span>
                      <span className="text-xs font-mono font-bold text-art-300">
                        #{order._id.slice(-8)}
                      </span>
                    </div>
                    <div className="text-[11px] text-art-500 mt-0.5">
                      Placed on {formatDate(order.createdAt, 'medium')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="px-3 py-1.5 rounded-xl bg-art-900 hover:bg-art-850 text-art-300 hover:text-brand-400 border border-art-700/80 text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <FileText className="w-3.5 h-3.5 text-brand-500" />
                      <span>Tax Invoice</span>
                    </button>
                    <StatusBadge type="order" status={order.status} />
                    <span className="text-sm font-bold text-art-300 font-mono">
                      {formatINR(order.totalPrice)}
                    </span>
                  </div>
                </div>

                {order.status !== 'Cancelled' && (
                  <div className="relative py-2">
                    <div className="grid grid-cols-4 gap-2 text-center relative z-10">
                      {[
                        { label: 'Order Placed', num: 1, icon: Clock },
                        { label: 'Processing', num: 2, icon: PackageCheck },
                        { label: 'In Transit', num: 3, icon: Truck },
                        { label: 'Delivered', num: 4, icon: CheckCircle2 },
                      ].map((s) => {
                        const isDone = step >= s.num;
                        const Icon = s.icon;

                        return (
                          <div key={s.num} className="flex flex-col items-center gap-1.5">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                isDone
                                  ? 'bg-brand-500 text-white shadow-md ring-4 ring-brand-500/20'
                                  : 'bg-art-900 text-art-500'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <span
                              className={`text-[10px] font-semibold ${
                                isDone ? 'text-art-300' : 'text-art-500'
                              }`}
                            >
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {order.trackingNumber && (
                  <div className="p-3 bg-cyan-50 rounded-2xl border border-cyan-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-cyan-800 font-medium">
                      <Truck className="w-4 h-4 text-cyan-600" />
                      <span>Courier Tracking:</span>
                      <span className="font-mono font-bold">{order.trackingNumber}</span>
                    </div>
                    <span className="text-[11px] text-cyan-700 font-semibold">BlueDart Express</span>
                  </div>
                )}

                <div className="divide-y divide-art-800/60">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover bg-art-900 border border-art-800 shrink-0"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-art-300">{item.name}</h4>
                          {item.selectedColor && (
                            <span className="text-[11px] text-brand-700 font-medium block">
                              Color: {item.selectedColor}
                            </span>
                          )}
                          <span className="text-[11px] text-art-500 block">
                            Qty: {item.quantity} × {formatINR(item.price)}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-art-300 font-mono">
                        {formatINR(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Instant Tax Invoice Modal */}
      <InvoiceModal
        isOpen={Boolean(selectedInvoiceOrder)}
        onClose={() => setSelectedInvoiceOrder(null)}
        order={selectedInvoiceOrder}
      />
    </div>
  );
};
