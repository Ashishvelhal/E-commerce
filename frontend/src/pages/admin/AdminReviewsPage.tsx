import React, { useEffect, useState } from 'react';
import { MessageSquare, Trash2, Loader2, Sparkles, CheckCircle2, Star } from 'lucide-react';
import { Review } from '../../types';
import { AdminNavbar } from '../../components/admin/AdminNavbar';
import { RatingStars } from '../../components/common/RatingStars';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToastStore();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reviews/admin');
      setReviews(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      addToast('Review deleted successfully', 'success');
      fetchReviews();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Delete failed', 'error');
    }
  };

  return (
    <div>
      <AdminNavbar
        title="Customer Reviews & 3D Hotspots"
        subtitle="Moderate product feedback, ratings, and 3D spatial annotations"
      />

      <div className="p-3 xs:p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <div className="text-xs text-art-500">
          Total Customer Reviews: <span className="font-bold text-art-300">{reviews.length}</span>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-brand-700">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-mono uppercase tracking-widest text-art-500">
              Loading Reviews...
            </span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center bg-white border border-art-800 rounded-2xl text-art-600 text-xs font-medium">
            No customer reviews posted yet.
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {reviews.map((review) => {
              const productObj = typeof review.product === 'object' ? review.product : null;

              return (
                <div
                  key={review._id}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-art-800 space-y-3 shadow-lg hover:border-brand-500/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <img
                        src={
                          review.user?.avatar ||
                          review.customerAvatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                        }
                        alt=""
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-art-800 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="text-xs font-bold text-art-300">
                            {review.user?.name || review.customerName || 'Verified Buyer'}
                          </span>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                            style={{ backgroundColor: '#f0fdf4', color: '#15803d', borderColor: '#86efac' }}
                          >
                            Verified Review
                          </span>
                        </div>
                        <div className="text-[11px] text-art-600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(review._id)}
                      className="p-2 sm:p-2.5 rounded-xl bg-art-950 hover:bg-rose-50 text-art-500 hover:text-rose-600 transition-colors shrink-0"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {productObj && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-brand-700 bg-art-950 p-2 sm:p-2.5 rounded-xl border border-art-800">
                      <span>Product:</span>
                      <span className="text-art-300 truncate">{productObj.title}</span>
                    </div>
                  )}

                  <div>
                    <RatingStars rating={review.rating} size="sm" />
                    <h4 className="text-sm font-bold text-art-300 mt-1.5">{review.title}</h4>
                    <p className="text-xs text-art-400 mt-1 leading-relaxed">{review.comment}</p>
                  </div>

                  {review.modelAnnotation && review.modelAnnotation.label && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-500/30 text-cyan-700 text-xs font-medium flex-wrap">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                      <span>3D Model Hotspot Note: </span>
                      <span className="text-art-400 font-semibold">{review.modelAnnotation.label}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
