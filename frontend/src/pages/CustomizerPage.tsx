import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Palette,
  Type,
  Gem,
  Cpu,
  ShoppingCart,
  Check,
  ShieldCheck,
  RotateCcw,
  Clock,
  FlaskConical,
  Award,
  Move,
  RotateCw,
} from 'lucide-react';
import { Customizer3DCanvas } from '../components/3d/Customizer3DCanvas';
import {
  useCustomizerStore,
  SHAPE_CONFIGS,
  RESIN_FINISHES,
  CustomizerShape,
  TextFinish,
  TextFont,
  StandOption,
} from '../store/useCustomizerStore';
import { useCartStore } from '../store/useCartStore';
import { useToastStore } from '../store/useToastStore';
import { Link, Navigate } from 'react-router-dom';
import { useSettingsStore } from '../store/useSettingsStore';

export const CustomizerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shape' | 'finish' | 'text' | 'inclusions' | 'stand'>('shape');
  const { addItem, setIsOpen } = useCartStore();
  const { addToast } = useToastStore();
  const { customizerEnabled, enabledCustomizerProducts } = useSettingsStore();

  const {
    shape,
    setShape,
    resinFinish,
    setResinFinish,
    customText,
    setCustomText,
    subText,
    setSubText,
    fontFamily,
    setFontFamily,
    textFinish,
    setTextFinish,
    textSize,
    setTextSize,
    textPositionPreset,
    setTextPositionPreset,
    textPosX,
    setTextPosX,
    textPosY,
    setTextPosY,
    textRotation,
    setTextRotation,
    resetTextPosition,
    inclusions,
    toggleInclusion,
    standOption,
    setStandOption,
    calculatePrice,
    loadPreset,
    resetCustomizer,
  } = useCustomizerStore();

  // If current shape is disabled, switch directly to first active product
  React.useEffect(() => {
    if (
      enabledCustomizerProducts &&
      enabledCustomizerProducts.length > 0 &&
      !enabledCustomizerProducts.includes(shape)
    ) {
      const firstActive = enabledCustomizerProducts[0] as CustomizerShape;
      if (firstActive && SHAPE_CONFIGS[firstActive]) {
        setShape(firstActive);
      }
    }
  }, [enabledCustomizerProducts, shape, setShape]);

  const currentShape = SHAPE_CONFIGS[shape] || SHAPE_CONFIGS['nameplate-rect'];
  const currentFinish = RESIN_FINISHES[resinFinish] || RESIN_FINISHES['sapphire-ocean'];
  const totalPrice = calculatePrice();

  const handleAddToCart = () => {
    const activeInclusionNames = inclusions
      .filter((i) => i.active && (!i.applicableShapes || i.applicableShapes.includes(shape)))
      .map((i) => i.name);

    const customTitle = customText.trim()
      ? `Custom ${currentShape.name} ("${customText}")`
      : `Custom ${currentShape.name}`;

    const customizedProduct = {
      _id: `custom-${shape}-${Date.now()}`,
      name: customTitle,
      slug: `custom-${shape}-${Date.now()}`,
      price: totalPrice,
      originalPrice: Math.round(totalPrice * 1.2),
      discount: 15,
      rating: 5.0,
      reviewCount: 1,
      stock: 99,
      category: {
        _id: `cat-${shape}`,
        name: currentShape.categoryLabel,
        slug: `custom-${shape}`,
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
          alt: customTitle,
          isPrimary: true,
        },
      ],
      tags: ['Custom 3D', 'Handcrafted Resin', currentShape.name, currentFinish.name],
      isFeatured: true,
      description: `Bespoke handcrafted resin art. Shape: ${currentShape.name}, Finish: ${currentFinish.name}, Text: "${customText}", Inclusions: ${activeInclusionNames.join(', ')}.`,
      customizationOptions: {
        customText,
        subText,
        shape: currentShape.name,
        resinFinish: currentFinish.name,
        textFinish,
        fontFamily,
        inclusions: activeInclusionNames,
        standOption,
      },
    };

    addItem(customizedProduct as any, 1, currentFinish.name);
    addToast(`✨ Added "${customTitle}" to your cart (₹${totalPrice.toLocaleString('en-IN')})`, 'success');
    setIsOpen(true);
  };

  // Filter inclusions relevant to current shape
  const relevantInclusions = inclusions.filter(
    (inc) => !inc.applicableShapes || inc.applicableShapes.includes(shape)
  );

  // If Customizer or all products are disabled: directly hide by redirecting to gallery
  const isCustomizerOffline =
    !customizerEnabled || (enabledCustomizerProducts && enabledCustomizerProducts.length === 0);

  if (isCustomizerOffline) {
    return <Navigate to="/shop" replace />;
  }

  const categoryPresets = [
    { id: 'nameplate-rect', preset: 'nameplate', label: '🏡 Nameplate' },
    { id: 'keychain-initial', preset: 'keychain', label: '🔑 Keychain' },
    { id: 'thali-puja', preset: 'thali', label: '🪔 Pooja Thali' },
    { id: 'frame-photo', preset: 'frame', label: '🖼️ Memory Frame' },
    { id: 'clock-round-12', preset: 'clock', label: '⏱️ Wall Clock' },
  ];

  return (
    <div className="min-h-screen bg-art-950 text-art-300 font-sans pb-24">
      {/* Top Banner Header */}
      <div className="border-b border-art-800/80 bg-gradient-to-r from-art-950 via-art-900 to-art-950 py-6 px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="w-full max-w-[1760px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-600 mb-1">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Bespoke 3D Studio & Co-Creation Workshop</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-art-300 tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Design Keychains, Nameplates, Thalis & Frames
            </h1>
            <p className="text-xs sm:text-sm text-art-500 mt-1 max-w-2xl">
              Co-create personalized resin art in real time — initial keychains, house nameplates, wedding aarti thalis, memory photo frames & clocks with instant pricing.
            </p>
          </div>

          {/* Preset Quick Styles / Category Bar */}
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-xs font-bold text-art-500 mr-1">Choose Category:</span>
            {categoryPresets
              .filter((cat) => (enabledCustomizerProducts ?? []).includes(cat.id))
              .map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setShape(cat.id as any);
                    loadPreset(cat.preset);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    shape === cat.id
                      ? 'bg-brand-500/20 border-brand-400 text-brand-300 shadow'
                      : 'bg-art-900 border-art-800 text-art-400 hover:text-art-300'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              ))}

            <button
              onClick={resetCustomizer}
              title="Reset"
              className="p-1.5 rounded-full text-art-500 hover:text-art-300 hover:bg-art-900 border border-art-800 transition-all ml-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Left 3D Canvas, Right Control Tabs */}
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: 3D Canvas + Spec Badges (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Customizer3DCanvas className="h-[420px] sm:h-[480px] lg:h-[540px] w-full" />

            {/* Live Studio Spec Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-art-900/80 border border-art-800 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-art-500 font-bold uppercase">Dimensions</p>
                  <p className="text-xs font-bold text-art-300 truncate">{currentShape.dimensions.split(' ')[0]}</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-art-900/80 border border-art-800 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-art-500 font-bold uppercase">Resin Weight</p>
                  <p className="text-xs font-bold text-art-300">{currentShape.resinGrams}g Crystal 2:1</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-art-900/80 border border-art-800 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-art-500 font-bold uppercase">Cure Cycle</p>
                  <p className="text-xs font-bold text-art-300">
                    {shape === 'keychain-initial' ? '12h Quick Cure' : '24–36h Demold'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-art-900/80 border border-art-800 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Award className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-art-500 font-bold uppercase">Quality Standard</p>
                  <p className="text-xs font-bold text-art-300">Grade A High-Gloss</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Customization Control Panel (5 Cols) */}
          <div className="lg:col-span-5 bg-art-900/90 backdrop-blur-xl border border-art-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
            <div>
              {/* Tab Navigation Bar */}
              <div className="flex items-center gap-1.5 p-1.5 bg-art-950 rounded-2xl border border-art-800 overflow-x-auto touch-pan-x mb-5">
                {[
                  { id: 'shape', label: '1. Product', icon: Layers },
                  { id: 'finish', label: '2. Resin Swirl', icon: Palette },
                  { id: 'text', label: '3. Text 3D', icon: Type },
                  { id: 'inclusions', label: '4. Accents', icon: Gem },
                  { id: 'stand', label: '5. Mount', icon: Cpu },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-1 justify-center ${
                      activeTab === id
                        ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-md glow-brand'
                        : 'text-art-400 hover:text-art-300 hover:bg-art-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Tab 1: Product Category & Shape Selection */}
              {activeTab === 'shape' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-art-300">Choose Custom Product</h3>
                    <span className="text-xs text-brand-600 font-mono">Step 1 of 5</span>
                  </div>

                  <div className="space-y-2.5">
                    {Object.values(SHAPE_CONFIGS)
                      .filter((s) => (enabledCustomizerProducts ?? []).includes(s.id))
                      .map((s) => {
                        const isSelected = shape === s.id;
                        return (
                          <div
                            key={s.id}
                            onClick={() => setShape(s.id)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-brand-500/10 border-brand-500 shadow-md glow-brand'
                                : 'bg-art-950/60 border-art-800 hover:border-art-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                  isSelected
                                    ? 'border-brand-500 bg-brand-500 text-white'
                                    : 'border-art-700 bg-art-900'
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-art-300">{s.name}</h4>
                                <p className="text-[11px] text-art-500">{s.description}</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-brand-500">
                                ₹{s.basePrice.toLocaleString('en-IN')}
                              </span>
                              <p className="text-[10px] text-art-500">{s.resinGrams}g resin</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Tab 2: Resin Finish & Swirl Colors */}
              {activeTab === 'finish' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-art-300">Select Resin Colorway Theme</h3>
                    <span className="text-xs text-brand-600 font-mono">Step 2 of 5</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {Object.values(RESIN_FINISHES).map((f) => {
                      const isSelected = resinFinish === f.id;
                      return (
                        <div
                          key={f.id}
                          onClick={() => setResinFinish(f.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-brand-500/10 border-brand-500 shadow glow-brand'
                              : 'bg-art-950/60 border-art-800 hover:border-art-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 mb-2">
                            <div
                              className="w-7 h-7 rounded-xl shadow border border-white/20 shrink-0"
                              style={{
                                background: `radial-gradient(circle at 30% 30%, ${f.accentColor}, ${f.secondaryColor}, ${f.primaryColor})`,
                              }}
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-art-300 truncate">{f.name}</h4>
                              <span className="text-[10px] text-brand-600 font-semibold">
                                {f.micaShimmer ? '✨ Mica Shimmer' : '💎 Gloss Mirror'}
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] text-art-500 leading-snug line-clamp-2">
                            {f.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: Custom 3D Embossed Typography */}
              {activeTab === 'text' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-art-300">Personalized 3D Lettering</h3>
                    <span className="text-xs text-brand-600 font-mono">Step 3 of 5</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-art-400 mb-1">
                        {shape === 'keychain-initial'
                          ? 'Initial Letter / First Name'
                          : shape === 'thali-puja'
                          ? 'Aarti Sacred Text / Family Name'
                          : shape === 'frame-photo'
                          ? 'Couple Name / Memory Quote'
                          : 'Primary House Name / Family Name'}
                      </label>
                      <input
                        type="text"
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder={
                          shape === 'keychain-initial'
                            ? 'e.g. A or Ashish'
                            : shape === 'thali-puja'
                            ? 'e.g. शुभ लाभ / The Sharma Family'
                            : shape === 'frame-photo'
                            ? 'e.g. Always & Forever / Rohit & Priya'
                            : "e.g. The Sharma's / Villa Nirvana"
                        }
                        maxLength={28}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-art-950 border border-art-800 text-art-300 text-xs font-medium focus:border-brand-500 focus:outline-hidden"
                      />
                    </div>

                    {shape !== 'keychain-initial' && (
                      <div>
                        <label className="block text-xs font-semibold text-art-400 mb-1">
                          {shape === 'frame-photo'
                            ? 'Date / Occasion (Optional)'
                            : shape === 'thali-puja'
                            ? 'Occasion Subtitle (Optional)'
                            : 'Flat / Bungalow No. / Subtext (Optional)'}
                        </label>
                        <input
                          type="text"
                          value={subText}
                          onChange={(e) => setSubText(e.target.value)}
                          placeholder={
                            shape === 'frame-photo'
                              ? 'e.g. 14.02.2024 / Happy Anniversary'
                              : shape === 'thali-puja'
                              ? 'e.g. Wedding Aarti / Diwali Pooja'
                              : 'e.g. Bungalow 42 / Flat 504'
                          }
                          maxLength={24}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-art-950 border border-art-800 text-art-300 text-xs font-medium focus:border-brand-500 focus:outline-hidden"
                        />
                      </div>
                    )}

                    {/* Metallic Finish Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-art-400 mb-1.5">
                        Metallic Lettering Finish
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'gold', label: '24K Gold', color: '#f59e0b' },
                          { id: 'silver', label: 'Silver Chrome', color: '#e2e8f0' },
                          { id: 'rose-gold', label: 'Rose Gold', color: '#fb7185' },
                          { id: 'white', label: 'Pearl White', color: '#ffffff' },
                        ].map((fin) => (
                          <button
                            key={fin.id}
                            onClick={() => setTextFinish(fin.id as TextFinish)}
                            className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                              textFinish === fin.id
                                ? 'border-brand-500 bg-brand-50 text-brand-700 font-extrabold'
                                : 'border-art-800 bg-art-950 text-art-400 hover:text-art-300'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full shadow"
                              style={{ backgroundColor: fin.color }}
                            />
                            <span>{fin.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Text Size Scale Slider */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-art-400 mb-1">
                        <span>Lettering Size Scale</span>
                        <span className="font-mono text-brand-500">{(textSize * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.7"
                        max="1.5"
                        step="0.05"
                        value={textSize}
                        onChange={(e) => setTextSize(parseFloat(e.target.value))}
                        className="w-full accent-brand-500 cursor-pointer"
                      />
                    </div>

                    {/* 3D Text Placement & Alignment Controls */}
                    <div className="pt-3 border-t border-art-800/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Move className="w-3.5 h-3.5 text-brand-500" />
                          <span className="text-xs font-bold text-art-300">Text Placement & Alignment</span>
                        </div>
                        <button
                          type="button"
                          onClick={resetTextPosition}
                          className="text-[10px] text-art-400 hover:text-brand-400 flex items-center gap-1 px-2 py-1 rounded-lg bg-art-950 border border-art-800 hover:border-brand-500/50 transition-all"
                          title="Reset text to default center position"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      </div>

                      {/* Quick Position Presets */}
                      <div>
                        <label className="block text-[11px] font-semibold text-art-400 mb-1.5">
                          Preset Placement Positions
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {[
                            { id: 'center', label: 'Center', icon: '🎯' },
                            { id: 'top', label: 'Top', icon: '⬆️' },
                            { id: 'bottom', label: 'Bottom', icon: '⬇️' },
                            { id: 'left', label: 'Left', icon: '⬅️' },
                            { id: 'right', label: 'Right', icon: '➡️' },
                          ].map((pos) => (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => setTextPositionPreset(pos.id as any)}
                              className={`py-1.5 px-1 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all ${
                                textPositionPreset === pos.id
                                  ? 'border-brand-500 bg-brand-500/20 text-brand-300 shadow-sm'
                                  : 'border-art-800 bg-art-950 text-art-400 hover:text-art-200'
                              }`}
                            >
                              <span className="text-xs">{pos.icon}</span>
                              <span>{pos.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Fine-Tuning Sliders */}
                      <div className="space-y-2.5 bg-art-950/60 p-3 rounded-2xl border border-art-800/80">
                        {/* Horizontal X Slider */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-semibold text-art-400 mb-1">
                            <span>Horizontal (X-Axis)</span>
                            <span className="font-mono text-brand-400 text-[10px]">
                              {textPosX === 0
                                ? 'Center (0.00)'
                                : textPosX > 0
                                ? `+${textPosX.toFixed(2)} (Right)`
                                : `${textPosX.toFixed(2)} (Left)`}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-1.2"
                            max="1.2"
                            step="0.05"
                            value={textPosX}
                            onChange={(e) => setTextPosX(parseFloat(e.target.value))}
                            className="w-full accent-brand-500 cursor-pointer h-1.5 bg-art-800 rounded-lg"
                          />
                        </div>

                        {/* Vertical Y Slider */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-semibold text-art-400 mb-1">
                            <span>Vertical (Y-Axis)</span>
                            <span className="font-mono text-brand-400 text-[10px]">
                              {textPosY === 0
                                ? 'Center (0.00)'
                                : textPosY > 0
                                ? `+${textPosY.toFixed(2)} (Down)`
                                : `${textPosY.toFixed(2)} (Up)`}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-1.0"
                            max="1.0"
                            step="0.05"
                            value={textPosY}
                            onChange={(e) => setTextPosY(parseFloat(e.target.value))}
                            className="w-full accent-brand-500 cursor-pointer h-1.5 bg-art-800 rounded-lg"
                          />
                        </div>

                        {/* Rotation Angle Slider */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-semibold text-art-400 mb-1">
                            <span className="flex items-center gap-1">
                              <RotateCw className="w-3 h-3 text-brand-500" />
                              <span>Rotation Angle</span>
                            </span>
                            <span className="font-mono text-brand-400 text-[10px]">
                              {textRotation > 0 ? `+${textRotation}°` : `${textRotation}°`}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-45"
                            max="45"
                            step="1"
                            value={textRotation}
                            onChange={(e) => setTextRotation(parseInt(e.target.value, 10))}
                            className="w-full accent-brand-500 cursor-pointer h-1.5 bg-art-800 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Inclusions & Accents */}
              {activeTab === 'inclusions' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-art-300">Inclusions & Embellishments</h3>
                    <span className="text-xs text-brand-600 font-mono">Step 4 of 5</span>
                  </div>

                  <div className="space-y-2.5">
                    {relevantInclusions.map((inc) => (
                      <div
                        key={inc.id}
                        onClick={() => toggleInclusion(inc.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          inc.active
                            ? 'bg-brand-500/10 border-brand-500 shadow-sm'
                            : 'bg-art-950/60 border-art-800 hover:border-art-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{inc.icon}</span>
                          <div>
                            <h4 className="text-xs font-bold text-art-300">{inc.name}</h4>
                            <p className="text-[10px] text-art-500">{inc.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="text-xs font-bold text-brand-500">
                            +₹{inc.price.toLocaleString('en-IN')}
                          </span>
                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                              inc.active
                                ? 'bg-brand-500 border-brand-500 text-white'
                                : 'border-art-700 bg-art-900'
                            }`}
                          >
                            {inc.active && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 5: Stand & Display Hardware */}
              {activeTab === 'stand' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-art-300">Mounting & Display Options</h3>
                    <span className="text-xs text-brand-600 font-mono">Step 5 of 5</span>
                  </div>

                  <div className="space-y-2.5">
                    {shape === 'keychain-initial' ? (
                      <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-art-300">Gold Split Keyring + Suede Tassel</h4>
                          <p className="text-[10px] text-art-500">Included standard with all keychains</p>
                        </div>
                        <span className="text-xs font-bold text-brand-400">INCLUDED</span>
                      </div>
                    ) : (
                      [
                        { id: 'none', label: 'Standard Wall Hook / Base', price: 0, desc: 'Included at zero extra cost' },
                        { id: 'brass-pegs', label: 'Brass Architectural Mounting Standoffs (4 pcs)', price: 199, desc: 'High-polish gold brass wall standoff screws' },
                        { id: 'acrylic-stand', label: 'Crystal Transparent Tabletop Stand', price: 149, desc: 'Clear acrylic angled display easel' },
                        { id: 'teak-wood', label: 'Solid Teak Wood Display Base', price: 399, desc: 'Handcrafted luxury natural oiled teak wood block' },
                        { id: 'walnut-wood', label: 'Dark Walnut Wood Display Base', price: 499, desc: 'Premium deep walnut wood stand with felt bottom' },
                      ].map((st) => {
                        const isSelected = standOption === st.id;
                        return (
                          <div
                            key={st.id}
                            onClick={() => setStandOption(st.id as StandOption)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-brand-500/10 border-brand-500 shadow-sm'
                                : 'bg-art-950/60 border-art-800 hover:border-art-700'
                            }`}
                          >
                            <div>
                              <h4 className="text-xs font-bold text-art-300">{st.label}</h4>
                              <p className="text-[10px] text-art-500">{st.desc}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-brand-500">
                                {st.price > 0 ? `+₹${st.price}` : 'FREE'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Sticky Action / Price Bar */}
            <div className="mt-6 pt-5 border-t border-art-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-art-500 uppercase tracking-wider block font-bold">
                    Custom Order Price
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-brand-500 font-mono">
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-art-500 line-through font-mono">
                      ₹{Math.round(totalPrice * 1.2).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Handcrafted
                  </span>
                  <p className="text-[10px] text-art-500">Dispatches in 2–4 days</p>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-600 via-rose-600 to-plum-600 hover:opacity-95 text-white font-bold text-sm shadow-xl glow-brand flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add Custom Design to Cart · ₹{totalPrice.toLocaleString('en-IN')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
