import React from 'react';
import { Search, Box, RefreshCcw } from 'lucide-react';
import { CategorySkeleton } from '../common/Skeletons';

interface ProductFilterProps {
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  has3DOnly: boolean;
  onToggle3DOnly: () => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onReset: () => void;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
  searchKeyword,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  has3DOnly,
  onToggle3DOnly,
  sortBy,
  onSortChange,
  onReset,
}) => {
  return (
    <div className="space-y-4 bg-white p-5 rounded-2xl border border-art-800 backdrop-blur-md shadow-sm">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-art-500" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search our resin pours, art pieces..."
            className="w-full bg-art-950 border border-art-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onToggle3DOnly}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              has3DOnly
                ? 'bg-plum-600 text-white border-plum-500 shadow-lg glow-plum animate-none'
                : 'bg-art-900 text-plum-700 border-art-800 hover:border-plum-500/50'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>3D View Only</span>
          </button>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-art-950 border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-semibold"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="popular">Most Popular</option>
          </select>
          <button
            onClick={onReset}
            title="Reset Filters"
            className="p-2.5 rounded-xl bg-art-950 border border-art-800 text-art-500 hover:text-brand-600 hover:border-brand-500 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {categories.length === 0 ? (
        <CategorySkeleton count={7} />
      ) : (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-md glow-brand animate-none'
                : 'bg-art-900 text-art-500 hover:text-art-300 border border-art-800 hover:border-art-700'
            }`}
          >
            All Items
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-md glow-brand animate-none'
                  : 'bg-art-900 text-art-500 hover:text-art-300 border border-art-800 hover:border-art-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export default ProductFilter;
