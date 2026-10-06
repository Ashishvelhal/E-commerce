import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Compass,
  BookOpen,
  Lock,
  ShieldCheck,
  Palette,
  Package,
  Sparkles,
  Building2,
  Home,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { recordAdminAccess } from '../../services/securityLog';
import { getIconComponent, getLogoGradientClass, getLogoShapeClass } from '../../utils/iconHelper';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getItemCount, toggleCart } = useCartStore();
  const { settings, customizerEnabled, enabledCustomizerProducts, fetchSettings } = useSettingsStore();
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const cartCount = getItemCount();
  const wishlistCount = Array.isArray(user?.wishlist) ? user.wishlist.length : 0;
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const isActive = (path: string) => location.pathname === path;
  const isCustomizerActive = customizerEnabled && (enabledCustomizerProducts?.length ?? 5) > 0;

  // Brand & Logo configuration from Store Settings
  const brandTitle = settings?.brandTitle || 'Rasin Arts';
  const brandSubtitle = settings?.brandSubtitle || 'Luxury 3D Studio';
  const logoIconName = settings?.logoIcon || 'Palette';
  const logoImageUrl = settings?.logoImageUrl || '';
  const logoBlobShape = settings?.logoBlobShape || 'resin-blob';
  const logoGradient = settings?.logoGradient || 'amber-rose';
  const LogoIconComp = getIconComponent(logoIconName, Palette);

  // Icon configuration from Store Settings
  const iconStyle = settings?.navbarIconStyle || 'animated';
  const animationMode = settings?.navbarIconAnimation || 'float';
  const customIcons = settings?.navbarCustomIcons || {};

  const HomeIcon = getIconComponent(customIcons.home, Home);
  const ShopIcon = getIconComponent(customIcons.shop, Compass);
  const CustomizerIcon = getIconComponent(customIcons.customizer, Sparkles);
  const BulkGiftingIcon = getIconComponent(customIcons.bulkGifting, Building2);
  const BlogIcon = getIconComponent(customIcons.blog, BookOpen);
  const WishlistIcon = getIconComponent(customIcons.wishlist, Heart);
  const CartIcon = getIconComponent(customIcons.cart, ShoppingBag);

  const navLinks = [
    { to: '/', label: 'Home', Icon: HomeIcon },
    { to: '/shop', label: 'Gallery', Icon: ShopIcon },
    ...(isCustomizerActive
      ? [{ to: '/customizer', label: '3D Co-Creator', Icon: CustomizerIcon }]
      : []),
    { to: '/bulk-gifting', label: 'Corporate Gifting', Icon: BulkGiftingIcon },
    { to: '/blog', label: 'Stories', Icon: BlogIcon },
  ];

  // Motion animation variants for dynamic navbar icons
  const getIconAnimationProps = (active: boolean) => {
    if (animationMode === 'none') return {};
    if (animationMode === 'pulse') {
      return {
        animate: active ? { scale: [1, 1.15, 1] } : { scale: 1 },
        transition: { repeat: Infinity, duration: 2.5 },
      };
    }
    if (animationMode === 'bounce') {
      return {
        whileHover: { y: -3, scale: 1.1 },
        whileTap: { scale: 0.9 },
      };
    }
    if (animationMode === 'spin-slow') {
      return {
        animate: active ? { rotate: 360 } : { rotate: 0 },
        transition: active ? { repeat: Infinity, duration: 12, ease: 'linear' } : {},
      };
    }
    // Default: float
    return {
      animate: active ? { y: [0, -3, 0] } : { y: 0 },
      transition: active ? { repeat: Infinity, duration: 3, ease: 'easeInOut' } : {},
      whileHover: { y: -2, scale: 1.1 },
    };
  };

  const getStyleColorClass = (active: boolean) => {
    if (iconStyle === 'rose') {
      return active
        ? 'bg-gradient-to-r from-rose-600 to-brand-600 text-white shadow-sm'
        : 'text-art-500 hover:text-rose-600 hover:bg-rose-50';
    }
    if (iconStyle === 'cyber') {
      return active
        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
        : 'text-art-500 hover:text-cyan-600 hover:bg-cyan-50';
    }
    if (iconStyle === 'emerald') {
      return active
        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
        : 'text-art-500 hover:text-emerald-700 hover:bg-emerald-50';
    }
    if (iconStyle === 'minimal') {
      return active
        ? 'bg-art-300 text-white shadow-sm'
        : 'text-art-500 hover:text-art-300 hover:bg-art-850';
    }
    // Default: animated Golden Amber Resin
    return active
      ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-sm glow-brand'
      : 'text-art-500 hover:text-art-300 hover:bg-art-850';
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm">
      <div className="h-[2px] bg-gradient-to-r from-brand-500 via-rose-500 to-plum-600" />

      <div className="backdrop-blur-xl bg-art-950/90 border-b border-art-800/80">
        <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 flex items-center justify-center">
              {logoImageUrl ? (
                <img
                  src={logoImageUrl}
                  alt={brandTitle}
                  className="w-11 h-11 object-contain rounded-xl shadow-md group-hover:scale-105 transition-transform"
                />
              ) : (
                <>
                  <div
                    className={`absolute inset-0 ${getLogoShapeClass(logoBlobShape)} ${getLogoGradientClass(
                      logoGradient
                    )} group-hover:scale-105 transition-transform shadow-md glow-gold`}
                  />
                  <LogoIconComp className="relative w-5 h-5 text-white z-10 drop-shadow" />
                </>
              )}
            </div>
            <div>
              <span
                className="font-bold text-art-300 tracking-tight text-xl block leading-none"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {brandTitle}
              </span>
              <span className="text-[9px] font-bold tracking-[0.25em] text-brand-700 uppercase font-sans">
                {brandSubtitle}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-art-900/60 p-1.5 rounded-full border border-art-800/50 shadow-sm">
            {navLinks.map(({ to, label, Icon }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${getStyleColorClass(
                    active
                  )}`}
                >
                  <motion.div {...getIconAnimationProps(active)}>
                    <Icon className="w-3.5 h-3.5" />
                  </motion.div>
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Direct Admin Control */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-xl text-art-500 hover:text-rose-600 hover:bg-art-900 border border-art-800 hover:border-rose-300 transition-all group"
              title="Saved Wishlist"
            >
              <motion.div {...getIconAnimationProps(wishlistCount > 0)}>
                <WishlistIcon className="w-5 h-5 group-hover:text-rose-600 transition-colors" />
              </motion.div>
              {wishlistCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              onClick={toggleCart}
              className="relative p-2.5 rounded-xl text-art-500 hover:text-brand-600 hover:bg-art-900 border border-art-800 hover:border-brand-600/30 transition-all group"
              title="Shopping Cart"
            >
              <motion.div {...getIconAnimationProps(cartCount > 0)}>
                <CartIcon className="w-5 h-5 group-hover:text-brand-600 transition-colors" />
              </motion.div>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-brand-500 to-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* Admin Controls */}
            {isAdmin ? (
              /* Logged-in Admin Dropdown */
              <div className="relative">
                <button
                  onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/30 hover:bg-brand-500/20 text-brand-700 transition-all font-semibold text-xs shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  <span className="hidden sm:inline">Admin Mode</span>
                </button>

                <AnimatePresence>
                  {adminDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      onClick={() => setAdminDropdownOpen(false)}
                      className="absolute right-0 mt-3 w-56 rounded-2xl bg-white border border-art-800 shadow-xl py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-art-800">
                        <p className="text-xs font-bold text-art-300">{user?.name}</p>
                        <p className="text-[10px] text-brand-600 font-mono">Store Administrator</p>
                      </div>
                      <Link
                        to="/admin"
                        onClick={() => {
                          setAdminDropdownOpen(false);
                          recordAdminAccess('Navbar Admin Dashboard Click');
                        }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-art-400 hover:bg-art-900 font-semibold"
                      >
                        <LayoutDashboard className="w-4 h-4 text-brand-600" />
                        <span>Admin Studio Dashboard</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-art-400 hover:bg-art-900 font-semibold"
                      >
                        <Package className="w-4 h-4 text-art-500" />
                        <span>Orders & Tracking</span>
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-left border-t border-art-800 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Direct Admin Login Button */
              <Link
                to="/admin/login"
                onClick={() => recordAdminAccess('Navbar Admin Click')}
                className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-sm glow-gold flex items-center gap-1.5 transition-all"
                title="Admin Studio Portal"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-semibold">Admin Login</span>
              </Link>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-art-500 hover:text-brand-600 bg-art-900 border border-art-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-art-800/80 bg-art-950 p-4 space-y-2 overflow-hidden"
            >
              {[
                { to: '/', label: 'Home' },
                { to: '/shop', label: 'Gallery' },
                ...(isCustomizerActive
                  ? [{ to: '/customizer', label: '✨ 3D Co-Creator Workshop' }]
                  : []),
                { to: '/bulk-gifting', label: '🏢 Corporate & Bulk Gifting' },
                { to: '/blog', label: 'Stories & News' },
                { to: '/wishlist', label: 'Saved Wishlist' },
                { to: '/orders', label: 'Order Tracking' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-medium ${
                    isActive(to)
                      ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white font-semibold'
                      : 'text-art-500 hover:bg-art-900'
                  }`}
                >
                  {label}
                </Link>
              ))}

              <div className="pt-2 border-t border-art-800 space-y-2">
                {isAdmin ? (
                  <>
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2.5 rounded-xl text-sm font-semibold bg-brand-500 text-white text-center"
                    >
                      👑 Admin Studio Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      🚪 Sign Out ({user?.name})
                    </button>
                  </>
                ) : (
                  <Link
                    to="/admin/login"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      recordAdminAccess('Navbar Mobile Admin Click');
                    }}
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold bg-brand-500 text-white text-center"
                  >
                    👑 Admin Studio Portal
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
