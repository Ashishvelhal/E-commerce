import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Layers, CheckCircle2 } from 'lucide-react';
import { Category } from '../../types';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSaved: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onSaved,
}) => {
  const { addToast } = useToastStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [icon, setIcon] = useState('Tag');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || '');
      setImage(category.image || '');
      setIcon(category.icon || 'Tag');
    } else {
      setName('');
      setDescription('');
      setImage('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80');
      setIcon('Headphones');
    }
  }, [category, isOpen]);

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
      addToast('Category image uploaded successfully', 'success');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Please provide a category name', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (category && category._id) {
        await api.put(`/products/categories/${category._id}`, {
          name: name.trim(),
          description: description.trim(),
          image: image.trim(),
          icon: icon.trim(),
        });
        addToast('Category updated successfully', 'success');
      } else {
        await api.post('/products/categories', {
          name: name.trim(),
          description: description.trim(),
          image: image.trim(),
          icon: icon.trim(),
        });
        addToast('Category created successfully', 'success');
      }
      onSaved();
      onClose();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to save category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
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
          className="relative w-full max-w-lg bg-white border border-art-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 p-4 sm:p-6 max-h-[92vh] flex flex-col"
        >
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-art-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-50 text-brand-700">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-art-300">
                  {category ? 'Edit Category' : 'Create New Category'}
                </h3>
                <p className="text-xs text-art-500">Configure department name, icon & imagery</p>
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
                Category Title *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Resin Clocks & Wall Art"
                required
                className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1">
                Category Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Brief description for category cards..."
                className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1">
                Thumbnail Image URL
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
              />
              <div className="mt-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-art-900 hover:bg-art-800 text-art-400 text-xs font-medium transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-art-300 text-xs font-bold shadow-lg glow-brand flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{category ? 'Save Category' : 'Create Category'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
