import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Star, CheckCircle2 } from 'lucide-react';
import { RatingStars } from '../common/RatingStars';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

interface ReviewModalProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
  onReviewCreated: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  productId,
  isOpen,
  onClose,
  onReviewCreated,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [annotationLabel, setAnnotationLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToastStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim()) {
      addToast('Please provide a review title and comment', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/reviews', {
        productId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        modelAnnotation: annotationLabel.trim()
          ? { point: [0.2, 0.3, 0.4], label: annotationLabel.trim() }
          : undefined,
      });
      addToast('Review submitted successfully!', 'success');
      onReviewCreated();
      onClose();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white border border-art-800 rounded-3xl shadow-2xl overflow-hidden z-10 p-6"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-500 via-rose-500 to-plum-600" />
          <div className="flex items-center justify-between pb-4 border-b border-art-800 mt-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-50 border border-brand-200">
                <Star className="w-5 h-5 text-brand-700" />
              </div>
              <div>
                <h3
                  className="text-base font-bold text-art-300"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Write a Product Review
                </h3>
                <p className="text-xs text-art-500">Share your experience with this resin art piece</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-art-500 hover:text-art-300 hover:bg-art-950 border border-art-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1.5">
                Overall Rating
              </label>
              <div className="flex items-center gap-3 bg-art-950 p-3 rounded-xl border border-art-800">
                <RatingStars rating={rating} max={5} size="lg" interactive onRatingChange={setRating} />
                <span className="text-sm font-bold text-brand-700">{rating} of 5 Stars</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1.5">
                Review Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Absolutely stunning resin piece!"
                required
                className="w-full bg-white border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1.5">
                Detailed Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="What did you love about the colours, texture, finish, or packaging?"
                required
                className="w-full bg-white border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500 resize-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-plum-600" />
                <span>3D Inspection Highlight (Optional)</span>
              </label>
              <input
                type="text"
                value={annotationLabel}
                onChange={(e) => setAnnotationLabel(e.target.value)}
                placeholder="e.g. The resin layers shimmer beautifully under light"
                className="w-full bg-white border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-plum-500 transition-colors"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold shadow-lg glow-brand transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Submitting Review...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Verified Review</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
