import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Truck,
  Phone,
  MapPin,
  User,
  Mail,
  ShoppingBag,
  MessageCircle,
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useToastStore } from '../store/useToastStore';
import { formatINR } from '../utils/formatters';
import { generateWhatsAppOrderUrl } from '../utils/whatsapp';
import api from '../services/api';

export const CheckoutPage: React.FC = () => {
  const { items, getSubtotal, getShippingPrice, getTaxPrice, getTotalPrice, clearCart } =
    useCartStore();
  const { settings, whatsappNumber, whatsappCheckoutEnabled } = useSettingsStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [paymentMethod, setPaymentMethod] = useState<'CreditCard' | 'Stripe' | 'PayPal'>('CreditCard');

  const subtotal = getSubtotal();
  const shipping = getShippingPrice();
  const tax = getTaxPrice();
  const total = getTotalPrice();

  const handleWhatsAppCheckout = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const url = generateWhatsAppOrderUrl({
      items,
      subtotal,
      shipping,
      total,
      whatsappNumber: settings?.whatsappNumber || whatsappNumber,
      customGreeting: settings?.whatsappCustomMessage,
      customerInfo: {
        fullName: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        street: street.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        paymentPreference: paymentMethod,
      },
    });

    addToast('📱 Redirecting to WhatsApp with your order & delivery details...', 'success');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-art-900 border border-art-800 flex items-center justify-center mx-auto text-art-600">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-art-300" style={{ fontFamily: "'Playfair Display', serif" }}>
          Your Cart is Empty
        </h2>
        <p className="text-xs text-art-500 max-w-sm mx-auto">
          Add luxury handcrafted resin art pieces to proceed to express checkout.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="mt-4 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg glow-brand transition-all"
        >
          Explore Art Catalog
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !street.trim() || !city.trim()) {
      addToast('Please provide your Full Name, Phone Number, and Delivery Address', 'warning');
      return;
    }

    const orderPayload = {
      orderItems: items.map((i) => ({
        product: i.product._id,
        name: i.product.title,
        quantity: i.quantity,
        price: i.product.discountPrice || i.product.price,
        image: i.product.thumbnail,
        selectedColor: i.selectedColor,
      })),
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim() || 'Maharashtra',
        postalCode: postalCode.trim() || '400001',
        country: country.trim() || 'India',
      },
      paymentMethod,
      itemsPrice: subtotal,
      shippingPrice: shipping,
      taxPrice: tax,
      totalPrice: total,
    };

    setIsSubmitting(true);
    try {
      const response = await api.post('/orders', orderPayload);
      const createdOrder = response.data.data;
      clearCart();
      addToast('Order placed successfully!', 'success');
      navigate(`/order-success/${createdOrder._id}`);
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-10">
      <div className="mb-8">
        <h1
          className="text-3xl font-black text-art-300"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Express Studio Checkout
        </h1>
        <p className="text-xs text-art-500 mt-1">
          Complete your contact information and delivery address below to finalize your order.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Contact Information */}
          <div className="p-6 rounded-3xl bg-white border border-art-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-brand-700 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>1. Contact Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-art-500 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ashish Sharma"
                  required
                  className="w-full bg-art-950 border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-500 mb-1">
                  Phone Number (For Delivery Confirmation) *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-art-600" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full bg-art-950 border border-art-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-art-500 mb-1">
                  Email Address (For Invoice & Updates)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-art-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com (Optional)"
                    className="w-full bg-art-950 border border-art-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Delivery Address */}
          <div className="p-6 rounded-3xl bg-white border border-art-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-plum-700 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>2. Delivery Address</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-art-500 mb-1">
                  Street Address & Flat / Building *
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Flat 402, Lotus Residency, MG Road"
                  required
                  className="w-full bg-art-950 border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-500 mb-1">City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  required
                  className="w-full bg-art-950 border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-500 mb-1">
                  State / Region *
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  required
                  className="w-full bg-art-950 border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-500 mb-1">
                  PIN Code *
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 400001"
                  required
                  className="w-full bg-art-950 border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-500 mb-1">Country *</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="India"
                  required
                  className="w-full bg-art-950 border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="p-6 rounded-3xl bg-white border border-art-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span>3. Payment Gateway</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {[
                { id: 'CreditCard', name: 'UPI / Cards / NetBanking', desc: 'Instant Razorpay / UPI' },
                { id: 'Stripe', name: 'Credit / Debit Card', desc: 'Visa, MasterCard, Rupay' },
                { id: 'PayPal', name: 'Cash on Delivery (COD)', desc: 'Pay upon delivery' },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? 'bg-brand-50 border-brand-500 ring-2 ring-brand-500/20'
                      : 'bg-art-950 border-art-800 hover:border-art-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id as any)}
                    className="hidden"
                  />
                  <div className="text-xs font-bold text-art-300">{method.name}</div>
                  <div className="text-[11px] text-art-500 mt-0.5">{method.desc}</div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-art-800 shadow-sm space-y-6 sticky top-28">
            <h2 className="text-sm font-bold text-art-300 uppercase tracking-wider font-sans">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h2>

            <div className="max-h-64 overflow-y-auto space-y-3 pr-1 divide-y divide-art-800/50">
              {items.map((item, idx) => (
                <div key={idx} className="pt-3 first:pt-0 flex items-center gap-3">
                  <img
                    src={item.product.thumbnail}
                    alt={item.product.title}
                    className="w-12 h-12 rounded-xl object-cover bg-art-900 border border-art-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-art-300 truncate">{item.product.title}</h4>
                    {item.selectedColor && (
                      <span className="text-[10px] text-brand-700 font-medium block">
                        Color: {item.selectedColor}
                      </span>
                    )}
                    <span className="text-[11px] text-art-500">Qty: {item.quantity}</span>
                  </div>
                  <div className="text-xs font-bold text-art-300 font-mono">
                    {formatINR((item.product.discountPrice || item.product.price) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 text-xs border-t border-art-800 pt-4 text-art-500">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-art-300 font-mono">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Insured Studio Delivery</span>
                <span className="font-semibold text-art-300 font-mono">
                  {shipping === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    formatINR(shipping)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST (8%)</span>
                <span className="font-semibold text-art-300 font-mono">{formatINR(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-art-300 pt-3 border-t border-art-800">
                <span>Total Amount</span>
                <span className="text-brand-700 font-mono">{formatINR(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-rose-600 hover:from-brand-500 hover:to-rose-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl glow-brand transition-all active:scale-[0.98] cursor-pointer"
            >
              {isSubmitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Place Order • {formatINR(total)}</span>
                </>
              )}
            </button>

            {/* Direct WhatsApp Order Option */}
            {whatsappCheckoutEnabled && (
              <button
                type="button"
                onClick={handleWhatsAppCheckout}
                className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/25 transition-all active:scale-[0.98] cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Complete &amp; Order via WhatsApp</span>
              </button>
            )}

            <div className="flex items-center justify-center gap-2 text-[11px] text-art-500 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-Bit SSL Encrypted • Direct Studio Dispatch</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
