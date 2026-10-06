import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, CheckCircle2, FileText } from 'lucide-react';
import { Post } from '../../types';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: Post | null;
  onSaved: () => void;
}

export const PostModal: React.FC<PostModalProps> = ({
  isOpen,
  onClose,
  post,
  onSaved,
}) => {
  const { addToast } = useToastStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [category, setCategory] = useState('Technology');
  const [tags, setTags] = useState('3D WebGL, Innovation, Retail');
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setSummary(post.summary || '');
      setContent(post.content);
      setBannerImage(post.bannerImage);
      setCategory(post.category);
      setTags(post.tags?.join(', ') || '');
      setIsPublished(post.isPublished);
    } else {
      setTitle('');
      setSummary('');
      setContent('');
      setBannerImage('https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80');
      setCategory('Technology');
      setTags('3D WebGL, Design, Innovation');
      setIsPublished(true);
    }
  }, [post, isOpen]);

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
      setBannerImage(response.data.data.url);
      addToast('Banner image uploaded successfully', 'success');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !bannerImage.trim()) {
      addToast('Please provide Title, Content, and Banner Image', 'warning');
      return;
    }

    const payload = {
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      bannerImage: bannerImage.trim(),
      category,
      tags: tags.split(',').map((t) => t.trim()).filter((t) => t.length > 0),
      isPublished,
    };

    setIsSubmitting(true);
    try {
      if (post) {
        await api.put(`/posts/${post._id}`, payload);
        addToast('Post updated successfully', 'success');
      } else {
        await api.post('/posts', payload);
        addToast('Post created successfully', 'success');
      }
      onSaved();
      onClose();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to save post', 'error');
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
          className="relative w-full max-w-3xl bg-white border border-art-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 my-3 sm:my-8 flex flex-col max-h-[92vh]"
        >
          <div className="p-4 sm:p-6 border-b border-art-800 flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-50 text-cyan-700 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-art-300 truncate">
                  {post ? 'Edit Post & Announcement' : 'Create New Article / Post'}
                </h2>
                <p className="text-[11px] sm:text-xs text-art-500 truncate">Publish store news, feature drops, and guides</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-art-500 hover:text-art-300 hover:bg-art-900 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1">Post Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Masterclass: Achieving Glass-Like Mirror Topcoats with Resin"
                required
                className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
                >
                  <option value="Studio Workshops">Studio Workshops</option>
                  <option value="Guides & Tips">Guides &amp; Tips</option>
                  <option value="Product Launch">Product Launch</option>
                  <option value="Material Science">Material Science</option>
                  <option value="Company Updates">Company Updates</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Resin, Workshop, Finishing, Curing"
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1">Banner Image URL *</label>
              <input
                type="text"
                value={bannerImage}
                onChange={(e) => setBannerImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                required
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

            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1">Summary (Short blurb)</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                placeholder="Quick hook shown on blog index cards..."
                className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1">Full Content (Markdown supported) *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder="Write your article in Markdown..."
                required
                className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded text-brand-500 bg-art-950 border-art-800"
              />
              <label htmlFor="isPublished" className="text-xs font-semibold text-art-400 cursor-pointer">
                Publish immediately to Storefront
              </label>
            </div>
            <div className="pt-3 sm:pt-4 border-t border-art-800 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-art-900 hover:bg-art-800 text-art-400 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="px-5 sm:px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-art-300 text-xs font-bold shadow-lg glow-brand flex items-center gap-2 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{post ? 'Save Post' : 'Publish Post'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
