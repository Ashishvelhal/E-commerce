import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Box, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { RatingStars } from '../common/RatingStars';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

interface ProductCardProps {
  product: Product;
  onQuickView3D?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView3D }) => {
  const { addItem } = useCartStore();
  const { isInWishlist, toggleWishlist } = useAuthStore();
  const { addToast } = useToastStore();
  const [isHovered, setIsHovered] = useState(false);

  const isLiked = isInWishlist(product._id);
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    addToast(`"${product.title}" added to cart ✨`, 'success');
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product._id);
    addToast(isLiked ? 'Removed from wishlist' : 'Saved to wishlist ♥', 'success');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col rounded-3xl bg-art-900/80 border border-art-700/60 hover:border-brand-600/50 transition-all duration-400 overflow-hidden art-card-shadow hover:shadow-gold"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-art-850 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 to-rose-500/0 group-hover:from-brand-500/10 group-hover:to-rose-600/10 transition-all duration-500" />

        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.model3d?.url && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-plum-900/80 backdrop-blur-md border border-plum-500/40 text-[10px] font-bold text-plum-300">
              <Box className="w-3 h-3" />
              <span>3D VIEW</span>
            </span>
          )}
          {hasDiscount && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-brand-600 to-rose-600 text-white text-[10px] font-bold shadow-md">
              -{discountPercent}% OFF
            </span>
          )}
        </div>
        {product.model3d?.url && onQuickView3D && (
          <div className="absolute inset-0 bg-art-950/60 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView3D(product); }}
              className="px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-brand-600 text-white border border-brand-500/50 text-xs font-bold flex items-center gap-1.5 shadow-xl transition-all scale-95 hover:scale-100 glow-brand"
            >
              <Box className="w-4 h-4 text-brand-300" />
              <span>Quick 3D Inspect</span>
            </button>
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-700 tracking-widest uppercase mb-1.5 font-sans">
            <Sparkles className="w-3 h-3 opacity-70" />
            {product.category}
          </div>

          <Link to={`/product/${product.slug}`}>
            <h3 className="text-sm font-bold text-art-400 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
              {product.title}
            </h3>
          </Link>

          <div className="mt-2">
            <RatingStars rating={product.ratingsAverage} count={product.ratingsCount} size="sm" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-art-700/60 flex items-center justify-between">
          <div className="flex flex-col">
            {hasDiscount ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-art-300 font-mono">
                  ₹{product.discountPrice?.toFixed(0)}
                </span>
                <span className="text-xs text-art-600 line-through font-mono">
                  ₹{product.price.toFixed(0)}
                </span>
              </div>
            ) : (
              <span className="text-base font-black text-art-300 font-mono">
                ₹{product.price.toFixed(0)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="p-2.5 rounded-xl bg-art-850 hover:bg-gradient-to-br hover:from-brand-600 hover:to-rose-600 text-art-400 hover:text-white border border-art-700/60 hover:border-brand-500/80 transition-all shadow-sm active:scale-95 group/btn"
            title="Add to Cart"
          >
            <ShoppingBag className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
