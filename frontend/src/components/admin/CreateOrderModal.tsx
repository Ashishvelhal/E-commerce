import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Trash2, Search, ShoppingBag, User, Phone,
  MapPin, CreditCard, CheckCircle2, Loader2, Package,
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

  const itemsPrice = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
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
    setOrderItems(prev => {
      const exists = prev.find(i => i.product === product._id);
      if (exists) {
        return prev.map(i => i.product === product._id
          ? { ...i, quantity: i.quantity + 1 }
          : i
        );
      }
      return [...prev, {
        product: product._id,
        name:     product.title,
        quantity: 1,
        price:    product.discountPrice || product.price,
        image:    product.thumbnail,
      }];
    });
    setProductSearch('');
    setSearchResults([]);
  };

  const removeItem = (productId: string) =>
    setOrderItems(prev => prev.filter(i => i.product !== productId));

  const changeQty = (productId: string, qty: number) => {
    if (qty < 1) { removeItem(productId); return; }
    setOrderItems(prev => prev.map(i => i.product === productId ? { ...i, quantity: qty } : i));
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
        orderItems,
        paymentMethod,
        status: orderStatus,
        trackingNumber,
        itemsPrice,
        taxPrice: 0,
        shippingPrice,
        totalPrice,
      });
      addToast('Order created and saved successfully!', 'success');
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
                  <div className="space-y-2">
                    {orderItems.map(item => (
                      <div key={item.product} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-white border border-art-800 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-art-800 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-art-300 truncate">{item.name}</div>
                            <div className="text-[11px] text-brand-700 font-bold font-mono">₹{item.price.toFixed(0)} each</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-art-800/40">
                          <div className="flex items-center gap-1.5">
                            <button type="button" onClick={() => changeQty(item.product, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg bg-art-950 border border-art-800 text-art-400 flex items-center justify-center hover:bg-art-900 transition-all text-sm font-bold">−</button>
                            <span className="w-7 text-center text-xs font-bold text-art-300">{item.quantity}</span>
                            <button type="button" onClick={() => changeQty(item.product, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-art-950 border border-art-800 text-art-400 flex items-center justify-center hover:bg-art-900 transition-all text-sm font-bold">+</button>
                          </div>
                          <div className="text-xs font-black text-art-300 font-mono w-16 sm:w-20 text-right">
                            ₹{(item.price * item.quantity).toFixed(0)}
                          </div>
                          <button type="button" onClick={() => removeItem(item.product)}
                            className="p-1.5 rounded-lg text-art-500 hover:text-rose-600 hover:bg-rose-50 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
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
                <div className="p-4 bg-art-950 rounded-2xl border border-art-800 space-y-2 text-xs">
                  <div className="flex justify-between text-art-500">
                    <span>Items Subtotal</span>
                    <span className="font-bold text-art-300 font-mono">₹{itemsPrice.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-art-500">
                    <span>Shipping</span>
                    <span className="font-bold text-art-300 font-mono">
                      {shippingPrice === 0 ? <span style={{ color: '#15803d' }}>FREE</span> : `₹${shippingPrice.toFixed(0)}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-black text-art-300 text-sm pt-2 border-t border-art-800">
                    <span>Total Payable</span>
                    <span className="text-brand-700 font-mono">₹{totalPrice.toFixed(0)}</span>
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
