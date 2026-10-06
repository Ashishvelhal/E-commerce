import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical, Calculator, Sparkles, ArrowRight, RotateCcw,
  Scale, Droplets, Info, Layers, Check, Copy, HelpCircle, CornerDownRight
} from 'lucide-react';
import { AdminNavbar } from '../../components/admin/AdminNavbar';
import { VoiceResinTimer } from '../../components/admin/VoiceResinTimer';
import { useToastStore } from '../../store/useToastStore';

interface RatioPreset {
  label: string;
  partA: number;
  partB: number;
  description: string;
}

const RATIO_PRESETS: RatioPreset[] = [
  { label: '2 : 1 (Standard Art Resin)', partA: 2, partB: 1, description: 'Default for jewelry, coasters, and art topcoats' },
  { label: '3 : 1 (Deep Pour / River Table)', partA: 3, partB: 1, description: 'For deep castings up to 2 inches depth' },
  { label: '1 : 1 (Equal Volume / Polyurethane)', partA: 1, partB: 1, description: 'Fast curing 1:1 craft resins' },
];

export const AdminResinCalculatorPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  // Kit Configuration
  const [kitPrice, setKitPrice] = useState<number>(1200);
  const [kitWeight, setKitWeight] = useState<number>(1500);
  const [selectedRatio, setSelectedRatio] = useState<RatioPreset>(RATIO_PRESETS[0]);

  // Project Input Modes: 'weight' | 'rectangle' | 'circle'
  const [calcMode, setCalcMode] = useState<'weight' | 'rectangle' | 'circle'>('weight');

  // Direct Weight Input
  const [productWeight, setProductWeight] = useState<number>(80);

  // Mold Dimension Inputs (cm)
  const [rectLength, setRectLength] = useState<number>(10);
  const [rectWidth, setRectWidth] = useState<number>(10);
  const [rectDepth, setRectDepth] = useState<number>(0.8);

  const [circleDiameter, setCircleDiameter] = useState<number>(10);
  const [circleDepth, setCircleDepth] = useState<number>(0.8);

  // Resin density constant (typical epoxy resin is ~1.1 g/cm³)
  const RESIN_DENSITY = 1.1;

  // Calculated Effective Weight (g)
  const getEffectiveWeight = (): number => {
    if (calcMode === 'weight') {
      return Math.max(0, productWeight || 0);
    } else if (calcMode === 'rectangle') {
      const volumeCm3 = Math.max(0, rectLength) * Math.max(0, rectWidth) * Math.max(0, rectDepth);
      return Number((volumeCm3 * RESIN_DENSITY).toFixed(1));
    } else if (calcMode === 'circle') {
      const radius = Math.max(0, circleDiameter) / 2;
      const volumeCm3 = Math.PI * Math.pow(radius, 2) * Math.max(0, circleDepth);
      return Number((volumeCm3 * RESIN_DENSITY).toFixed(1));
    }
    return 0;
  };

  const effectiveWeight = getEffectiveWeight();

  // Core Formulas as per specification
  const pricePerGram = kitWeight > 0 ? kitPrice / kitWeight : 0;
  const materialCost = effectiveWeight * pricePerGram;

  // Ratio split: Part A (Resin) & Part B (Hardener)
  const totalParts = selectedRatio.partA + selectedRatio.partB;
  const partAWeight = totalParts > 0 ? (effectiveWeight * selectedRatio.partA) / totalParts : 0;
  const partBWeight = totalParts > 0 ? (effectiveWeight * selectedRatio.partB) / totalParts : 0;

  const handleExportToPricing = () => {
    navigate(
      `/admin/pricing-calculator?resinCost=${materialCost.toFixed(2)}&resinWeight=${effectiveWeight}&pricePerGram=${pricePerGram.toFixed(4)}`
    );
    addToast('Resin cost exported to Product Pricing Calculator ✨', 'success');
  };

  const referenceExamples = [
    { weight: 30, note: 'Small keychain or bookmark' },
    { weight: 70, note: 'Single coaster casting' },
    { weight: 80, note: 'Standard coaster with embellishments' },
    { weight: 160, note: 'Pair of coasters or small trinket tray' },
    { weight: 350, note: 'Large geode tray or clock face' },
  ];

  return (
    <div className="min-h-screen pb-16">
      <AdminNavbar
        title="Resin Mixing & Material Cost Calculator"
        subtitle="Calculate accurate resin-to-hardener mixing ratios and raw material costs per piece"
      />

      <div className="p-3 xs:p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-8 max-w-7xl mx-auto">
        {/* Top Summary Banner */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-brand-600 via-brand-500 to-rose-600 text-white shadow-xl glow-brand flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Standard Art Resin Spec (₹0.80/g)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-sans">
              Material Cost Formula Engine
            </h2>
            <p className="text-[11px] sm:text-xs text-white/90 max-w-xl leading-relaxed">
              <span className="font-mono font-bold">Price Per Gram = Kit Price ÷ Kit Weight</span> • Current: ₹{kitPrice} ÷ {kitWeight}g = <span className="font-bold underline">₹{pricePerGram.toFixed(2)} per gram</span>
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shrink-0 text-left md:text-right w-full md:w-auto">
            <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/80 font-bold">
              Current Cost Rate
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono">
              ₹{pricePerGram.toFixed(2)}
              <span className="text-xs sm:text-sm font-normal text-white/80"> / gram</span>
            </div>
          </div>
        </div>

        {/* Hands-Free Voice-Controlled Stirring & Pot-Life Timer */}
        <VoiceResinTimer />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
          {/* Left Column: Kit & Mold Inputs (7 cols) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            {/* 1. Kit Configuration Card */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-art-800 shadow-xs space-y-4 sm:space-y-5">
              <div className="flex items-center justify-between border-b border-art-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-brand-50 text-brand-700">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-art-300">1. Resin Kit Details</h3>
                    <p className="text-[11px] text-art-500">Configure your purchase batch size and price</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setKitPrice(1200);
                    setKitWeight(1500);
                    setSelectedRatio(RATIO_PRESETS[0]);
                  }}
                  className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Defaults
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-art-400 mb-1.5">
                    Kit Purchase Price (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-art-500">₹</span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={kitPrice}
                      onChange={(e) => setKitPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-art-950 border border-art-800 rounded-xl pl-8 pr-4 py-2.5 text-xs text-art-300 font-mono font-bold focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-art-400 mb-1.5">
                    Total Kit Weight (Grams)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={kitWeight}
                      onChange={(e) => setKitWeight(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-art-950 border border-art-800 rounded-xl px-4 py-2.5 text-xs text-art-300 font-mono font-bold focus:outline-none focus:border-brand-500"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-art-500">grams</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-2">
                  Resin : Hardener Mixing Ratio
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {RATIO_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setSelectedRatio(preset)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedRatio.label === preset.label
                          ? 'bg-brand-50/70 border-brand-400 ring-2 ring-brand-400/50'
                          : 'bg-art-950/60 border-art-800 hover:border-brand-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-art-300">{preset.label}</div>
                      <div className="text-[10px] text-art-500 mt-0.5">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Mold & Project Calculator Card */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-art-800 shadow-xs space-y-4 sm:space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-art-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 sm:p-2 rounded-xl bg-brand-50 text-brand-700 shrink-0">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-art-300">2. Product Weight / Mold Calculator</h3>
                    <p className="text-[10px] sm:text-[11px] text-art-500">Enter grams directly or estimate from mold dimensions</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-art-950 p-1 rounded-xl border border-art-800 text-xs overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setCalcMode('weight')}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                      calcMode === 'weight'
                        ? 'bg-brand-500 text-white shadow-xs font-bold'
                        : 'text-art-500 hover:text-art-300'
                    }`}
                  >
                    Direct Weight
                  </button>
                  <button
                    onClick={() => setCalcMode('rectangle')}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                      calcMode === 'rectangle'
                        ? 'bg-brand-500 text-white shadow-xs font-bold'
                        : 'text-art-500 hover:text-art-300'
                    }`}
                  >
                    Rect Mold
                  </button>
                  <button
                    onClick={() => setCalcMode('circle')}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                      calcMode === 'circle'
                        ? 'bg-brand-500 text-white shadow-xs font-bold'
                        : 'text-art-500 hover:text-art-300'
                    }`}
                  >
                    Round Coaster
                  </button>
                </div>
              </div>

              {calcMode === 'weight' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-art-400 mb-1.5">
                      Required Product Pour Weight (Grams)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={productWeight}
                        onChange={(e) => setProductWeight(Math.max(0, Number(e.target.value)))}
                        placeholder="e.g. 80"
                        className="w-full bg-art-950 border border-art-800 rounded-xl px-4 py-2.5 sm:py-3 text-base text-art-300 font-mono font-black focus:outline-none focus:border-brand-500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-art-500">
                        grams total
                      </span>
                    </div>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-art-500 mr-1">Quick Presets:</span>
                    {[30, 70, 80, 160, 250, 350].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setProductWeight(w)}
                        className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                          productWeight === w
                            ? 'bg-brand-600 text-white'
                            : 'bg-art-950 hover:bg-art-900 border border-art-800 text-art-400'
                        }`}
                      >
                        {w}g
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {calcMode === 'rectangle' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-art-400 mb-1.5">Length (cm)</label>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={rectLength}
                        onChange={(e) => setRectLength(Number(e.target.value))}
                        className="w-full bg-art-950 border border-art-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-art-300 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-art-400 mb-1.5">Width (cm)</label>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={rectWidth}
                        onChange={(e) => setRectWidth(Number(e.target.value))}
                        className="w-full bg-art-950 border border-art-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-art-300 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-art-400 mb-1.5">Depth / Height (cm)</label>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={rectDepth}
                        onChange={(e) => setRectDepth(Number(e.target.value))}
                        className="w-full bg-art-950 border border-art-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-art-300 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-art-500 font-medium leading-relaxed">
                    📐 Volume: {rectLength} × {rectWidth} × {rectDepth} cm = {(rectLength * rectWidth * rectDepth).toFixed(1)} cm³ × 1.1 density = <span className="font-bold text-brand-700 font-mono">{effectiveWeight} g</span>
                  </p>
                </div>
              )}

              {calcMode === 'circle' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-art-400 mb-1.5">Diameter (cm)</label>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={circleDiameter}
                        onChange={(e) => setCircleDiameter(Number(e.target.value))}
                        className="w-full bg-art-950 border border-art-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-art-300 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-art-400 mb-1.5">Depth / Thickness (cm)</label>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={circleDepth}
                        onChange={(e) => setCircleDepth(Number(e.target.value))}
                        className="w-full bg-art-950 border border-art-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-art-300 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-art-500 font-medium leading-relaxed">
                    📐 Volume: π × {(circleDiameter / 2).toFixed(1)}² × {circleDepth} cm = {(Math.PI * Math.pow(circleDiameter / 2, 2) * circleDepth).toFixed(1)} cm³ × 1.1 density = <span className="font-bold text-brand-700 font-mono">{effectiveWeight} g</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Recipe Output & Cost Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            {/* Calculation Recipe Card */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-brand-300 shadow-md space-y-5 sm:space-y-6">
              <div className="flex items-center justify-between border-b border-art-800 pb-3 sm:pb-4">
                <span className="text-xs font-bold text-brand-700 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Calculated Recipe
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-500 text-white font-mono">
                  {selectedRatio.label.split(' ')[0]}
                </span>
              </div>

              {/* Material Cost Display */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-brand-50 to-rose-50 border border-brand-200/80 text-center space-y-1">
                <div className="text-[11px] sm:text-xs font-semibold text-brand-800 uppercase tracking-wider">
                  Total Resin + Hardener Cost
                </div>
                <div className="text-3xl sm:text-4xl font-black text-brand-700 font-mono">
                  ₹{materialCost.toFixed(2)}
                </div>
                <div className="text-[10px] sm:text-[11px] text-art-500 font-mono">
                  {effectiveWeight} g × ₹{pricePerGram.toFixed(4)} / gram
                </div>
              </div>

              {/* Mixing Ratio Split (Parts A & B) */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-art-300 flex items-center justify-between">
                  <span>Accurate Mixing Measurement</span>
                  <span className="text-art-500 font-normal">Total: {effectiveWeight}g</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-art-950 border border-art-800 space-y-1">
                    <div className="text-[10px] font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-brand-600" />
                      Resin (Part A)
                    </div>
                    <div className="text-xl font-black text-art-300 font-mono">
                      {partAWeight.toFixed(1)} <span className="text-xs font-normal text-art-500">g</span>
                    </div>
                    <div className="text-[10px] text-art-500">
                      ({selectedRatio.partA}/{totalParts} of total weight)
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-art-950 border border-art-800 space-y-1">
                    <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-rose-600" />
                      Hardener (Part B)
                    </div>
                    <div className="text-xl font-black text-art-300 font-mono">
                      {partBWeight.toFixed(1)} <span className="text-xs font-normal text-art-500">g</span>
                    </div>
                    <div className="text-[10px] text-art-500">
                      ({selectedRatio.partB}/{totalParts} of total weight)
                    </div>
                  </div>
                </div>
              </div>

              {/* Export to Product Pricing Button */}
              <button
                type="button"
                onClick={handleExportToPricing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white text-xs font-bold shadow-xl glow-brand flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>Use in Product Pricing Calculator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Reference Table from Document */}
            <div className="p-5 rounded-3xl bg-white border border-art-800 shadow-sm space-y-3">
              <div className="text-xs font-bold text-art-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-brand-700" />
                Quick Material Cost Reference (₹0.80/g)
              </div>
              <div className="divide-y divide-art-800 text-xs">
                {referenceExamples.map((ex) => (
                  <div
                    key={ex.weight}
                    onClick={() => {
                      setCalcMode('weight');
                      setProductWeight(ex.weight);
                    }}
                    className="py-2 flex items-center justify-between hover:bg-art-950 px-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold text-art-300 font-mono">{ex.weight} g</span>
                      <span className="text-[11px] text-art-500 ml-2">({ex.note})</span>
                    </div>
                    <div className="font-black text-brand-700 font-mono">
                      ₹{(ex.weight * pricePerGram).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
