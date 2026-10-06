import React, { useEffect, useState } from 'react';
import { Truck, Edit, Loader2, Search, Phone, MapPin, User, Package, Plus, ChevronLeft, ChevronRight, FileText, PackageCheck } from 'lucide-react';
import { Order } from '../../types';
import { AdminNavbar } from '../../components/admin/AdminNavbar';
import { OrderStatusModal } from '../../components/admin/OrderStatusModal';
import { CreateOrderModal } from '../../components/admin/CreateOrderModal';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { PackingSlipModal } from '../../components/admin/PackingSlipModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatINR, formatDate } from '../../utils/formatters';
import api from '../../services/api';

export const AdminOrdersPage: React.FC = () => {
  const [orders,        setOrders]        = useState<Order[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [selectedPackingOrder, setSelectedPackingOrder] = useState<Order | null>(null);
  const [isStatusModal, setIsStatusModal] = useState(false);
  const [isCreateModal, setIsCreateModal] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders?page=${page}&limit=${limit}`);
      setOrders(res.data.data || []);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.pages || 1);
        setTotalOrders(res.data.pagination.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);



  const filtered = orders.filter((o) => {
    const term = search.toLowerCase();
    return (
      o._id.toLowerCase().includes(term) ||
      (o.customerName  || '').toLowerCase().includes(term) ||
      (o.customerPhone || '').toLowerCase().includes(term) ||
      o.status.toLowerCase().includes(term) ||
      (o.shippingAddress?.city || '').toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <AdminNavbar
        title="Customer Orders & Shipments"
        subtitle="Track orders, update delivery status, and manually create new orders"
      />

      <div className="p-3 xs:p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-art-600" />
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID, customer, phone, city..."
              className="w-full bg-white border border-art-700 rounded-xl pl-10 pr-4 py-2.5 sm:py-2 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <span className="text-xs text-art-500 font-medium">
              Total Orders: <span className="font-bold text-art-300">{totalOrders}</span>
            </span>
            <button
              onClick={() => setIsCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg glow-brand transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Order</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-brand-700">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-mono uppercase tracking-widest text-art-500">
              Loading Orders...
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-white border border-art-800 rounded-2xl text-art-500 text-sm font-medium">
            {totalOrders === 0
              ? 'No orders yet. Use "Create Order" to add your first one.'
              : 'No orders match your search.'}
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              {filtered.map((order) => (
                <div
                  key={order._id}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-art-800 shadow-sm space-y-3 sm:space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-art-500">
                          #{order._id.slice(-10).toUpperCase()}
                        </span>
                        <StatusBadge type="order" status={order.status} size="sm" />
                        {order.trackingNumber && (
                          <span className="text-[10px] font-mono text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-500/30">
                            {order.trackingNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-art-600">
                        Placed on {formatDate(order.createdAt, 'full')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-art-800/40">
                      <div className="text-left sm:text-right">
                        <div className="text-base sm:text-lg font-black text-brand-700 font-mono">
                          {formatINR(order.totalPrice)}
                        </div>
                        <div className="text-[11px] text-art-500">
                          {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="px-2.5 py-1.5 rounded-xl bg-art-900 hover:bg-art-850 border border-art-700 text-art-300 hover:text-brand-400 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                          title="Generate & Print Tax Invoice"
                        >
                          <FileText className="w-3.5 h-3.5 text-brand-500" />
                          <span className="hidden md:inline">Invoice</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedPackingOrder(order)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                          title="Print Workshop Packing Slip & Shipping Label"
                        >
                          <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden md:inline">Packing Slip</span>
                        </button>
                        <button
                          onClick={() => { setSelectedOrder(order); setIsStatusModal(true); }}
                          className="p-2 rounded-xl bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 transition-colors shrink-0"
                          title="Update shipment status"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-art-950 border border-art-800">
                      <div className="p-1.5 rounded-lg bg-brand-50 border border-brand-200 shrink-0">
                        <User className="w-3.5 h-3.5 text-brand-700" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] text-art-500 uppercase font-bold tracking-wider">Customer</div>
                        <div className="text-xs font-semibold text-art-300 truncate">
                          {order.customerName || order.shippingAddress?.fullName || 'Guest Buyer'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-art-950 border border-art-800">
                      <div className="p-1.5 rounded-lg bg-green-50 border border-green-200 shrink-0">
                        <Phone className="w-3.5 h-3.5" style={{ color: '#15803d' }} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] text-art-500 uppercase font-bold tracking-wider">Phone</div>
                        <div className="text-xs font-mono font-semibold text-art-300 truncate">
                          {order.customerPhone || order.shippingAddress?.phone || '—'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-art-950 border border-art-800">
                      <div className="p-1.5 rounded-lg bg-cyan-50 border border-cyan-200 shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-cyan-700" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] text-art-500 uppercase font-bold tracking-wider">Delivery</div>
                        <div className="text-xs font-semibold text-art-300 truncate">
                          {order.shippingAddress
                            ? `${order.shippingAddress.city}, ${order.shippingAddress.state}`
                            : '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <Package className="w-4 h-4 text-art-600 shrink-0" />
                    {order.orderItems.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] text-art-400 bg-white px-2.5 py-1 rounded-full border border-art-800 truncate max-w-[200px]"
                      >
                        {item.name} × {item.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-art-800 pt-4 flex-wrap gap-3">
                <p className="text-xs text-art-500">
                  Showing page <span className="font-bold text-art-300">{page}</span> of{' '}
                  <span className="font-bold text-art-300">{totalPages}</span>
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center justify-center p-2 rounded-xl border border-art-800 bg-white hover:bg-art-950 disabled:opacity-40 disabled:hover:bg-white text-art-500 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageIndex = idx + 1;
                    return (
                      <button
                        key={pageIndex}
                        onClick={() => setPage(pageIndex)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                          page === pageIndex
                            ? 'bg-brand-500 text-white shadow-lg glow-brand'
                            : 'bg-white border border-art-800 text-art-400 hover:bg-art-950'
                        }`}
                      >
                        {pageIndex}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center justify-center p-2 rounded-xl border border-art-800 bg-white hover:bg-art-950 disabled:opacity-40 disabled:hover:bg-white text-art-500 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <OrderStatusModal
        isOpen={isStatusModal}
        onClose={() => { setIsStatusModal(false); setSelectedOrder(null); }}
        order={selectedOrder}
        onUpdated={fetchOrders}
      />
      <CreateOrderModal
        isOpen={isCreateModal}
        onClose={() => setIsCreateModal(false)}
        onCreated={fetchOrders}
      />
      <InvoiceModal
        isOpen={Boolean(selectedInvoiceOrder)}
        onClose={() => setSelectedInvoiceOrder(null)}
        order={selectedInvoiceOrder}
      />
      <PackingSlipModal
        isOpen={Boolean(selectedPackingOrder)}
        onClose={() => setSelectedPackingOrder(null)}
        order={selectedPackingOrder}
      />
    </div>
  );
};
