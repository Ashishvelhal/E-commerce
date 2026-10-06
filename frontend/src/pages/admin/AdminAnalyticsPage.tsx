import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Layers,
  FlaskConical,
  Package,
  Calendar,
  Download,
  ShieldCheck,
  Zap,
  BarChart3,
  PieChart,
  Boxes,
  Clock,
  CheckCircle2,
  RefreshCw,
  Info,
  ArrowUpRight,
  Droplets,
} from 'lucide-react';
import { AdminNavbar } from '../../components/admin/AdminNavbar';
import { useToastStore } from '../../store/useToastStore';

interface CategoryMargin {
  category: string;
  icon: string;
  unitsMade: number;
  avgRetailPrice: number;
  resinMaterialCost: number;
  hardwarePackagingCost: number;
  laborFinishingCost: number;
  netProfit: number;
  marginPercent: number;
}

interface MaterialStockoutForecast {
  materialName: string;
  category: string;
  currentStock: number;
  unit: string;
  dailyBurnRate: number;
  daysRemaining: number;
  status: 'critical' | 'warning' | 'healthy';
  reorderQuantity: number;
}

const CATEGORY_MARGINS: CategoryMargin[] = [
  {
    category: '12" Geode Wall Clocks',
    icon: '⏱️',
    unitsMade: 28,
    avgRetailPrice: 2899,
    resinMaterialCost: 320,
    hardwarePackagingCost: 380,
    laborFinishingCost: 200,
    netProfit: 1999,
    marginPercent: 68.9,
  },
  {
    category: 'Luxury Custom Nameplates',
    icon: '✨',
    unitsMade: 36,
    avgRetailPrice: 2299,
    resinMaterialCost: 270,
    hardwarePackagingCost: 220,
    laborFinishingCost: 150,
    netProfit: 1659,
    marginPercent: 72.1,
  },
  {
    category: 'Geode Serving Trays',
    icon: '💎',
    unitsMade: 22,
    avgRetailPrice: 2499,
    resinMaterialCost: 310,
    hardwarePackagingCost: 340,
    laborFinishingCost: 180,
    netProfit: 1669,
    marginPercent: 66.8,
  },
  {
    category: 'Coaster Sets (4 pcs)',
    icon: '🍷',
    unitsMade: 54,
    avgRetailPrice: 1499,
    resinMaterialCost: 180,
    hardwarePackagingCost: 120,
    laborFinishingCost: 90,
    netProfit: 1109,
    marginPercent: 74.0,
  },
  {
    category: 'Botanical Arch Plaques',
    icon: '🌸',
    unitsMade: 19,
    avgRetailPrice: 1899,
    resinMaterialCost: 220,
    hardwarePackagingCost: 260,
    laborFinishingCost: 120,
    netProfit: 1299,
    marginPercent: 68.4,
  },
];

const STOCKOUT_FORECASTS: MaterialStockoutForecast[] = [
  {
    materialName: '2:1 Crystal Clear Epoxy Resin (Part A)',
    category: 'Resin Kit',
    currentStock: 3200,
    unit: 'grams',
    dailyBurnRate: 360,
    daysRemaining: 8.8,
    status: 'critical',
    reorderQuantity: 10000,
  },
  {
    materialName: '2:1 Fast Curing Hardener (Part B)',
    category: 'Hardener',
    currentStock: 1650,
    unit: 'grams',
    dailyBurnRate: 180,
    daysRemaining: 9.1,
    status: 'critical',
    reorderQuantity: 5000,
  },
  {
    materialName: 'Silent Sweep Quartz Clock Machines',
    category: 'Hardware',
    currentStock: 14,
    unit: 'pcs',
    dailyBurnRate: 1.2,
    daysRemaining: 11.6,
    status: 'warning',
    reorderQuantity: 50,
  },
  {
    materialName: 'Ocean Blue Mica Pearl Pigment',
    category: 'Pigments',
    currentStock: 480,
    unit: 'grams',
    dailyBurnRate: 18,
    daysRemaining: 26.6,
    status: 'healthy',
    reorderQuantity: 1000,
  },
  {
    materialName: '24K Metallic Gold Leaf Foil Flakes',
    category: 'Inclusions',
    currentStock: 350,
    unit: 'grams',
    dailyBurnRate: 8,
    daysRemaining: 43.7,
    status: 'healthy',
    reorderQuantity: 500,
  },
  {
    materialName: '12" Pre-Cut MDF Round Clock Bases',
    category: 'Bases',
    currentStock: 22,
    unit: 'pcs',
    dailyBurnRate: 1.1,
    daysRemaining: 20.0,
    status: 'healthy',
    reorderQuantity: 50,
  },
];

export const AdminAnalyticsPage: React.FC = () => {
  const { addToast } = useToastStore();
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | 'ytd'>('30d');

  const totalRevenue = 348500;
  const totalMaterialCosts = 68400;
  const grossProfit = totalRevenue - totalMaterialCosts;
  const overallMarginPercent = ((grossProfit / totalRevenue) * 100).toFixed(1);

  // Wastage math
  const theoreticalResinGrams = 22400; // Expected by BOM
  const actualResinGramsConsumed = 23380; // Actual deducted
  const wastageGrams = actualResinGramsConsumed - theoreticalResinGrams; // 980g
  const wastagePercent = ((wastageGrams / actualResinGramsConsumed) * 100).toFixed(1); // 4.2%
  const wastageCostRupees = Math.round(wastageGrams * 0.85); // ₹833

  const handleExportCSV = () => {
    const csvContent = [
      ['Studio Material Wastage & Profit Analytics Report'],
      ['Generated On', new Date().toLocaleString('en-IN')],
      ['Time Range', timeRange.toUpperCase()],
      [],
      ['Total Studio Revenue (INR)', totalRevenue],
      ['Total Raw Material Expenses (INR)', totalMaterialCosts],
      ['Gross Profit Margin (%)', `${overallMarginPercent}%`],
      ['Resin Wastage Rate (%)', `${wastagePercent}%`],
      ['Wastage Material Loss (INR)', wastageCostRupees],
      [],
      ['Category Profit Margins'],
      ['Category', 'Units Made', 'Avg Retail Price', 'Resin Cost', 'Hardware Cost', 'Labor Cost', 'Net Profit', 'Margin %'],
      ...CATEGORY_MARGINS.map((c) => [
        c.category,
        c.unitsMade,
        c.avgRetailPrice,
        c.resinMaterialCost,
        c.hardwarePackagingCost,
        c.laborFinishingCost,
        c.netProfit,
        `${c.marginPercent}%`,
      ]),
      [],
      ['Raw Material Burn Rate & Stockout Forecast'],
      ['Material Name', 'Category', 'Current Stock', 'Unit', 'Daily Burn', 'Days Remaining', 'Status', 'Suggested Reorder'],
      ...STOCKOUT_FORECASTS.map((f) => [
        f.materialName,
        f.category,
        f.currentStock,
        f.unit,
        f.dailyBurnRate,
        f.daysRemaining.toFixed(1),
        f.status.toUpperCase(),
        f.reorderQuantity,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resin-studio-analytics-report-${timeRange}-${Date.now()}.csv`;
    link.click();
    addToast('📊 Analytics report downloaded as CSV!', 'success');
  };

  return (
    <div className="min-h-screen bg-art-950 text-art-300 font-sans pb-20">
      <AdminNavbar
        title="Studio Material Wastage & Profit Analytics"
        subtitle="Live metrics on raw material burn rates, spill wastage %, and product category margins"
      />

      <div className="p-3 xs:p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Top Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-art-800 pb-4">
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-art-900 border border-art-800 text-xs font-bold">
            {(['30d', '90d', 'ytd'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  timeRange === r
                    ? 'bg-brand-500 text-white shadow'
                    : 'text-art-400 hover:text-art-300'
                }`}
              >
                {r === '30d' ? 'Last 30 Days' : r === '90d' ? 'Last 90 Days' : 'Year to Date'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-art-900 hover:bg-art-850 border border-art-800 text-xs font-bold text-art-300 flex items-center gap-2 transition-all shadow-sm self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-brand-500" />
            <span>Export CSV Report</span>
          </button>
        </div>

        {/* Top 4 KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-art-900 border border-art-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-art-500 font-bold uppercase">
              <span>Studio Gross Revenue</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-art-300 font-mono">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs last period</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-art-900 border border-art-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-art-500 font-bold uppercase">
              <span>Raw Material COGS</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <FlaskConical className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-art-300 font-mono">
              ₹{totalMaterialCosts.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-art-500">
              <span>19.6% of total revenue</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-art-900 border border-art-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-art-500 font-bold uppercase">
              <span>Net Profit Margin</span>
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-brand-500 font-mono">
              {overallMarginPercent}%
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Healthy Studio Margin</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-art-900 border border-art-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-art-500 font-bold uppercase">
              <span>Resin Wastage Rate</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Droplets className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              {wastagePercent}%
            </div>
            <div className="flex items-center gap-1.5 text-xs text-art-500">
              <span>{wastageGrams}g lost (₹{wastageCostRupees} scrap)</span>
            </div>
          </div>
        </div>

        {/* Material Wastage & Pour Efficiency Section */}
        <div className="p-5 sm:p-6 rounded-3xl bg-art-900 border border-art-800 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-art-300 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-brand-500" />
                <span>Theoretical BOM vs Actual Raw Material Consumption</span>
              </h3>
              <p className="text-xs text-art-500 mt-0.5">
                Evaluates epoxy resin cup-cling, stirring residual, and over-pour variance across all batches.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                95.8% Pour Efficiency (Industry Benchmark: 92–95%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-art-950 border border-art-800 space-y-1">
              <span className="text-[10px] text-art-500 font-bold uppercase">Theoretical Recipe Target</span>
              <div className="text-xl font-bold text-art-300 font-mono">
                {theoreticalResinGrams.toLocaleString()}g
              </div>
              <p className="text-[11px] text-art-500">Calculated from 159 logged product units</p>
            </div>

            <div className="p-4 rounded-2xl bg-art-950 border border-art-800 space-y-1">
              <span className="text-[10px] text-art-500 font-bold uppercase">Actual Warehouse Consumed</span>
              <div className="text-xl font-bold text-amber-400 font-mono">
                {actualResinGramsConsumed.toLocaleString()}g
              </div>
              <p className="text-[11px] text-art-500">Physical stock deducted from inventory logs</p>
            </div>

            <div className="p-4 rounded-2xl bg-art-950 border border-art-800 space-y-1">
              <span className="text-[10px] text-art-500 font-bold uppercase">Residual Scrap / Cup Cling</span>
              <div className="text-xl font-bold text-rose-400 font-mono">
                +{wastageGrams}g ({wastagePercent}%)
              </div>
              <p className="text-[11px] text-art-500">Estimated cost of cup cling: ₹{wastageCostRupees}</p>
            </div>
          </div>
        </div>

        {/* Product Category Profit Margins Table */}
        <div className="p-5 sm:p-6 rounded-3xl bg-art-900 border border-art-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-art-300 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-500" />
                <span>Product Category Margin Breakdown</span>
              </h3>
              <p className="text-xs text-art-500">
                Detailed unit economics factoring raw resin, pigments, hardware, and packaging.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto touch-pan-x">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-art-800 text-art-500 uppercase font-mono text-[10px]">
                  <th className="py-3 px-3">Product Category</th>
                  <th className="py-3 px-3 text-center">Units Made</th>
                  <th className="py-3 px-3 text-right">Avg Retail (₹)</th>
                  <th className="py-3 px-3 text-right">Resin Cost</th>
                  <th className="py-3 px-3 text-right">Hardware & Pack</th>
                  <th className="py-3 px-3 text-right">Net Profit / Unit</th>
                  <th className="py-3 px-3 text-right">Profit Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-art-800/60 font-medium">
                {CATEGORY_MARGINS.map((c, i) => (
                  <tr key={i} className="hover:bg-art-950/60 transition-colors">
                    <td className="py-3.5 px-3 flex items-center gap-2 font-bold text-art-300">
                      <span>{c.icon}</span>
                      <span>{c.category}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-art-400">{c.unitsMade}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-art-300">
                      ₹{c.avgRetailPrice}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-purple-400">
                      ₹{c.resinMaterialCost}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-art-400">
                      ₹{c.hardwarePackagingCost}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-400">
                      ₹{c.netProfit}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-500/15 text-brand-400 border border-brand-500/30">
                        {c.marginPercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Raw Material Burn Rate & Stockout Forecaster */}
        <div className="p-5 sm:p-6 rounded-3xl bg-art-900 border border-art-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-art-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Raw Material Burn Rate & Stockout Forecaster</span>
              </h3>
              <p className="text-xs text-art-500">
                Predicts exact days until inventory depletion based on workshop consumption velocity.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {STOCKOUT_FORECASTS.map((f, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                  f.status === 'critical'
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : f.status === 'warning'
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-art-950 border-art-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-art-300 line-clamp-1">{f.materialName}</h4>
                    <span className="text-[10px] text-art-500 uppercase font-mono">{f.category}</span>
                  </div>

                  {f.status === 'critical' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                      Urgent Reorder
                    </span>
                  )}
                  {f.status === 'warning' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      Reorder Soon
                    </span>
                  )}
                  {f.status === 'healthy' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      Optimal
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-xl bg-art-900 border border-art-800">
                    <span className="text-[10px] text-art-500 uppercase block">Current Stock</span>
                    <span className="font-bold text-art-300 font-mono">
                      {f.currentStock} {f.unit}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-art-900 border border-art-800">
                    <span className="text-[10px] text-art-500 uppercase block">Depletion In</span>
                    <span
                      className={`font-bold font-mono ${
                        f.status === 'critical'
                          ? 'text-rose-400'
                          : f.status === 'warning'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      ~{f.daysRemaining.toFixed(0)} Days
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-art-500 flex items-center justify-between pt-1">
                  <span>Burn: {f.dailyBurnRate} {f.unit}/day</span>
                  <span className="text-brand-400 font-semibold font-mono">
                    Restock: +{f.reorderQuantity} {f.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
