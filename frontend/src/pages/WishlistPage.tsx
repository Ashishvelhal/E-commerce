import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useToastStore } from '../store/useToastStore';
import { formatINR } from '../utils/formatters';
import api from '../services/api';

export const WishlistPage: React.FC = () => {
  const { user, toggleWishlist } = useAuthStore();
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.data?.wishlist) {
          setWishlistProducts(res.data.data.wishlist);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user?.wishlist]);

  const handleRemove = async (productId: string) => {
    await toggleWishlist(productId);
    setWishlistProducts((prev) => prev.filter((p) => p._id !== productId));
    addToast('Removed from wishlist', 'info');
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    addToast(`Added "${product.title}" to cart!`, 'success');
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-brand-600">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest text-art-500">
          Loading Saved Wishlist...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1
          className="text-3xl font-bold text-art-300"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          My Saved Wishlist
        </h1>
        <p className="text-xs text-art-500 mt-1">
          Keep track of luxury handcrafted resin art pieces you wish to collect.
        </p>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-art-800 space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-200">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-art-300">Your wishlist is empty</h3>
          <p className="text-xs text-art-500 max-w-sm mx-auto">
            Click the heart icon on any art piece in our 3D gallery to save it for later.
          </p>
          <Link
            to="/shop"
            className="mt-3 inline-block px-5 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-lg glow-brand transition-all"
          >
            Explore Art Gallery
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlistProducts.map((product) => (
            <div
              key={product._id}
              className="p-5 rounded-3xl bg-white border border-art-800 flex flex-col justify-between space-y-4 hover:border-brand-500/40 transition-all shadow-sm group"
            >
              <div className="space-y-3">
                <div className="aspect-square rounded-2xl overflow-hidden bg-art-950 flex items-center justify-center p-3 border border-art-800">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">
                    {product.category}
                  </span>
                  <Link to={`/product/${product.slug}`} className="block hover:text-brand-600">
                    <h3 className="text-sm font-bold text-art-300 line-clamp-1 mt-0.5">{product.title}</h3>
                  </Link>
                  <div className="text-sm font-black text-art-300 font-mono mt-1">
                    {formatINR(product.discountPrice || product.price)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-art-800">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md glow-brand transition-all"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add To Cart</span>
                </button>

                <button
                  onClick={() => handleRemove(product._id)}
                  className="p-2.5 rounded-xl bg-art-900 hover:bg-rose-50 text-art-500 hover:text-rose-600 transition-colors border border-art-800"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
