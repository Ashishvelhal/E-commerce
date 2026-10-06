import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image, CheckCircle2 } from 'lucide-react';
import { Banner } from '../../types';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner?: Banner | null;
  onSaved: () => void;
}

export const BannerModal: React.FC<BannerModalProps> = ({
  isOpen,
  onClose,
  banner,
  onSaved,
}) => {
  const { addToast } = useToastStore();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('');
  const [image, setImage] = useState('');
  const [linkUrl, setLinkUrl] = useState('/shop');
  const [buttonText, setButtonText] = useState('Explore Collection');
  const [position, setPosition] = useState<'hero' | 'promo' | 'popup'>('hero');
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (banner) {
      setTitle(banner.title);
      setSubtitle(banner.subtitle || '');
      setBadge(banner.badge || '');
      setImage(banner.image);
      setLinkUrl(banner.linkUrl || '/shop');
      setButtonText(banner.buttonText || 'Explore Collection');
      setPosition(banner.position || 'hero');
      setIsActive(banner.isActive);
      setOrder(banner.order.toString());
    } else {
      setTitle('');
      setSubtitle('');
      setBadge('EXCLUSIVE DROP');
      setImage('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80');
      setLinkUrl('/shop');
      setButtonText('Shop Now');
      setPosition('hero');
      setIsActive(true);
      setOrder('1');
    }
  }, [banner, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImage(response.data.data.url);
      addToast('Banner image uploaded successfully', 'success');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !image.trim()) {
      addToast('Please provide a banner title and image URL', 'warning');
      return;
    }

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      badge: badge.trim(),
      image: image.trim(),
      linkUrl: linkUrl.trim(),
      buttonText: buttonText.trim(),
      position,
      isActive,
      order: parseInt(order, 10) || 0,
    };

    setIsSubmitting(true);
    try {
      if (banner && banner._id) {
        await api.put(`/banners/${banner._id}`, payload);
        addToast('Banner updated successfully', 'success');
      } else {
        await api.post('/banners', payload);
        addToast('Banner created successfully', 'success');
      }
      onSaved();
      onClose();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to save banner', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white border border-art-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 p-4 sm:p-6 my-3 sm:my-8 max-h-[92vh] flex flex-col"
        >
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-art-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-50 text-brand-700">
                <Image className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-art-300">
                  {banner ? 'Edit Promotion Banner' : 'Create New Promotion Banner'}
                </h3>
                <p className="text-xs text-art-500">
                  Configure storefront hero slides, promo banners & links
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-art-500 hover:text-art-300 hover:bg-art-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4 overflow-y-auto flex-1">
            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1">
                Headline Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Masterpiece Resin Geode Wall Clocks"
                required
                className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1">
                  Tag Badge
                </label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. EXCLUSIVE STUDIO DROP"
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1">
                  Banner Placement
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as any)}
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
                >
                  <option value="hero">Hero Top Slider</option>
                  <option value="promo">Mid-Page Promotional Card</option>
                  <option value="popup">Announcement Banner</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1">
                Subtitle Description
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Experience 3D interactive models and custom artisan finishes"
                className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1">
                Banner Graphic Image URL *
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                required
                className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
              />
              <div className="mt-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-art-900 hover:bg-art-800 text-art-400 text-xs font-medium transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Graphic</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1">
                  Destination Link URL
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="/shop?category=Resin+Clocks+%26+Wall+Art"
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1">
                  Button Call-to-Action Text
                </label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Explore Collection"
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-500 bg-art-950 border-art-800"
                />
                <span className="text-xs text-art-400 font-semibold">Active & Visible on Store</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs text-art-500">Order:</span>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="w-16 bg-white border border-art-700 rounded-lg px-2 py-1 text-xs text-art-300"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-art-300 text-xs font-bold shadow-lg glow-brand flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{banner ? 'Save Banner' : 'Publish Banner'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
