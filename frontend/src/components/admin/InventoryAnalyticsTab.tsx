import React, { useState, useEffect } from 'react';
import {
  PieChart, DollarSign, AlertTriangle, TrendingUp, RefreshCw,
  Box, Sparkles, Clock, ArrowRight, ShieldAlert, CheckCircle2, Tag
} from 'lucide-react';
import { InventoryValuationAndDeadStockResponse } from '../../types';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

export const InventoryAnalyticsTab: React.FC = () => {
  const { addToast } = useToastStore();
  const [data, setData] = useState<InventoryValuationAndDeadStockResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [deadStockCategory, setDeadStockCategory] = useState<'all' | 'products' | 'raw'>('all');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory/analytics/dead-stock');
      setData(res.data.data || null);
    } catch (err) {
      console.error('Error fetching inventory analytics:', err);
      addToast('Failed to load inventory valuation & dead-stock analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-art-500">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3 text-brand-500" />
        <p className="font-semibold text-sm">Calculating real-time capital valuation and scanning dead-stock...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12 text-center text-art-500">
        <p>No valuation data available.</p>
      </div>
    );
  }

  const { valuation, deadStock } = data;
  const rawRatio = valuation.totalCombinedCapital > 0 ? (valuation.rawMaterialsCapital / valuation.totalCombinedCapital) * 100 : 50;
  const finishedRatio = 100 - rawRatio;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-50 via-white to-amber-50 border border-purple-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-600" />
            <span>Inventory Capital Valuation & Dead-Stock Intelligence</span>
          </h3>
          <p className="text-xs text-slate-600">
            Real-time capital balance (raw materials locked vs finished goods) and automated detector for inactive items with clearance suggestions.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="p-2.5 rounded-xl bg-white border border-slate-300 text-slate-600 hover:text-slate-900 transition-colors"
          title="Refresh metrics"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Capital Valuation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Combined Locked Capital */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-900 to-slate-900 text-white shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
              Total Capital Locked
            </span>
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              <DollarSign className="w-4 h-4 text-purple-300" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono">
            ₹{valuation.totalCombinedCapital.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-purple-200">Total studio cash tied in physical assets</p>
        </div>

        {/* 2. Raw Materials Locked */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Raw Materials Capital
            </span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-cyan-800">
            ₹{valuation.rawMaterialsCapital.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500 font-semibold">{rawRatio.toFixed(1)}% of total inventory capital</p>
        </div>

        {/* 3. Finished Goods Locked */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Finished Goods Cost
            </span>
            <div className="p-2 rounded-xl bg-brand-50 text-brand-700">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-brand-700">
            ₹{valuation.finishedGoodsCapital.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500 font-semibold">
            Retail Realization: <strong className="text-emerald-700">₹{valuation.finishedGoodsRetailValue.toLocaleString('en-IN')}</strong>
          </p>
        </div>

        {/* 4. Dead-Stock Trapped Capital */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50 to-rose-50 border border-amber-300 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Dead Stock Trapped
            </span>
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-rose-800">
            ₹{deadStock.totalLockedDeadCapital.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-amber-900 font-bold">
            {deadStock.totalDeadProductsCount + deadStock.totalDeadRawMaterialsCount} dormant items (60+ days)
          </p>
        </div>
      </div>

      {/* Capital Distribution Proportion Bar */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Capital Allocation Ratio</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-cyan-700">
              <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block" />
              Raw Materials: {rawRatio.toFixed(1)}%
            </span>
            <span className="flex items-center gap-1.5 text-brand-700">
              <span className="w-3 h-3 rounded-full bg-brand-500 inline-block" />
              Finished Stock: {finishedRatio.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="w-full h-3.5 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${rawRatio}%` }}
            className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all duration-500"
          />
          <div
            style={{ width: `${finishedRatio}%` }}
            className="h-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-500"
          />
        </div>

        {/* Category Breakdown Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Raw Categories:</span>
          {Object.entries(valuation.rawCategoryValuation).map(([cat, val]) => (
            <span
              key={cat}
              className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200"
            >
              {cat}: <strong className="font-mono text-slate-900">₹{val.toLocaleString('en-IN')}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* DEAD STOCK DETECTOR SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Dead-Stock Detector & Clearance Recommendations</span>
            </h3>
            <p className="text-xs text-slate-500">
              Items with stock &gt; 0 that have not had movements or sales in the last 60+ days.
            </p>
          </div>

          <div className="flex rounded-xl bg-white p-1 border border-slate-200 text-xs font-bold shadow-xs">
            <button
              onClick={() => setDeadStockCategory('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                deadStockCategory === 'all' ? 'bg-brand-500 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({deadStock.products.length + deadStock.rawMaterials.length})
            </button>
            <button
              onClick={() => setDeadStockCategory('products')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                deadStockCategory === 'products' ? 'bg-brand-500 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Finished Products ({deadStock.products.length})
            </button>
            <button
              onClick={() => setDeadStockCategory('raw')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                deadStockCategory === 'raw' ? 'bg-brand-500 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Raw Materials ({deadStock.rawMaterials.length})
            </button>
          </div>
        </div>

        {/* Dead Stock Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Products */}
          {(deadStockCategory === 'all' || deadStockCategory === 'products') &&
            deadStock.products.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-amber-300 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                          {p.status}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">{p.category}</span>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm truncate">{p.title}</h4>
                      <div className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{p.daysInactive} days inactive</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-50 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Stock Units</span>
                      <strong className="font-mono text-slate-800">{p.stock} pcs</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Locked Capital</span>
                      <strong className="font-mono text-rose-700">₹{p.lockedCapital}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Catalog Price</span>
                      <strong className="font-mono text-slate-800">₹{p.sellingPrice}</strong>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-amber-600" />
                    AI Clearance Recommendation:
                  </span>
                  <p className="text-amber-900 font-medium text-[11px] leading-relaxed">
                    {p.recommendation}
                  </p>
                </div>
              </div>
            ))}

          {/* Raw Materials */}
          {(deadStockCategory === 'all' || deadStockCategory === 'raw') &&
            deadStock.rawMaterials.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-amber-300 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                          {m.status}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">{m.category}</span>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">{m.name}</h4>
                      <div className="text-[11px] text-purple-700 font-bold flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{m.daysInactive} days dormant</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-right shrink-0">
                      <span className="text-[10px] text-slate-500 block">Trapped Cost</span>
                      <strong className="font-mono text-sm font-black text-slate-900">₹{m.lockedCapital}</strong>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 flex items-center justify-between text-xs">
                    <span className="text-slate-600">Current Stock Remaining:</span>
                    <strong className="font-mono font-bold text-slate-900">
                      {m.currentStock} {m.unit} (@ ₹{m.costPerUnit}/{m.unit})
                    </strong>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    Artisan Recommendation:
                  </span>
                  <p className="text-purple-900 font-medium text-[11px] leading-relaxed">
                    {m.recommendation}
                  </p>
                </div>
              </div>
            ))}
        </div>

        {deadStock.products.length === 0 && deadStock.rawMaterials.length === 0 && (
          <div className="p-12 rounded-3xl bg-emerald-50/60 border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-black text-emerald-900 text-base">Exceptional Inventory Velocity!</h4>
            <p className="text-xs text-emerald-700 max-w-md mx-auto">
              No dead-stock or dormant items detected. All products and raw materials have active movement and turnover within the last 60 days.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
