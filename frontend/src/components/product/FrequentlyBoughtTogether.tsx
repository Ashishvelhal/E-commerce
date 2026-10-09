import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Check, Loader2 } from 'lucide-react';
import { Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';
import { formatINR } from '../../utils/formatters';
import api from '../../services/api';

export interface FrequentlyBoughtProduct {
  id: string;
  title: string;
  imageUrl: string;
  priceInMinorUnit: number;
  currency: string;
  isCurrentProduct: boolean;
  originalPriceInMinorUnit?: number;
}

export interface FrequentlyBoughtTogetherResponse {
  currentProduct: FrequentlyBoughtProduct;
  recommendations: FrequentlyBoughtProduct[];
}

interface FrequentlyBoughtTogetherProps {
  productId: string;
}

export const FrequentlyBoughtTogether: React.FC<FrequentlyBoughtTogetherProps> = ({ productId }) => {
  const [data, setData] = useState<FrequentlyBoughtTogetherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);

  const { addItem } = useCartStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await api.get(`/products/${productId}/frequently-bought-together`);
        if (res.data?.success && res.data?.data) {
          const payload: FrequentlyBoughtTogetherResponse = res.data.data;
          setData(payload);
          // Select all by default
          const ids = new Set<string>();
          if (payload.currentProduct) ids.add(payload.currentProduct.id);
          payload.recommendations.forEach(r => ids.add(r.id));
          setSelectedIds(ids);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching frequently bought together recommendations:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchRecommendations();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="border-t border-art-800 pt-10 mt-10 space-y-6">
        <div className="h-6 w-56 bg-art-800 animate-pulse rounded-lg" />
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6">
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-44 h-48 bg-art-800 animate-pulse rounded-2xl" />
            <div className="text-xl text-art-600 hidden sm:block">+</div>
            <div className="w-full sm:w-44 h-48 bg-art-800 animate-pulse rounded-2xl" />
            <div className="text-xl text-art-600 hidden sm:block">+</div>
            <div className="w-full sm:w-44 h-48 bg-art-800 animate-pulse rounded-2xl" />
          </div>
          <div className="w-full lg:w-64 p-6 bg-art-900 border border-art-800 rounded-2xl h-36 animate-pulse" />
        </div>
      </div>
    );
  }

  // Do not render section if error or no recommendations (or less than 1 recommendation)
  if (error || !data || !data.recommendations || data.recommendations.length === 0) {
    return null;
  }

  const allItems = [data.currentProduct, ...data.recommendations];
  const selectedItems = allItems.filter(item => selectedIds.has(item.id));
  const totalMinorUnit = selectedItems.reduce((sum, item) => sum + item.priceInMinorUnit, 0);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatCurrency = (minorUnit: number) => {
    return formatINR(minorUnit, true, false);
  };

  const handleAddAllToCart = async () => {
    if (selectedItems.length === 0) {
      addToast('Please select at least one item to add.', 'warning');
      return;
    }

    setIsAdding(true);
    try {
      // Simulate small bulk add latency or trigger adding immediately
      selectedItems.forEach(item => {
        const productObj: Product = {
          _id: item.id,
          title: item.title,
          price: item.priceInMinorUnit / 100,
          thumbnail: item.imageUrl,
          stock: 99,
          slug: item.id,
          description: '',
          category: '',
          images: [item.imageUrl],
          specifications: [],
          isFeatured: false,
          isTrending: false,
          ratingsAverage: 5,
          ratingsCount: 1,
          createdAt: '',
          updatedAt: '',
        };
        addItem(productObj, 1);
      });
      addToast(`Added ${selectedItems.length} items to your cart!`, 'success');
    } catch (err) {
      addToast('Failed to add bundle items to cart', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const buttonText = () => {
    const count = selectedItems.length;
    if (count === 0 || count === 1) return 'Add to Cart';
    return `Add all ${count} to Cart`;
  };

  return (
    <div className="border-t border-art-800 pt-10 mt-10 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-art-300" style={{ fontFamily: "'Playfair Display', serif" }}>
          Frequently bought together
        </h2>
        <p className="text-xs text-art-500 mt-1">Complement your selection with these popular companion pieces</p>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch gap-6">
        {/* Bundled Product Cards */}
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-4">
          {allItems.map((item, index) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <React.Fragment key={item.id}>
                {index > 0 && (
                  <div className="text-art-600 font-bold text-xl px-1 hidden sm:block">
                    <Plus className="w-5 h-5 text-art-700" />
                  </div>
                )}
                <div
                  className={`relative flex-1 w-full sm:w-44 p-4 bg-white border rounded-2xl shadow-sm transition-all duration-300 flex flex-col justify-between ${
                    isSelected ? 'border-art-800' : 'border-art-800/40 opacity-60'
                  }`}
                >
                  {/* Custom Checkbox in top right */}
                  <button
                    type="button"
                    onClick={() => toggleSelection(item.id)}
                    className={`absolute top-3 right-3 w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-brand-500 border-brand-500 text-white'
                        : 'border-art-800 hover:border-brand-500'
                    }`}
                    aria-label={`Select ${item.title}`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="space-y-3">
                    <div className="aspect-square w-full rounded-xl overflow-hidden bg-art-950 border border-art-800 flex items-center justify-center p-2 mt-4 sm:mt-2">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-art-300 line-clamp-2 min-h-[32px] leading-tight">
                        {item.isCurrentProduct && <span className="text-brand-700 font-black">This item: </span>}
                        {item.title}
                      </p>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-brand-700 font-mono">
                          {formatCurrency(item.priceInMinorUnit)}
                        </span>
                        {item.originalPriceInMinorUnit && (
                          <span className="text-[10px] text-art-500 line-through font-mono">
                            {formatCurrency(item.originalPriceInMinorUnit)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Pricing Summary Sidebar Card */}
        <div className="w-full lg:w-64 p-6 bg-white border border-art-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-art-500 uppercase tracking-wider">Bundle Summary</div>
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-xs font-medium text-art-600">Total Price:</span>
              <span className="text-lg font-black text-brand-700 font-mono">
                {formatCurrency(totalMinorUnit)}
              </span>
            </div>
            <p className="text-[10px] text-art-500 leading-normal">
              {selectedItems.length} of {allItems.length} items selected
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddAllToCart}
            disabled={selectedItems.length === 0 || isAdding}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-rose-600 hover:from-brand-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md glow-brand transition-all mt-4"
          >
            {isAdding ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{buttonText()}</span>
              </>
            )}
          </button>
          <div className="text-[10px] text-art-500 text-center mt-2.5 flex items-center justify-center gap-1">
            <span>ⓘ</span> These items can be purchased together.
          </div>
        </div>
      </div>
    </div>
  );
};
