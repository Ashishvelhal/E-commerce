import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Plus, Trash2, Box, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { Product, Specification, ModelColorVariant } from '../../types';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSaved: () => void;
}

const DEFAULT_RESIN_CATEGORIES = [
  'Pooja Thalis & Platters',
  'Pooja Thalis & Aarti Platters',
  'Mandir & Spiritual Decor',
  'Resin Wall Clocks',
  'Custom Nameplates',
  'Preservation & Frames',
  'Coasters & Trays',
  'Keychains & Accessories',
  'Resin Jewellery',
  'Epoxy Tables & Furniture',
  'Corporate & Wedding Favors',
  'Custom Resin Art & Gifts',
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSaved,
}) => {
  const { addToast } = useToastStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [richDetails, setRichDetails] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [category, setCategory] = useState('Pooja Thalis & Platters');
  const [brand, setBrand] = useState('Rasin Arts Studio');
  const [stock, setStock] = useState('20');
  const [thumbnail, setThumbnail] = useState('');
  const [imagesText, setImagesText] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);

  const [categoryList, setCategoryList] = useState<string[]>(DEFAULT_RESIN_CATEGORIES);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  const [has3D, setHas3D] = useState(false);
  const [modelUrl, setModelUrl] = useState('');
  const [initialScale, setInitialScale] = useState('1');
  const [colors, setColors] = useState<ModelColorVariant[]>([]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#8b5cf6');

  const [specs, setSpecs] = useState<Specification[]>([]);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/products/categories');
        const backendNames: string[] = res.data.data?.names || [];
        const combined = Array.from(new Set([...DEFAULT_RESIN_CATEGORIES, ...backendNames]));
        setCategoryList(combined);
      } catch (e) {
        setCategoryList(DEFAULT_RESIN_CATEGORIES);
      }
    };
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    setIsCustomCategory(false);
    setCustomCategoryInput('');

    if (product) {
      setTitle(product.title);
      setDescription(product.description);
      setRichDetails(product.richDetails || '');
      setPrice(product.price.toString());
      setDiscountPrice(product.discountPrice ? product.discountPrice.toString() : '');
      setCategory(product.category || 'Pooja Thalis & Platters');
      setBrand(product.brand || 'Rasin Arts Studio');
      setStock(product.stock.toString());
      setThumbnail(product.thumbnail);
      setImagesText(product.images.join('\n'));
      setIsFeatured(product.isFeatured);
      setIsTrending(product.isTrending);

      if (product.model3d && product.model3d.url) {
        setHas3D(true);
        setModelUrl(product.model3d.url);
        setInitialScale((product.model3d.initialScale || 1).toString());
        setColors(product.model3d.availableColors || []);
      } else {
        setHas3D(false);
        setModelUrl('');
        setInitialScale('1');
        setColors([]);
      }

      setSpecs(product.specifications || []);
    } else {
      setTitle('');
      setDescription('');
      setRichDetails('');
      setPrice('2299.00');
      setDiscountPrice('1999.00');
      setCategory('Pooja Thalis & Platters');
      setBrand('Rasin Arts Studio');
      setStock('15');
      setThumbnail('https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80');
      setImagesText('https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1000&auto=format&fit=crop&q=80');
      setIsFeatured(true);
      setIsTrending(false);
      setHas3D(false);
      setModelUrl('');
      setInitialScale('1');
      setColors([
        { name: 'Royal Gold & Ruby', hex: '#d97706' },
        { name: 'Sapphire Ocean Wave', hex: '#0284c7' },
      ]);
      setSpecs([
        { key: 'Material', value: 'Non-Toxic UV-Resistant Epoxy Resin & 24K Gold Leaf' },
        { key: 'Finish', value: 'High-Gloss Food-Safe Glass Finish' },
      ]);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, is3DFile = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = response.data.data.url;
      if (is3DFile) {
        setModelUrl(uploadedUrl);
        setHas3D(true);
        addToast('3D Model uploaded successfully', 'success');
      } else {
        setThumbnail(uploadedUrl);
        setImagesText((prev) => (prev ? `${prev}\n${uploadedUrl}` : uploadedUrl));
        addToast('Image uploaded successfully', 'success');
      }
    } catch (error: any) {
      addToast(error.response?.data?.message || 'File upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setColors([...colors, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName('');
  };

  const handleRemoveColor = (idx: number) => {
    setColors(colors.filter((_, i) => i !== idx));
  };

  const handleAddSpec = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) return;
    setSpecs([...specs, { key: newSpecKey.trim(), value: newSpecValue.trim() }]);
    setNewSpecKey('');
    setNewSpecValue('');
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || !thumbnail.trim()) {
      addToast('Please fill in required fields (Title, Price, Thumbnail)', 'warning');
      return;
    }

    const imagesArray = imagesText
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const payload: any = {
      title: title.trim(),
      description: description.trim(),
      richDetails: richDetails.trim(),
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
      category,
      brand,
      stock: parseInt(stock, 10),
      thumbnail: thumbnail.trim(),
      images: imagesArray.length > 0 ? imagesArray : [thumbnail.trim()],
      specifications: specs,
      isFeatured,
      isTrending,
      model3d:
        has3D && modelUrl.trim()
          ? {
              url: modelUrl.trim(),
              initialScale: parseFloat(initialScale) || 1,
              cameraPosition: [0, 0, 3.8],
              availableColors: colors,
            }
          : null,
    };

    setIsSubmitting(true);
    try {
      if (product) {
        await api.put(`/products/${product._id}`, payload);
        addToast('Product updated successfully', 'success');
      } else {
        await api.post('/products', payload);
        addToast('Product created successfully', 'success');
      }
      onSaved();
      onClose();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to save product', 'error');
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
          className="relative w-full max-w-4xl bg-white border border-art-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 my-4 sm:my-8 flex flex-col max-h-[92vh]"
        >
          <div className="p-4 sm:p-6 border-b border-art-800 flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-brand-50 text-brand-700 shrink-0">
                <Box className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-art-300 truncate">
                  {product ? 'Edit Product' : 'Create New Product'}
                </h2>
                <p className="text-[11px] sm:text-xs text-art-500 truncate">Configure catalog specs, 3D WebGL assets & pricing</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-art-500 hover:text-art-300 hover:bg-art-900 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-art-400 mb-1">Product Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Resin Ocean Wave Geode Wall Clock"
                  required
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1">Category *</label>
                {!isCustomCategory ? (
                  <div className="space-y-1.5">
                    <select
                      value={category}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          setIsCustomCategory(true);
                          setCustomCategoryInput('');
                        } else {
                          setCategory(e.target.value);
                        }
                      }}
                      className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-semibold"
                    >
                      {categoryList.map((catName) => (
                        <option key={catName} value={catName}>
                          {catName}
                        </option>
                      ))}
                      <option value="__NEW__">➕ Add New Custom Category...</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customCategoryInput}
                      onChange={(e) => {
                        setCustomCategoryInput(e.target.value);
                        setCategory(e.target.value);
                      }}
                      placeholder="Type category name (e.g. Pooja Thali)..."
                      className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-semibold"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomCategory(false)}
                      className="px-3 py-2.5 text-xs font-bold bg-art-850 hover:bg-art-800 text-art-300 rounded-xl transition-all border border-art-700 shrink-0"
                    >
                      Select Existing
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Kalakar Studio"
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1499.00"
                  required
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1">Discount Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="Optional sale price"
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1">Stock Units *</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="25"
                  required
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-6 pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-500 bg-art-950 border-art-800 focus:ring-0"
                  />
                  <span className="text-xs text-art-400 font-medium">Featured Item</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-500 bg-art-950 border-art-800 focus:ring-0"
                  />
                  <span className="text-xs text-art-400 font-medium">Trending Badge</span>
                </label>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1">Short Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Concise overview for catalog cards..."
                  required
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1">Rich Detailed Information</label>
                <textarea
                  value={richDetails}
                  onChange={(e) => setRichDetails(e.target.value)}
                  rows={3}
                  placeholder="Full engineering story, acoustic specs, materials details..."
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>
            </div>
            <div className="p-4 bg-art-950 rounded-2xl border border-art-800 space-y-4">
              <h3 className="text-xs font-bold text-art-400 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand-700" />
                <span>Product Imagery</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-art-400 mb-1">Thumbnail Image URL *</label>
                  <input
                    type="text"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="https://..."
                    required
                    className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
                  />
                  <div className="mt-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-art-900 hover:bg-art-800 text-art-400 text-xs font-medium transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Thumbnail</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, false)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-art-400 mb-1">
                    Image Gallery URLs (1 per line)
                  </label>
                  <textarea
                    value={imagesText}
                    onChange={(e) => setImagesText(e.target.value)}
                    rows={3}
                    placeholder="https://image1.jpg&#10;https://image2.jpg"
                    className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 resize-none font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 bg-art-950 rounded-2xl border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-cyan-700 uppercase tracking-wider flex items-center gap-2">
                  <Box className="w-4 h-4 text-cyan-700" />
                  <span>3D WebGL Model Engine Config</span>
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={has3D}
                    onChange={(e) => setHas3D(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 bg-art-950 border-art-700 focus:ring-0"
                  />
                  <span className="text-xs font-bold text-cyan-700">Enable 3D Experience</span>
                </label>
              </div>

              {has3D && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-art-400 mb-1">
                        3D GLB/GLTF Model URL
                      </label>
                      <input
                        type="text"
                        value={modelUrl}
                        onChange={(e) => setModelUrl(e.target.value)}
                        placeholder="https://.../model.glb"
                        className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                      <div className="mt-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 border border-cyan-500/30 hover:bg-cyan-100 text-cyan-700 text-xs font-medium transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload .GLB 3D Asset</span>
                          <input
                            type="file"
                            accept=".glb,.gltf"
                            onChange={(e) => handleFileUpload(e, true)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-art-400 mb-1">
                        Initial 3D Scale
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={initialScale}
                        onChange={(e) => setInitialScale(e.target.value)}
                        placeholder="1.0"
                        className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                  <div className="border-t border-art-800/80 pt-3">
                    <label className="block text-xs font-semibold text-art-400 mb-2">
                      Interactive 3D Color Swatches
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {colors.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 px-3 py-1 bg-art-950 border border-art-700 rounded-xl text-xs text-art-300"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(i)}
                            className="text-art-500 hover:text-rose-600 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Color Name (e.g. Neon Cyan)"
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                        className="bg-white border border-art-700 rounded-xl px-3 py-1.5 text-xs text-art-300 focus:outline-none"
                      />
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-art-950 border border-art-800"
                      />
                      <button
                        type="button"
                        onClick={handleAddColor}
                        className="px-3 py-1.5 bg-art-900 hover:bg-art-800 text-art-400 rounded-xl text-xs font-semibold"
                      >
                        Add Swatch
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-art-950 rounded-2xl border border-art-800 space-y-3">
              <h3 className="text-xs font-bold text-art-400 uppercase tracking-wider">
                Technical Specifications
              </h3>

              <div className="space-y-2">
                {specs.map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 p-2 bg-art-950 rounded-xl border border-art-800 text-xs">
                    <span className="font-semibold text-art-400">{s.key}:</span>
                    <span className="text-art-500 flex-1 truncate">{s.value}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(i)}
                      className="text-art-600 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Spec Key (e.g. Dimensions)"
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                  className="bg-white border border-art-700 rounded-xl px-3 py-2 sm:py-1.5 text-xs text-art-300 focus:outline-none flex-1"
                />
                <input
                  type="text"
                  placeholder="Spec Value (e.g. 12 x 12 inches)"
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                  className="bg-white border border-art-700 rounded-xl px-3 py-2 sm:py-1.5 text-xs text-art-300 focus:outline-none flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="px-4 py-2 sm:py-1.5 bg-art-900 hover:bg-art-800 text-art-400 rounded-xl text-xs font-semibold shrink-0"
                >
                  Add Spec
                </button>
              </div>
            </div>
            <div className="pt-4 border-t border-art-800 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-art-900 hover:bg-art-800 text-art-400 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-art-300 text-xs font-bold shadow-lg glow-brand transition-all flex items-center gap-2 active:scale-95"
              >
                {isSubmitting ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{product ? 'Save Changes' : 'Create Product'}</span>
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
