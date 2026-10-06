import React from 'react';

/**
 * Category filter pill skeletons
 */
export const CategorySkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-9 w-28 rounded-full bg-art-850 animate-pulse border border-art-800 shrink-0"
        />
      ))}
    </div>
  );
};

/**
 * Product Card Grid Skeletons
 */
export const ProductCardSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl bg-white border border-art-800 p-4 space-y-4 shadow-sm animate-pulse flex flex-col justify-between"
        >
          {/* Image Placeholder */}
          <div className="aspect-square w-full rounded-2xl bg-art-900 border border-art-800/80" />

          {/* Details Placeholder */}
          <div className="space-y-3">
            {/* Category tag */}
            <div className="h-3 w-20 rounded-full bg-art-850" />
            {/* Title */}
            <div className="h-4 w-3/4 rounded-md bg-art-800" />
            {/* Rating stars */}
            <div className="h-3 w-24 rounded-md bg-art-850" />

            {/* Price & Action */}
            <div className="pt-3 border-t border-art-800 flex items-center justify-between">
              <div className="h-5 w-20 rounded-md bg-art-800 font-mono" />
              <div className="h-9 w-9 rounded-xl bg-art-850" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Admin Table Skeleton Rows
 */
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 5,
}) => {
  return (
    <div className="w-full bg-white border border-art-800 rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="p-4 bg-art-900 border-b border-art-800 flex items-center justify-between">
        <div className="h-4 w-32 bg-art-800 rounded-md" />
        <div className="h-4 w-24 bg-art-850 rounded-md" />
      </div>
      <div className="divide-y divide-art-800/60 p-2 space-y-3">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center justify-between p-3 gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-art-850 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-1/3 bg-art-800 rounded" />
                <div className="h-2.5 w-1/4 bg-art-850 rounded" />
              </div>
            </div>
            {Array.from({ length: cols - 1 }).map((_, cIdx) => (
              <div key={cIdx} className="h-3.5 w-16 bg-art-850 rounded hidden sm:block" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Hero Banner Skeleton
 */
export const BannerSkeleton: React.FC = () => {
  return (
    <div className="w-full h-64 sm:h-96 rounded-3xl bg-art-900 border border-art-800 p-8 flex flex-col justify-center space-y-4 animate-pulse">
      <div className="h-6 w-36 rounded-full bg-art-850" />
      <div className="h-8 sm:h-12 w-2/3 rounded-xl bg-art-800" />
      <div className="h-4 w-1/2 rounded-md bg-art-850" />
      <div className="h-10 w-36 rounded-xl bg-art-800 pt-2" />
    </div>
  );
};

/**
 * Product Details Panel Skeleton
 */
export const ProductDetailsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 animate-pulse">
      <div className="aspect-square rounded-3xl bg-art-900 border border-art-800" />
      <div className="space-y-5">
        <div className="h-4 w-24 rounded-full bg-art-850" />
        <div className="h-8 w-3/4 rounded-xl bg-art-800" />
        <div className="h-4 w-1/3 rounded-md bg-art-850" />
        <div className="h-10 w-40 rounded-xl bg-art-800 font-mono" />
        <div className="h-24 w-full rounded-2xl bg-art-900 border border-art-800" />
        <div className="h-12 w-full rounded-xl bg-art-800" />
      </div>
    </div>
  );
};
