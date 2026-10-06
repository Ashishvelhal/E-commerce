import React, { Suspense, lazy } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { MobileNav } from './components/common/MobileNav';
import { CartDrawer } from './components/common/CartDrawer';
import { ToastContainer } from './components/common/Toast';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { ProductLoadingScreen } from './components/common/ProductLoadingScreen';
import { WelcomeSplashScreen } from './components/common/WelcomeSplashScreen';

import { useAuthStore } from './store/useAuthStore';
import { useIdleTimer } from './hooks/useIdleTimer';
import { useVoiceStore } from './store/useVoiceStore';
import { useWakeWord } from './hooks/useWakeWord';
import { AdminVoiceAssistant } from './components/admin/AdminVoiceAssistant';
import { AdminVoiceHUD } from './components/admin/AdminVoiceHUD';
import { AdminVoiceNotepadDrawer } from './components/admin/AdminVoiceNotepadDrawer';
import { Studio12StepGuideModal } from './components/admin/Studio12StepGuideModal';
import { BatchCureTrackerModal } from './components/admin/BatchCureTrackerModal';

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const ShopPage = lazy(() => import('./pages/ShopPage').then((m) => ({ default: m.ShopPage })));
const ProductDetailsPage = lazy(() =>
  import('./pages/ProductDetailsPage').then((m) => ({ default: m.ProductDetailsPage }))
);
const WishlistPage = lazy(() => import('./pages/WishlistPage').then((m) => ({ default: m.WishlistPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const OrderSuccessPage = lazy(() =>
  import('./pages/OrderSuccessPage').then((m) => ({ default: m.OrderSuccessPage }))
);
const OrdersHistoryPage = lazy(() =>
  import('./pages/OrdersHistoryPage').then((m) => ({ default: m.OrdersHistoryPage }))
);
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then((m) => ({ default: m.BlogPage })));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then((m) => ({ default: m.BlogPostPage })));
const CustomizerPage = lazy(() =>
  import('./pages/CustomizerPage').then((m) => ({ default: m.CustomizerPage }))
);
const BulkGiftingPage = lazy(() =>
  import('./pages/BulkGiftingPage').then((m) => ({ default: m.BulkGiftingPage }))
);

const AdminLoginPage = lazy(() =>
  import('./pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
);
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminAnalyticsPage = lazy(() =>
  import('./pages/admin/AdminAnalyticsPage').then((m) => ({ default: m.AdminAnalyticsPage }))
);
const AdminProductsPage = lazy(() =>
  import('./pages/admin/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage }))
);
const AdminOrdersPage = lazy(() =>
  import('./pages/admin/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage }))
);
const AdminBulkInquiriesPage = lazy(() =>
  import('./pages/admin/AdminBulkInquiriesPage').then((m) => ({ default: m.AdminBulkInquiriesPage }))
);
const AdminPostsPage = lazy(() =>
  import('./pages/admin/AdminPostsPage').then((m) => ({ default: m.AdminPostsPage }))
);
const AdminUsersPage = lazy(() =>
  import('./pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage }))
);
const AdminCategoriesPage = lazy(() =>
  import('./pages/admin/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage }))
);
const AdminBannersPage = lazy(() =>
  import('./pages/admin/AdminBannersPage').then((m) => ({ default: m.AdminBannersPage }))
);
const AdminReviewsPage = lazy(() =>
  import('./pages/admin/AdminReviewsPage').then((m) => ({ default: m.AdminReviewsPage }))
);
const AdminSettingsPage = lazy(() =>
  import('./pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage }))
);
const AdminInventoryPage = lazy(() =>
  import('./pages/admin/AdminInventoryPage').then((m) => ({ default: m.AdminInventoryPage }))
);
const AdminResinCalculatorPage = lazy(() =>
  import('./pages/admin/AdminResinCalculatorPage').then((m) => ({ default: m.AdminResinCalculatorPage }))
);
const AdminPricingCalculatorPage = lazy(() =>
  import('./pages/admin/AdminPricingCalculatorPage').then((m) => ({ default: m.AdminPricingCalculatorPage }))
);

const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000;
const IDLE_WARNING_MS = 2 * 60 * 1000;

const StorefrontLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-art-950 text-art-300 selection:bg-brand-500 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<ProductLoadingScreen />}>{children}</Suspense>
      </main>
      <Footer />
      <MobileNav />
      <CartDrawer />
      <ToastContainer />
    </div>
  );
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isAssistantOpen, closeAssistant } = useVoiceStore();
  const [showWarning, setShowWarning] = React.useState(false);
  const [countdown, setCountdown] = React.useState(IDLE_WARNING_MS / 1000);

  useWakeWord();

  React.useEffect(() => {
    if (!showWarning) {
      setCountdown(IDLE_WARNING_MS / 1000);
      return;
    }
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [showWarning]);

  const handleWarning = React.useCallback(() => setShowWarning(true), []);
  const handleLogout = React.useCallback(() => {
    logout();
    setShowWarning(false);
  }, [logout]);
  const handleStayIn = React.useCallback(() => setShowWarning(false), []);

  useIdleTimer({
    timeoutMs: IDLE_TIMEOUT_MS,
    warningMs: IDLE_WARNING_MS,
    onWarning: handleWarning,
    onLogout: handleLogout,
  });

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-art-950 text-art-300 selection:bg-brand-500 selection:text-white font-poppins admin-scope relative">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto max-h-screen font-poppins">
        {showWarning && (
          <div className="sticky top-0 z-50 w-full flex items-center justify-between gap-4 px-5 py-3 bg-amber-50 border-b border-amber-300 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
              <span className="text-base">⏱</span>
              <span>
                Your admin session will expire in{' '}
                <span className="font-black text-amber-900">
                  {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                </span>{' '}
                due to inactivity.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleStayIn}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all"
              >
                Stay Logged In
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg border border-amber-400 text-amber-800 hover:bg-amber-100 text-xs font-semibold transition-all"
              >
                Logout Now
              </button>
            </div>
          </div>
        )}
        <Suspense fallback={<ProductLoadingScreen />}>{children}</Suspense>
      </main>
      <AdminVoiceHUD />
      <AdminVoiceAssistant isOpen={isAssistantOpen} onClose={closeAssistant} />
      <AdminVoiceNotepadDrawer />
      <Studio12StepGuideModal />
      <BatchCureTrackerModal />
      <ToastContainer />
    </div>
  );
};

const AdminLoginGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const isElectron = typeof window !== 'undefined' && (window.location.protocol === 'file:' || !!(window as any).electronAPI);
const RouterComponent = isElectron ? HashRouter : BrowserRouter;

const HomePageWithWelcome: React.FC = () => {
  const [showSplash, setShowSplash] = React.useState(true);

  const handleDismiss = React.useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <>
      {showSplash && (
        <WelcomeSplashScreen onDismiss={handleDismiss} autoHideDuration={2800} />
      )}
      <HomePage />
    </>
  );
};

export function App() {
  return (
    <RouterComponent future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<StorefrontLayout><HomePageWithWelcome /></StorefrontLayout>} />
        <Route path="/shop" element={<StorefrontLayout><ShopPage /></StorefrontLayout>} />
        <Route path="/customizer" element={<StorefrontLayout><CustomizerPage /></StorefrontLayout>} />
        <Route path="/bulk-gifting" element={<StorefrontLayout><BulkGiftingPage /></StorefrontLayout>} />
        <Route path="/product/:slug" element={<StorefrontLayout><ProductDetailsPage /></StorefrontLayout>} />
        <Route path="/wishlist" element={<StorefrontLayout><WishlistPage /></StorefrontLayout>} />
        <Route path="/checkout" element={<StorefrontLayout><CheckoutPage /></StorefrontLayout>} />
        <Route path="/order-success/:id" element={<StorefrontLayout><OrderSuccessPage /></StorefrontLayout>} />
        <Route path="/orders" element={<StorefrontLayout><OrdersHistoryPage /></StorefrontLayout>} />
        <Route path="/profile" element={<StorefrontLayout><ProfilePage /></StorefrontLayout>} />
        <Route path="/blog" element={<StorefrontLayout><BlogPage /></StorefrontLayout>} />
        <Route path="/blog/:slug" element={<StorefrontLayout><BlogPostPage /></StorefrontLayout>} />
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />

        <Route
          path="/admin/login"
          element={
            <div className="min-h-screen bg-art-950 text-art-300 font-poppins admin-scope">
              <ToastContainer />
              <AdminLoginGuard>
                <Suspense fallback={<ProductLoadingScreen />}>
                  <AdminLoginPage />
                </Suspense>
              </AdminLoginGuard>
            </div>
          }
        />
        <Route path="/admin" element={<AdminLayout><AdminDashboardPage /></AdminLayout>} />
        <Route path="/admin/analytics" element={<AdminLayout><AdminAnalyticsPage /></AdminLayout>} />
        <Route path="/admin/products" element={<AdminLayout><AdminProductsPage /></AdminLayout>} />
        <Route path="/admin/categories" element={<AdminLayout><AdminCategoriesPage /></AdminLayout>} />
        <Route path="/admin/banners" element={<AdminLayout><AdminBannersPage /></AdminLayout>} />
        <Route path="/admin/orders" element={<AdminLayout><AdminOrdersPage /></AdminLayout>} />
        <Route path="/admin/bulk-inquiries" element={<AdminLayout><AdminBulkInquiriesPage /></AdminLayout>} />
        <Route path="/admin/inventory" element={<AdminLayout><AdminInventoryPage /></AdminLayout>} />
        <Route path="/admin/resin-calculator" element={<AdminLayout><AdminResinCalculatorPage /></AdminLayout>} />
        <Route path="/admin/pricing-calculator" element={<AdminLayout><AdminPricingCalculatorPage /></AdminLayout>} />
        <Route path="/admin/posts" element={<AdminLayout><AdminPostsPage /></AdminLayout>} />
        <Route path="/admin/reviews" element={<AdminLayout><AdminReviewsPage /></AdminLayout>} />
        <Route path="/admin/users" element={<AdminLayout><AdminUsersPage /></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><AdminSettingsPage /></AdminLayout>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RouterComponent>
  );
}

export default App;
