import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Plus, Trash2, Box, CheckCircle2, Image as ImageIcon, TrendingUp, AlertCircle, ShieldCheck, Tag, Handshake, DollarSign, BookOpen, Sparkles } from 'lucide-react';
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
  const [costPrice, setCostPrice] = useState('');
  const [minBargainPrice, setMinBargainPrice] = useState('');
  const [recipeId, setRecipeId] = useState('');
  const [recipesList, setRecipesList] = useState<{ _id: string; name: string; productType: string }[]>([]);
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
    const loadData = async () => {
      try {
        const [catRes, recipeRes] = await Promise.all([
          api.get('/products/categories'),
          api.get('/recipes'),
        ]);
        const backendNames: string[] = catRes.data.data?.names || [];
        const combined = Array.from(new Set([...DEFAULT_RESIN_CATEGORIES, ...backendNames]));
        setCategoryList(combined);
        setRecipesList(recipeRes.data.data || []);
      } catch (e) {
        setCategoryList(DEFAULT_RESIN_CATEGORIES);
      }
    };
    if (isOpen) {
      loadData();
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
      setCostPrice(product.costPrice !== undefined ? product.costPrice.toString() : '');
      setMinBargainPrice(product.minBargainPrice !== undefined && product.minBargainPrice !== null ? product.minBargainPrice.toString() : '');
      setRecipeId(product.recipeId || '');
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
      setCostPrice('850.00');
      setMinBargainPrice('1600.00');
      setRecipeId('');
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

  const handleAutoFillProduct = (templateKey: 'clock' | 'thali' | 'coasters') => {
    if (templateKey === 'clock') {
      setTitle('Ocean Wave Geode Resin Wall Clock (14")');
      setDescription('Handcrafted 14-inch luxury ocean resin geode clock with genuine quartz crystals, real sand, gold leaf accents, and a silent sweeping quartz movement.');
      setRichDetails('Crafted with 3 layers of high-grade art epoxy. Includes quartz points, crushed fire glass, and metallic pigments.');
      setCategory('Resin Wall Clocks');
      setPrice('2899.00');
      setDiscountPrice('2499.00');
      setCostPrice('950.00');
      setMinBargainPrice('2100.00');
      setStock('12');
      setThumbnail('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80');
      setImagesText('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80');
      setSpecs([
        { key: 'Dimensions', value: '14-inch diameter, 18mm thickness' },
        { key: 'Materials', value: 'UV-resistant epoxy resin, raw crystal geodes, gold leaf' },
        { key: 'Mechanism', value: 'Silent sweep continuous quartz movement' },
      ]);
      setColors([
        { name: 'Deep Ocean Blue', hex: '#0369a1' },
        { name: 'Turquoise Lagoon', hex: '#06b6d4' },
      ]);
    } else if (templateKey === 'thali') {
      setTitle('Royal Gold & Pearl Resin Pooja Thali (11")');
      setDescription('Festive handcrafted resin pooja aarti thali with encrusted pearls, 24K gold foil, and matching attached diya holders.');
      setRichDetails('Heat-resistant up to 95°C for standard brass and clay diyas. Washable with mild soapy water.');
      setCategory('Pooja Thalis & Platters');
      setPrice('1599.00');
      setDiscountPrice('1299.00');
      setCostPrice('480.00');
      setMinBargainPrice('1100.00');
      setStock('25');
      setThumbnail('https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800&auto=format&fit=crop&q=80');
      setImagesText('https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800&auto=format&fit=crop&q=80');
      setSpecs([
        { key: 'Diameter', value: '11-inch round platter' },
        { key: 'Heat Resistance', value: 'Up to 95°C for aarti diya placement' },
        { key: 'Finish', value: 'Scratch-proof diamond high gloss coat' },
      ]);
      setColors([
        { name: 'Imperial Red & Gold', hex: '#b91c1c' },
        { name: 'Royal Emerald Gold', hex: '#047857' },
      ]);
    } else {
      setTitle('Emerald Agate Resin Coaster Set (4 Pcs)');
      setDescription('Handmade emerald green and gold leaf agate slice coasters with gold gilded edges and non-slip silicone feet.');
      setRichDetails('Set of 4 matching resin slices. Each piece has unique organic marbling and hand-painted metallic edges.');
      setCategory('Coasters & Trays');
      setPrice('799.00');
      setDiscountPrice('649.00');
      setCostPrice('240.00');
      setMinBargainPrice('550.00');
      setStock('30');
      setThumbnail('https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80');
      setImagesText('https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80');
      setSpecs([
        { key: 'Quantity', value: '4 matching handmade coasters' },
        { key: 'Size', value: '4-inch diameter each' },
        { key: 'Features', value: 'Heat resistant up to 90°C with gold gilded rims' },
      ]);
      setColors([
        { name: 'Emerald & Gold', hex: '#059669' },
        { name: 'Sapphire & Gold', hex: '#2563eb' },
      ]);
    }
    addToast('Auto-filled resin product template!', 'success');
  };

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
      costPrice: costPrice ? parseFloat(costPrice) : 0,
      minBargainPrice: minBargainPrice ? parseFloat(minBargainPrice) : undefined,
      recipeId: recipeId || null,
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
          <div className="p-4 sm:p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                <Box className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-black text-stone-900 truncate">
                  {product ? 'Edit Product' : 'Create New Product'}
                </h2>
                <p className="text-[11px] sm:text-xs text-stone-500 truncate">Configure catalog specs, 3D WebGL assets & pricing</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {!product && (
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] font-black uppercase text-amber-900 px-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Auto-Fill:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAutoFillProduct('clock')}
                    className="px-2 py-1 rounded-lg bg-white border border-amber-200 hover:border-brand-500 text-[10px] font-bold text-stone-800 transition-all shadow-2xs"
                  >
                    Geode Clock
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAutoFillProduct('thali')}
                    className="px-2 py-1 rounded-lg bg-white border border-amber-200 hover:border-brand-500 text-[10px] font-bold text-stone-800 transition-all shadow-2xs"
                  >
                    Pooja Thali
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAutoFillProduct('coasters')}
                    className="px-2 py-1 rounded-lg bg-white border border-amber-200 hover:border-brand-500 text-[10px] font-bold text-stone-800 transition-all shadow-2xs"
                  >
                    Coaster Set
                  </button>
                </div>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 border border-stone-200 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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
                <label className="block text-xs font-semibold text-art-400 mb-1">Catalog Price (₹) *</label>
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
                <label className="block text-xs font-semibold text-art-400 mb-1">Sale / Discount Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="Optional sale price"
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              {/* Admin-only Cost Price (COGS) & Bargain Floor */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/5 via-brand-500/5 to-rose-500/5 border border-brand-200/70 sm:col-span-2 space-y-3">
                <div className="flex items-center justify-between border-b border-brand-200/50 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-brand-50 text-brand-700">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-art-300 flex items-center gap-1.5">
                        Admin Profitability & Bargain Intelligence
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-md bg-brand-500 text-white font-extrabold tracking-wider">Confidential</span>
                      </span>
                      <p className="text-[10px] text-art-500">Visible only to admin. Powers live profit calculations during regular and bargained sales.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-art-400 mb-1 flex items-center gap-1">
                      <span>Base Manufacturing Cost (COGS) (₹)</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      placeholder="e.g. 650.00 (raw resin + labor)"
                      className="w-full bg-white border border-brand-300 rounded-xl px-3.5 py-2 text-xs text-art-300 font-mono font-bold focus:outline-none focus:border-brand-500"
                    />
                    <span className="text-[10px] text-art-500 mt-0.5 block">Resin, pigment, inclusions & artisan labor</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-art-400 mb-1 flex items-center gap-1">
                      <span>Minimum Bargain Floor Price (₹)</span>
                      <span className="text-[10px] text-art-500 font-normal">(Optional floor)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={minBargainPrice}
                      onChange={(e) => setMinBargainPrice(e.target.value)}
                      placeholder="e.g. 1200.00 (lowest deal allowed)"
                      className="w-full bg-white border border-brand-300 rounded-xl px-3.5 py-2 text-xs text-art-300 font-mono font-bold focus:outline-none focus:border-brand-500"
                    />
                    <span className="text-[10px] text-art-500 mt-0.5 block">Lowest price admin should negotiate down to</span>
                  </div>
                </div>

                {/* Real-time Profit Preview Cards */}
                {(() => {
                  const numP = parseFloat(price) || 0;
                  const numD = parseFloat(discountPrice) || 0;
                  const numC = parseFloat(costPrice) || 0;
                  const numB = parseFloat(minBargainPrice) || 0;

                  const normProfit = numP - numC;
                  const normMargin = numP > 0 ? (normProfit / numP) * 100 : 0;

                  const effSalePrice = numD > 0 ? numD : numP;
                  const effSaleProfit = effSalePrice - numC;
                  const effSaleMargin = effSalePrice > 0 ? (effSaleProfit / effSalePrice) * 100 : 0;

                  const bargProfit = numB > 0 ? numB - numC : null;
                  const bargMargin = numB > 0 && bargProfit !== null ? (bargProfit / numB) * 100 : null;

                  return (
                    <div className="pt-2 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                        {/* 1. Catalog Price Profit */}
                        <div className={`p-2.5 rounded-xl border ${normProfit >= 0 ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                          <div className="text-[10px] font-bold text-slate-600 uppercase">Regular Sale Profit</div>
                          <div className={`text-sm font-black font-mono ${normProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {normProfit >= 0 ? `+₹${normProfit.toFixed(0)}` : `-₹${Math.abs(normProfit).toFixed(0)}`}
                          </div>
                          <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                            {normMargin.toFixed(1)}% margin
                          </div>
                        </div>

                        {/* 2. Sale / Discount Profit */}
                        <div className={`p-2.5 rounded-xl border ${numD > 0 ? (effSaleProfit >= 0 ? 'bg-brand-50/70 border-brand-200' : 'bg-rose-50 border-rose-200') : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                          <div className="text-[10px] font-bold text-slate-600 uppercase">Discount Sale Profit</div>
                          <div className={`text-sm font-black font-mono ${numD > 0 ? (effSaleProfit >= 0 ? 'text-brand-700' : 'text-rose-700') : 'text-slate-500'}`}>
                            {numD > 0 ? (effSaleProfit >= 0 ? `+₹${effSaleProfit.toFixed(0)}` : `-₹${Math.abs(effSaleProfit).toFixed(0)}`) : 'No Sale Price'}
                          </div>
                          <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                            {numD > 0 ? `${effSaleMargin.toFixed(1)}% margin` : 'Standard applies'}
                          </div>
                        </div>

                        {/* 3. Min Bargain Floor Profit */}
                        <div className={`p-2.5 rounded-xl border ${numB > 0 ? (bargProfit! >= 0 ? 'bg-purple-50/70 border-purple-200' : 'bg-rose-50 border-rose-200') : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                          <div className="text-[10px] font-bold text-slate-600 uppercase">Min Bargain Profit</div>
                          <div className={`text-sm font-black font-mono ${numB > 0 ? (bargProfit! >= 0 ? 'text-purple-700' : 'text-rose-700') : 'text-slate-500'}`}>
                            {numB > 0 ? (bargProfit! >= 0 ? `+₹${bargProfit!.toFixed(0)}` : `-₹${Math.abs(bargProfit!).toFixed(0)}`) : 'No Floor Set'}
                          </div>
                          <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                            {numB > 0 ? `${bargMargin!.toFixed(1)}% floor margin` : 'Flexible bargain'}
                          </div>
                        </div>
                      </div>

                      {numC > 0 && numP < numC && (
                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>Warning: Catalog price (₹{numP}) is lower than manufacturing cost (₹{numC})!</span>
                        </div>
                      )}
                      {numC > 0 && numB > 0 && numB < numC && (
                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>Warning: Minimum bargain price (₹{numB}) is below manufacturing cost (₹{numC})! Bargaining to this floor would result in a loss.</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* BOM Recipe Linkage */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-50/70 via-indigo-50/50 to-amber-50/50 border border-brand-200/80 sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-brand-500 text-white">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-art-300 flex items-center gap-1.5">
                        Linked BOM Recipe (Automatic Raw Material Deduction)
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold tracking-wider border border-emerald-200">
                          Auto-Sync
                        </span>
                      </span>
                      <p className="text-[10px] text-art-500">
                        When this finished product is sold online or created in admin orders, warehouse resin, pigments, molds, and boxes will be deducted automatically.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <select
                      value={recipeId}
                      onChange={(e) => setRecipeId(e.target.value)}
                      className="w-full bg-white border border-brand-300 rounded-xl px-3.5 py-2.5 text-xs text-art-300 font-semibold focus:outline-none focus:border-brand-500"
                    >
                      <option value="">-- No Recipe Linked (Manual Raw Stock) --</option>
                      {recipesList.map((rec) => (
                        <option key={rec._id} value={rec._id}>
                          {rec.name} ({rec.productType})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-[11px] text-art-600 flex items-center gap-1.5 bg-white/70 p-2 rounded-xl border border-brand-100">
                    {recipeId ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        Active Link: Stock movements will log automatically upon customer or admin purchase.
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        Select a recipe to link raw materials to this product.
                      </span>
                    )}
                  </div>
                </div>
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
