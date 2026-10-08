import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Image as ImageIcon,
  ShoppingCart,
  FileText,
  MessageSquare,
  Settings,
  Palette,
  ArrowUpRight,
  LogOut,
  Warehouse,
  FlaskConical,
  Calculator,
  BarChart3,
  X,
  Building2,
  Users,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useAdminUIStore } from '../../store/useAdminUIStore';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { isMobileSidebarOpen, closeMobileSidebar } = useAdminUIStore();

  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname, closeMobileSidebar]);

  const navGroups: NavGroup[] = [
    {
      title: 'Overview & Sales',
      items: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Customer Orders', path: '/admin/orders', icon: ShoppingCart },
        { name: 'Bulk & B2B Leads', path: '/admin/bulk-inquiries', icon: Building2, badge: 'B2B', badgeColor: 'bg-brand-50 text-brand-700 border-brand-200' },
      ],
    },
    {
      title: 'Catalog & Content',
      items: [
        { name: 'Products & 3D Art', path: '/admin/products', icon: Package },
        { name: 'Categories', path: '/admin/categories', icon: Layers },
        { name: 'Banners & Promos', path: '/admin/banners', icon: ImageIcon },
        { name: 'Stories & Journal', path: '/admin/posts', icon: FileText },
        { name: 'Customer Reviews', path: '/admin/reviews', icon: MessageSquare },
      ],
    },
    {
      title: 'Studio & Workshop',
      items: [
        { name: 'Warehouse Inventory', path: '/admin/inventory', icon: Warehouse },
        { name: 'Resin Calculator', path: '/admin/resin-calculator', icon: FlaskConical },
        { name: 'Pricing & Margin Tool', path: '/admin/pricing-calculator', icon: Calculator },
        { name: 'Studio Analytics', path: '/admin/analytics', icon: BarChart3, badge: 'PRO', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      ],
    },
    {
      title: 'Administration',
      items: [
        { name: 'Users & Staff', path: '/admin/users', icon: Users },
        { name: 'Store Settings', path: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full select-none bg-white text-slate-800 font-poppins">
      {/* Top Brand Accent Line */}
      <div className="h-1 bg-gradient-to-r from-brand-600 via-rose-500 to-plum-600 shrink-0" />

      {/* Main Scrollable Navigation Area */}
      <div className="overflow-y-auto flex-1 px-4 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-200">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <Link to="/" onClick={closeMobileSidebar} className="flex items-center gap-3 group min-w-0">
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-600 via-rose-500 to-plum-600 shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform" />
              <Palette className="relative w-5 h-5 text-white z-10" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-sm tracking-tight truncate">
                  Rasin Arts
                </span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200/60 leading-none">
                  Admin
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide truncate">
                3D Luxury Studio
              </p>
            </div>
          </Link>

          {/* Close button for mobile drawer */}
          <button
            onClick={closeMobileSidebar}
            aria-label="Close navigation menu"
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity Pill */}
        {user && (
          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center gap-3 shadow-xs">
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-rose-600 flex items-center justify-center text-white text-xs font-bold shadow-xs shrink-0">
              {user.name?.charAt(0).toUpperCase() || 'A'}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                {user.name || 'Studio Administrator'}
              </p>
              <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                {user.email || 'admin@rasinarts.com'}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="space-y-5">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map(({ name, path, icon: Icon, badge, badgeColor }) => {
                  const active = isActive(path);
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={closeMobileSidebar}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        active
                          ? 'bg-gradient-to-r from-brand-600 via-brand-600 to-rose-600 text-white shadow-md shadow-brand-600/25 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:bg-slate-200/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-brand-600 group-hover:shadow-xs'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="truncate">{name}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {badge && (
                          <span
                            className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-md border ${
                              active
                                ? 'bg-white/20 text-white border-white/30'
                                : badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {badge}
                          </span>
                        )}
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform ${
                            active
                              ? 'text-white/80 translate-x-0.5'
                              : 'text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                          }`}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-4 border-t border-slate-100 space-y-1.5 bg-slate-50/50 shrink-0">
        <Link
          to="/"
          onClick={closeMobileSidebar}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all shadow-2xs group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-brand-50 flex items-center justify-center text-slate-500 group-hover:text-brand-600 transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
            <span>View Live Storefront</span>
          </div>
        </Link>

        <button
          onClick={() => {
            closeMobileSidebar();
            logout();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 border border-transparent hover:border-rose-200/60 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
              <LogOut className="w-3.5 h-3.5" />
            </div>
            <span>Sign Out</span>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar (lg and above) */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200/80 flex-col justify-between h-screen sticky top-0 shrink-0 z-40 shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (screens below lg) */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            onClick={closeMobileSidebar}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Slide-out Sidebar Panel */}
          <div className="relative w-72 max-w-[85vw] h-full bg-white shadow-2xl border-r border-slate-200 z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

