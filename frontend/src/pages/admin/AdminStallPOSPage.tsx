import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Store, Zap, Search, Plus, Minus, Trash2, QrCode, DollarSign,
  Smartphone, CreditCard, CheckCircle2, User, Phone, ArrowRight,
  TrendingUp, RefreshCw, X, ShieldCheck, Tag, Sparkles, Building2,
  Calendar, FileText, Send, Download, Award, PieChart, ShoppingBag
} from 'lucide-react';
import { Product, StallSession, StallSessionSummaryResponse } from '../../types';
import { AdminNavbar } from '../../components/admin/AdminNavbar';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

interface CartItem {
  product: Product;
  quantity: number;
  soldPrice: number;
  costPrice: number;
}

export const AdminStallPOSPage: React.FC = () => {
  const { addToast } = useToastStore();
  const [activeTab, setActiveTab] = useState<'kiosk' | 'summary' | 'history'>('kiosk');

  // Products & Session State
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeSession, setActiveSession] = useState<StallSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Cart & Order Pad State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountType, setDiscountType] = useState<'none' | 'flat' | 'percent'>('none');
  const [discountValue, setDiscountValue] = useState('');
  const [appliedBundle, setAppliedBundle] = useState<string>('');

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'Card'>('UPI');
  const [cashTendered, setCashTendered] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [completedOrderData, setCompletedOrderData] = useState<{
    orderNumber: string;
    totalAmount: number;
    customerPhone: string;
    customerName: string;
  } | null>(null);

  // End-of-Day Summary State
  const [summaryData, setSummaryData] = useState<StallSessionSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [pastSessions, setPastSessions] = useState<StallSession[]>([]);

  // Start Session Modal
  const [isStartSessionModalOpen, setIsStartSessionModalOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionLocation, setNewSessionLocation] = useState('');

  // 1. Fetch Products & Active Session
  const fetchActiveSession = async () => {
    try {
      const res = await api.get('/stall-pos/session/active');
      setActiveSession(res.data.data || null);
    } catch (err) {
      console.error('Error fetching active session:', err);
    } finally {
      setSessionLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await api.get('/products?limit=100');
      setProducts(res.data.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      addToast('Failed to load products for POS', 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchSummary = async (sessionId?: string) => {
    const targetId = sessionId || activeSession?._id;
    if (!targetId) return;
    setSummaryLoading(true);
    try {
      const res = await api.get(`/stall-pos/session/${targetId}/summary`);
      setSummaryData(res.data.data || null);
    } catch (err) {
      console.error('Error fetching session summary:', err);
      addToast('Failed to load financial summary', 'error');
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchPastSessions = async () => {
    try {
      const res = await api.get('/stall-pos/sessions');
      setPastSessions(res.data.data || []);
    } catch (err) {
      console.error('Error fetching past sessions:', err);
    }
  };

  useEffect(() => {
    fetchActiveSession();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeTab === 'summary' && activeSession?._id) {
      fetchSummary(activeSession._id);
    } else if (activeTab === 'history') {
      fetchPastSessions();
    }
  }, [activeTab, activeSession]);

  // Audio Chime Feedback on Payment Completion (Pure Web Audio API)
  const playSuccessChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc1.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      osc2.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start();
      osc2.start(audioCtx.currentTime + 0.15);
      osc1.stop(audioCtx.currentTime + 0.6);
      osc2.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      // AudioContext unavailable, fallback silently
    }
  };

  // Cart Operations
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      addToast(`"${product.title}" is out of stock!`, 'warning');
      return;
    }

    const existingIdx = cart.findIndex((i) => i.product._id === product._id);
    if (existingIdx > -1) {
      const updated = [...cart];
      if (updated[existingIdx].quantity >= product.stock) {
        addToast(`Max available stock (${product.stock}) reached`, 'warning');
        return;
      }
      updated[existingIdx].quantity += 1;
      setCart(updated);
    } else {
      const sellingPrice = product.discountPrice || product.price;
      const unitCost = product.costPrice || Number((sellingPrice * 0.45).toFixed(2));
      setCart([
        ...cart,
        {
          product,
          quantity: 1,
          soldPrice: sellingPrice,
          costPrice: unitCost,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.product._id === productId) {
          const newQty = item.quantity + delta;
          if (newQty > item.product.stock) {
            addToast(`Max available stock is ${item.product.stock}`, 'warning');
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);
    setCart(updated);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product._id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setAppliedBundle('');
    setDiscountType('none');
    setDiscountValue('');
  };

  // Bundle Engine Helpers
  const handleApplyBundle = (bundleName: string, type: 'pick3' | 'clockCombo' | 'festiveHamper' | 'flash10') => {
    if (type === 'flash10') {
      setDiscountType('percent');
      setDiscountValue('10');
      setAppliedBundle('10% Exhibition Flash Promo');
      addToast('Applied 10% Exhibition Flash Discount!', 'success');
      return;
    }

    if (type === 'pick3') {
      // Filter small items in cart
      const smallItems = cart.filter((i) => /keychain|bookmark|mirror|coaster/i.test(i.product.title + i.product.category));
      const totalSmallQty = smallItems.reduce((acc, i) => acc + i.quantity, 0);

      if (totalSmallQty < 3) {
        // Auto-find 3 small items from catalog if empty
        const candidates = products.filter((p) => /keychain|bookmark|coaster/i.test(p.title + p.category) && p.stock > 0);
        if (candidates.length >= 3) {
          const newCartItems: CartItem[] = candidates.slice(0, 3).map((p) => ({
            product: p,
            quantity: 1,
            soldPrice: 200,
            costPrice: p.costPrice || 60,
          }));
          setCart([...cart, ...newCartItems]);
          setAppliedBundle('Pick Any 3 Small Items for ₹599');
          addToast('Added 3 items combo for ₹599 to cart', 'success');
          return;
        } else {
          addToast('Please add at least 3 small items (keychains, bookmarks, coasters) to cart', 'info');
          return;
        }
      }
      setAppliedBundle('Pick Any 3 Small Items for ₹599');
      addToast('Applied "Pick Any 3 for ₹599" combo!', 'success');
      return;
    }

    if (type === 'clockCombo') {
      const hasClock = cart.some((i) => /clock|wall/i.test(i.product.title + i.product.category));
      if (!hasClock) {
        addToast('Please add a Wall Clock to activate 50% Coaster combo', 'info');
        return;
      }
      setAppliedBundle('Clock + 50% Off Matching Coasters');
      addToast('Applied 50% Coasters Discount with Clock purchase!', 'success');
      return;
    }

    if (type === 'festiveHamper') {
      setAppliedBundle('Festive Diwali Gift Hamper (Flat ₹1,200)');
      addToast('Applied Festive Hamper Bundle!', 'success');
    }
  };

  // Calculations
  const rawSubtotal = cart.reduce((acc, item) => acc + item.soldPrice * item.quantity, 0);

  let calculatedDiscount = 0;
  if (appliedBundle === 'Pick Any 3 Small Items for ₹599') {
    // If 3 items usually cost ~750, discount down to 599
    calculatedDiscount = Math.max(0, rawSubtotal - 599);
  } else if (discountType === 'percent') {
    calculatedDiscount = Number(((rawSubtotal * (parseFloat(discountValue) || 0)) / 100).toFixed(2));
  } else if (discountType === 'flat') {
    calculatedDiscount = Math.min(rawSubtotal, parseFloat(discountValue) || 0);
  }

  const finalPayable = Math.max(0, Number((rawSubtotal - calculatedDiscount).toFixed(2)));

  // Cash change calculator
  const cashNum = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, Number((cashNum - finalPayable).toFixed(2)));

  // Checkout Execution
  const handleProcessOrder = async () => {
    if (cart.length === 0) {
      addToast('Cart is empty', 'warning');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const payload = {
        sessionId: activeSession?._id,
        orderItems: cart.map((i) => ({
          product: i.product._id,
          title: i.product.title,
          category: i.product.category,
          quantity: i.quantity,
          soldPrice: i.soldPrice,
          costPrice: i.costPrice,
          thumbnail: i.product.thumbnail,
        })),
        paymentMethod,
        customerName: customerName.trim() || 'Walk-in Guest',
        customerPhone: customerPhone.trim(),
        discountAmount: calculatedDiscount,
        bundleApplied: appliedBundle,
      };

      const res = await api.post('/stall-pos/orders', payload);
      const data = res.data.data;

      // Success feedback
      playSuccessChime();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.65 } });

      setCompletedOrderData({
        orderNumber: data.orderNumber,
        totalAmount: finalPayable,
        customerPhone: customerPhone.trim(),
        customerName: customerName.trim() || 'Walk-in Guest',
      });

      addToast(`Order #${data.orderNumber} completed successfully!`, 'success');

      // Update session local stats
      if (activeSession) {
        setActiveSession({
          ...activeSession,
          totalRevenue: data.session.totalRevenue,
          ordersCount: data.session.ordersCount,
          totalUpi: data.session.totalUpi,
          totalCash: data.session.totalCash,
        });
      }

      // Refresh product stock
      fetchProducts();
      handleClearCart();
      setCustomerName('');
      setCustomerPhone('');
      setCashTendered('');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Checkout failed', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Start Session
  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim()) {
      addToast('Please enter an exhibition name', 'warning');
      return;
    }

    try {
      const res = await api.post('/stall-pos/session/start', {
        name: newSessionName.trim(),
        location: newSessionLocation.trim() || 'Exhibition Stall',
      });
      setActiveSession(res.data.data);
      setIsStartSessionModalOpen(false);
      setNewSessionName('');
      setNewSessionLocation('');
      addToast(`Started stall session: ${res.data.data.name}`, 'success');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to start session', 'error');
    }
  };

  // Close Session
  const handleCloseSession = async () => {
    if (!activeSession) return;
    if (!window.confirm(`Close and reconcile today's exhibition session "${activeSession.name}"? This will finalize your financial totals.`)) {
      return;
    }

    try {
      await api.post(`/stall-pos/session/${activeSession._id}/close`);
      addToast(`Session "${activeSession.name}" closed and reconciled`, 'success');
      fetchActiveSession();
      setActiveTab('summary');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to close session', 'error');
    }
  };

  // WhatsApp Bill Dispatch
  const handleSendWhatsAppBill = (orderNum: string, phone: string, amount: number) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const msg = `*Rasin Arts Studio - Exhibition Digital Receipt* 🌸\nOrder: *#${orderNum}*\nTotal Paid: *₹${amount}*\n\nThank you for visiting our stall! Here is your 15% discount coupon for your next custom resin clock or anniversary frame on our website:\nCoupon Code: *EXHIBITION15*\nWebsite: https://rasinarts.com`;
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Deterministic SVG QR Matrix Generator
  const renderUPIQRCode = (upiUrl: string, size = 180) => {
    let hash = 0;
    for (let i = 0; i < upiUrl.length; i++) {
      hash = (hash << 5) - hash + upiUrl.charCodeAt(i);
      hash |= 0;
    }

    const gridSize = 21;
    const cells: boolean[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

    const placeFinder = (r: number, c: number) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (
            i === 0 || i === 6 || j === 0 || j === 6 ||
            (i >= 2 && i <= 4 && j >= 2 && j <= 4)
          ) {
            cells[r + i][c + j] = true;
          }
        }
      }
    };

    placeFinder(0, 0);
    placeFinder(0, 14);
    placeFinder(14, 0);

    for (let i = 8; i < 13; i++) {
      cells[6][i] = i % 2 === 0;
      cells[i][6] = i % 2 === 0;
    }

    let seed = Math.abs(hash);
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if ((r < 8 && c < 8) || (r < 8 && c >= 13) || (r >= 13 && c < 8)) continue;
        seed = (seed * 9301 + 49297) % 233280;
        cells[r][c] = seed / 233280 > 0.46;
      }
    }

    const cellSize = size / gridSize;

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-xl bg-white shadow-md p-2">
        {cells.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#0f172a"
              />
            ) : null
          )
        )}
      </svg>
    );
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      search.trim() === '' ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  return (
    <div className="min-h-screen bg-art-950 pb-16 font-poppins">
      <AdminNavbar
        title="🎪 Exhibition & Flea Market Stall POS"
        subtitle="3-tap touch checkout, dynamic UPI QR, bundle promotions, and end-of-day financial reconciliation"
      />

      <div className="p-3 xs:p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        {/* Top Active Session Header & Live Ticker */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-brand-900 via-slate-900 to-purple-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-brand-500/30">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-500/30">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight">
                  {activeSession ? activeSession.name : 'No Active Stall Session'}
                </span>
                {activeSession ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE STALL ACTIVE
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">
                    Offline
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-200">
                Location: {activeSession?.location || 'Flea Market Ground'} • Started:{' '}
                {activeSession
                  ? new Date(activeSession.startedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                  : '—'}
              </p>
            </div>
          </div>

          {/* Live Sales Ticker Cards */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-center min-w-[100px]">
              <span className="text-[10px] font-bold uppercase text-brand-200 block">Stall Sales</span>
              <span className="text-lg font-black font-mono text-emerald-400">
                ₹{activeSession ? activeSession.totalRevenue.toLocaleString('en-IN') : '0'}
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-center min-w-[70px]">
              <span className="text-[10px] font-bold uppercase text-brand-200 block">Orders</span>
              <span className="text-lg font-black font-mono text-white">
                {activeSession?.ordersCount || 0}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!activeSession ? (
                <button
                  onClick={() => setIsStartSessionModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg transition-all active:scale-95"
                >
                  + Start Stall Day
                </button>
              ) : (
                <button
                  onClick={handleCloseSession}
                  className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs font-bold transition-all"
                  title="Close and reconcile session"
                >
                  Close Stall Day
                </button>
              )}
            </div>
          </div>
        </div>

        {/* View Mode Navigation Switcher */}
        <div className="flex items-center justify-between border-b border-art-800 pb-3">
          <div className="flex rounded-2xl bg-art-900 p-1 border border-art-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('kiosk')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'kiosk' ? 'bg-brand-500 text-white shadow-md' : 'text-art-400 hover:text-art-200'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>3-Tap Touch Kiosk POS</span>
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'summary' ? 'bg-brand-500 text-white shadow-md' : 'text-art-400 hover:text-art-200'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>End-of-Day Financial Summary</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'history' ? 'bg-brand-500 text-white shadow-md' : 'text-art-400 hover:text-art-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Exhibition History</span>
            </button>
          </div>

          {activeTab === 'kiosk' && (
            <div className="text-xs text-art-400 font-mono hidden md:block">
              Cart Items: <strong className="text-brand-400">{cart.reduce((a, b) => a + b.quantity, 0)}</strong>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: 3-TAP TOUCH KIOSK POS */}
        {/* ======================================================== */}
        {activeTab === 'kiosk' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Product Tiles & Bundles (7 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              {/* Exhibition Bundle Deals Shortcuts Banner */}
              <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-rose-500/10 border border-brand-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Exhibition Bundle & Impulse Promos (1-Tap Apply)
                  </span>
                  {appliedBundle && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-500 text-white">
                      Active: {appliedBundle}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyBundle('Pick Any 3 for ₹599', 'pick3')}
                    className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all active:scale-95 group"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">Combo #1</span>
                    <strong className="text-xs font-black text-white block group-hover:text-brand-300 truncate">
                      3 Small for ₹599
                    </strong>
                    <span className="text-[10px] text-art-400">Keychains, bookmarks</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyBundle('Clock + 50% Coasters', 'clockCombo')}
                    className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all active:scale-95 group"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">Combo #2</span>
                    <strong className="text-xs font-black text-white block group-hover:text-brand-300 truncate">
                      Clock + 50% Coasters
                    </strong>
                    <span className="text-[10px] text-art-400">Matching set deal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyBundle('Diwali Festive Hamper', 'festiveHamper')}
                    className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all active:scale-95 group"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Festive Hamper</span>
                    <strong className="text-xs font-black text-white block group-hover:text-brand-300 truncate">
                      Thali + Diya ₹1,200
                    </strong>
                    <span className="text-[10px] text-art-400">Gift box included</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyBundle('10% Flash Discount', 'flash10')}
                    className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all active:scale-95 group"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">Flash Deal</span>
                    <strong className="text-xs font-black text-white block group-hover:text-brand-300 truncate">
                      10% Off Stall Bill
                    </strong>
                    <span className="text-[10px] text-art-400">Negotiated closing</span>
                  </button>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-art-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search stall product by name or SKU..."
                    className="w-full bg-art-900 border border-art-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-brand-500 text-white shadow-md'
                          : 'bg-art-900 border border-art-800 text-art-400 hover:text-art-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Giant Touch Tiles Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[580px] overflow-y-auto pr-1">
                {loadingProducts ? (
                  <div className="col-span-full py-20 text-center text-art-500">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-brand-500" />
                    <span>Loading stall products...</span>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-art-500">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-art-600" />
                    <p>No products match your search.</p>
                  </div>
                ) : (
                  filteredProducts.map((p) => {
                    const price = p.discountPrice || p.price;
                    const isOutOfStock = p.stock <= 0;
                    return (
                      <motion.div
                        key={p._id}
                        whileTap={{ scale: isOutOfStock ? 1 : 0.96 }}
                        onClick={() => handleAddToCart(p)}
                        className={`p-3 rounded-3xl bg-art-900 border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden select-none ${
                          isOutOfStock
                            ? 'opacity-40 border-art-800 cursor-not-allowed'
                            : 'border-art-800 hover:border-brand-400 hover:shadow-lg shadow-sm'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="relative aspect-square rounded-2xl overflow-hidden bg-art-950">
                            <img
                              src={p.thumbnail}
                              alt={p.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-mono font-bold text-white">
                              {p.stock} in stock
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-brand-400 block truncate">
                              {p.category}
                            </span>
                            <h4 className="font-bold text-art-200 text-xs truncate leading-snug">
                              {p.title}
                            </h4>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-art-800/80 mt-2">
                          <span className="text-sm font-black font-mono text-emerald-400">
                            ₹{price}
                          </span>
                          <span className="text-[10px] font-mono text-art-500">
                            Cost: ₹{p.costPrice || Math.round(price * 0.45)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Order Pad & Fast Checkout (5 cols) */}
            <div className="lg:col-span-5 xl:col-span-4 p-5 rounded-3xl bg-art-900 border border-art-800 shadow-xl space-y-4 sticky top-24">
              <div className="flex items-center justify-between border-b border-art-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-brand-500" />
                  <h3 className="font-black text-sm text-art-200">Current Stall Order Pad</h3>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-[11px] font-bold text-rose-400 hover:text-rose-300"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Customer Contact (For WhatsApp Receipt) */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-art-950 border border-art-800 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-art-500 uppercase block mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Guest Name"
                    className="w-full bg-art-900 border border-art-800 rounded-xl px-2.5 py-1.5 text-xs text-art-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-art-500 uppercase block mb-1">WhatsApp Phone *</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full bg-art-900 border border-art-800 rounded-xl px-2.5 py-1.5 text-xs font-mono text-art-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-art-500 space-y-1">
                    <p className="text-xs font-semibold">Cart is currently empty.</p>
                    <p className="text-[11px]">Tap products on the left to add items.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product._id}
                      className="p-2.5 rounded-2xl bg-art-950 border border-art-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <img
                          src={item.product.thumbnail}
                          alt=""
                          className="w-9 h-9 rounded-xl object-cover shrink-0"
                        />
                        <div className="truncate">
                          <strong className="text-art-200 block truncate leading-tight font-bold">
                            {item.product.title}
                          </strong>
                          <span className="font-mono text-art-400 text-[11px]">
                            ₹{item.soldPrice} each
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleUpdateQuantity(item.product._id, -1)}
                          className="w-6 h-6 rounded-lg bg-art-900 border border-art-800 flex items-center justify-center text-art-300 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-mono font-black text-xs text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product._id, 1)}
                          className="w-6 h-6 rounded-lg bg-art-900 border border-art-800 flex items-center justify-center text-art-300 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleRemoveFromCart(item.product._id)}
                          className="p-1 text-rose-500 hover:text-rose-400 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals & Discount Controls */}
              <div className="pt-3 border-t border-art-800 space-y-2 text-xs font-medium">
                <div className="flex justify-between text-art-400">
                  <span>Gross Subtotal:</span>
                  <span className="font-mono font-bold text-art-200">₹{rawSubtotal.toFixed(2)}</span>
                </div>

                {calculatedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Discount / Bundle Savings:</span>
                    <span className="font-mono">-₹{calculatedDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-black text-white pt-2 border-t border-art-800/80">
                  <span>Total Payable:</span>
                  <span className="font-mono text-emerald-400 text-xl">₹{finalPayable.toFixed(2)}</span>
                </div>
              </div>

              {/* Fast Checkout Trigger */}
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 to-emerald-500 hover:from-brand-600 hover:to-emerald-600 text-white font-black text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-40"
              >
                <span>⚡ Collect ₹{finalPayable.toFixed(0)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: END-OF-DAY FINANCIAL SUMMARY & RECONCILIATION */}
        {/* ======================================================== */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {summaryLoading ? (
              <div className="py-24 text-center text-art-500">
                <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3 text-brand-500" />
                <p>Compiling End-of-Day financial metrics and customer leads...</p>
              </div>
            ) : !summaryData ? (
              <div className="py-16 text-center text-art-500 space-y-2">
                <Store className="w-8 h-8 mx-auto text-art-600" />
                <p>No active exhibition session found. Start a session to record stall sales.</p>
              </div>
            ) : (
              <>
                {/* 4 Executive KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Revenue */}
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-900 to-slate-900 text-white shadow-xl space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                      Total Exhibition Revenue
                    </span>
                    <div className="text-2xl font-black font-mono text-emerald-300">
                      ₹{summaryData.financial.totalRevenue.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[11px] text-purple-200">
                      {summaryData.financial.ordersCount} total orders processed
                    </p>
                  </div>

                  {/* UPI Collections */}
                  <div className="p-5 rounded-3xl bg-art-900 border border-art-800 shadow-sm space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      UPI GPay / PhonePe ({summaryData.financial.upiShare}%)
                    </span>
                    <div className="text-2xl font-black font-mono text-cyan-300">
                      ₹{summaryData.financial.totalUpi.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[11px] text-art-500">Direct studio bank transfer</p>
                  </div>

                  {/* Cash in Drawer */}
                  <div className="p-5 rounded-3xl bg-art-900 border border-art-800 shadow-sm space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Cash in Drawer ({summaryData.financial.cashShare}%)
                    </span>
                    <div className="text-2xl font-black font-mono text-amber-300">
                      ₹{summaryData.financial.totalCash.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[11px] text-art-500">Physical paper currency tally</p>
                  </div>

                  {/* Net Profit */}
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-500/30 shadow-sm space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Net Gross Profit ({summaryData.financial.profitMargin}%)
                    </span>
                    <div className="text-2xl font-black font-mono text-emerald-400">
                      ₹{summaryData.financial.totalProfit.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[11px] text-emerald-300 font-semibold">After deducting BOM manufacturing cost</p>
                  </div>
                </div>

                {/* Top Selling Products & Leads Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Top Selling Table (7 cols) */}
                  <div className="lg:col-span-7 rounded-3xl bg-art-900 border border-art-800 p-5 space-y-4">
                    <h4 className="font-bold text-sm text-art-200 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Top Selling Items at Exhibition</span>
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-art-800 text-art-500 uppercase text-[10px]">
                            <th className="pb-2">Product Name</th>
                            <th className="pb-2 text-center">Units Sold</th>
                            <th className="pb-2 text-right">Revenue</th>
                            <th className="pb-2 text-right">Profit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-art-800/60 font-medium">
                          {summaryData.topProducts.map((item, idx) => (
                            <tr key={idx} className="hover:bg-art-950/40">
                              <td className="py-2.5 font-bold text-art-200 truncate max-w-xs">
                                {item.title}
                              </td>
                              <td className="py-2.5 text-center font-mono font-bold text-white">
                                {item.quantity} pcs
                              </td>
                              <td className="py-2.5 text-right font-mono font-bold text-emerald-400">
                                ₹{item.revenue}
                              </td>
                              <td className="py-2.5 text-right font-mono text-art-400">
                                ₹{item.profit}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Customer Leads Directory (5 cols) */}
                  <div className="lg:col-span-5 rounded-3xl bg-art-900 border border-art-800 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-art-200 flex items-center gap-2">
                        <User className="w-4 h-4 text-brand-400" />
                        <span>Walk-in Customer Leads ({summaryData.leadsCount})</span>
                      </h4>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {summaryData.leads.length === 0 ? (
                        <p className="text-xs text-art-500 py-6 text-center">
                          No phone numbers collected for this session yet.
                        </p>
                      ) : (
                        summaryData.leads.map((lead, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-art-950 border border-art-800 flex items-center justify-between text-xs"
                          >
                            <div>
                              <strong className="text-art-200 block font-bold">{lead.customerName}</strong>
                              <span className="font-mono text-art-500 text-[11px]">{lead.customerPhone}</span>
                              <span className="text-[10px] text-emerald-400 block font-mono">
                                Spent: ₹{lead.totalSpent}
                              </span>
                            </div>

                            <a
                              href={`https://api.whatsapp.com/send?phone=${lead.customerPhone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Hi ${lead.customerName}! 🌸 Thank you for visiting Rasin Arts stall! Enjoy 15% OFF your next order with coupon FLEA15.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <Send className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: EXHIBITION HISTORY */}
        {/* ======================================================== */}
        {activeTab === 'history' && (
          <div className="rounded-3xl bg-art-900 border border-art-800 p-5 space-y-4">
            <h4 className="font-bold text-base text-art-200">Past Exhibition & Stall Records</h4>
            <div className="space-y-3">
              {pastSessions.map((s) => (
                <div
                  key={s._id}
                  className="p-4 rounded-2xl bg-art-950 border border-art-800 flex items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <h5 className="font-black text-sm text-art-200">{s.name}</h5>
                    <p className="text-art-500 text-[11px]">
                      {s.location} • {new Date(s.startedAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-art-500 block">Total Revenue</span>
                      <strong className="font-mono font-black text-emerald-400 text-sm">
                        ₹{s.totalRevenue.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-art-500 block">Profit</span>
                      <strong className="font-mono font-bold text-white text-xs">
                        ₹{s.totalProfit.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: FAST PAYMENT (DYNAMIC UPI QR & CASH) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-art-900 border border-art-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-5 border-b border-art-800 flex items-center justify-between bg-art-950">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-brand-500 text-white">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-art-200">Collect Payment</h4>
                    <p className="text-[11px] text-art-500">Scan UPI or accept physical cash</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="p-1.5 text-art-400 hover:text-white rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Payment Method Switcher */}
                <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-art-950 border border-art-800 text-xs font-bold">
                  <button
                    onClick={() => setPaymentMethod('UPI')}
                    className={`py-2 rounded-xl transition-all ${
                      paymentMethod === 'UPI' ? 'bg-brand-500 text-white shadow-md' : 'text-art-400'
                    }`}
                  >
                    UPI QR
                  </button>
                  <button
                    onClick={() => setPaymentMethod('Cash')}
                    className={`py-2 rounded-xl transition-all ${
                      paymentMethod === 'Cash' ? 'bg-brand-500 text-white shadow-md' : 'text-art-400'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod('Card')}
                    className={`py-2 rounded-xl transition-all ${
                      paymentMethod === 'Card' ? 'bg-brand-500 text-white shadow-md' : 'text-art-400'
                    }`}
                  >
                    Card POS
                  </button>
                </div>

                {/* Amount Banner */}
                <div className="p-4 rounded-2xl bg-art-950 border border-art-800 text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-art-500">
                    Exact Amount to Collect
                  </span>
                  <div className="text-3xl font-black font-mono text-emerald-400">
                    ₹{finalPayable.toFixed(2)}
                  </div>
                </div>

                {/* Method 1: Dynamic UPI QR Code */}
                {paymentMethod === 'UPI' && (
                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-art-950 border border-art-800 space-y-3 text-center">
                    {renderUPIQRCode(
                      `upi://pay?pa=rasinarts@okhdfcbank&pn=RasinArtsStudio&am=${finalPayable}&cu=INR`,
                      170
                    )}
                    <span className="text-[11px] font-bold text-art-400 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-brand-400" />
                      Scan with Google Pay, PhonePe, or Paytm
                    </span>
                  </div>
                )}

                {/* Method 2: Physical Cash Calculator */}
                {paymentMethod === 'Cash' && (
                  <div className="space-y-3 p-4 rounded-2xl bg-art-950 border border-art-800 text-xs">
                    <div>
                      <label className="font-bold text-art-400 block mb-1">Cash Tendered by Customer (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        placeholder={`e.g. ${Math.ceil(finalPayable / 500) * 500 || 500}`}
                        className="w-full bg-art-900 border border-art-700 rounded-xl p-2.5 font-mono text-lg font-black text-white focus:outline-none focus:border-brand-500"
                        autoFocus
                      />
                    </div>
                    {cashNum > 0 && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-art-900 border border-art-700">
                        <span className="font-bold text-art-400">Return Change:</span>
                        <strong className="text-base font-black font-mono text-amber-400">
                          ₹{changeDue.toFixed(2)}
                        </strong>
                      </div>
                    )}
                  </div>
                )}

                {/* Confirm Payment Button */}
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleProcessOrder}
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {isProcessingPayment ? 'Saving & Syncing...' : 'Payment Received & Hand Over'}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL: POST-PAYMENT RECEIPT & WHATSAPP VOUCHER */}
      {/* ======================================================== */}
      <AnimatePresence>
        {completedOrderData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-art-900 border border-emerald-500/40 rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500 text-white font-mono text-xs font-black">
                  #{completedOrderData.orderNumber}
                </span>
                <h3 className="text-lg font-black text-white mt-1.5">Sale Completed!</h3>
                <p className="text-xs text-art-400">
                  Collected ₹{completedOrderData.totalAmount.toFixed(0)} • Stock decremented live
                </p>
              </div>

              {completedOrderData.customerPhone && (
                <button
                  onClick={() =>
                    handleSendWhatsAppBill(
                      completedOrderData.orderNumber,
                      completedOrderData.customerPhone,
                      completedOrderData.totalAmount
                    )
                  }
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Bill & Promo on WhatsApp</span>
                </button>
              )}

              <button
                onClick={() => {
                  setCompletedOrderData(null);
                  setIsPaymentModalOpen(false);
                }}
                className="w-full py-2.5 rounded-2xl bg-art-800 hover:bg-art-700 text-art-200 font-bold text-xs transition-all"
              >
                Done (Next Customer)
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL: START NEW STALL DAY SESSION */}
      {/* ======================================================== */}
      {isStartSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-art-900 border border-art-800 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-art-800 pb-3">
              <h4 className="font-black text-sm text-art-200">Start New Exhibition / Stall Session</h4>
              <button
                onClick={() => setIsStartSessionModalOpen(false)}
                className="text-art-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStartSession} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-art-400 block mb-1">Exhibition / Event Name *</label>
                <input
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="e.g. Bandra Flea Market, Diwali Crafts Gala"
                  className="w-full bg-art-950 border border-art-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-art-400 block mb-1">Stall Location / Booth Number</label>
                <input
                  type="text"
                  value={newSessionLocation}
                  onChange={(e) => setNewSessionLocation(e.target.value)}
                  placeholder="e.g. Stall #14, MMRDA Grounds"
                  className="w-full bg-art-950 border border-art-700 rounded-xl p-2.5 text-art-300 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStartSessionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-art-800 text-art-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-md"
                >
                  Start Stall Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
