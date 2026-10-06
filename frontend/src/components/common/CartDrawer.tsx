import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Palette,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useToastStore } from '../../store/useToastStore';
import { generateWhatsAppOrderUrl } from '../../utils/whatsapp';

export const CartDrawer: React.FC = () => {
  const {
    isOpen,
    items,
    removeItem,
    updateQuantity,
    getSubtotal,
    getShippingPrice,
    getTotalPrice,
    toggleCart,
    clearCart,
  } = useCartStore();
  const { settings, whatsappNumber, whatsappCheckoutEnabled, fetchSettings } =
    useSettingsStore();
  const { addToast } = useToastStore();
  const drawerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleCart();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, toggleCart]);

  const subtotal = getSubtotal();
  const shipping = getShippingPrice();
  const total = getTotalPrice();

  const handleCheckout = () => {
    toggleCart();
    navigate('/checkout');
  };

  const handleWhatsAppCheckout = () => {
    const url = generateWhatsAppOrderUrl({
      items,
      subtotal,
      shipping,
      total,
      whatsappNumber: settings?.whatsappNumber || whatsappNumber,
      customGreeting: settings?.whatsappCustomMessage,
    });

    addToast('📱 Opening WhatsApp with your selected products & customization details...', 'success');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white border-l border-art-800 flex flex-col shadow-2xl"
          >
            <div className="h-[3px] bg-gradient-to-r from-brand-500 via-rose-500 to-plum-600" />
            <div className="flex items-center justify-between px-6 py-5 border-b border-art-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-50 border border-brand-200">
                  <ShoppingBag className="w-5 h-5 text-brand-700" />
                </div>
                <div>
                  <h2
                    className="font-bold text-art-300 text-base"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Your Cart
                  </h2>
                  <p className="text-[11px] text-art-500 font-medium">
                    {items.length} item{items.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              </div>
              <button
                onClick={toggleCart}
                className="p-2 rounded-xl text-art-500 hover:text-art-300 hover:bg-art-950 border border-art-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-art-950">
              <AnimatePresence initial={false}>
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-48 gap-4 text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white border border-art-800 flex items-center justify-center shadow-sm">
                      <Palette className="w-8 h-8 text-art-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-art-300">Your cart is empty</p>
                      <p className="text-xs text-art-500 mt-1">
                        Explore our resin art gallery or 3D studio to find your piece.
                      </p>
                    </div>
                    <Link
                      to="/shop"
                      onClick={toggleCart}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 text-white text-xs font-bold glow-brand hover:from-brand-500 transition-all"
                    >
                      Browse Gallery
                    </Link>
                  </motion.div>
                ) : (
                  items.map((item) => {
                    const title = item.product.title || (item.product as any).name || 'Handcrafted Resin Piece';
                    const imageSrc =
                      item.product.thumbnail ||
                      (Array.isArray(item.product.images) && typeof item.product.images[0] === 'string'
                        ? item.product.images[0]
                        : (item.product.images as any)?.[0]?.url) ||
                      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80';
                    const customOptions = (item.product as any).customizationOptions;

                    return (
                      <motion.div
                        key={`${item.product._id}-${item.selectedColor}`}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30, height: 0 }}
                        className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-art-800 hover:border-brand-400 transition-all shadow-sm"
                      >
                        <div className="shrink-0 relative">
                          <img
                            src={imageSrc}
                            alt={title}
                            className="w-16 h-16 rounded-xl object-cover border border-art-800"
                          />
                          {customOptions && (
                            <span className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-brand-500 text-white text-[9px] shadow">
                              <Sparkles className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4
                            className="text-xs font-bold text-art-300 leading-snug line-clamp-2 hover:text-brand-700 transition-colors"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                          >
                            {title}
                          </h4>+6
                          {customOptions && (
                            <div className="text-[10px] text-brand-700 bg-brand-50 rounded-lg p-1.5 border border-brand-200/60 space-y-0.5">
                              {customOptions.customText && (
                                <p className="font-bold truncate">
                                  ✨ Text: &quot;{customOptions.customText}&quot;
                                  {customOptions.subText ? ` (${customOptions.subText})` : ''}
                                </p>
                              )}
                              {customOptions.resinFinish && (
                                <p className="text-art-600 truncate">
                                  🎨 {customOptions.resinFinish} • {customOptions.textFinish || 'Gold'}
                                </p>
                              )}
                              {customOptions.inclusions && customOptions.inclusions.length > 0 && (
                                <p className="text-art-500 truncate">
                                  💎 {customOptions.inclusions.join(', ')}
                                </p>
                              )}
                            </div>
                          )}

                          {item.selectedColor && !customOptions && (
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-3 h-3 rounded-full border border-art-700"
                                style={{ backgroundColor: item.selectedColor }}
                              />
                              <span className="text-[11px] text-art-500">{item.selectedColor}</span>
                            </div>
                          )}

                          <div className="text-sm font-black text-brand-700 font-mono">
                            ₹{((item.product.discountPrice || item.product.price) * item.quantity).toFixed(0)}
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() =>
                                updateQuantity(item.product._id, item.quantity - 1, item.selectedColor)
                              }
                              className="w-7 h-7 rounded-lg bg-art-950 hover:bg-art-900 text-art-400 border border-art-800 flex items-center justify-center transition-all cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold text-art-300 w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product._id, item.quantity + 1, item.selectedColor)
                              }
                              className="w-7 h-7 rounded-lg bg-art-950 hover:bg-art-900 text-art-400 border border-art-800 flex items-center justify-center transition-all cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => removeItem(item.product._id, item.selectedColor)}
                              className="ml-auto p-1.5 rounded-lg text-art-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
            {items.length > 0 && (
              <div className="border-t border-art-800 px-6 py-5 space-y-3 bg-white">
                <div className="space-y-1.5 text-xs text-art-500 font-medium">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-art-300">₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="font-bold text-art-300">
                      {shipping === 0 ? (
                        <span className="text-emerald-600 font-bold">FREE</span>
                      ) : (
                        `₹${shipping.toFixed(0)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-art-300 pt-1.5 border-t border-art-800">
                    <span>Total</span>
                    <span className="text-brand-700 font-mono text-base">₹{total.toFixed(0)}</span>
                  </div>
                </div>

                {/* 1. Buy & Order via WhatsApp Button */}
                {whatsappCheckoutEnabled && (
                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/25 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Buy &amp; Order via WhatsApp</span>
                  </button>
                )}

                {/* 2. Standard Web Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-rose-500 hover:from-brand-500 hover:to-rose-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl glow-brand transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>Proceed to Express Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={clearCart}
                  className="w-full text-center text-xs text-art-500 hover:text-rose-600 font-semibold transition-colors py-1 cursor-pointer"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
