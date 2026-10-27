import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Store, Zap, Search, Plus, Minus, Trash2, QrCode, DollarSign,
  Smartphone, CreditCard, CheckCircle2, User, Phone, ArrowRight,
  TrendingUp, RefreshCw, X, ShieldCheck, Tag, Sparkles, Building2,
  Calendar, FileText, Send, Download, Award, PieChart, ShoppingBag,
  Upload, Image as ImageIcon
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

  // UPI Payment QR Configuration State (persisted in localStorage)
  const [upiId, setUpiId] = useState<string>(() => localStorage.getItem('rasin_stall_upi_id') || 'rasinarts@okhdfcbank');
  const [payeeName, setPayeeName] = useState<string>(() => localStorage.getItem('rasin_stall_payee_name') || 'Rasin Arts Studio');
  const [customQrImage, setCustomQrImage] = useState<string>(() => localStorage.getItem('rasin_stall_custom_qr') || '');
  const [isQrSettingsModalOpen, setIsQrSettingsModalOpen] = useState(false);
  const [showQrOnPad, setShowQrOnPad] = useState(true);

  // Temporary edit state in QR settings modal
  const [tempUpiId, setTempUpiId] = useState(upiId);
  const [tempPayeeName, setTempPayeeName] = useState(payeeName);
  const [tempCustomQrImage, setTempCustomQrImage] = useState(customQrImage);

  const handleSaveQrSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUpi = tempUpiId.trim();
    const cleanPayee = tempPayeeName.trim();
    if (!cleanUpi) {
      addToast('Please enter a valid UPI ID (e.g. yourname@okhdfcbank)', 'warning');
      return;
    }
    setUpiId(cleanUpi);
    setPayeeName(cleanPayee || 'Rasin Arts Studio');
    setCustomQrImage(tempCustomQrImage.trim());
    localStorage.setItem('rasin_stall_upi_id', cleanUpi);
    localStorage.setItem('rasin_stall_payee_name', cleanPayee || 'Rasin Arts Studio');
    localStorage.setItem('rasin_stall_custom_qr', tempCustomQrImage.trim());
    setIsQrSettingsModalOpen(false);
    addToast('Payment QR & UPI settings saved!', 'success');
  };

  const handleQrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      addToast('QR image must be under 2MB', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setTempCustomQrImage(reader.result);
        addToast('Custom QR standee image loaded!', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

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
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20 shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-base sm:text-lg font-black tracking-tight text-stone-900">
                  {activeSession ? activeSession.name : 'No Active Stall Session'}
                </span>
                {activeSession ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE STALL ACTIVE
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                    Offline
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                <span className="font-semibold text-stone-700">Location:</span> {activeSession?.location || 'Flea Market Ground'} •{' '}
                <span className="font-semibold text-stone-700">Started:</span>{' '}
                {activeSession
                  ? new Date(activeSession.startedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                  : '—'}
              </p>
            </div>
          </div>

          {/* Live Sales Ticker Cards */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="px-4 py-2 rounded-2xl bg-stone-50 border border-stone-200 text-center min-w-[110px] shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Stall Sales</span>
              <span className="text-lg font-black font-mono text-emerald-700">
                ₹{activeSession ? activeSession.totalRevenue.toLocaleString('en-IN') : '0'}
              </span>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-stone-50 border border-stone-200 text-center min-w-[80px] shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Orders</span>
              <span className="text-lg font-black font-mono text-stone-900">
                {activeSession?.ordersCount || 0}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!activeSession ? (
                <button
                  onClick={() => setIsStartSessionModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start Stall Day</span>
                </button>
              ) : (
                <button
                  onClick={handleCloseSession}
                  className="px-3.5 py-2.5 rounded-2xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-xs font-bold transition-all shadow-2xs"
                  title="Close and reconcile session"
                >
                  Close Stall Day
                </button>
              )}
            </div>
          </div>
        </div>

        {/* View Mode Navigation Switcher */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex rounded-2xl bg-white p-1 border border-stone-200 shadow-sm text-xs font-bold">
            <button
              onClick={() => setActiveTab('kiosk')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'kiosk'
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>3-Tap Touch Kiosk POS</span>
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'summary'
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>End-of-Day Financial Summary</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Exhibition History</span>
            </button>
          </div>

          {activeTab === 'kiosk' && (
            <div className="text-xs text-stone-600 font-mono hidden md:block">
              Cart Items: <strong className="text-brand-600 text-sm font-bold">{cart.reduce((a, b) => a + b.quantity, 0)}</strong>
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
              <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border border-amber-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Exhibition Bundle &amp; Impulse Promos (1-Tap Apply)
                  </span>
                  {appliedBundle && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-brand-500 text-white shadow-sm flex items-center gap-1">
                      Active: {appliedBundle}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleApplyBundle('Pick Any 3 for ₹599', 'pick3')}
                    className="p-3 rounded-2xl bg-white hover:bg-amber-100/50 border border-amber-200 text-left transition-all active:scale-95 group shadow-xs hover:border-amber-400"
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">Combo #1</span>
                    <strong className="text-xs font-black text-stone-900 block group-hover:text-brand-600 truncate mt-0.5">
                      3 Small for ₹599
                    </strong>
                    <span className="text-[10px] text-stone-500 font-medium">Keychains, bookmarks</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyBundle('Clock + 50% Coasters', 'clockCombo')}
                    className="p-3 rounded-2xl bg-white hover:bg-purple-50 border border-purple-200 text-left transition-all active:scale-95 group shadow-xs hover:border-purple-400"
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block">Combo #2</span>
                    <strong className="text-xs font-black text-stone-900 block group-hover:text-purple-700 truncate mt-0.5">
                      Clock + 50% Coasters
                    </strong>
                    <span className="text-[10px] text-stone-500 font-medium">Matching set deal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyBundle('Diwali Festive Hamper', 'festiveHamper')}
                    className="p-3 rounded-2xl bg-white hover:bg-emerald-50 border border-emerald-200 text-left transition-all active:scale-95 group shadow-xs hover:border-emerald-400"
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">Festive Hamper</span>
                    <strong className="text-xs font-black text-stone-900 block group-hover:text-emerald-700 truncate mt-0.5">
                      Thali + Diya ₹1,200
                    </strong>
                    <span className="text-[10px] text-stone-500 font-medium">Gift box included</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyBundle('10% Flash Discount', 'flash10')}
                    className="p-3 rounded-2xl bg-white hover:bg-rose-50 border border-rose-200 text-left transition-all active:scale-95 group shadow-xs hover:border-rose-400"
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 block">Flash Deal</span>
                    <strong className="text-xs font-black text-stone-900 block group-hover:text-rose-700 truncate mt-0.5">
                      10% Off Stall Bill
                    </strong>
                    <span className="text-[10px] text-stone-500 font-medium">Negotiated closing</span>
                  </button>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search stall product by name or SKU..."
                    className="w-full bg-white border border-stone-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-brand-500 shadow-xs"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-brand-500 text-white shadow-md'
                          : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 shadow-xs'
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
                  <div className="col-span-full py-20 text-center text-stone-500">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-brand-500" />
                    <span>Loading stall products...</span>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-stone-500">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-stone-400" />
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
                        className={`p-3 rounded-3xl bg-white border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden select-none ${
                          isOutOfStock
                            ? 'opacity-40 border-stone-200 cursor-not-allowed'
                            : 'border-stone-200 hover:border-brand-500 hover:shadow-lg shadow-xs'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100">
                            <img
                              src={p.thumbnail}
                              alt={p.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-lg bg-white/95 backdrop-blur-xs text-[10px] font-mono font-bold text-stone-800 border border-stone-200 shadow-2xs flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${p.stock > 5 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              {p.stock} in stock
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-brand-700 block truncate uppercase tracking-wider">
                              {p.category}
                            </span>
                            <h4 className="font-bold text-stone-900 text-xs truncate leading-snug">
                              {p.title}
                            </h4>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-stone-100 mt-2">
                          <span className="text-sm font-black font-mono text-emerald-700">
                            ₹{price}
                          </span>
                          <span className="text-[10px] font-mono font-semibold text-stone-600">
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
            <div className="lg:col-span-5 xl:col-span-4 p-5 rounded-3xl bg-white border border-stone-200 shadow-xl space-y-4 sticky top-24">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-brand-500" />
                  <h3 className="font-black text-sm text-stone-900">Current Stall Order Pad</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTempUpiId(upiId);
                      setTempPayeeName(payeeName);
                      setTempCustomQrImage(customQrImage);
                      setIsQrSettingsModalOpen(true);
                    }}
                    className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                    title="Configure Stall Payment QR & UPI ID"
                  >
                    <QrCode className="w-3.5 h-3.5 text-amber-700" />
                    <span>Setup QR</span>
                  </button>
                  {cart.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {/* Customer Contact (For WhatsApp Receipt) with Auto-Fill */}
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">Customer Details</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerName('Walk-in Guest');
                        setCustomerPhone('9876543210');
                        addToast('Auto-filled walk-in customer details', 'info');
                      }}
                      className="px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold border border-amber-300 transition-colors flex items-center gap-1 shadow-2xs"
                      title="Auto-fill walk-in customer details"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-amber-700" />
                      <span>Auto-Fill Guest</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerName('VIP Collector');
                        setCustomerPhone('9820011223');
                        addToast('Auto-filled VIP customer details', 'info');
                      }}
                      className="px-1.5 py-0.5 rounded-md bg-stone-200 hover:bg-stone-300 text-stone-800 text-[10px] font-bold transition-colors"
                      title="Auto-fill VIP customer details"
                    >
                      VIP
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Guest Name"
                      className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">WhatsApp Phone *</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="10-digit mobile"
                      className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-mono text-stone-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-stone-400 space-y-1">
                    <p className="text-xs font-semibold text-stone-600">Cart is currently empty.</p>
                    <p className="text-[11px]">Tap products on the left to add items.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product._id}
                      className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <img
                          src={item.product.thumbnail}
                          alt=""
                          className="w-9 h-9 rounded-xl object-cover shrink-0 border border-stone-200"
                        />
                        <div className="truncate">
                          <strong className="text-stone-900 block truncate leading-tight font-bold">
                            {item.product.title}
                          </strong>
                          <span className="font-mono text-stone-500 text-[11px]">
                            ₹{item.soldPrice} each
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleUpdateQuantity(item.product._id, -1)}
                          className="w-6 h-6 rounded-lg bg-white border border-stone-300 flex items-center justify-center text-stone-700 hover:bg-stone-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-mono font-black text-xs text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product._id, 1)}
                          className="w-6 h-6 rounded-lg bg-white border border-stone-300 flex items-center justify-center text-stone-700 hover:bg-stone-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleRemoveFromCart(item.product._id)}
                          className="p-1 text-rose-500 hover:text-rose-700 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals & Discount Controls */}
              <div className="pt-3 border-t border-stone-200 space-y-2 text-xs font-medium">
                <div className="flex justify-between text-stone-600">
                  <span>Gross Subtotal:</span>
                  <span className="font-mono font-bold text-stone-900">₹{rawSubtotal.toFixed(2)}</span>
                </div>

                {calculatedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount / Bundle Savings:</span>
                    <span className="font-mono">-₹{calculatedDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-black text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total Payable:</span>
                  <span className="font-mono text-emerald-700 text-xl font-black">₹{finalPayable.toFixed(2)}</span>
                </div>
              </div>

              {/* Live Counter Payment QR Box (Instant Customer Walk-in Scan) */}
              {cart.length > 0 && showQrOnPad && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-b from-stone-50 to-white border border-stone-200 text-center space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                      Live Customer Pay QR
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTempUpiId(upiId);
                        setTempPayeeName(payeeName);
                        setTempCustomQrImage(customQrImage);
                        setIsQrSettingsModalOpen(true);
                      }}
                      className="text-[10px] font-bold text-brand-600 hover:text-brand-700 underline cursor-pointer"
                    >
                      Configure QR
                    </button>
                  </div>

                  <div className="flex items-center justify-center py-1">
                    {customQrImage ? (
                      <div className="p-2 bg-white rounded-xl shadow-xs border border-stone-200">
                        <img
                          src={customQrImage}
                          alt="Custom UPI Standee QR"
                          className="w-36 h-36 object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="p-2 bg-white rounded-xl shadow-xs border border-stone-200">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=4&data=${encodeURIComponent(
                            `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${finalPayable.toFixed(2)}&cu=INR`
                          )}`}
                          alt="Scan to Pay via UPI"
                          className="w-36 h-36 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-[11px] font-black text-stone-900">
                      ₹{finalPayable.toFixed(2)} • {payeeName}
                    </div>
                    <div className="text-[10px] text-stone-600 font-mono">
                      UPI ID: <span className="text-emerald-700 font-bold">{upiId}</span>
                    </div>
                    <p className="text-[9px] text-stone-600 font-medium">Customer scans with GPay, PhonePe, Paytm, or BHIM</p>
                  </div>
                </div>
              )}

              {/* Fast Checkout Trigger */}
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() => setIsPaymentModalOpen(true)}
                className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                  cart.length === 0
                    ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed shadow-none'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/25 active:scale-98 cursor-pointer'
                }`}
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
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-600 to-brand-700 text-white shadow-xl space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100">
                      Total Exhibition Revenue
                    </span>
                    <div className="text-2xl font-black font-mono text-white">
                      ₹{summaryData.financial.totalRevenue.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[11px] text-amber-100 font-medium">
                      {summaryData.financial.ordersCount} total orders processed
                    </p>
                  </div>

                  {/* UPI Collections */}
                  <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
                      UPI GPay / PhonePe ({summaryData.financial.upiShare}%)
                    </span>
                    <div className="text-2xl font-black font-mono text-sky-950">
                      ₹{summaryData.financial.totalUpi.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[11px] text-stone-500 font-medium">Direct studio bank transfer</p>
                  </div>

                  {/* Cash in Drawer */}
                  <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                      Cash in Drawer ({summaryData.financial.cashShare}%)
                    </span>
                    <div className="text-2xl font-black font-mono text-amber-950">
                      ₹{summaryData.financial.totalCash.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[11px] text-stone-500 font-medium">Physical paper currency tally</p>
                  </div>

                  {/* Net Profit */}
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                      Net Gross Profit ({summaryData.financial.profitMargin}%)
                    </span>
                    <div className="text-2xl font-black font-mono text-white">
                      ₹{summaryData.financial.totalProfit.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[11px] text-emerald-100 font-semibold">After deducting BOM manufacturing cost</p>
                  </div>
                </div>

                {/* Top Selling Products & Leads Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Top Selling Table (7 cols) */}
                  <div className="lg:col-span-7 rounded-3xl bg-white border border-stone-200 p-5 space-y-4 shadow-sm">
                    <h4 className="font-black text-sm text-stone-900 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>Top Selling Items at Exhibition</span>
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-stone-200 text-stone-500 uppercase text-[10px]">
                            <th className="pb-2">Product Name</th>
                            <th className="pb-2 text-center">Units Sold</th>
                            <th className="pb-2 text-right">Revenue</th>
                            <th className="pb-2 text-right">Profit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 font-medium">
                          {summaryData.topProducts.map((item, idx) => (
                            <tr key={idx} className="hover:bg-stone-50 transition-colors">
                              <td className="py-2.5 font-bold text-stone-900 truncate max-w-xs">
                                {item.title}
                              </td>
                              <td className="py-2.5 text-center font-mono font-bold text-stone-800">
                                {item.quantity} pcs
                              </td>
                              <td className="py-2.5 text-right font-mono font-bold text-emerald-700">
                                ₹{item.revenue}
                              </td>
                              <td className="py-2.5 text-right font-mono font-bold text-brand-700">
                                ₹{item.profit}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Customer Leads Directory (5 cols) */}
                  <div className="lg:col-span-5 rounded-3xl bg-white border border-stone-200 p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm text-stone-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-brand-600" />
                        <span>Walk-in Customer Leads ({summaryData.leadsCount})</span>
                      </h4>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {summaryData.leads.length === 0 ? (
                        <p className="text-xs text-stone-500 py-6 text-center">
                          No phone numbers collected for this session yet.
                        </p>
                      ) : (
                        summaryData.leads.map((lead, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
                          >
                            <div>
                              <strong className="text-stone-900 block font-bold">{lead.customerName}</strong>
                              <span className="font-mono text-stone-500 text-[11px]">{lead.customerPhone}</span>
                              <span className="text-[10px] text-emerald-700 block font-mono font-bold">
                                Spent: ₹{lead.totalSpent}
                              </span>
                            </div>

                            <a
                              href={`https://api.whatsapp.com/send?phone=${lead.customerPhone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Hi ${lead.customerName}! 🌸 Thank you for visiting Rasin Arts stall! Enjoy 15% OFF your next order with coupon FLEA15.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow-xs"
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
          <div className="rounded-3xl bg-white border border-stone-200 p-5 space-y-4 shadow-sm">
            <h4 className="font-black text-base text-stone-900">Past Exhibition &amp; Stall Records</h4>
            <div className="space-y-3">
              {pastSessions.map((s) => (
                <div
                  key={s._id}
                  className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-4 text-xs hover:border-brand-500 transition-colors"
                >
                  <div>
                    <h5 className="font-black text-sm text-stone-900">{s.name}</h5>
                    <p className="text-stone-500 text-[11px]">
                      {s.location} • {new Date(s.startedAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-stone-500 block font-semibold">Total Revenue</span>
                      <strong className="font-mono font-black text-emerald-700 text-sm">
                        ₹{s.totalRevenue.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-stone-500 block font-semibold">Profit</span>
                      <strong className="font-mono font-black text-stone-900 text-xs">
                        ₹{s.totalProfit.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-200 text-stone-800">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-stone-200 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-brand-500 text-white">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-stone-900">Collect Payment</h4>
                    <p className="text-[11px] text-stone-500">Scan UPI or accept physical cash</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Payment Method Switcher */}
                <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-stone-100 border border-stone-200 text-xs font-bold">
                  <button
                    onClick={() => setPaymentMethod('UPI')}
                    className={`py-2 rounded-xl transition-all ${
                      paymentMethod === 'UPI' ? 'bg-brand-500 text-white shadow-md' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    UPI QR
                  </button>
                  <button
                    onClick={() => setPaymentMethod('Cash')}
                    className={`py-2 rounded-xl transition-all ${
                      paymentMethod === 'Cash' ? 'bg-brand-500 text-white shadow-md' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod('Card')}
                    className={`py-2 rounded-xl transition-all ${
                      paymentMethod === 'Card' ? 'bg-brand-500 text-white shadow-md' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Card POS
                  </button>
                </div>

                {/* Amount Banner */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Exact Amount to Collect
                  </span>
                  <div className="text-3xl font-black font-mono text-emerald-800">
                    ₹{finalPayable.toFixed(2)}
                  </div>
                </div>

                {/* Method 1: Dynamic UPI QR Code */}
                {paymentMethod === 'UPI' && (
                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 text-center">
                    {customQrImage ? (
                      <div className="space-y-1">
                        <div className="p-2 bg-white rounded-xl shadow-xs border border-stone-200 inline-block">
                          <img
                            src={customQrImage}
                            alt="Custom UPI Standee QR"
                            className="w-44 h-44 object-contain rounded-lg"
                          />
                        </div>
                        <p className="text-[12px] font-black text-stone-800">{payeeName}</p>
                      </div>
                    ) : (
                      <div className="p-2 bg-white rounded-xl shadow-xs border border-stone-200">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=6&data=${encodeURIComponent(
                            `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${finalPayable.toFixed(2)}&cu=INR`
                          )}`}
                          alt="Dynamic UPI QR"
                          className="w-44 h-44 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-stone-700 flex items-center justify-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-brand-600" />
                        Scan with Google Pay, PhonePe, Paytm, or BHIM
                      </span>
                      <p className="text-[10px] text-stone-600 font-mono">
                        UPI: <span className="text-emerald-700 font-bold">{upiId}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTempUpiId(upiId);
                        setTempPayeeName(payeeName);
                        setTempCustomQrImage(customQrImage);
                        setIsQrSettingsModalOpen(true);
                      }}
                      className="text-[10px] font-bold text-brand-600 hover:text-brand-700 underline cursor-pointer"
                    >
                      ⚙️ Change UPI ID / Custom Standee QR
                    </button>
                  </div>
                )}

                {/* Method 2: Physical Cash Calculator */}
                {paymentMethod === 'Cash' && (
                  <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Cash Tendered by Customer (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        placeholder={`e.g. ${Math.ceil(finalPayable / 500) * 500 || 500}`}
                        className="w-full bg-white border border-stone-300 rounded-xl p-2.5 font-mono text-lg font-black text-stone-900 focus:outline-none focus:border-brand-500"
                        autoFocus
                      />
                    </div>
                    {cashNum > 0 && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                        <span className="font-bold text-amber-900">Return Change:</span>
                        <strong className="text-base font-black font-mono text-amber-900">
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
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-emerald-200 rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-xs font-black">
                  #{completedOrderData.orderNumber}
                </span>
                <h3 className="text-lg font-black text-stone-900 mt-1.5">Sale Completed!</h3>
                <p className="text-xs text-stone-500">
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
                  <span>Send Bill &amp; Promo on WhatsApp</span>
                </button>
              )}

              <button
                onClick={() => {
                  setCompletedOrderData(null);
                  setIsPaymentModalOpen(false);
                }}
                className="w-full py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-all"
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
          <div className="bg-white border border-stone-200 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h4 className="font-black text-sm text-stone-900">Start New Exhibition / Stall Session</h4>
              <button
                onClick={() => setIsStartSessionModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStartSession} className="space-y-4 text-xs">
              {/* Quick Auto-Fill Event Presets */}
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Auto-Fill Quick Presets
                  </span>
                  <span className="text-[10px] text-amber-700 font-semibold">1-tap setup</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setNewSessionName('Diwali Crafts & Lifestyle Gala');
                      setNewSessionLocation('Stall #14, MMRDA Pavilion');
                    }}
                    className="p-2 rounded-xl bg-white border border-amber-200 text-[10px] font-bold text-stone-800 hover:border-brand-500 hover:text-brand-700 transition-all text-center truncate shadow-2xs"
                  >
                    Diwali Gala
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewSessionName('Weekend Artisan Flea Market');
                      setNewSessionLocation('Booth B-08, Open Lawn');
                    }}
                    className="p-2 rounded-xl bg-white border border-amber-200 text-[10px] font-bold text-stone-800 hover:border-brand-500 hover:text-brand-700 transition-all text-center truncate shadow-2xs"
                  >
                    Weekend Flea
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewSessionName('Bandra Pop-up Exhibition');
                      setNewSessionLocation('Stall 22, Ground Floor');
                    }}
                    className="p-2 rounded-xl bg-white border border-amber-200 text-[10px] font-bold text-stone-800 hover:border-brand-500 hover:text-brand-700 transition-all text-center truncate shadow-2xs"
                  >
                    Pop-Up Stall
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Exhibition / Event Name *</label>
                <input
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="e.g. Bandra Flea Market, Diwali Crafts Gala"
                  className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-stone-900 font-bold focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Stall Location / Booth Number</label>
                <input
                  type="text"
                  value={newSessionLocation}
                  onChange={(e) => setNewSessionLocation(e.target.value)}
                  placeholder="e.g. Stall #14, MMRDA Grounds"
                  className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStartSessionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50"
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

      {/* ======================================================== */}
      {/* MODAL 3: STALL PAYMENT QR & UPI ID CONFIGURATION */}
      {/* ======================================================== */}
      {isQrSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-stone-900">Configure Stall Payment QR & UPI</h3>
                  <p className="text-[11px] text-stone-500">Walk-in customers scan this QR to pay at your counter</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQrSettingsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQrSettings} className="space-y-4 text-xs">
              {/* Quick UPI Presets Banner */}
              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Quick UPI ID Presets
                  </span>
                  <span className="text-[10px] text-amber-700 font-semibold">1-tap fill</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setTempUpiId('rasinarts@okhdfcbank');
                      setTempPayeeName('Rasin Arts Studio');
                    }}
                    className="p-2 rounded-xl bg-white border border-amber-200 text-[10px] font-bold text-stone-800 hover:border-brand-500 hover:text-brand-700 transition-all text-center truncate shadow-2xs"
                  >
                    HDFC Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempUpiId('9876543210@paytm');
                      setTempPayeeName('Rasin Arts Studio');
                    }}
                    className="p-2 rounded-xl bg-white border border-amber-200 text-[10px] font-bold text-stone-800 hover:border-brand-500 hover:text-brand-700 transition-all text-center truncate shadow-2xs"
                  >
                    Paytm Merchant
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempUpiId('rasin.studio@icici');
                      setTempPayeeName('Rasin Arts Studio');
                    }}
                    className="p-2 rounded-xl bg-white border border-amber-200 text-[10px] font-bold text-stone-800 hover:border-brand-500 hover:text-brand-700 transition-all text-center truncate shadow-2xs"
                  >
                    ICICI / GPay
                  </button>
                </div>
              </div>

              {/* UPI ID Field */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Your UPI ID / VPA <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={tempUpiId}
                    onChange={(e) => setTempUpiId(e.target.value)}
                    placeholder="e.g. rasinarts@okhdfcbank or 9876543210@paytm"
                    className="w-full bg-white border border-stone-300 rounded-xl p-2.5 font-mono text-sm text-stone-900 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <p className="text-[10px] text-stone-500 mt-1">
                  Payments received via QR will credit directly to the bank account linked with this UPI ID.
                </p>
              </div>

              {/* Payee / Merchant Name */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Business / Payee Display Name</label>
                <input
                  type="text"
                  value={tempPayeeName}
                  onChange={(e) => setTempPayeeName(e.target.value)}
                  placeholder="e.g. Rasin Arts Studio"
                  className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Custom Physical QR Standee Image (Optional) */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-800 block">
                    Custom QR Standee Image <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  {tempCustomQrImage && (
                    <button
                      type="button"
                      onClick={() => setTempCustomQrImage('')}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-700 underline"
                    >
                      Use Dynamic QR Instead
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-stone-500">
                  If you already have an official printed UPI standee (from PhonePe, Paytm, BharatPe, or GPay), upload or paste its image here.
                </p>

                {/* Upload or URL */}
                <div className="flex items-center gap-2">
                  <label className="px-3 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-stone-500" />
                    <span>Upload QR Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrImageUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-stone-400 text-xs">or paste URL:</span>
                  <input
                    type="url"
                    value={tempCustomQrImage}
                    onChange={(e) => setTempCustomQrImage(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-white border border-stone-300 rounded-xl p-2 text-stone-900 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Live Preview of QR */}
                <div className="pt-2 border-t border-stone-200 flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl border border-stone-300 bg-white p-1.5 flex items-center justify-center shrink-0 shadow-xs">
                    {tempCustomQrImage ? (
                      <img
                        src={tempCustomQrImage}
                        alt="Preview QR"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&margin=2&data=${encodeURIComponent(
                          `upi://pay?pa=${tempUpiId || 'rasinarts@okhdfcbank'}&pn=${encodeURIComponent(
                            tempPayeeName || 'Rasin Arts Studio'
                          )}&cu=INR`
                        )}`}
                        alt="Dynamic QR Preview"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <div className="text-[11px] text-stone-600 space-y-1">
                    <div className="font-bold text-stone-900">
                      {tempCustomQrImage ? 'Custom Standee Image Active' : 'Dynamic Auto-Amount QR Active'}
                    </div>
                    <div className="text-[10px] text-stone-500 font-mono">
                      Payee: {tempPayeeName || 'Rasin Arts Studio'}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-mono font-bold">
                      {tempUpiId || 'rasinarts@okhdfcbank'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Pad Display Toggle */}
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl hover:bg-stone-50">
                <input
                  type="checkbox"
                  checked={showQrOnPad}
                  onChange={(e) => setShowQrOnPad(e.target.checked)}
                  className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-stone-700">
                  Display Payment QR directly on the Current Stall Order Pad
                </span>
              </label>

              {/* Modal Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsQrSettingsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer transition-colors"
                >
                  Save & Apply QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
