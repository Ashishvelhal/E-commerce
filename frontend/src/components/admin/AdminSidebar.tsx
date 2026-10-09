import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Layers, Image as ImageIcon,
  ShoppingCart, FileText, MessageSquare, Settings,
  Palette, ArrowLeft, LogOut, Warehouse, FlaskConical, Calculator,
  BarChart3, X, Building2
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useAdminUIStore } from '../../store/useAdminUIStore';

interface NavGroup {
  title: string;
  items: {
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { isMobileSidebarOpen, closeMobileSidebar } = useAdminUIStore();

  // Automatically close mobile sidebar on route changes
  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname, closeMobileSidebar]);

  const navGroups: NavGroup[] = [
    {
      title: 'STORE & CATALOG',
      items: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Products & 3D Art', path: '/admin/products', icon: Package },
        { name: 'Categories', path: '/admin/categories', icon: Layers },
        { name: 'Customer Orders', path: '/admin/orders', icon: ShoppingCart },
        { name: 'Bulk & B2B Leads', path: '/admin/bulk-inquiries', icon: Building2, badge: 'B2B' },
        { name: 'Banners & Promos', path: '/admin/banners', icon: ImageIcon },
      ],
    },
    {
      title: 'STUDIO & WAREHOUSE',
      items: [
        { name: 'Warehouse Inventory', path: '/admin/inventory', icon: Warehouse },
        { name: 'Wastage & Margins', path: '/admin/analytics', icon: BarChart3, badge: 'PRO' },
        { name: 'Resin Calculator', path: '/admin/resin-calculator', icon: FlaskConical },
        { name: 'Product Pricing', path: '/admin/pricing-calculator', icon: Calculator },
      ],
    },
    {
      title: 'CONTENT & SYSTEM',
      items: [
        { name: 'Blog & Stories', path: '/admin/posts', icon: FileText },
        { name: 'Reviews', path: '/admin/reviews', icon: MessageSquare },
        { name: 'Store Settings', path: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full select-none bg-white">
      <div className="h-[2px] bg-gradient-to-r from-brand-500 via-rose-500 to-plum-600" />

      <div className="overflow-y-auto flex-1">
        <div className="p-5 sm:p-6 border-b border-art-800 flex items-center justify-between">
          <Link to="/" onClick={closeMobileSidebar} className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 resin-blob bg-gradient-to-br from-brand-500 via-rose-500 to-plum-600 group-hover:opacity-90 transition-opacity" />
              <Palette className="relative w-5 h-5 text-white z-10" />
            </div>
            <div>
              <span className="font-bold text-art-300 block text-base font-poppins">
                Rasin Arts
              </span>
              <span className="text-[9px] font-bold tracking-[0.2em] text-brand-700 uppercase">
                Admin Studio
              </span>
            </div>
          </Link>

          {/* Close button for mobile drawer */}
          <button
            onClick={closeMobileSidebar}
            aria-label="Close menu"
            className="lg:hidden p-2 rounded-xl text-art-400 hover:text-art-300 hover:bg-art-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {user && (
          <div className="px-5 pt-4">
            <div className="p-3 rounded-xl bg-art-900 border border-art-800 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-art-300 truncate">{user.name}</p>
                <p className="text-[10px] text-brand-700 font-semibold">System Administrator</p>
              </div>
            </div>
          </div>
        )}

        <nav className="p-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <div className="px-3 text-[10px] font-black tracking-wider text-art-500 uppercase font-mono">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map(({ name, path, icon: Icon, badge }) => {
                  const active = isActive(path);
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={closeMobileSidebar}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-md glow-brand'
                          : 'text-art-400 hover:text-art-300 hover:bg-art-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{name}</span>
                      </div>
                      {badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-art-800 text-art-400'
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-art-800 space-y-1 bg-white">
        <Link
          to="/"
          onClick={closeMobileSidebar}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-art-500 hover:text-art-300 hover:bg-art-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>View Storefront</span>
        </Link>
        <button
          onClick={() => {
            closeMobileSidebar();
            logout();
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar (lg and above) */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-art-800 flex-col justify-between h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (screens below lg) */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            onClick={closeMobileSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Slide-out Sidebar Panel */}
          <div className="relative w-72 max-w-[85vw] h-full bg-white shadow-2xl border-r border-art-800 z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

