import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Image as ImageIcon,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RefreshCw,
  Plus,
  Minus,
  Sparkles,
  ChevronRight,
  Palette,
  Check,
  Loader2,
  Info,
} from 'lucide-react';
import { Product, Review } from '../types';
import { ProductCanvas } from '../components/3d/ProductCanvas';
import { ReviewAnnotationViewer } from '../components/3d/ReviewAnnotationViewer';
import { ReviewList } from '../components/review/ReviewList';
import { ReviewModal } from '../components/review/ReviewModal';
import { RatingStars } from '../components/common/RatingStars';
import { useCartStore } from '../store/useCartStore';
import { useToastStore } from '../store/useToastStore';
import api from '../services/api';
import { FrequentlyBoughtTogether } from '../components/product/FrequentlyBoughtTogether';
import { ProductLoadingScreen } from '../components/common/ProductLoadingScreen';

export const ProductDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedColorName, setSelectedColorName] = useState<string | undefined>(undefined);

  const [quantity, setQuantity] = useState(1);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const { addItem } = useCartStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      setLoading(true);
      try {
        const prodRes = await api.get(`/products/${slug}`);
        const prodData: Product = prodRes.data.data;
        setProduct(prodData);

        if (prodData.model3d?.availableColors?.[0]) {
          setSelectedColor(prodData.model3d.availableColors[0].hex);
          setSelectedColorName(prodData.model3d.availableColors[0].name);
        }

        if (!prodData.model3d?.url) {
          setViewMode('2D');
        }

        const revRes = await api.get(`/reviews/product/${prodData._id}`);
        setReviews(revRes.data.data || []);
      } catch (error) {
        console.error('Error loading product details', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProductAndReviews();
    }
  }, [slug]);

  const reloadReviews = async () => {
    if (!product) return;
    try {
      const res = await api.get(`/reviews/product/${product._id}`);
      setReviews(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <ProductLoadingScreen
        productTitle={slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : undefined}
      />
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-art-300">Product Not Found</h2>
        <Link to="/shop" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity, selectedColorName);
    addToast(`Added ${quantity}x "${product.title}" to cart! ✨`, 'success');
  };

  return (
    <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-8 space-y-16">
      <nav className="flex items-center gap-2 text-xs text-art-500">
        <Link to="/" className="hover:text-art-300 transition-colors hover:underline">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-art-300 transition-colors hover:underline">Catalog</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-art-300 transition-colors hover:underline">
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-art-400 truncate max-w-xs">{product.title}</span>
      </nav>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 space-y-4">
          {product.model3d?.url && (
            <div className="flex items-center justify-between bg-white p-1.5 rounded-2xl border border-art-800 shadow-sm">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode('3D')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    viewMode === '3D'
                      ? 'bg-brand-600 text-white shadow-lg glow-brand'
                      : 'text-art-500 hover:text-art-300'
                  }`}
                >
                  <Box className="w-4 h-4" />
                  <span>Interactive 3D Orbit</span>
                </button>

                <button
                  onClick={() => setViewMode('2D')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    viewMode === '2D'
                      ? 'bg-rose-600 text-white shadow-lg glow-rose'
                      : 'text-art-500 hover:text-art-300'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>High-Res Photo Gallery</span>
                </button>
              </div>

              <span className="text-[11px] text-art-600 hidden sm:inline px-3 font-mono">
                WebGL 2.0 Engine
              </span>
            </div>
          )}
          {viewMode === '3D' && product.model3d?.url ? (
            <ProductCanvas
              modelConfig={product.model3d}
              selectedColor={selectedColor}
              className="h-[460px] sm:h-[520px] w-full"
            />
          ) : (
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-art-800 flex items-center justify-center p-8">
              <img
                src={product.images[selectedImageIndex] || product.thumbnail}
                alt={product.title}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImageIndex(idx);
                    setViewMode('2D');
                  }}
                  className={`w-20 h-20 rounded-xl overflow-hidden bg-white border flex-shrink-0 transition-all ${
                    viewMode === '2D' && selectedImageIndex === idx
                      ? 'border-brand-500 ring-2 ring-brand-500/40 scale-105'
                      : 'border-art-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-brand-700 uppercase tracking-widest font-sans">
                {product.brand || 'Rasin Arts Studio'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-art-300 mt-1.5 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              {product.title}
            </h1>
            <div className="mt-3 flex items-center gap-3">
              <RatingStars rating={product.ratingsAverage} size="sm" showNumber />
              <a href="#reviews" className="text-xs text-brand-700 hover:underline font-semibold">
                Read {reviews.length} Verified Reviews
              </a>
            </div>
            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl font-black text-art-300 font-mono">
                ₹{(product.discountPrice || product.price).toFixed(0)}
              </span>
              {product.discountPrice && (
                <span className="text-base text-art-500 line-through font-mono">
                  ₹{product.price.toFixed(0)}
                </span>
              )}
            </div>
            <div className="mt-2 text-xs flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  product.stock > 5 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
              />
              <span className="text-art-400 font-medium">
                {product.stock > 5
                  ? `In Stock (${product.stock} units available)`
                  : product.stock > 0
                  ? `Only ${product.stock} left in stock - order soon`
                  : 'Out of Stock'}
              </span>
            </div>
          </div>

          <p className="text-xs text-art-500 leading-relaxed pt-2 border-t border-art-800">
            {product.description}
          </p>
          {product.model3d?.availableColors && product.model3d.availableColors.length > 0 && (
            <div className="p-4 rounded-2xl bg-white border border-art-800 space-y-3 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-art-400 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-brand-600" />
                  <span>Finish / Colorway:</span>
                </span>
                <span className="font-bold text-brand-700">{selectedColorName}</span>
              </div>

              <div className="flex items-center gap-3">
                {product.model3d.availableColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => {
                      setSelectedColor(color.hex);
                      setSelectedColorName(color.name);
                      if (viewMode !== '3D') setViewMode('3D');
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      selectedColor === color.hex
                        ? 'ring-2 ring-brand-400 ring-offset-2 ring-offset-white scale-110 shadow-lg'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColor === color.hex && (
                      <Check className="w-4 h-4 text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 bg-white border border-art-800 rounded-xl px-3 py-2.5 shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-art-500 hover:text-brand-600 p-0.5"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-art-300 w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="text-art-500 hover:text-brand-600 p-0.5"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-rose-600 hover:from-brand-500 hover:to-rose-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl glow-brand transition-all active:scale-[0.98]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart • ₹{((product.discountPrice || product.price) * quantity).toFixed(0)}</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-art-800 text-[11px] text-art-500">
            <div className="flex flex-col items-center text-center gap-1 p-2 rounded-xl bg-white border border-art-800 shadow-sm">
              <Truck className="w-4 h-4 text-brand-600" />
              <span>Complimentary Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1 p-2 rounded-xl bg-white border border-art-800 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Premium Quality</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1 p-2 rounded-xl bg-white border border-art-800 shadow-sm">
              <RefreshCw className="w-4 h-4 text-rose-600" />
              <span>7-Day Returns</span>
            </div>
          </div>
        </div>
      </div>
      <FrequentlyBoughtTogether productId={product._id} />
      <div className="border-t border-art-800 pt-12 space-y-8">
        <h2 className="text-2xl font-bold text-art-300" style={{ fontFamily: "'Playfair Display', serif" }}>Details & Specifications</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-art-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-brand-700 uppercase tracking-wider font-sans">
              Technical Specifications
            </h3>
            <div className="divide-y divide-art-800 text-xs">
              {product.specifications?.map((spec, i) => (
                <div key={i} className="py-2.5 flex justify-between">
                  <span className="text-art-500">{spec.key}</span>
                  <span className="font-semibold text-art-300">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-art-800 space-y-3 shadow-sm">
            <h3 className="text-sm font-bold text-plum-700 uppercase tracking-wider font-sans">
              Product Overview & Design
            </h3>
            <p className="text-xs text-art-500 leading-relaxed">
              {product.richDetails || product.description}
            </p>
          </div>
        </div>
      </div>
      <div id="reviews" className="border-t border-art-800 pt-12 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-widest font-sans">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Feedback</span>
          </div>
          <h2 className="text-2xl font-bold text-art-300 mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>Customer Reviews & 3D Hotspots</h2>
        </div>
        {product.model3d?.url && reviews.some((r) => r.modelAnnotation?.point) && (
          <ReviewAnnotationViewer
            modelUrl={product.model3d.url}
            reviews={reviews}
            selectedReviewId={selectedReviewId}
            onSelectReview={(r) => setSelectedReviewId(r._id)}
          />
        )}
        <ReviewList
          productId={product._id}
          reviews={reviews}
          onOpenReviewModal={() => setIsReviewModalOpen(true)}
          selectedReviewId={selectedReviewId}
          onSelectReviewAnnotation={(r) => setSelectedReviewId(r._id)}
          onReviewDeleted={reloadReviews}
        />
      </div>
      <ReviewModal
        productId={product._id}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onReviewCreated={reloadReviews}
      />
    </div>
  );
};

export default ProductDetailsPage;
