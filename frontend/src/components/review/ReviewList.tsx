import React, { useState } from 'react';
import { CheckCircle2, MessageSquare, Sparkles, Trash2, Plus, Star } from 'lucide-react';
import { Review } from '../../types';
import { RatingStars } from '../common/RatingStars';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

interface ReviewListProps {
  productId: string;
  reviews: Review[];
  onOpenReviewModal: () => void;
  onSelectReviewAnnotation?: (review: Review) => void;
  selectedReviewId?: string | null;
  onReviewDeleted?: (reviewId: string) => void;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  productId,
  reviews,
  onOpenReviewModal,
  onSelectReviewAnnotation,
  selectedReviewId,
  onReviewDeleted,
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const { addToast } = useToastStore();
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      addToast('Review deleted successfully', 'success');
      if (onReviewDeleted) onReviewDeleted(reviewId);
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to delete review', 'error');
    }
  };

  const filteredReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews;

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl border border-art-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div
              className="text-4xl font-black text-art-300"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {averageRating}
            </div>
            <div className="mt-1">
              <RatingStars rating={Number(averageRating)} size="md" />
            </div>
            <div className="text-xs text-art-500 mt-1">Based on {reviews.length} reviews</div>
          </div>
          <div className="hidden sm:flex flex-wrap gap-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter((r) => r.rating === stars).length;
              const active = filterRating === stars;
              return (
                <button
                  key={stars}
                  onClick={() => setFilterRating(active ? null : stars)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                    active
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-art-950 text-art-500 border-art-800 hover:text-art-300 hover:border-art-700'
                  }`}
                >
                  <span>{stars}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-art-500 font-mono">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
        <button
          onClick={() => {
            if (!isAuthenticated) {
              addToast('Please sign in to write a product review', 'info');
              return;
            }
            onOpenReviewModal();
          }}
          className="px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg glow-brand transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Write a Verified Review</span>
        </button>
      </div>
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center bg-art-950 rounded-2xl border border-dashed border-art-800 text-art-500 text-sm font-medium">
            No reviews match your selected filter. Be the first to review this product!
          </div>
        ) : (
          filteredReviews.map((review) => {
            const isSelected = selectedReviewId === review._id;
            const canDelete = user && (user.role === 'admin' || user._id === review.user?._id);

            return (
              <div
                key={review._id}
                onClick={() => onSelectReviewAnnotation && onSelectReviewAnnotation(review)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-brand-50 border-brand-400 shadow-md'
                    : 'bg-white border-art-800 hover:border-art-700 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        review.user?.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                      }
                      alt={review.user?.name || 'Reviewer'}
                      className="w-9 h-9 rounded-full object-cover border border-art-800"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-art-300">
                          {review.user?.name || 'Anonymous Customer'}
                        </span>
                        {review.verifiedPurchase && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                            style={{
                              backgroundColor: '#f0fdf4',
                              color: '#15803d',
                              borderColor: '#86efac',
                            }}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified Purchase</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-art-500 mt-0.5">
                        {new Date(review.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(review._id); }}
                      className="p-1.5 text-art-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="mt-3">
                  <RatingStars rating={review.rating} size="sm" />
                  <h4
                    className="text-sm font-bold text-art-300 mt-1.5"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {review.title}
                  </h4>
                  <p className="text-xs text-art-500 mt-1 leading-relaxed">{review.comment}</p>
                </div>
                {review.modelAnnotation?.label && (
                  <div
                    className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{
                      backgroundColor: '#f5f3ff',
                      border: '1px solid #c4b5fd',
                      color: '#6d28d9',
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5" style={{ color: '#7c3aed' }} />
                    <span>3D Note:</span>
                    <span className="font-bold">{review.modelAnnotation.label}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
