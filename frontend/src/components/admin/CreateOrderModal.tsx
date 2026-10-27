import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Trash2, Search, ShoppingBag, User, Phone,
  MapPin, CreditCard, CheckCircle2, Loader2, Package,
  TrendingUp, AlertCircle, Tag, Handshake, ShieldAlert, Sparkles
} from 'lucide-react';
import { Product } from '../../types';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  costPrice: number;
  minBargainPrice?: number;
  isBargained: boolean;
  bargainedPrice: number;
  soldPrice: number;
  profit: number;
}

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { addToast } = useToastStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customerName,  setCustomerName]  = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const [street,     setStreet]     = useState('');
  const [city,       setCity]       = useState('');
  const [state,      setState]      = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country,    setCountry]    = useState('India');

  const [paymentMethod,  setPaymentMethod]  = useState('CashOnDelivery');
  const [orderStatus,    setOrderStatus]    = useState('Processing');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingPrice,  setShippingPrice]  = useState(0);

  const [productSearch,   setProductSearch]   = useState('');
  const [searchResults,   setSearchResults]   = useState<Product[]>([]);
  const [searchLoading,   setSearchLoading]   = useState(false);
  const [orderItems,      setOrderItems]      = useState<OrderItem[]>([]);

  const itemsPrice = orderItems.reduce((s, i) => s + i.soldPrice * i.quantity, 0);
  const totalCost = orderItems.reduce((s, i) => s + i.costPrice * i.quantity, 0);
  const totalProfit = itemsPrice - totalCost;
  const totalBargainSavings = orderItems.reduce((s, i) => i.isBargained ? s + Math.max(0, i.price - i.soldPrice) * i.quantity : s, 0);
  const overallMargin = itemsPrice > 0 ? (totalProfit / itemsPrice) * 100 : 0;
  const totalPrice = itemsPrice + shippingPrice;

  useEffect(() => {
    if (!isOpen) {
      setCustomerName(''); setCustomerPhone(''); setCustomerEmail('');
      setStreet(''); setCity(''); setState(''); setPostalCode(''); setCountry('India');
      setPaymentMethod('CashOnDelivery'); setOrderStatus('Processing');
      setTrackingNumber(''); setShippingPrice(0);
      setOrderItems([]); setProductSearch(''); setSearchResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!productSearch.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(productSearch)}&limit=8`);
        setSearchResults(res.data.data || []);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [productSearch]);

  const handleAutoFillLocal = async (preset: 'walkin' | 'exhibition' | 'corporate' = 'walkin') => {
    if (preset === 'walkin') {
      setCustomerName('Priya Sharma (Studio Walk-in)');
      setCustomerPhone('9876543210');
      setCustomerEmail('priya.walkin@example.com');
      setStreet('Shop 4, Linking Road, Bandra West');
      setCity('Mumbai');
      setState('Maharashtra');
      setPostalCode('400050');
      setCountry('India');
      setPaymentMethod('CashOnDelivery');
      setOrderStatus('Processing');
    } else if (preset === 'exhibition') {
      setCustomerName('Rahul Verma (Exhibition Lead)');
      setCustomerPhone('9820123456');
      setCustomerEmail('rahul.exhibition@example.com');
      setStreet('Booth 14, MMRDA Flea Market Pavilion');
      setCity('Mumbai');
      setState('Maharashtra');
      setPostalCode('400051');
      setCountry('India');
      setPaymentMethod('UPI');
      setOrderStatus('Processing');
    } else {
      setCustomerName('Ananya Deshmukh (Bulk Corporate)');
      setCustomerPhone('9811223344');
      setCustomerEmail('ananya.gifts@craftcorp.in');
      setStreet('Tower B, BKC Financial Center');
      setCity('Mumbai');
      setState('Maharashtra');
      setPostalCode('400051');
      setCountry('India');
      setPaymentMethod('BankTransfer');
      setOrderStatus('Confirmed');
    }

    // Auto-select first available product from catalog if none selected
    if (orderItems.length === 0) {
      try {
        const res = await api.get('/products?limit=1');
        const firstProd = res.data.data?.[0];
        if (firstProd) {
          addItem(firstProd);
        }
      } catch (e) {
        // silent fallback
      }
    }

    addToast(`Auto-filled local ${preset} order details!`, 'success');
  };

  const addItem = (product: Product) => {
    const catalogPrice = product.discountPrice || product.price;
    const unitCost = product.costPrice || 0;
    const floorPrice = product.minBargainPrice || undefined;

    setOrderItems(prev => {
      const exists = prev.find(i => i.product === product._id);
      if (exists) {
        return prev.map(i => {
          if (i.product === product._id) {
            const newQty = i.quantity + 1;
            return {
              ...i,
              quantity: newQty,
              profit: (i.soldPrice - i.costPrice) * newQty,
            };
          }
          return i;
        });
      }
      return [...prev, {
        product: product._id,
        name:     product.title,
        quantity: 1,
        price:    catalogPrice,
        image:    product.thumbnail,
        costPrice: unitCost,
        minBargainPrice: floorPrice,
        isBargained: false,
        bargainedPrice: catalogPrice,
        soldPrice: catalogPrice,
        profit: (catalogPrice - unitCost) * 1,
      }];
    });
    setProductSearch('');
    setSearchResults([]);
  };

  const removeItem = (productId: string) =>
    setOrderItems(prev => prev.filter(i => i.product !== productId));

  const changeQty = (productId: string, qty: number) => {
    if (qty < 1) { removeItem(productId); return; }
    setOrderItems(prev => prev.map(i => i.product === productId ? {
      ...i,
      quantity: qty,
      profit: (i.soldPrice - i.costPrice) * qty,
    } : i));
  };

  const toggleBargain = (productId: string, isBargained: boolean) => {
    setOrderItems(prev => prev.map(i => {
      if (i.product === productId) {
        const effectiveSoldPrice = isBargained ? i.bargainedPrice : i.price;
        return {
          ...i,
          isBargained,
          soldPrice: effectiveSoldPrice,
          profit: (effectiveSoldPrice - i.costPrice) * i.quantity,
        };
      }
      return i;
    }));
  };

  const changeBargainedPrice = (productId: string, newBargainedPrice: number) => {
    const validPrice = Math.max(0, isNaN(newBargainedPrice) ? 0 : newBargainedPrice);
    setOrderItems(prev => prev.map(i => {
      if (i.product === productId) {
        const effectiveSoldPrice = i.isBargained ? validPrice : i.price;
        return {
          ...i,
          bargainedPrice: validPrice,
          soldPrice: effectiveSoldPrice,
          profit: (effectiveSoldPrice - i.costPrice) * i.quantity,
        };
      }
      return i;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      addToast('Customer name and phone are required', 'warning'); return;
    }
    if (!street || !city) {
      addToast('Street address and city are required', 'warning'); return;
    }
    if (orderItems.length === 0) {
      addToast('Add at least one product to the order', 'warning'); return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/orders/admin', {
        customerName, customerPhone, customerEmail,
        shippingAddress: { street, city, state, postalCode, country },
        orderItems: orderItems.map(item => ({
          product: item.product,
          name: item.name,
          quantity: item.quantity,
          price: item.soldPrice,
          soldPrice: item.soldPrice,
          originalPrice: item.price,
          costPrice: item.costPrice,
          profit: item.profit,
          isBargained: item.isBargained,
          image: item.image,
        })),
        paymentMethod,
        status: orderStatus,
        trackingNumber,
        itemsPrice,
        taxPrice: 0,
        shippingPrice,
        totalPrice,
      });
      addToast('Order created and saved successfully with profit metrics!', 'success');
      onCreated();
      onClose();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to create order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24 }}
          className="relative w-full max-w-3xl bg-white border border-stone-200 rounded-2xl sm:rounded-3xl shadow-2xl z-10 my-3 sm:my-8 flex flex-col max-h-[92vh] overflow-hidden"
        >
          <div className="h-[3px] bg-gradient-to-r from-brand-500 via-rose-500 to-plum-600 shrink-0" />
          <div className="flex items-center justify-between px-4 sm:px-7 py-3.5 sm:py-5 border-b border-stone-200 shrink-0 bg-white">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50 border border-amber-200 shrink-0 text-amber-700">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-black text-stone-900 font-poppins truncate">
                  Create New Order
                </h2>
                <p className="text-[11px] sm:text-xs text-stone-500 truncate">Manually record a phone or walk-in customer order</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAutoFillLocal('walkin')}
                className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                title="Auto-fill walk-in customer details and sample product"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Quick Auto-Fill</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 border border-stone-200 transition-all shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 flex flex-col justify-between">
            <div className="p-4 sm:p-7 space-y-6 sm:space-y-8">
              {/* Quick Auto-Fill Presets Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Auto-Fill Local Order Presets
                  </span>
                  <span className="text-[10px] text-amber-800 font-semibold">1-Click Fast Fill</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAutoFillLocal('walkin')}
                    className="p-2.5 rounded-xl bg-white border border-amber-200 hover:border-brand-500 hover:shadow-2xs text-left transition-all group"
                  >
                    <span className="text-[10px] font-bold text-amber-800 block">Preset #1</span>
                    <strong className="text-xs font-bold text-stone-900 group-hover:text-brand-600 block truncate">
                      Studio Walk-in
                    </strong>
                    <span className="text-[10px] text-stone-500 block truncate">Priya Sharma • Bandra W</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAutoFillLocal('exhibition')}
                    className="p-2.5 rounded-xl bg-white border border-amber-200 hover:border-brand-500 hover:shadow-2xs text-left transition-all group"
                  >
                    <span className="text-[10px] font-bold text-amber-800 block">Preset #2</span>
                    <strong className="text-xs font-bold text-stone-900 group-hover:text-brand-600 block truncate">
                      Exhibition Buyer
                    </strong>
                    <span className="text-[10px] text-stone-500 block truncate">Rahul Verma • Flea Pavilion</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAutoFillLocal('corporate')}
                    className="p-2.5 rounded-xl bg-white border border-amber-200 hover:border-brand-500 hover:shadow-2xs text-left transition-all group"
                  >
                    <span className="text-[10px] font-bold text-amber-800 block">Preset #3</span>
                    <strong className="text-xs font-bold text-stone-900 group-hover:text-brand-600 block truncate">
                      Bulk Gifting Client
                    </strong>
                    <span className="text-[10px] text-stone-500 block truncate">Ananya D. • BKC Tower</span>
                  </button>
                </div>
              </div>

              <section>
                <h3 className="text-xs font-bold text-stone-700 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-600" /> Customer Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text" value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-brand-500 shadow-2xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                      <input
                        type="tel" value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-brand-500 font-mono shadow-2xs"
                        required
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Email (optional)</label>
                    <input
                      type="email" value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      placeholder="customer@email.com"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-brand-500 shadow-2xs"
                    />
                  </div>
                </div>
              </section>
              <section>
                <h3 className="text-xs font-bold text-stone-700 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-600" /> Delivery Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Street / House No. <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text" value={street}
                      onChange={e => setStreet(e.target.value)}
                      placeholder="e.g. 12, MG Road, Flat 3B"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-brand-500 shadow-2xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text" value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-brand-500 shadow-2xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">State</label>
                    <input
                      type="text" value={state}
                      onChange={e => setState(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-brand-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Postal Code</label>
                    <input
                      type="text" value={postalCode}
                      onChange={e => setPostalCode(e.target.value)}
                      placeholder="e.g. 400001"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-brand-500 font-mono shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Country</label>
                    <select
                      value={country} onChange={e => setCountry(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-brand-500 shadow-2xs"
                    >
                      <option value="India">India</option>
                      <option value="USA">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="UAE">UAE</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </section>
              <section>
                <h3 className="text-xs font-bold text-stone-700 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-600" /> Order Items
                </h3>
                <div className="relative mb-3 sm:mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text" value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="Search products by name to add..."
                    className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-brand-500 shadow-2xs"
                  />
                  {(searchResults.length > 0 || searchLoading) && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-xl z-20 overflow-hidden max-h-60 overflow-y-auto">
                      {searchLoading ? (
                        <div className="flex items-center gap-2 px-4 py-3 text-xs text-stone-500">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" /> Searching products...
                        </div>
                      ) : (
                        searchResults.map(p => (
                          <button
                            key={p._id} type="button"
                            onClick={() => addItem(p)}
                            className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-stone-50 transition-colors text-left border-b border-stone-100 last:border-0"
                          >
                            <img src={p.thumbnail} alt={p.title} className="w-8 h-8 rounded-lg object-cover border border-stone-200 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-stone-900 truncate">{p.title}</div>
                              <div className="text-[11px] text-emerald-700 font-bold font-mono">₹{(p.discountPrice || p.price).toFixed(0)}</div>
                            </div>
                            <Plus className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {orderItems.length === 0 ? (
                  <div className="p-5 sm:p-6 text-center text-xs text-stone-500 bg-stone-50 border border-dashed border-stone-300 rounded-xl">
                    No items added yet — click <strong className="text-brand-600">Quick Auto-Fill</strong> above or search products to add
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item) => {
                      const itemProfitPerPiece = item.soldPrice - item.costPrice;
                      const totalLineProfit = itemProfitPerPiece * item.quantity;
                      const marginPct = item.soldPrice > 0 ? (itemProfitPerPiece / item.soldPrice) * 100 : 0;
                      const isHealthy = marginPct >= 30;
                      const isWarning = marginPct < 15;

                      return (
                        <div
                          key={item.product}
                          className="p-3.5 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-3 transition-all hover:border-brand-300"
                        >
                          {/* Row 1: Item Info, Quantity Stepper, Line Total, Trash */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0 shadow-2xs"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-black text-stone-900 truncate">{item.name}</div>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-[11px] text-stone-500 font-medium">
                                    Catalog: <span className="font-mono font-bold text-stone-700">₹{item.price.toFixed(0)}</span>
                                  </span>
                                  {item.costPrice > 0 && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-mono font-semibold border border-stone-200">
                                      COGS Cost: ₹{item.costPrice.toFixed(0)}
                                    </span>
                                  )}
                                  {item.minBargainPrice && item.minBargainPrice > 0 && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono font-semibold border border-purple-200">
                                      Min Deal Floor: ₹{item.minBargainPrice.toFixed(0)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => changeQty(item.product, item.quantity - 1)}
                                  className="w-7 h-7 rounded-lg bg-stone-100 border border-stone-200 text-stone-700 flex items-center justify-center hover:bg-stone-200 transition-all text-sm font-bold"
                                >
                                  −
                                </button>
                                <span className="w-7 text-center text-xs font-bold text-stone-900 font-mono">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => changeQty(item.product, item.quantity + 1)}
                                  className="w-7 h-7 rounded-lg bg-stone-100 border border-stone-200 text-stone-700 flex items-center justify-center hover:bg-stone-200 transition-all text-sm font-bold"
                                >
                                  +
                                </button>
                              </div>

                              <div className="text-right">
                                <div className="text-[10px] text-stone-500 uppercase font-semibold">Subtotal</div>
                                <div className="text-xs font-black text-emerald-700 font-mono">
                                  ₹{(item.soldPrice * item.quantity).toFixed(0)}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeItem(item.product)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Row 2: Bargain Toggle Switch & Real-time Margin Intelligence */}
                          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                              {/* Toggle: Without Bargain vs With Bargain */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
                                  Sale Mode:
                                </span>
                                <div className="inline-flex rounded-xl bg-white border border-stone-200 p-0.5 text-xs shadow-2xs">
                                  <button
                                    type="button"
                                    onClick={() => toggleBargain(item.product, false)}
                                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 ${
                                      !item.isBargained
                                        ? 'bg-stone-900 text-white shadow-2xs'
                                        : 'text-stone-500 hover:text-stone-900'
                                    }`}
                                  >
                                    <Tag className="w-3 h-3" />
                                    <span>Without Bargain (Standard)</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleBargain(item.product, true)}
                                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 ${
                                      item.isBargained
                                        ? 'bg-brand-500 text-white shadow-2xs'
                                        : 'text-stone-500 hover:text-stone-900'
                                    }`}
                                  >
                                    <Handshake className="w-3 h-3" />
                                    <span>With Bargain (Negotiated)</span>
                                  </button>
                                </div>
                              </div>

                              {/* Real-time Line Profit Badge */}
                              <div className="self-start sm:self-auto">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono border ${
                                    isHealthy
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : isWarning
                                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}
                                  title={`Cost: ₹${(item.costPrice * item.quantity).toFixed(0)} | Revenue: ₹${(item.soldPrice * item.quantity).toFixed(0)}`}
                                >
                                  <TrendingUp className="w-3 h-3" />
                                  <span>
                                    Profit: {totalLineProfit >= 0 ? `+₹${totalLineProfit.toFixed(0)}` : `-₹${Math.abs(totalLineProfit).toFixed(0)}`}
                                  </span>
                                  <span className="opacity-80 font-medium">({marginPct.toFixed(1)}% margin)</span>
                                </span>
                              </div>
                            </div>

                            {/* If With Bargain is enabled: show bargained price input and negotiation feedback */}
                            {item.isBargained && (
                              <div className="pt-2.5 border-t border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <label className="text-[11px] font-bold text-stone-700 whitespace-nowrap flex items-center gap-1">
                                    🤝 Bargained Sold Price (₹):
                                  </label>
                                  <div className="relative w-36">
                                    <input
                                      type="number"
                                      min="0"
                                      step="any"
                                      value={item.bargainedPrice}
                                      onChange={(e) => changeBargainedPrice(item.product, Number(e.target.value))}
                                      className="w-full bg-white border border-brand-400 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
                                      placeholder="Deal price..."
                                    />
                                  </div>

                                  {item.price > item.soldPrice && (
                                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md whitespace-nowrap">
                                      Discount Given: -₹{(item.price - item.soldPrice).toFixed(0)} (-{(((item.price - item.soldPrice) / item.price) * 100).toFixed(0)}%)
                                    </span>
                                  )}
                                </div>

                                {/* Warning Badges */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  {item.minBargainPrice && item.soldPrice < item.minBargainPrice && (
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                                      <AlertCircle className="w-3 h-3 shrink-0" />
                                      <span>Below floor (₹{item.minBargainPrice.toFixed(0)})</span>
                                    </div>
                                  )}
                                  {item.costPrice > 0 && item.soldPrice < item.costPrice && (
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                                      <ShieldAlert className="w-3 h-3 shrink-0" />
                                      <span>Loss: Selling below cost (₹{item.costPrice.toFixed(0)})!</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
              <section>
                <h3 className="text-xs font-bold text-stone-700 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-brand-600" /> Payment & Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-brand-500 shadow-2xs"
                    >
                      <option value="CashOnDelivery">Cash on Delivery</option>
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="CreditCard">Credit / Debit Card</option>
                      <option value="BankTransfer">Bank Transfer / NEFT</option>
                      <option value="PayPal">PayPal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Order Status</label>
                    <select
                      value={orderStatus} onChange={e => setOrderStatus(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-brand-500 shadow-2xs"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Shipping Charge (₹)</label>
                    <input
                      type="number" min="0" value={shippingPrice}
                      onChange={e => setShippingPrice(Number(e.target.value))}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-brand-500 font-mono shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Tracking Number (optional)</label>
                    <input
                      type="text" value={trackingNumber}
                      onChange={e => setTrackingNumber(e.target.value)}
                      placeholder="e.g. IN1234567890"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-brand-500 font-mono shadow-2xs"
                    />
                  </div>
                </div>
              </section>
              {orderItems.length > 0 && (
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 shadow-2xs space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-900 border-b border-stone-200 pb-2">
                    <span className="uppercase tracking-wider">Financial & Profitability Breakdown</span>
                    <span className="text-[10px] text-brand-700 font-extrabold uppercase bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Admin Insights
                    </span>
                  </div>

                  <div className="flex justify-between text-stone-600">
                    <span>Catalog Items Subtotal:</span>
                    <span className="font-bold text-stone-900 font-mono">₹{orderItems.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(0)}</span>
                  </div>

                  {totalBargainSavings > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span className="flex items-center gap-1">
                        <Handshake className="w-3.5 h-3.5" />
                        <span>Bargain Savings Given:</span>
                      </span>
                      <span className="font-bold font-mono">-₹{totalBargainSavings.toFixed(0)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-stone-600">
                    <span>Sold Subtotal:</span>
                    <span className="font-bold text-stone-900 font-mono">₹{itemsPrice.toFixed(0)}</span>
                  </div>

                  <div className="flex justify-between text-stone-600">
                    <span>Shipping Fee:</span>
                    <span className="font-bold text-stone-900 font-mono">
                      {shippingPrice === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${shippingPrice.toFixed(0)}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-stone-700 font-medium pt-1.5 border-t border-stone-200">
                    <span>Total Manufacturing Cost (COGS):</span>
                    <span className="font-bold text-stone-900 font-mono">₹{totalCost.toFixed(0)}</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-700" />
                      <span className="font-bold text-emerald-950">Total Net Profit:</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-black font-mono ${totalProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {totalProfit >= 0 ? `+₹${totalProfit.toFixed(0)}` : `-₹${Math.abs(totalProfit).toFixed(0)}`}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-800 ml-1.5 font-mono">
                        ({overallMargin.toFixed(1)}% margin)
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center font-black text-stone-900 text-sm pt-2 border-t border-stone-200">
                    <span>Total Payable by Customer:</span>
                    <span className="text-base text-brand-700 font-mono">₹{totalPrice.toFixed(0)}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 px-4 sm:px-7 py-3.5 sm:py-5 border-t border-stone-200 bg-white shrink-0">
              <button type="button" onClick={onClose}
                className="px-4 sm:px-5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={isSubmitting}
                className="px-5 sm:px-8 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-500/25 flex items-center gap-2 transition-all active:scale-95"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving Order...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Save Order to Database</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
