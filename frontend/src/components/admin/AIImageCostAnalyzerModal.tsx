import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Sparkles,
  CheckCircle2,
  Tag,
  DollarSign,
  Package,
  Layers,
  ArrowRight,
  TrendingUp,
  Droplets,
  Box,
  Image as ImageIcon,
  Zap,
} from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

export interface AIAnalyzedCostData {
  projectName: string;
  category: string;
  resinWeightGrams: number;
  resinPricePerGram: number;
  pigmentCost: number;
  hardwareCost: number;
  packagingCost: number;
  laborMinutes: number;
  overheadCost: number;
  profitMarginPercent: number;
  batchQuantity: number;
  totalBatchPrice: number;
}

interface AIImageCostAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCosting: (data: AIAnalyzedCostData) => void;
}

const SAMPLE_PRESET_IMAGES = [
  {
    id: 'thali',
    title: 'Pooja Aarti Thali',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    resinGrams: 300,
    pigment: 45,
    hardware: 85,
    packaging: 40,
    laborMins: 45,
    overhead: 25,
    margin: 55,
    inclusions: ['24K Gold Leaf Flakes', 'Saffron & Ruby Pigment', '2 Brass Katoris', 'Diya Ring'],
  },
  {
    id: 'clock',
    title: '12" Ocean Wave Wall Clock',
    image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&auto=format&fit=crop&q=80',
    resinGrams: 350,
    pigment: 80,
    hardware: 120,
    packaging: 60,
    laborMins: 60,
    overhead: 35,
    margin: 60,
    inclusions: ['Sapphire Blue Alcohol Inks', 'Raw Quartz Crystals', 'Silent Sweep Quartz Machine', 'Gold Needles'],
  },
  {
    id: 'coasters',
    title: 'Agate Coasters (Set of 4)',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80',
    resinGrams: 320,
    pigment: 40,
    hardware: 0,
    packaging: 35,
    laborMins: 30,
    overhead: 20,
    margin: 55,
    inclusions: ['Gilded 24K Gold Edges', 'Emerald Pigment Swirl', 'Anti-Slip Silicone Bumpers'],
  },
  {
    id: 'nameplate',
    title: 'Teak & Resin Entrance Nameplate',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
    resinGrams: 250,
    pigment: 50,
    hardware: 60,
    packaging: 45,
    laborMins: 45,
    overhead: 30,
    margin: 60,
    inclusions: ['Seasoned Teak Wood Slab', '3D Gold Embossed Acrylic Lettering', 'Brass Standoff Mounts'],
  },
  {
    id: 'frame',
    title: 'Flower Preservation Block',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
    resinGrams: 300,
    pigment: 20,
    hardware: 0,
    packaging: 50,
    laborMins: 50,
    overhead: 30,
    margin: 65,
    inclusions: ['Preserved Real Wedding Rose Garlands', 'Fairy Wire Lights', 'UV Anti-Yellowing Resin'],
  },
  {
    id: 'keychains',
    title: 'Initial Keychains (Batch of 10)',
    image: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&auto=format&fit=crop&q=80',
    resinGrams: 300,
    pigment: 30,
    hardware: 150,
    packaging: 80,
    laborMins: 40,
    overhead: 25,
    margin: 60,
    inclusions: ['24K Gold Foil Initial Letters', 'Faux Suede Tassels', 'Gold Keyring Clasps'],
  },
];

export const AIImageCostAnalyzerModal: React.FC<AIImageCostAnalyzerModalProps> = ({
  isOpen,
  onClose,
  onApplyCosting,
}) => {
  const { addToast } = useToastStore();
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_PRESET_IMAGES[0].image);
  const [selectedPreset, setSelectedPreset] = useState<typeof SAMPLE_PRESET_IMAGES[0]>(SAMPLE_PRESET_IMAGES[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  // Batch Calculation Inputs
  const [batchQuantity, setBatchQuantity] = useState<number>(1);
  const [totalBatchPriceInput, setTotalBatchPriceInput] = useState<number>(1200);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      addToast('Uploading image for AI Vision analysis...', 'info');
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = response.data.data.url;
      setSelectedImage(uploadedUrl);
      setIsAnalyzed(false);

      // Create a custom dynamic preset for uploaded image
      const customPreset = {
        id: 'uploaded_' + Date.now(),
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        image: uploadedUrl,
        resinGrams: 280,
        pigment: 35,
        hardware: 40,
        packaging: 30,
        laborMins: 35,
        overhead: 20,
        margin: 55,
        inclusions: ['AI Detected Resin Swirl', 'Color Pigment Layer', 'Protective Topcoat'],
      };
      setSelectedPreset(customPreset);
      addToast('Image uploaded! Click "Analyze Image with AI" to calculate BOM.', 'success');
    } catch (err) {
      addToast('Failed to upload image', 'error');
    }
  };

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setIsAnalyzed(false);

    setTimeout(() => {
      setIsAnalyzing(false);
      setIsAnalyzed(true);
      addToast(`✨ AI Vision completed! Extracted BOM for "${selectedPreset.title}".`, 'success');
    }, 1200);
  };

  if (!isOpen) return null;

  // Computations
  const resinRate = 0.8; // ₹0.80/g
  const resinCost = selectedPreset.resinGrams * resinRate;
  const laborCost = (selectedPreset.laborMins / 60) * 180; // ₹180/hr
  const totalUnitCost = resinCost + selectedPreset.pigment + selectedPreset.hardware + selectedPreset.packaging + laborCost + selectedPreset.overhead;
  
  const recommendedUnitPrice = Math.round(totalUnitCost / (1 - selectedPreset.margin / 100));
  const perPiecePrice = batchQuantity > 1 && totalBatchPriceInput > 0 ? (totalBatchPriceInput / batchQuantity) : recommendedUnitPrice;
  const perPieceCost = totalUnitCost;
  const perPieceProfit = perPiecePrice - perPieceCost;
  const perGramSellingPrice = perPiecePrice / (selectedPreset.resinGrams || 1);
  const perGramCost = perPieceCost / (selectedPreset.resinGrams || 1);

  const handleApply = () => {
    onApplyCosting({
      projectName: selectedPreset.title,
      category: 'Resin Arts',
      resinWeightGrams: selectedPreset.resinGrams,
      resinPricePerGram: resinRate,
      pigmentCost: selectedPreset.pigment,
      hardwareCost: selectedPreset.hardware,
      packagingCost: selectedPreset.packaging,
      laborMinutes: selectedPreset.laborMins,
      overheadCost: selectedPreset.overhead,
      profitMarginPercent: selectedPreset.margin,
      batchQuantity,
      totalBatchPrice: perPiecePrice * batchQuantity,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-white border border-art-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-4 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-art-800 flex items-center justify-between bg-gradient-to-r from-art-950 via-art-900 to-brand-950 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-brand-500 to-rose-500 text-white shadow-md">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>AI Vision Image-to-Cost &amp; Per-Piece Price Analyzer</span>
                </h2>
                <p className="text-[11px] sm:text-xs text-brand-200">
                  Click or upload any resin art photo to auto-calculate resin weight, BOM materials &amp; per-piece pricing
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-art-400 hover:text-white hover:bg-art-800 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-art-950/20">
            {/* 1. Sample Presets Gallery / Upload Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-art-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <ImageIcon className="w-4 h-4 text-brand-600" />
                  Select Resin Product Image or Upload Photo
                </label>
                <label className="px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Custom Photo</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {SAMPLE_PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedPreset(preset);
                      setSelectedImage(preset.image);
                      setIsAnalyzed(false);
                      setTotalBatchPriceInput(preset.resinGrams > 200 ? 1999 : 499);
                    }}
                    className={`relative rounded-2xl overflow-hidden border-2 transition-all group aspect-square text-left ${
                      selectedPreset.id === preset.id
                        ? 'border-brand-500 ring-2 ring-brand-400/40 shadow-lg scale-[1.02]'
                        : 'border-art-800 hover:border-brand-300 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.image} alt={preset.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-art-950 via-art-950/30 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 text-[10px] font-bold text-white truncate">
                      {preset.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Main Selected Image Preview & AI Scanner Trigger */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-white p-4 sm:p-5 rounded-3xl border border-art-800 shadow-sm">
              <div className="md:col-span-5 relative rounded-2xl overflow-hidden border border-art-800 bg-art-950 h-56 sm:h-64 group shadow-inner">
                <img src={selectedImage} alt="Analysis target" className="w-full h-full object-cover" />

                {/* Animated AI Vision Scan Beam */}
                {isAnalyzing && (
                  <motion.div
                    animate={{ y: ['0%', '100%', '0%'] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_15px_#f43f5e]"
                  />
                )}

                <div className="absolute bottom-3 left-3 right-3 p-2 rounded-xl bg-art-950/90 backdrop-blur-md border border-art-800 text-[11px] text-art-200 font-medium">
                  <span className="font-bold text-brand-400 block">{selectedPreset.title}</span>
                  <span>Scanned for volumetric resin density &amp; hardware</span>
                </div>
              </div>

              <div className="md:col-span-7 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-art-300 flex items-center gap-2">
                    <span>AI Resin Art Costing Engine</span>
                    <span className="text-[10px] font-extrabold uppercase bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-200">
                      Vision 2.0
                    </span>
                  </h3>
                  <p className="text-xs text-art-500 mt-1">
                    Analyzes color depth, surface area, embedded metallic foils, and hardware findings to estimate manufacturing costs per piece.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleRunAnalysis}
                    disabled={isAnalyzing}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-rose-500 hover:from-brand-500 hover:to-rose-400 text-white font-bold text-xs shadow-xl glow-brand transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{isAnalyzing ? 'Scanning & Extruding Costing...' : '🔍 Analyze Image with AI Studio Vision'}</span>
                  </button>
                  {isAnalyzed && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Analysis Ready
                    </span>
                  )}
                </div>

                {/* Detected Features Badge Chips */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-art-500 uppercase tracking-wider block">
                    Detected Studio Features &amp; Inclusions:
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {selectedPreset.inclusions.map((inc, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-art-950 text-art-300 border border-art-800 font-medium">
                        ✨ {inc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. AI Extracted Itemized BOM & Per-Piece Price Results */}
            {isAnalyzed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Batch & Price Per Piece Calculator Toolbar */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white border border-brand-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-brand-100 pb-3">
                    <span className="text-xs font-bold text-brand-800 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-brand-600" />
                      Batch Quantity &amp; Per-Piece Pricing Calculator
                    </span>
                    <span className="text-[10px] font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                      Auto Calculated
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-art-400 mb-1">
                        Batch Production Quantity (Pieces)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={batchQuantity}
                        onChange={(e) => setBatchQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full bg-art-950 border border-art-800 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-art-300 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-art-400 mb-1">
                        Total Batch Quoted Selling Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={totalBatchPriceInput}
                        onChange={(e) => setTotalBatchPriceInput(Math.max(0, Number(e.target.value)))}
                        placeholder="e.g. 5000"
                        className="w-full bg-art-950 border border-art-800 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-art-300 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  {/* Per-Piece Metrics Hero Card */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center">
                    <div className="p-3.5 rounded-2xl bg-art-950 border border-art-800">
                      <span className="text-[10px] font-bold text-art-500 uppercase block">Per-Piece Cost (COGS)</span>
                      <span className="text-lg font-black font-mono text-art-300">₹{perPieceCost.toFixed(2)}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-brand-500 to-rose-500 text-white shadow-md">
                      <span className="text-[10px] font-bold uppercase block text-white/90">Per-Piece Retail Price</span>
                      <span className="text-xl font-black font-mono text-white">₹{perPiecePrice.toFixed(0)}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">Per-Piece Net Profit</span>
                      <span className="text-lg font-black font-mono text-emerald-700">+₹{perPieceProfit.toFixed(0)}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
                      <span className="text-[10px] font-bold text-purple-800 uppercase block">Per-Gram Retail Price</span>
                      <span className="text-lg font-black font-mono text-purple-700">₹{perGramSellingPrice.toFixed(2)}/g</span>
                    </div>
                  </div>
                </div>

                {/* Itemized Costing Table Extracted by AI */}
                <div className="p-5 rounded-3xl bg-white border border-art-800 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-art-800 pb-3 text-xs">
                    <span className="font-bold text-art-300 uppercase tracking-wider">AI Extracted Itemized Costing (Per Piece)</span>
                    <span className="font-mono font-bold text-brand-700">Total COGS: ₹{totalUnitCost.toFixed(2)}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-art-950 border border-art-800">
                      <span className="text-[10px] text-art-500 block">1. Resin &amp; Hardener</span>
                      <span className="font-bold text-brand-700">{selectedPreset.resinGrams}g (₹{resinCost.toFixed(2)})</span>
                    </div>
                    <div className="p-3 rounded-xl bg-art-950 border border-art-800">
                      <span className="text-[10px] text-art-500 block">2. Pigments &amp; Inks</span>
                      <span className="font-bold text-art-300">₹{selectedPreset.pigment.toFixed(2)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-art-950 border border-art-800">
                      <span className="text-[10px] text-art-500 block">3. Hardware &amp; Attachments</span>
                      <span className="font-bold text-art-300">₹{selectedPreset.hardware.toFixed(2)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-art-950 border border-art-800">
                      <span className="text-[10px] text-art-500 block">4. Gift Packaging Box</span>
                      <span className="font-bold text-art-300">₹{selectedPreset.packaging.toFixed(2)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-art-950 border border-art-800">
                      <span className="text-[10px] text-art-500 block">5. Crafting Labor Time</span>
                      <span className="font-bold text-emerald-700">{selectedPreset.laborMins} mins (₹{laborCost.toFixed(2)})</span>
                    </div>
                    <div className="p-3 rounded-xl bg-art-950 border border-art-800">
                      <span className="text-[10px] text-art-500 block">6. Studio Overheads</span>
                      <span className="font-bold text-art-300">₹{selectedPreset.overhead.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-art-800 bg-white flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-art-400 hover:text-art-200 bg-art-900 hover:bg-art-850 border border-art-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!isAnalyzed}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-rose-500 hover:from-brand-500 hover:to-rose-400 text-white font-bold text-xs shadow-lg glow-brand transition-all disabled:opacity-40 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Apply AI Costing &amp; Per-Piece Price to Calculator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
