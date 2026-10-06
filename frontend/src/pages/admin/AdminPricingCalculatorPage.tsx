import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Calculator, DollarSign, Package, Sparkles, TrendingUp,
  Clock, ShieldAlert, ArrowRight, CheckCircle2, RotateCcw,
  Sliders, Layers, Box, HelpCircle, Save, Tag, Copy, Check, FileText, Share2
} from 'lucide-react';
import { Product } from '../../types';
import { AdminNavbar } from '../../components/admin/AdminNavbar';
import { useToastStore } from '../../store/useToastStore';
import { useStudioNoteStore } from '../../store/useStudioNoteStore';
import { useVoiceStore } from '../../store/useVoiceStore';
import { StudioInvoiceModal } from '../../components/admin/StudioInvoiceModal';
import { WorkshopClimateWidget } from '../../components/admin/WorkshopClimateWidget';
import { AIImageCostAnalyzerModal, AIAnalyzedCostData } from '../../components/admin/AIImageCostAnalyzerModal';
import api from '../../services/api';

export const AdminPricingCalculatorPage: React.FC = () => {
  const location = useLocation();
  const { addToast } = useToastStore();
  const { language } = useVoiceStore();
  const { addNote } = useStudioNoteStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customProjectName, setCustomProjectName] = useState('Resin Ocean Geode Coaster');
  const [updatingPrice, setUpdatingPrice] = useState(false);
  const [quoteLanguage, setQuoteLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  useEffect(() => {
    setQuoteLanguage(language);
  }, [language]);

  // 1. Resin Material Cost
  const [resinWeightGrams, setResinWeightGrams] = useState<number>(80);
  const [resinPricePerGram, setResinPricePerGram] = useState<number>(0.8);
  const [bulkPackCost, setBulkPackCost] = useState<number>(800);
  const [bulkPackGrams, setBulkPackGrams] = useState<number>(1000);
  const [showBulkCalc, setShowBulkCalc] = useState<boolean>(false);

  const handleBulkCalcUpdate = (cost: number, weight: number) => {
    setBulkPackCost(cost);
    setBulkPackGrams(weight);
    if (weight > 0) {
      const calculatedRate = Number((cost / weight).toFixed(4));
      setResinPricePerGram(calculatedRate);
    }
  };

  // 2. Additives & Inks
  const [pigmentCost, setPigmentCost] = useState<number>(15);

  // 3. Hardware & Findings
  const [hardwareCost, setHardwareCost] = useState<number>(20);

  // 4. Packaging & Box
  const [packagingCost, setPackagingCost] = useState<number>(25);

  // 5. Crafting Labor
  const [laborMinutes, setLaborMinutes] = useState<number>(20);
  const [hourlyWage, setHourlyWage] = useState<number>(180);

  // 6. Overheads / Wastage / Electricity
  const [overheadCost, setOverheadCost] = useState<number>(15);

  // Pricing Strategy: Target Profit Margin %
  const [profitMarginPercent, setProfitMarginPercent] = useState<number>(55);

  // Read URL query parameters if exported from Resin Calculator or Voice
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryCost = params.get('resinCost');
    const queryWeight = params.get('resinWeight');
    const queryRate = params.get('pricePerGram');
    const openInvoice = params.get('openInvoice');

    if (queryWeight) setResinWeightGrams(Number(queryWeight));
    if (queryRate) setResinPricePerGram(Number(queryRate));
    if (openInvoice === 'true') setIsInvoiceOpen(true);
  }, [location.search]);

  // Fetch catalog products for selection
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data.data || []);
      } catch (err) {
        console.error('Failed to load store products:', err);
      }
    };
    fetchCatalog();
  }, []);

  // Cost Computations
  const resinCost = resinWeightGrams * resinPricePerGram;
  const laborCost = (laborMinutes / 60) * hourlyWage;

  const totalMaterialCost = resinCost + pigmentCost + hardwareCost + packagingCost;
  const totalUnitCost = totalMaterialCost + laborCost + overheadCost;

  // Selling Price Calculation:
  // Selling Price = Total Cost ÷ (1 - Margin%)
  const marginDecimal = profitMarginPercent / 100;
  const recommendedPrice =
    marginDecimal < 1
      ? Math.round(totalUnitCost / (1 - marginDecimal))
      : Math.round(totalUnitCost * 2);

  const profitPerPiece = recommendedPrice - totalUnitCost;
  const markupPercent = totalUnitCost > 0 ? (profitPerPiece / totalUnitCost) * 100 : 0;

  // Handle updating catalog product price in database
  const handleUpdateStorePrice = async () => {
    if (!selectedProduct) return;

    setUpdatingPrice(true);
    try {
      await api.put(`/products/${selectedProduct._id}`, {
        price: recommendedPrice,
      });
      addToast(`Store price for "${selectedProduct.title}" updated to ₹${recommendedPrice}! ✨`, 'success');
      setSelectedProduct({ ...selectedProduct, price: recommendedPrice });
    } catch (err) {
      addToast('Failed to update store catalog price', 'error');
    } finally {
      setUpdatingPrice(false);
    }
  };

  const [copiedQuote, setCopiedQuote] = useState(false);

  const PRODUCT_TEMPLATES = [
    { label: '💎 Keychain', name: 'Custom Alphabet / Shaker Keychain', resin: 30, pigment: 15, hardware: 20, packaging: 15, laborMins: 15, margin: 60 },
    { label: '☕ Coaster', name: 'Ocean Wave Geode Coaster', resin: 80, pigment: 25, hardware: 0, packaging: 25, laborMins: 20, margin: 55 },
    { label: '📖 Bookmark', name: 'Floral Gold Flake Bookmark', resin: 30, pigment: 15, hardware: 10, packaging: 15, laborMins: 12, margin: 60 },
    { label: '💍 Jewelry Pendant', name: 'Preserved Flower Pendant Necklace', resin: 20, pigment: 20, hardware: 35, packaging: 20, laborMins: 25, margin: 65 },
    { label: '🪴 Trinket Tray', name: 'Marble Agate Vanity Tray', resin: 160, pigment: 40, hardware: 60, packaging: 35, laborMins: 35, margin: 55 },
    { label: '🏷️ Name Plate', name: 'Personalized Acrylic & Resin Desk Plate', resin: 250, pigment: 50, hardware: 40, packaging: 40, laborMins: 45, margin: 55 },
    { label: '🕰️ Wall Clock', name: '12-inch Luxury Crystal Wall Clock', resin: 350, pigment: 80, hardware: 120, packaging: 60, laborMins: 60, margin: 60 },
    { label: '🌸 Flower Cube', name: 'Wedding Floral Keepsake Cube', resin: 300, pigment: 30, hardware: 0, packaging: 50, laborMins: 50, margin: 65 },
  ];

  const applyTemplate = (t: typeof PRODUCT_TEMPLATES[0]) => {
    setCustomProjectName(t.name);
    setSelectedProduct(null);
    setResinWeightGrams(t.resin);
    setPigmentCost(t.pigment);
    setHardwareCost(t.hardware);
    setPackagingCost(t.packaging);
    setLaborMinutes(t.laborMins);
    setProfitMarginPercent(t.margin);
    addToast(`Loaded ${t.label} costing template ✨`, 'info');
  };

  const copyQuoteSummary = () => {
    let quoteText = '';
    const itemName = selectedProduct ? selectedProduct.title : customProjectName;

    if (quoteLanguage === 'hi') {
      quoteText = `🎨 *रेज़िन आर्ट्स — ग्राहक कोटेशन*
━━━━━━━━━━━━━━━━━━━━
📦 *उत्पाद*: ${itemName}
🧪 *कच्चा रेजिन*: ${resinWeightGrams}g (₹${resinCost.toFixed(0)})
🎨 *रंग व पिगमेंट*: ₹${pigmentCost}
🧰 *हार्डवेयर व फिटिंग*: ₹${hardwareCost}
⏱️ *कारीगरी मजदूरी*: ${laborMinutes} मिनट (₹${laborCost.toFixed(0)})
🎁 *उपहार पैकेजिंग*: ₹${packagingCost}
⚡ *स्टूडियो खर्च*: ₹${overheadCost}
━━━━━━━━━━━━━━━━━━━━
💰 *अंतिम विक्रय मूल्य*: ₹${recommendedPrice.toLocaleString('en-IN')}
✨ *निर्माण समय*: 3 से 5 कार्य दिवस
━━━━━━━━━━━━━━━━━━━━`;
    } else if (quoteLanguage === 'mr') {
      quoteText = `🎨 *रेझिन आर्ट्स — ग्राहक कोटेशन*
━━━━━━━━━━━━━━━━━━━━
📦 *उत्पाद*: ${itemName}
🧪 *कच्चा रेझिन*: ${resinWeightGrams}g (₹${resinCost.toFixed(0)})
🎨 *रंग व मायका पिगमेंट*: ₹${pigmentCost}
🧰 *हार्डवेअर व कड्या*: ₹${hardwareCost}
⏱️ *कारीगरी मजुरी*: ${laborMinutes} मिनिटे (₹${laborCost.toFixed(0)})
🎁 *गिफ्ट पॅकेजिंग*: ₹${packagingCost}
⚡ *स्टुडिओ खर्च*: ₹${overheadCost}
━━━━━━━━━━━━━━━━━━━━
💰 *अंतिम विक्री किंमत*: ₹${recommendedPrice.toLocaleString('en-IN')}
✨ *तयार करण्याचा कालावधी*: 3 ते 5 कामकाजाचे दिवस
━━━━━━━━━━━━━━━━━━━━`;
    } else {
      quoteText = `🎨 *Rasin Arts — Client Quotation*
━━━━━━━━━━━━━━━━━━━━
📦 *Item*: ${itemName}
🧪 *Raw Resin*: ${resinWeightGrams}g (₹${resinCost.toFixed(0)})
🎨 *Pigments & Inks*: ₹${pigmentCost}
🧰 *Hardware & Findings*: ₹${hardwareCost}
⏱️ *Crafting Labor*: ${laborMinutes} mins (₹${laborCost.toFixed(0)})
🎁 *Luxury Gift Packaging*: ₹${packagingCost}
⚡ *Studio Overheads*: ₹${overheadCost}
━━━━━━━━━━━━━━━━━━━━
💰 *Quoted Selling Price*: ₹${recommendedPrice.toLocaleString('en-IN')}
✨ *Production Window*: 3 to 5 business days
━━━━━━━━━━━━━━━━━━━━`;
    }

    navigator.clipboard.writeText(quoteText);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2500);
    addToast(
      quoteLanguage === 'hi'
        ? 'ग्राहक कोटेशन क्लिपबोर्ड पर कॉपी हो गया! 📋'
        : quoteLanguage === 'mr'
        ? 'ग्राहक कोटेशन क्लिपबोर्डवर कॉपी झाले! 📋'
        : 'Client quote copied to clipboard! 📋',
      'success'
    );
  };

  const saveQuoteToNotes = async () => {
    const summary = `Quotation for ${selectedProduct ? selectedProduct.title : customProjectName}:
• Total Cost: ₹${totalUnitCost.toFixed(2)}
• Resin: ${resinWeightGrams}g (₹${resinCost.toFixed(2)})
• Selling Price: ₹${recommendedPrice} (${profitMarginPercent}% margin)`;

    await addNote({
      title: `Quote: ${selectedProduct ? selectedProduct.title : customProjectName}`,
      content: summary,
      category: 'order_customization',
      priority: 'medium',
      productType: selectedProduct ? selectedProduct.title : customProjectName,
    });
    addToast('Quote saved to Studio Notepad 📝', 'success');
  };

  const handleSelectCatalogProduct = (productId: string) => {
    if (productId === 'custom') {
      setSelectedProduct(null);
      setCustomProjectName('Custom Resin Project');
      return;
    }
    const found = products.find((p) => p._id === productId);
    if (found) {
      setSelectedProduct(found);
      setCustomProjectName(found.title);
    }
  };

  const batchQuantities = [1, 5, 10, 25, 50, 100];

  const handleApplyAICosting = (data: AIAnalyzedCostData) => {
    setCustomProjectName(data.projectName);
    setSelectedProduct(null);
    setResinWeightGrams(data.resinWeightGrams);
    setResinPricePerGram(data.resinPricePerGram);
    setPigmentCost(data.pigmentCost);
    setHardwareCost(data.hardwareCost);
    setPackagingCost(data.packagingCost);
    setLaborMinutes(data.laborMinutes);
    setOverheadCost(data.overheadCost);
    setProfitMarginPercent(data.profitMarginPercent);
    addToast(`✨ Applied AI Vision Costing & Per-Piece Pricing for "${data.projectName}"!`, 'success');
  };

  return (
    <div className="min-h-screen pb-16">
      <AdminNavbar
        title="Product Pricing & Profitability Calculator"
        subtitle="Itemized cost accounting: materials, hardware, packaging, crafting labor, and target profit margins"
      />

      <div className="p-3 xs:p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 max-w-7xl mx-auto">
        {/* 12-Step Artisan Product Templates Toolbar */}
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-art-800 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-art-300 flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="w-4 h-4 text-brand-600 shrink-0 animate-pulse" />
              <span>Costing Benchmarks &amp; AI Image Analyzer</span>
            </span>
            <button
              type="button"
              onClick={() => setIsAIModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-rose-500 hover:from-brand-500 hover:to-rose-400 text-white font-bold text-xs shadow-md glow-brand transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>🖼️ AI Image-to-Cost &amp; Per-Piece Price Analyzer</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 sm:gap-2">
            {PRODUCT_TEMPLATES.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => applyTemplate(t)}
                className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border text-left transition-all ${
                  customProjectName === t.name
                    ? 'bg-brand-50 border-brand-400 ring-2 ring-brand-400/40 text-brand-700'
                    : 'bg-art-950 hover:bg-white hover:border-brand-300 border-art-800 text-art-400'
                }`}
              >
                <div className="text-xs font-bold truncate">{t.label}</div>
                <div className="text-[9px] sm:text-[10px] text-art-500 font-mono mt-0.5">{t.resin}g • {t.laborMins}m</div>
              </button>
            ))}
          </div>
        </div>

        {/* Product Selection & Header */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-art-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <div className="text-[11px] sm:text-xs font-bold text-brand-700 uppercase tracking-wider">
              Project / Product Selection
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <select
                value={selectedProduct?._id || 'custom'}
                onChange={(e) => handleSelectCatalogProduct(e.target.value)}
                className="bg-art-950 border border-art-800 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs text-art-300 font-bold focus:outline-none focus:border-brand-500 max-w-full sm:max-w-xs"
              >
                <option value="custom">🛠️ Custom Workshop Project</option>
                <optgroup label="Store Catalog Products">
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      🛍️ {p.title} (Current: ₹{p.price})
                    </option>
                  ))}
                </optgroup>
              </select>

              {!selectedProduct && (
                <input
                  type="text"
                  value={customProjectName}
                  onChange={(e) => setCustomProjectName(e.target.value)}
                  placeholder="Enter project name..."
                  className="bg-art-950 border border-art-800 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs text-art-300 font-semibold focus:outline-none focus:border-brand-500 flex-1 sm:flex-none"
                />
              )}
            </div>
          </div>

          {selectedProduct && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-brand-50 border border-brand-200 shrink-0">
              <div className="text-right">
                <div className="text-[10px] text-brand-800 uppercase font-bold">Catalog Price</div>
                <div className="text-base font-black text-brand-700 font-mono">
                  ₹{selectedProduct.price}
                </div>
              </div>
              <button
                onClick={handleUpdateStorePrice}
                disabled={updatingPrice || selectedProduct.price === recommendedPrice}
                className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{updatingPrice ? 'Updating...' : `Set to ₹${recommendedPrice}`}</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: 6-Part Itemized Cost Inputs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-art-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-art-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-brand-50 text-brand-700">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-art-300">Itemized Cost Structure (Per Piece)</h3>
                    <p className="text-[11px] text-art-500">
                      Breakdown of raw materials, labor time, and studio overheads
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-art-500 uppercase font-bold">Total Unit Cost</span>
                  <div className="text-lg font-black text-art-300 font-mono">
                    ₹{totalUnitCost.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* 1. Resin & Hardener */}
              <div className="p-4 rounded-2xl bg-art-950 border border-art-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-700 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    1. Resin & Hardener Material Cost
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBulkCalc(!showBulkCalc)}
                      className="text-[10px] font-bold text-brand-700 hover:text-brand-800 underline bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200 transition-all"
                    >
                      {showBulkCalc ? 'Hide Bulk Calculator' : '🧮 Bulk Purchase Rate Calculator'}
                    </button>
                    <span className="text-xs font-mono font-bold text-brand-700">
                      Subtotal: ₹{resinCost.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-art-500 mb-1">
                      Resin Pour Weight (Grams) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={resinWeightGrams}
                      onChange={(e) => setResinWeightGrams(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white border border-art-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-art-300 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-art-500 mb-1">
                      Resin Rate per Gram (₹ / g) *
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      value={resinPricePerGram}
                      onChange={(e) => setResinPricePerGram(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white border border-art-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-art-300 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Bulk Purchase Calculator Helper Drawer */}
                {showBulkCalc && (
                  <div className="p-3 rounded-xl bg-white border border-brand-200 space-y-2 text-xs animate-in fade-in">
                    <div className="flex items-center justify-between font-bold text-brand-800 text-[11px]">
                      <span>🧮 Calculate Price Per Gram From Bulk Pack</span>
                      <span className="text-[10px] font-mono text-brand-700">
                        {bulkPackCost && bulkPackGrams ? `₹${(bulkPackCost / bulkPackGrams).toFixed(4)} / gram` : ''}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-art-500 font-medium mb-0.5">Bulk Pack Price (₹)</label>
                        <input
                          type="number"
                          value={bulkPackCost}
                          onChange={(e) => handleBulkCalcUpdate(Number(e.target.value), bulkPackGrams)}
                          placeholder="e.g. 800"
                          className="w-full bg-art-950 border border-art-800 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-art-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-art-500 font-medium mb-0.5">Bulk Pack Weight (Grams)</label>
                        <input
                          type="number"
                          value={bulkPackGrams}
                          onChange={(e) => handleBulkCalcUpdate(bulkPackCost, Number(e.target.value))}
                          placeholder="e.g. 1000 (1kg)"
                          className="w-full bg-art-950 border border-art-800 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-art-300"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Part A / Part B 2:1 Auto Ratio Breakdown Pill */}
                {resinWeightGrams > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    <span className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-800 font-semibold border border-brand-200">
                      💧 Part A (Resin): <span className="font-bold">{((resinWeightGrams * 2) / 3).toFixed(1)}g</span> (₹{(((resinWeightGrams * 2) / 3) * resinPricePerGram).toFixed(2)})
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 font-semibold border border-purple-200">
                      🧪 Part B (Hardener): <span className="font-bold">{((resinWeightGrams * 1) / 3).toFixed(1)}g</span> (₹{(((resinWeightGrams * 1) / 3) * resinPricePerGram).toFixed(2)})
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Pigment, Mica, Inks */}
              <div className="p-4 rounded-2xl bg-art-950 border border-art-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-art-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    2. Pigment, Mica Powder & Drop Inks (₹ / piece)
                  </span>
                  <span className="text-xs font-mono font-bold text-art-300">
                    ₹{pigmentCost.toFixed(2)}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={pigmentCost}
                  onChange={(e) => setPigmentCost(Math.max(0, Number(e.target.value)))}
                  placeholder="e.g. 15"
                  className="w-full bg-white border border-art-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-art-300 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* 3. Keychain Hardware / Findings */}
              <div className="p-4 rounded-2xl bg-art-950 border border-art-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-art-300 flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-cyan-600" />
                    3. Hardware, Rings, Clock Hands & Inserts (₹ / piece)
                  </span>
                  <span className="text-xs font-mono font-bold text-art-300">
                    ₹{hardwareCost.toFixed(2)}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={hardwareCost}
                  onChange={(e) => setHardwareCost(Math.max(0, Number(e.target.value)))}
                  placeholder="e.g. 20"
                  className="w-full bg-white border border-art-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-art-300 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* 4. Packaging */}
              <div className="p-4 rounded-2xl bg-art-950 border border-art-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-art-300 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-purple-600" />
                    4. Packaging Box, Pouch, Bubble Wrap & Cards (₹ / piece)
                  </span>
                  <span className="text-xs font-mono font-bold text-art-300">
                    ₹{packagingCost.toFixed(2)}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={packagingCost}
                  onChange={(e) => setPackagingCost(Math.max(0, Number(e.target.value)))}
                  placeholder="e.g. 25"
                  className="w-full bg-white border border-art-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-art-300 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* 5. Crafting Labor Time */}
              <div className="p-4 rounded-2xl bg-art-950 border border-art-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-art-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    5. Crafting Labor & Finishing Time
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700">
                    Labor: ₹{laborCost.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-art-500 mb-1">
                      Crafting Time (Minutes / piece)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={laborMinutes}
                      onChange={(e) => setLaborMinutes(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white border border-art-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-art-300 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-art-500 mb-1">
                      Labor Hourly Wage (₹ / hour)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={hourlyWage}
                      onChange={(e) => setHourlyWage(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white border border-art-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-art-300 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-art-500">
                  Formula: ({laborMinutes} mins ÷ 60) × ₹{hourlyWage}/hr = ₹{laborCost.toFixed(2)}
                </p>
              </div>

              {/* 6. Studio Overheads / Wastage */}
              <div className="p-4 rounded-2xl bg-art-950 border border-art-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-art-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    6. Studio Overhead, Mold Wear & Wastage Allowance (₹)
                  </span>
                  <span className="text-xs font-mono font-bold text-art-300">
                    ₹{overheadCost.toFixed(2)}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={overheadCost}
                  onChange={(e) => setOverheadCost(Math.max(0, Number(e.target.value)))}
                  placeholder="e.g. 15"
                  className="w-full bg-white border border-art-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-art-300 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Pricing Strategy, Margin & Projections (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Profit Margin & Selling Price Output Card */}
            <div className="p-6 rounded-3xl bg-white border border-brand-300 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-art-800 pb-4">
                <span className="text-xs font-bold text-brand-700 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  Recommended Retail Price
                </span>
                <span className="text-[11px] font-bold text-art-500">
                  {customProjectName}
                </span>
              </div>

              {/* Recommended Selling Price Hero Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-500 via-rose-500 to-plum-600 text-white text-center shadow-lg space-y-1">
                <div className="text-xs uppercase tracking-wider font-bold text-white/90">
                  Recommended Selling Price
                </div>
                <div className="text-4xl font-black font-mono">
                  ₹{recommendedPrice.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-white/80">
                  Profit: <span className="font-bold text-white">₹{profitPerPiece.toFixed(0)}</span> ({profitMarginPercent}% margin)
                </div>
              </div>

              {/* Profit Margin Slider & Controls */}
              <div className="space-y-3 p-4 rounded-2xl bg-art-950 border border-art-800">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-art-400">Target Profit Margin:</span>
                  <span className="text-brand-700 font-mono text-sm">{profitMarginPercent}%</span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="85"
                  step="5"
                  value={profitMarginPercent}
                  onChange={(e) => setProfitMarginPercent(Number(e.target.value))}
                  className="w-full accent-brand-500 cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-art-500 font-semibold">
                  <span>10% (Low)</span>
                  <span>40% (Standard)</span>
                  <span>60% (Premium)</span>
                  <span>80% (Luxury)</span>
                </div>
              </div>

              {/* Key Financial KPIs */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-art-950 border border-art-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-art-500 uppercase">Unit Cost (COGS)</span>
                  <div className="text-base font-black font-mono text-art-300">
                    ₹{totalUnitCost.toFixed(2)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-0.5">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Gross Profit / Pc</span>
                  <div className="text-base font-black font-mono text-emerald-700">
                    +₹{profitPerPiece.toFixed(2)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-art-950 border border-art-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-art-500 uppercase">Markup on Cost</span>
                  <div className="text-base font-black font-mono text-art-300">
                    {markupPercent.toFixed(1)}%
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200 space-y-0.5">
                  <span className="text-[10px] font-bold text-brand-700 uppercase">Material Ratio</span>
                  <div className="text-base font-black font-mono text-brand-700">
                    {Math.round((totalMaterialCost / (totalUnitCost || 1)) * 100)}%
                  </div>
                </div>
              </div>

              {/* Automated Per-Gram Product Pricing Metrics Card */}
              {resinWeightGrams > 0 && (() => {
                const perGramCOGS = totalUnitCost / resinWeightGrams;
                const perGramSellingPrice = recommendedPrice / resinWeightGrams;
                const perGramProfit = profitPerPiece / resinWeightGrams;

                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-950/40 via-art-950 to-brand-900/30 border border-brand-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                        Per-Gram Product Pricing Metrics
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full border border-brand-500/30">
                        {resinWeightGrams}g Total Pour
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-art-900/80 border border-art-800">
                        <span className="text-[9px] text-art-500 uppercase block font-semibold">Cost / Gram</span>
                        <span className="text-xs font-black font-mono text-art-300">₹{perGramCOGS.toFixed(2)}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-brand-900/40 border border-brand-500/30">
                        <span className="text-[9px] text-brand-300 uppercase block font-semibold">Retail / Gram</span>
                        <span className="text-xs font-black font-mono text-brand-400">₹{perGramSellingPrice.toFixed(2)}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30">
                        <span className="text-[9px] text-emerald-400 uppercase block font-semibold">Profit / Gram</span>
                        <span className="text-xs font-black font-mono text-emerald-400">+₹{perGramProfit.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Shareable Client Quotation Card (@Quote) */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-50/80 via-white to-rose-50/50 border border-brand-200 space-y-4">
                <div className="flex items-center justify-between border-b border-brand-200/60 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-600" />
                    <span className="text-xs font-bold text-brand-800">
                      {quoteLanguage === 'hi' ? 'ग्राहक कोटेशन (@Quote)' : quoteLanguage === 'mr' ? 'ग्राहक कोटेशन (@Quote)' : 'Client Quotation Summary (@Quote)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center p-0.5 rounded-lg bg-brand-100/70 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setQuoteLanguage('en')}
                        className={`px-1.5 py-0.5 rounded ${quoteLanguage === 'en' ? 'bg-brand-600 text-white' : 'text-brand-700 hover:text-brand-900'}`}
                      >
                        EN
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuoteLanguage('hi')}
                        className={`px-1.5 py-0.5 rounded ${quoteLanguage === 'hi' ? 'bg-brand-600 text-white' : 'text-brand-700 hover:text-brand-900'}`}
                      >
                        हिं
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuoteLanguage('mr')}
                        className={`px-1.5 py-0.5 rounded ${quoteLanguage === 'mr' ? 'bg-brand-600 text-white' : 'text-brand-700 hover:text-brand-900'}`}
                      >
                        मरा
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs font-mono divide-y divide-art-800/40 text-art-400">
                  <div className="flex justify-between py-1">
                    <span>Resin ({resinWeightGrams}g):</span>
                    <span className="font-bold text-art-300">₹{resinCost.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Pigments & Inks:</span>
                    <span className="font-bold text-art-300">₹{pigmentCost}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Hardware / Findings:</span>
                    <span className="font-bold text-art-300">₹{hardwareCost}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Labor ({laborMinutes}m):</span>
                    <span className="font-bold text-art-300">₹{laborCost.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Gift Packaging:</span>
                    <span className="font-bold text-art-300">₹{packagingCost}</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-sm font-black text-brand-700 border-t-2 border-brand-300">
                    <span>Quoted Price:</span>
                    <span>₹{recommendedPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={copyQuoteSummary}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-brand-50 border border-brand-300 text-brand-700 text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    {copiedQuote ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedQuote ? 'Copied!' : 'Copy Quote'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={saveQuoteToNotes}
                    className="py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save to Notes</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsInvoiceOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-rose-600 to-brand-600 hover:opacity-95 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>📄 Generate Branded PDF Quotation / Invoice</span>
                </button>
              </div>
            </div>

            {/* Workshop Climate & Cure Compensator Widget */}
            <WorkshopClimateWidget />

            {/* Batch Economics Projections */}
            <div className="p-6 rounded-3xl bg-white border border-art-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-art-300 uppercase tracking-wider">
                  Batch Run Economic Projections
                </h4>
                <span className="text-[10px] text-art-500">Revenue vs Net Profit</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-art-800 text-[10px] font-bold text-art-500 uppercase">
                      <th className="py-2">Batch</th>
                      <th className="py-2">Total Cost</th>
                      <th className="py-2">Revenue</th>
                      <th className="py-2 text-right">Net Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-art-800 font-mono text-[11px]">
                    {batchQuantities.map((qty) => (
                      <tr key={qty} className="hover:bg-art-950">
                        <td className="py-2 font-bold text-art-300">{qty} pcs</td>
                        <td className="py-2 text-art-500">₹{(totalUnitCost * qty).toFixed(0)}</td>
                        <td className="py-2 font-semibold text-art-400">₹{(recommendedPrice * qty).toFixed(0)}</td>
                        <td className="py-2 text-right font-black text-emerald-700">
                          +₹{(profitPerPiece * qty).toFixed(0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Studio Invoice Modal */}
      <StudioInvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        initialData={{
          productName: selectedProduct?.title || customProjectName,
          productDescription: `Handcrafted resin art piece (${resinWeightGrams}g resin, ${laborMinutes} mins artisan crafting, luxury packaging).`,
          items: [
            { name: `Epoxy Casting Resin (${resinWeightGrams}g)`, category: 'Raw Materials', qty: resinWeightGrams, unit: 'g', unitPrice: resinPricePerGram, total: resinCost },
            { name: 'Pigments, Mica Powder & Drop Inks', category: 'Pigments', qty: 1, unit: 'set', unitPrice: pigmentCost, total: pigmentCost },
            { name: 'Hardware, Rings, Clock Hands & Inserts', category: 'Hardware', qty: 1, unit: 'pcs', unitPrice: hardwareCost, total: hardwareCost },
            { name: 'Artisan Craftsmanship & Pouring Labor', category: 'Labor', qty: laborMinutes, unit: 'mins', unitPrice: Number((hourlyWage / 60).toFixed(2)), total: laborCost },
            { name: 'Packaging Box, Bubble Wrap & Care Card', category: 'Packaging', qty: 1, unit: 'pcs', unitPrice: packagingCost, total: packagingCost },
            { name: 'Studio Utilities & Overhead Utility', category: 'Overhead', qty: 1, unit: 'job', unitPrice: overheadCost, total: overheadCost },
          ],
          subtotal: Number(totalUnitCost.toFixed(2)),
          grandTotal: Number(recommendedPrice.toFixed(0)),
        }}
      />

      {/* AI Image Cost & Per-Piece Price Analyzer Modal */}
      <AIImageCostAnalyzerModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onApplyCosting={handleApplyAICosting}
      />
    </div>
  );
};
