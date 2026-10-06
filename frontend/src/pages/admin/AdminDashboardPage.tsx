import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Box,
  Shield,
  ShieldAlert,
  Globe,
  MapPin,
  RefreshCw,
  Trash2,
  ExternalLink,
  Laptop,
  CheckCircle2,
  XCircle,
  Clock,
  Radio,
} from 'lucide-react';
import { AdminAnalyticsSummary, AdminAccessLog, AdminAccessLogMetrics } from '../../types';
import { AdminNavbar } from '../../components/admin/AdminNavbar';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

const StatCard: React.FC<{
  label: string;
  value: string | number;
  sub: React.ReactNode;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
}> = ({ label, value, sub, iconBg, iconColor, icon }) => (
  <div className="p-3.5 xs:p-4 sm:p-5 rounded-2xl bg-white border border-art-800 shadow-xs space-y-2 sm:space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-[11px] sm:text-xs font-bold text-art-500 font-sans truncate pr-2">{label}</span>
      <div className={`p-1.5 sm:p-2 rounded-xl shrink-0 ${iconBg} ${iconColor}`}>{icon}</div>
    </div>
    <div className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-black text-art-300 font-mono truncate">{value}</div>
    <div className={`text-[10px] sm:text-[11px] font-medium flex items-center gap-1 truncate ${iconColor}`}>{sub}</div>
  </div>
);

export const AdminDashboardPage: React.FC = () => {
  const { addToast } = useToastStore();
  const [data, setData] = useState<AdminAnalyticsSummary | null>(null);
  const [logs, setLogs] = useState<AdminAccessLog[]>([]);
  const [metrics, setMetrics] = useState<AdminAccessLogMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics');
      setData(res.data.data);
    } catch (err) {
      console.error('Error loading admin analytics', err);
    }
  };

  const fetchAccessLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.get('/analytics/admin-access-logs?limit=25');
      setLogs(res.data.data.logs || []);
      setMetrics(res.data.data.metrics || null);
    } catch (err) {
      console.error('Error loading admin access logs', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchAnalytics(), fetchAccessLogs()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all security access logs?')) return;
    try {
      await api.delete('/analytics/admin-access-logs');
      addToast('Security logs cleared successfully', 'success');
      fetchAccessLogs();
    } catch (err) {
      addToast('Failed to clear security logs', 'error');
    }
  };

  if (loading) {
    return (
      <div>
        <AdminNavbar title="Analytics Overview" subtitle="Real-time business performance & security tracking" />
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-brand-600">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xs font-mono uppercase tracking-widest text-art-500">
            Compiling Analytics & Security Metrics...
          </span>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalReviews: 0,
    totalPosts: 0,
  };

  const getActionBadge = (action: string, status: string) => {
    if (action === 'Login Failed' || status === 'Danger') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 border border-rose-200 text-rose-700">
          <XCircle className="w-3 h-3" />
          {action}
        </span>
      );
    }
    if (action === 'Login Success' || status === 'Success') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
          <CheckCircle2 className="w-3 h-3" />
          {action}
        </span>
      );
    }
    if (action.includes('Navbar') || action.includes('Click')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 border border-brand-200 text-brand-700">
          <Radio className="w-3 h-3 text-brand-600" />
          {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-art-900 border border-art-800 text-art-400">
        <Clock className="w-3 h-3" />
        {action}
      </span>
    );
  };

  return (
    <div>
      <AdminNavbar
        title="Admin Control Center"
        subtitle="Store revenue, inventory tracking, and live security geolocation logs"
      />

      <div className="p-3 xs:p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-8 max-w-7xl mx-auto">
        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
          <StatCard
            label="Total Store Revenue"
            value={`₹${summary.totalRevenue.toLocaleString()}`}
            sub={<><TrendingUp className="w-3 h-3 shrink-0" /><span>+18.4%</span></>}
            iconBg="bg-emerald-500/10"
            iconColor="text-emerald-600"
            icon={<IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          />
          <StatCard
            label="Orders Processed"
            value={summary.totalOrders}
            sub="All customer orders"
            iconBg="bg-brand-500/10"
            iconColor="text-brand-600"
            icon={<ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          />
          <StatCard
            label="Active Art Catalog"
            value={summary.totalProducts}
            sub="Pieces listed"
            iconBg="bg-plum-500/10"
            iconColor="text-plum-600"
            icon={<Box className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          />
          <StatCard
            label="Registered Buyers"
            value={summary.totalUsers}
            sub="Verified accounts"
            iconBg="bg-rose-500/10"
            iconColor="text-rose-600"
            icon={<Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          />
        </div>

        {/* Orders & Low Inventory Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          <div className="lg:col-span-8 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-art-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold text-art-300 uppercase tracking-wider font-sans">
                Recent Orders
              </h2>
              <Link
                to="/admin/orders"
                className="text-xs font-bold text-brand-700 hover:text-brand-600 flex items-center gap-1"
              >
                <span>View All Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data?.recentOrders && data.recentOrders.length > 0 ? (
              <div className="divide-y divide-art-800/60">
                {data.recentOrders.map((order) => (
                  <div key={order._id} className="py-2.5 sm:py-3 flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 xs:gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-art-300 truncate">
                        #{order._id.slice(-8)} — {typeof order.user === 'object' ? order.user?.name : 'Guest Customer'}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-art-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()} • {order.paymentMethod}
                      </div>
                    </div>

                    <div className="flex items-center justify-between xs:justify-end gap-3 shrink-0">
                      <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-brand-500/10 text-brand-700 border border-brand-500/20">
                        {order.status}
                      </span>
                      <span className="text-xs font-black text-art-300 font-mono">
                        ₹{order.totalPrice.toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-art-500">No orders yet</div>
            )}
          </div>

          <div className="lg:col-span-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-art-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-art-300 font-sans">
                Low Inventory
              </h2>
            </div>

            {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {data.lowStockProducts.map((p) => (
                  <div key={p._id} className="p-3 rounded-2xl bg-art-950 border border-amber-500/30 flex items-center justify-between gap-3">
                    <img src={p.thumbnail} alt="" className="w-10 h-10 rounded-xl object-cover bg-art-900 border border-art-800" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-art-300 truncate">{p.title}</div>
                      <div className="text-[10px] text-rose-600 font-bold">
                        Only {p.stock} units remaining
                      </div>
                    </div>
                    <Link
                      to="/admin/products"
                      className="px-2 py-1 rounded-lg bg-art-800 text-[10px] text-art-400 hover:text-brand-600 font-semibold border border-art-800 transition-colors"
                    >
                      Restock
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-emerald-700 font-bold bg-emerald-50 rounded-2xl border border-emerald-200">
                ✓ All inventory levels optimal (5+ units)
              </div>
            )}
          </div>
        </div>

        {/* NEW SECTION: Admin Access & Security Geolocation Logs */}
        <div className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-white border border-art-800 shadow-xs space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-art-800 pb-4 sm:pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-xl bg-brand-50 text-brand-700 shrink-0">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-art-300">
                  Admin Access & Geolocation Security Logs
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-art-500">
                Live audit trail of visitors attempting to access the Admin Panel, including IP, ISP, and GPS coordinates
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={fetchAccessLogs}
                disabled={loadingLogs}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-art-800 bg-art-950 hover:bg-white text-xs font-semibold text-art-400 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              {logs.length > 0 && (
                <button
                  onClick={handleClearLogs}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Logs</span>
                </button>
              )}
            </div>
          </div>

          {/* Security Metrics Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-art-950 border border-art-800 space-y-0.5">
              <span className="text-[9px] sm:text-[10px] font-bold text-art-500 uppercase truncate block">Total Access</span>
              <div className="text-lg sm:text-xl font-black font-mono text-art-300">
                {metrics?.totalLogs ?? logs.length}
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-art-950 border border-art-800 space-y-0.5">
              <span className="text-[9px] sm:text-[10px] font-bold text-art-500 uppercase truncate block">Unique IPs</span>
              <div className="text-lg sm:text-xl font-black font-mono text-brand-700">
                {metrics?.uniqueIpsCount ?? 0}
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-art-950 border border-art-800 space-y-0.5">
              <span className="text-[9px] sm:text-[10px] font-bold text-art-500 uppercase truncate block">Countries</span>
              <div className="text-lg sm:text-xl font-black font-mono text-plum-700">
                {metrics?.uniqueCountriesCount ?? 0}
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-50 border border-rose-200 space-y-0.5">
              <span className="text-[9px] sm:text-[10px] font-bold text-rose-700 uppercase truncate block">Failed Logins</span>
              <div className="text-lg sm:text-xl font-black font-mono text-rose-700">
                {metrics?.failedLogins ?? 0}
              </div>
            </div>
          </div>

          {/* Logs Table */}
          {logs.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-xs text-art-500 space-y-2 bg-art-950/50 rounded-xl sm:rounded-2xl border border-art-800">
              <Globe className="w-8 h-8 text-art-600 mx-auto" />
              <p className="font-bold text-art-400">No Admin Access Logs Recorded Yet</p>
              <p className="text-[11px] text-art-600">
                Logs will appear automatically whenever someone clicks the Admin button in the Navbar or attempts to log in.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-art-800 touch-pan-x">
              <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-art-800 bg-art-950/80 text-[10px] font-bold text-art-500 uppercase tracking-wider">
                    <th className="py-3 px-3.5">Origin & Geolocation</th>
                    <th className="py-3 px-3.5">Network / IP Address</th>
                    <th className="py-3 px-3.5">Action Event</th>
                    <th className="py-3 px-3.5">Attempted Email</th>
                    <th className="py-3 px-3.5">Device / Resolution</th>
                    <th className="py-3 px-3.5 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-art-800 text-[11px]">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-art-950/50 transition-colors">
                      {/* Location & Flag */}
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base" role="img" aria-label="Flag">
                            {log.flag?.emoji || '🌐'}
                          </span>
                          <div>
                            <div className="font-bold text-art-300">
                              {log.city}, {log.region}
                            </div>
                            <div className="text-[10px] text-art-500 flex items-center gap-1">
                              <span>{log.country}</span>
                              {log.latitude && log.longitude && (
                                <a
                                  href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-700 hover:underline flex items-center gap-0.5 ml-1 font-mono"
                                  title="View on Google Maps"
                                >
                                  <MapPin className="w-2.5 h-2.5" />
                                  <span>GPS</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* IP & ISP */}
                      <td className="py-2.5 px-3.5">
                        <div className="font-mono font-bold text-brand-700">{log.ip}</div>
                        <div className="text-[10px] text-art-500 truncate max-w-[180px]">
                          {log.isp}
                        </div>
                      </td>

                      {/* Action Event Badge */}
                      <td className="py-2.5 px-3.5">
                        {getActionBadge(log.action, log.status)}
                      </td>

                      {/* Attempted Email */}
                      <td className="py-2.5 px-3.5 font-mono text-art-400">
                        {log.attemptedEmail || '—'}
                      </td>

                      {/* Device & Screen */}
                      <td className="py-2.5 px-3.5">
                        <div className="text-art-400 truncate max-w-[180px]" title={log.userAgent}>
                          {log.screenResolution ? `Display ${log.screenResolution}` : 'Browser'}
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-2.5 px-3.5 text-right font-mono text-art-500 whitespace-nowrap">
                        <div>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                        <div className="text-[10px] text-art-600">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Navigation Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          {[
            { label: 'Warehouse Inventory', to: '/admin/inventory', color: 'bg-brand-500/10 text-brand-700 border-brand-500/20 hover:border-brand-500/40', icon: <Package className="w-4 h-4 sm:w-5 sm:h-5" /> },
            { label: 'Manage Orders', to: '/admin/orders', color: 'bg-rose-500/10 text-rose-700 border-rose-500/20 hover:border-rose-500/40', icon: <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" /> },
            { label: 'Resin Calculator', to: '/admin/resin-calculator', color: 'bg-plum-500/10 text-plum-700 border-plum-500/20 hover:border-plum-500/40', icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" /> },
            { label: 'Product Pricing', to: '/admin/pricing-calculator', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:border-emerald-500/40', icon: <Box className="w-4 h-4 sm:w-5 sm:h-5" /> },
          ].map(({ label, to, color, icon }) => (
            <Link
              key={to}
              to={to}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border flex flex-col items-center gap-1.5 sm:gap-2 transition-all font-bold text-xs text-center active:scale-95 ${color}`}
            >
              {icon}
              <span className="truncate w-full">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
