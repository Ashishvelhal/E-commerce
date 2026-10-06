import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, ShoppingBag, Lock, Sparkles, BookOpen } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { getItemCount, toggleCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { customizerEnabled, enabledCustomizerProducts } = useSettingsStore();
  const count = getItemCount();
  const isAdmin = isAuthenticated && user?.role === 'admin';

  const isActive = (path: string) => location.pathname === path;
  const isCustomizerActive = customizerEnabled && (enabledCustomizerProducts?.length ?? 5) > 0;

  const navItems = [
    { to: '/', label: 'Home', Icon: Home },
    { to: '/shop', label: 'Gallery', Icon: Compass },
    ...(isCustomizerActive
      ? [{ to: '/customizer', label: '3D Studio', Icon: Sparkles }]
      : [{ to: '/blog', label: 'Stories', Icon: BookOpen }]),
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-art-950/95 backdrop-blur-2xl border-t border-art-800/80 px-2 py-2 flex items-center justify-around shadow-2xl">
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50" />

      {navItems.map(({ to, label, Icon }) => (
        <Link
          key={to}
          to={to}
          className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all ${
            isActive(to) ? 'text-brand-600' : 'text-art-500 hover:text-art-300'
          }`}
        >
          <Icon className="w-5 h-5" />
          <span className="text-[10px] font-semibold">{label}</span>
        </Link>
      ))}
      <button
        onClick={toggleCart}
        className="relative flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl text-art-500 hover:text-art-300 transition-all"
      >
        <ShoppingBag className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-gradient-to-br from-brand-500 to-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
            {count}
          </span>
        )}
        <span className="text-[10px] font-semibold">Cart</span>
      </button>
      <Link
        to={isAdmin ? '/admin' : '/admin/login'}
        className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all ${
          location.pathname.startsWith('/admin') ? 'text-brand-600' : 'text-art-500 hover:text-art-300'
        }`}
      >
        <Lock className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Admin</span>
      </Link>
    </div>
  );
};
