import React, { useEffect, useState } from 'react';
import {
  Warehouse, Plus, Search, Filter, AlertTriangle, CheckCircle2,
  XCircle, Edit2, Trash2, ArrowUpDown, DollarSign, Package,
  Droplets, Sparkles, Box, RefreshCw, Layers, MapPin, Building2, Minus,
  BookOpen, Clock, Thermometer, ShieldAlert, Check, Play
} from 'lucide-react';
import { InventoryItem, InventoryStats } from '../../types';
import { AdminNavbar } from '../../components/admin/AdminNavbar';
import { InventoryModal } from '../../components/admin/InventoryModal';
import { WorkshopClimateWidget } from '../../components/admin/WorkshopClimateWidget';
import { BatchCureWidget } from '../../components/admin/BatchCureWidget';
import { useToastStore } from '../../store/useToastStore';
import { useRecipeStore, RecipeItem } from '../../store/useRecipeStore';
import api from '../../services/api';

const CATEGORIES = [
  'All',
  'Resin & Hardener',
  'Pigments & Inks',
  'Molds & Frames',
  'Hardware & Findings',
  'Packaging & Shipping',
  'Safety & Tools',
  'Other',
];

const TYPES = ['All', 'Liquid', 'Powder', 'Solid', 'Units/Pieces'];

export const AdminInventoryPage: React.FC = () => {
  const { addToast } = useToastStore();
  const { recipes, fetchRecipes, consumeRecipe } = useRecipeStore();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'recipes' | 'cure' | 'climate'>('inventory');
  const [executingRecipeSlug, setExecutingRecipeSlug] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedCategory !== 'All') queryParams.append('category', selectedCategory);
      if (selectedType !== 'All') queryParams.append('type', selectedType);
      if (onlyLowStock) queryParams.append('lowStock', 'true');
      if (search.trim()) queryParams.append('search', search.trim());

      const [itemsRes, statsRes] = await Promise.all([
        api.get(`/inventory?${queryParams.toString()}`),
        api.get('/inventory/stats'),
      ]);

      setItems(itemsRes.data.data || []);
      setStats(statsRes.data.data || null);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      addToast('Failed to load warehouse inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchRecipes();
  }, [selectedCategory, selectedType, onlyLowStock]);

  const handleExecuteRecipe = async (recipe: RecipeItem) => {
    setExecutingRecipeSlug(recipe.slug);
    try {
      const res = await consumeRecipe({ recipeSlug: recipe.slug, units: 1 });
      if (res && res.success) {
        addToast(`✅ Deducted all materials for ${recipe.name} (₹${res.data.totalMaterialCost} cost)`, 'success');
        fetchInventory();
      } else {
        addToast('Could not consume recipe items', 'error');
      }
    } catch (err) {
      addToast('Failed to execute recipe', 'error');
    } finally {
      setExecutingRecipeSlug(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInventory();
  };

  const handleQuickStockAdjust = async (id: string, delta: number) => {
    try {
      const res = await api.patch(`/inventory/${id}/stock`, { delta });
      addToast(res.data.message || 'Stock updated', 'success');
      fetchInventory();
    } catch (err) {
      addToast('Failed to update stock', 'error');
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from warehouse inventory?`)) {
      return;
    }

    try {
      await api.delete(`/inventory/${id}`);
      addToast(`"${name}" removed from inventory`, 'success');
      fetchInventory();
    } catch (err) {
      addToast('Failed to delete inventory item', 'error');
    }
  };

  const getTypeIcon = (type: InventoryItem['type']) => {
    switch (type) {
      case 'Liquid':
        return <Droplets className="w-3.5 h-3.5 text-cyan-700" />;
      case 'Powder':
        return <Sparkles className="w-3.5 h-3.5 text-amber-700" />;
      case 'Solid':
        return <Layers className="w-3.5 h-3.5 text-purple-700" />;
      default:
        return <Box className="w-3.5 h-3.5 text-brand-700" />;
    }
  };

  const getStockStatusBadge = (item: InventoryItem) => {
    if (item.currentStock === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 border border-rose-200 text-rose-700">
          <XCircle className="w-3.5 h-3.5" />
          Out of Stock
        </span>
      );
    }
    if (item.currentStock <= item.minStockAlert) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 border border-amber-300 text-amber-800 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" />
          Reorder Alert
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Healthy Stock
      </span>
    );
  };

  return (
    <div className="min-h-screen pb-16">
      <AdminNavbar
        title="Warehouse Inventory & Raw Materials"
        subtitle="Manage workshop supplies, resin kits, pigments, hardware, and reorder levels"
      />

      <div className="p-3 xs:p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        {/* Top View Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-art-800 pb-3 sm:pb-4">
          <div className="flex items-center p-1 rounded-xl sm:rounded-2xl bg-white border border-art-800 shadow-xs text-xs font-bold overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl transition-all shrink-0 ${
                activeTab === 'inventory'
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'text-art-400 hover:text-art-300'
              }`}
            >
              <Warehouse className="w-4 h-4 shrink-0" />
              <span>Raw Materials ({items.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl transition-all shrink-0 ${
                activeTab === 'recipes'
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'text-art-400 hover:text-art-300'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>BOM Recipes ({recipes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('cure')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl transition-all shrink-0 ${
                activeTab === 'cure'
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'text-art-400 hover:text-art-300'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>Cure Tracker</span>
            </button>

            <button
              onClick={() => setActiveTab('climate')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl transition-all shrink-0 ${
                activeTab === 'climate'
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'text-art-400 hover:text-art-300'
              }`}
            >
              <Thermometer className="w-4 h-4 shrink-0" />
              <span>Climate Guide</span>
            </button>
          </div>

          <div className="text-[11px] sm:text-xs text-art-500 font-mono hidden md:block">
            Voice Sync: Say <span className="font-bold text-brand-700">"Hey Partner, started batch for clock"</span>
          </div>
        </div>

        {/* CURE TRACKER VIEW */}
        {activeTab === 'cure' && (
          <div className="max-w-4xl mx-auto py-2 sm:py-4">
            <BatchCureWidget />
          </div>
        )}

        {/* CLIMATE VIEW */}
        {activeTab === 'climate' && (
          <div className="max-w-2xl mx-auto py-2 sm:py-4">
            <WorkshopClimateWidget />
          </div>
        )}

        {/* RECIPES VIEW */}
        {activeTab === 'recipes' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-50 via-white to-amber-50 border border-brand-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-brand-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand-600" />
                  <span>BOM (Bill of Materials) Composite Product Recipes</span>
                </h3>
                <p className="text-xs text-art-600">
                  Pre-set multi-item recipes for instant 1-voice bulk deduction of resin grams, pigments, and hardware pieces simultaneously.
                </p>
              </div>
              <div className="text-xs font-mono font-bold text-brand-700 bg-white px-3 py-1.5 rounded-xl border border-brand-200">
                {recipes.length} Active Studio Recipes
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recipes.map((recipe) => (
                <div
                  key={recipe._id}
                  className="p-6 rounded-3xl bg-white border border-art-800 shadow-sm hover:border-brand-300 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-black text-art-300">{recipe.name}</h4>
                        <p className="text-xs text-art-500">{recipe.description}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
                        {recipe.productType}
                      </span>
                    </div>

                    {/* Materials List */}
                    <div className="p-4 rounded-2xl bg-art-950 border border-art-800 space-y-2 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-art-500 block">
                        Recipe Bill of Materials ({recipe.materials.length} Items):
                      </span>
                      <div className="space-y-1.5 divide-y divide-art-800/40">
                        {recipe.materials.map((mat, idx) => (
                          <div key={idx} className="flex items-center justify-between pt-1 font-mono text-[11px]">
                            <span className="text-art-400">
                              • {mat.name} ({mat.quantity} {mat.unit})
                            </span>
                            <span className="text-art-300 font-bold">
                              ₹{mat.lineCost ?? (mat.quantity * mat.costPerUnit).toFixed(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cost & Price Summary */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-art-950 border border-art-800">
                        <span className="text-[10px] text-art-500 block">Material Cost</span>
                        <span className="font-mono font-black text-art-300">₹{recipe.totalMaterialCost}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-art-950 border border-art-800">
                        <span className="text-[10px] text-art-500 block">Labor ({recipe.laborMinutes}m)</span>
                        <span className="font-mono font-black text-art-300">₹{recipe.laborCost}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                        <span className="text-[10px] text-emerald-700 block">Retail Value</span>
                        <span className="font-mono font-black text-emerald-700">₹{recipe.suggestedRetailPrice}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-art-800 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-art-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      <span>Cure: {recipe.defaultCureHours} hours</span>
                    </div>

                    <button
                      onClick={() => handleExecuteRecipe(recipe)}
                      disabled={executingRecipeSlug === recipe.slug}
                      className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
                    >
                      {executingRecipeSlug === recipe.slug ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-white" />
                      )}
                      <span>1-Click Deduct Batch</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INVENTORY STOCK VIEW */}
        {activeTab === 'inventory' && (
          <>
            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-art-800 shadow-xs space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-semibold text-art-500 uppercase tracking-wider truncate">
                    Total Items
                  </span>
                  <div className="p-1.5 sm:p-2 rounded-xl bg-brand-50 text-brand-700 shrink-0">
                    <Warehouse className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="text-lg xs:text-xl sm:text-2xl font-black text-art-300 font-mono">
                  {stats?.totalItems ?? items.length}
                </div>
                <p className="text-[10px] sm:text-[11px] text-art-500 truncate">Supplies & stock</p>
              </div>

              <div
                onClick={() => setOnlyLowStock(!onlyLowStock)}
                className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border shadow-xs space-y-1.5 sm:space-y-2 cursor-pointer transition-all ${
                  onlyLowStock
                    ? 'bg-amber-100/70 border-amber-400 ring-2 ring-amber-400'
                    : 'bg-white border-art-800 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1 truncate">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    Reorder
                  </span>
                  <div className="px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[9px] sm:text-[10px] font-bold font-mono shrink-0">
                    Urgent
                  </div>
                </div>
                <div className="text-lg xs:text-xl sm:text-2xl font-black text-amber-900 font-mono">
                  {stats?.lowStockCount ?? 0}
                </div>
                <p className="text-[10px] sm:text-[11px] text-amber-700 truncate">
                  {onlyLowStock ? 'Click to show all' : 'Below min threshold'}
                </p>
              </div>

              <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-art-800 shadow-xs space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-semibold text-art-500 uppercase tracking-wider truncate">
                    Total Value
                  </span>
                  <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                    <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="text-lg xs:text-xl sm:text-2xl font-black text-emerald-700 font-mono truncate">
                  ₹{stats ? stats.totalValuation.toLocaleString('en-IN') : '0'}
                </div>
                <p className="text-[10px] sm:text-[11px] text-art-500 truncate">Asset valuation</p>
              </div>

              <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-art-800 shadow-xs space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-semibold text-art-500 uppercase tracking-wider truncate">
                    Out of Stock
                  </span>
                  <div className="p-1.5 sm:p-2 rounded-xl bg-rose-50 text-rose-700 shrink-0">
                    <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="text-lg xs:text-xl sm:text-2xl font-black text-rose-700 font-mono">
                  {stats?.outOfStockCount ?? 0}
                </div>
                <p className="text-[10px] sm:text-[11px] text-art-500 truncate">0 inventory units</p>
              </div>
            </div>

            {/* Search & Actions Bar */}
            <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-art-800 shadow-xs space-y-3 sm:space-y-4">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
                <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-art-600" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search raw material, vendor, shelf bin location..."
                    className="w-full bg-art-950 border border-art-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </form>

                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <button
                    onClick={() => setOnlyLowStock(!onlyLowStock)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-bold transition-all ${
                      onlyLowStock
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-art-950 hover:bg-amber-50 text-amber-800 border border-amber-300/80'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{onlyLowStock ? 'Low Stock' : 'Filter Low Stock'}</span>
                  </button>

                  <button
                    onClick={fetchInventory}
                    className="p-2 sm:p-2.5 rounded-xl border border-art-800 bg-art-950 hover:bg-white text-art-500 transition-colors"
                    title="Refresh Inventory"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setIsModalOpen(true);
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white text-xs font-bold shadow-md glow-brand transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    <span>Add Material</span>
                  </button>
                </div>
              </div>

              {/* Categories & Physical Form Filter Pills */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-art-800 text-xs">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
                  <span className="text-[10px] sm:text-[11px] font-bold text-art-500 uppercase tracking-wider mr-1 shrink-0">
                    Category:
                  </span>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-brand-500 text-white shadow-xs'
                          : 'bg-art-950 text-art-400 hover:text-art-300 border border-art-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 shrink-0 bg-art-950 p-1 rounded-xl border border-art-800 overflow-x-auto max-w-full no-scrollbar">
                  {TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedType(t)}
                      className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                        selectedType === t
                          ? 'bg-white text-art-300 shadow-xs font-bold'
                          : 'text-art-500 hover:text-art-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

        {/* Inventory List Table */}
        <div className="bg-white border border-art-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 sm:p-16 flex flex-col items-center justify-center gap-3 text-brand-700">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <span className="text-xs font-mono uppercase tracking-widest text-art-500">
                Loading Warehouse Inventory...
              </span>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 sm:p-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center mx-auto">
                <Warehouse className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-art-300">No Inventory Items Found</h3>
              <p className="text-xs text-art-500 max-w-sm mx-auto">
                No items match your active filters. Clear search or click "Add Raw Material" to record your workshop supplies.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto touch-pan-x">
              <table className="w-full text-left border-collapse min-w-[720px]">
                <thead>
                  <tr className="border-b border-art-800 bg-art-950/60 text-[11px] font-bold text-art-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Item / Raw Material</th>
                    <th className="py-4 px-4">Form & Category</th>
                    <th className="py-4 px-4">Remaining Stock</th>
                    <th className="py-4 px-4">Cost / Unit</th>
                    <th className="py-4 px-4">Total Value</th>
                    <th className="py-4 px-4">Reorder Status</th>
                    <th className="py-4 px-4">Quick Adjust</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-art-800 text-xs">
                  {items.map((item) => {
                    const stockPercent = Math.min(
                      100,
                      Math.round((item.currentStock / (item.minStockAlert * 3 || 1)) * 100)
                    );
                    const isLow = item.currentStock <= item.minStockAlert;
                    const isOut = item.currentStock === 0;

                    return (
                      <tr key={item._id} className="hover:bg-art-950/50 transition-colors">
                        {/* Name & Details */}
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <div className="font-bold text-art-300 text-sm">{item.name}</div>
                            <div className="flex items-center gap-3 text-[11px] text-art-500">
                              {item.supplier && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-art-600" />
                                  {item.supplier}
                                </span>
                              )}
                              {item.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-art-600" />
                                  {item.location}
                                </span>
                              )}
                            </div>
                            {item.notes && (
                              <p className="text-[10px] text-art-500 italic truncate max-w-xs">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Category & Physical Form */}
                        <td className="py-4 px-4">
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-art-900 border border-art-800 text-[11px] font-semibold text-art-400">
                              {getTypeIcon(item.type)}
                              {item.type}
                            </span>
                            <div className="text-[11px] text-art-500 font-medium">
                              {item.category}
                            </div>
                          </div>
                        </td>

                        {/* Remaining Stock with Progress Meter */}
                        <td className="py-4 px-4 min-w-[140px]">
                          <div className="space-y-1.5">
                            <div className="flex items-baseline justify-between">
                              <span className="text-sm font-black font-mono text-art-300">
                                {item.currentStock.toLocaleString()}{' '}
                                <span className="text-[11px] font-normal text-art-500">
                                  {item.unit}
                                </span>
                              </span>
                              <span className="text-[10px] text-art-500">
                                Min: {item.minStockAlert} {item.unit}
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-art-900 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isOut
                                    ? 'bg-rose-500 w-full'
                                    : isLow
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.max(5, stockPercent)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Cost Per Unit */}
                        <td className="py-4 px-4">
                          <div className="font-mono font-bold text-brand-700">
                            ₹{item.costPerUnit.toFixed(2)}
                            <span className="text-[10px] text-art-500 font-normal">
                              {' '}/ {item.unit}
                            </span>
                          </div>
                          <div className="text-[10px] text-art-500">
                            Kit: ₹{item.purchasePrice} ({item.purchaseQuantity} {item.unit})
                          </div>
                        </td>

                        {/* Total Value */}
                        <td className="py-4 px-4 font-mono font-black text-art-300">
                          ₹{Math.round(item.currentStock * item.costPerUnit).toLocaleString('en-IN')}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          {getStockStatusBadge(item)}
                        </td>

                        {/* Quick Adjust Buttons */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                handleQuickStockAdjust(
                                  item._id,
                                  item.unit === 'g' || item.unit === 'ml' ? -50 : -1
                                )
                              }
                              disabled={item.currentStock <= 0}
                              className="p-1 rounded-lg border border-art-800 bg-white hover:bg-art-900 text-art-600 disabled:opacity-30 transition-colors"
                              title={`Deduct ${item.unit === 'g' || item.unit === 'ml' ? '50' : '1'} ${item.unit}`}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                handleQuickStockAdjust(
                                  item._id,
                                  item.unit === 'g' || item.unit === 'ml' ? 50 : 1
                                )
                              }
                              className="p-1 rounded-lg border border-art-800 bg-white hover:bg-art-900 text-art-600 transition-colors"
                              title={`Add ${item.unit === 'g' || item.unit === 'ml' ? '50' : '1'} ${item.unit}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setIsModalOpen(true);
                              }}
                              className="p-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 transition-colors"
                              title="Edit item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item._id, item.name)}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                              title="Delete item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        item={editingItem}
        onSaved={fetchInventory}
      />
    </div>
  );
};
