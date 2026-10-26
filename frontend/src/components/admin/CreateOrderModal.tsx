import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Trash2, Search, ShoppingBag, User, Phone,
  MapPin, CreditCard, CheckCircle2, Loader2, Package,
  TrendingUp, AlertCircle, Tag, Handshake, ShieldAlert
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
          className="relative w-full max-w-3xl bg-white border border-art-800 rounded-2xl sm:rounded-3xl shadow-2xl z-10 my-3 sm:my-8 flex flex-col max-h-[92vh] overflow-hidden"
        >
          <div className="h-[3px] bg-gradient-to-r from-brand-500 via-rose-500 to-plum-600 shrink-0" />
          <div className="flex items-center justify-between px-4 sm:px-7 py-3.5 sm:py-5 border-b border-art-800 shrink-0 bg-white">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-brand-50 border border-brand-200 shrink-0">
                <ShoppingBag className="w-5 h-5 text-brand-700" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-art-300 font-poppins truncate">
                  Create New Order
                </h2>
                <p className="text-[11px] sm:text-xs text-art-500 truncate">Manually record a phone or walk-in customer order</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-art-500 hover:text-art-300 hover:bg-art-950 border border-art-800 transition-all shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 flex flex-col justify-between">
            <div className="p-4 sm:p-7 space-y-6 sm:space-y-8">
              <section>
                <h3 className="text-xs font-bold text-art-400 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-600" /> Customer Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-art-400 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text" value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full bg-art-950 border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-art-400 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-art-600" />
                      <input
                        type="tel" value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-art-950 border border-art-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500 font-mono"
                        required
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-art-400 mb-1">Email (optional)</label>
                    <input
                      type="email" value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      placeholder="customer@email.com"
                      className="w-full bg-art-950 border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </section>
              <section>
                <h3 className="text-xs font-bold text-art-400 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-600" /> Delivery Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-art-400 mb-1">
                      Street / House No. <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text" value={street}
                      onChange={e => setStreet(e.target.value)}
                      placeholder="e.g. 12, MG Road, Flat 3B"
                      className="w-full bg-art-950 border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-art-400 mb-1">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text" value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="w-full bg-art-950 border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-art-400 mb-1">State</label>
                    <input
                      type="text" value={state}
                      onChange={e => setState(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="w-full bg-art-950 border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-art-400 mb-1">Postal Code</label>
                    <input
                      type="text" value={postalCode}
                      onChange={e => setPostalCode(e.target.value)}
                      placeholder="e.g. 400001"
                      className="w-full bg-art-950 border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-art-400 mb-1">Country</label>
                    <select
                      value={country} onChange={e => setCountry(e.target.value)}
                      className="w-full bg-art-950 border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
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
                <h3 className="text-xs font-bold text-art-400 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-600" /> Order Items
                </h3>
                <div className="relative mb-3 sm:mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-art-600" />
                  <input
                    type="text" value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="Search products by name to add..."
                    className="w-full bg-art-950 border border-art-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
                  />
                  {(searchResults.length > 0 || searchLoading) && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-art-800 rounded-xl shadow-xl z-20 overflow-hidden max-h-60 overflow-y-auto">
                      {searchLoading ? (
                        <div className="flex items-center gap-2 px-4 py-3 text-xs text-art-500">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching...
                        </div>
                      ) : (
                        searchResults.map(p => (
                          <button
                            key={p._id} type="button"
                            onClick={() => addItem(p)}
                            className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-art-950 transition-colors text-left border-b border-art-800 last:border-0"
                          >
                            <img src={p.thumbnail} alt={p.title} className="w-8 h-8 rounded-lg object-cover border border-art-800 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-art-300 truncate">{p.title}</div>
                              <div className="text-[11px] text-brand-700 font-bold font-mono">₹{(p.discountPrice || p.price).toFixed(0)}</div>
                            </div>
                            <Plus className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {orderItems.length === 0 ? (
                  <div className="p-5 sm:p-6 text-center text-xs text-art-500 bg-art-950 border border-dashed border-art-800 rounded-xl">
                    No items added yet — search and select products above
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
                          className="p-3.5 bg-white border border-art-800 rounded-2xl shadow-xs space-y-3 transition-all hover:border-brand-200"
                        >
                          {/* Row 1: Item Info, Quantity Stepper, Line Total, Trash */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 rounded-xl object-cover border border-art-800 shrink-0 shadow-xs"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-art-300 truncate">{item.name}</div>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-[11px] text-art-500 font-medium">
                                    Catalog: <span className="font-mono font-bold text-art-400">₹{item.price.toFixed(0)}</span>
                                  </span>
                                  {item.costPrice > 0 && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-semibold border border-slate-200">
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

                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-art-800/40">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => changeQty(item.product, item.quantity - 1)}
                                  className="w-7 h-7 rounded-lg bg-art-950 border border-art-800 text-art-400 flex items-center justify-center hover:bg-art-900 transition-all text-sm font-bold"
                                >
                                  −
                                </button>
                                <span className="w-7 text-center text-xs font-bold text-art-300">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => changeQty(item.product, item.quantity + 1)}
                                  className="w-7 h-7 rounded-lg bg-art-950 border border-art-800 text-art-400 flex items-center justify-center hover:bg-art-900 transition-all text-sm font-bold"
                                >
                                  +
                                </button>
                              </div>

                              <div className="text-right">
                                <div className="text-[10px] text-art-500 uppercase font-semibold">Subtotal</div>
                                <div className="text-xs font-black text-brand-700 font-mono">
                                  ₹{(item.soldPrice * item.quantity).toFixed(0)}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeItem(item.product)}
                                className="p-1.5 rounded-lg text-art-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Row 2: Bargain Toggle Switch & Real-time Margin Intelligence */}
                          <div className="p-3 rounded-xl bg-art-950 border border-art-800 space-y-2.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                              {/* Toggle: Without Bargain vs With Bargain */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] font-bold text-art-400 uppercase tracking-wider flex items-center gap-1">
                                  Sale Mode:
                                </span>
                                <div className="inline-flex rounded-xl bg-white border border-art-800 p-0.5 text-xs shadow-xs">
                                  <button
                                    type="button"
                                    onClick={() => toggleBargain(item.product, false)}
                                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 ${
                                      !item.isBargained
                                        ? 'bg-slate-900 text-white shadow-xs'
                                        : 'text-art-500 hover:text-art-300'
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
                                        ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-xs glow-brand'
                                        : 'text-art-500 hover:text-art-300'
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
                              <div className="pt-2.5 border-t border-art-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <label className="text-[11px] font-bold text-art-300 whitespace-nowrap flex items-center gap-1">
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
                <h3 className="text-xs font-bold text-art-400 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-brand-600" /> Payment & Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-art-400 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full bg-art-950 border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
                    >
                      <option value="CashOnDelivery">Cash on Delivery</option>
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="CreditCard">Credit / Debit Card</option>
                      <option value="BankTransfer">Bank Transfer / NEFT</option>
                      <option value="PayPal">PayPal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-art-400 mb-1">Order Status</label>
                    <select
                      value={orderStatus} onChange={e => setOrderStatus(e.target.value)}
                      className="w-full bg-art-950 border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-art-400 mb-1">Shipping Charge (₹)</label>
                    <input
                      type="number" min="0" value={shippingPrice}
                      onChange={e => setShippingPrice(Number(e.target.value))}
                      className="w-full bg-art-950 border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-art-400 mb-1">Tracking Number (optional)</label>
                    <input
                      type="text" value={trackingNumber}
                      onChange={e => setTrackingNumber(e.target.value)}
                      placeholder="e.g. IN1234567890"
                      className="w-full bg-art-950 border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500 font-mono"
                    />
                  </div>
                </div>
              </section>
              {orderItems.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-art-950 via-white to-brand-50/40 rounded-2xl border border-brand-200 shadow-sm space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-xs font-bold text-art-300 border-b border-art-800 pb-2">
                    <span className="uppercase tracking-wider">Financial & Profitability Breakdown</span>
                    <span className="text-[10px] text-brand-700 font-extrabold uppercase bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
                      Admin Insights
                    </span>
                  </div>

                  <div className="flex justify-between text-art-500">
                    <span>Catalog Items Subtotal:</span>
                    <span className="font-bold text-art-300 font-mono">₹{orderItems.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(0)}</span>
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

                  <div className="flex justify-between text-art-500">
                    <span>Sold Subtotal:</span>
                    <span className="font-bold text-art-300 font-mono">₹{itemsPrice.toFixed(0)}</span>
                  </div>

                  <div className="flex justify-between text-art-500">
                    <span>Shipping Fee:</span>
                    <span className="font-bold text-art-300 font-mono">
                      {shippingPrice === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${shippingPrice.toFixed(0)}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600 font-medium pt-1.5 border-t border-art-800">
                    <span>Total Manufacturing Cost (COGS):</span>
                    <span className="font-bold text-slate-800 font-mono">₹{totalCost.toFixed(0)}</span>
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

                  <div className="flex justify-between items-center font-black text-art-300 text-sm pt-2 border-t border-art-800">
                    <span>Total Payable by Customer:</span>
                    <span className="text-base text-brand-700 font-mono">₹{totalPrice.toFixed(0)}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 px-4 sm:px-7 py-3.5 sm:py-5 border-t border-art-800 bg-art-950 shrink-0">
              <button type="button" onClick={onClose}
                className="px-4 sm:px-5 py-2.5 rounded-xl border border-art-800 text-xs font-semibold text-art-500 hover:text-art-300 hover:bg-white transition-all">
                Cancel
              </button>
              <button
                type="submit" disabled={isSubmitting}
                className="px-5 sm:px-8 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold shadow-lg glow-brand flex items-center gap-2 transition-all active:scale-95"
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
