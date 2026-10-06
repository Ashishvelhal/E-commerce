import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, PackageX, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { ProductFilter } from '../components/product/ProductFilter';
import { Quick3DModal } from '../components/product/Quick3DModal';
import api from '../services/api';

import { ProductCardSkeleton } from '../components/common/Skeletons';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('keyword') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [has3DOnly, setHas3DOnly] = useState(searchParams.get('has3D') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/products/categories');
        setCategories(res.data.data.names || []);
      } catch (err) {
        console.error('Error fetching categories', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);

    return () => clearTimeout(timer);
  }, [searchKeyword, selectedCategory, has3DOnly, sortBy, searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        keyword: searchKeyword || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        has3D: has3DOnly ? 'true' : undefined,
        sort: sortBy,
        limit: 24,
      };

      if (searchParams.get('featured') === 'true') params.featured = 'true';
      if (searchParams.get('trending') === 'true') params.trending = 'true';

      const res = await api.get('/products', { params });
      setProducts(res.data.data || []);
    } catch (err) {
      console.error('Error fetching products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedCategory('all');
    setHas3DOnly(false);
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-8 space-y-8">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-widest font-sans">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Index</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-art-300" style={{ fontFamily: "'Playfair Display', serif" }}>Full Spatial Catalog</h1>
        <p className="text-xs sm:text-sm text-art-500">
          Discover cutting edge gear with 360-degree real-time WebGL previews.
        </p>
      </div>
      <ProductFilter
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (cat === 'all') {
            searchParams.delete('category');
          } else {
            searchParams.set('category', cat);
          }
          setSearchParams(searchParams);
        }}
        has3DOnly={has3DOnly}
        onToggle3DOnly={() => setHas3DOnly(!has3DOnly)}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onReset={handleResetFilters}
      />
      {loading ? (
        <ProductCardSkeleton count={8} />
      ) : products.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-art-800 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-art-900 flex items-center justify-center mx-auto text-art-600">
            <PackageX className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-art-300">No products found</h3>
          <p className="text-xs text-art-500 max-w-sm mx-auto">
            Try adjusting your search keyword, category, or filter parameters.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-3 px-5 py-2 rounded-xl bg-art-850 hover:bg-art-800 text-art-300 text-xs font-bold transition-all"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 sm:gap-8"
        >
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onQuickView3D={(p) => setQuickViewProduct(p)}
            />
          ))}
        </motion.div>
      )}
      <Quick3DModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
