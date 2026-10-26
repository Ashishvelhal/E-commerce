import React, { useState, useEffect } from 'react';
import {
  History, Search, Filter, RefreshCw, Plus, ArrowUpRight, ArrowDownRight,
  ShieldCheck, AlertTriangle, Package, Calendar, User, FileText, DollarSign, X
} from 'lucide-react';
import { StockMovement, StockMovementType, InventoryItem } from '../../types';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

interface StockMovementsTabProps {
  inventoryItems: InventoryItem[];
  onRefreshInventory: () => void;
}

export const StockMovementsTab: React.FC<StockMovementsTabProps> = ({
  inventoryItems,
  onRefreshInventory,
}) => {
  const { addToast } = useToastStore();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Manual Movement Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [manualType, setManualType] = useState<StockMovementType>('Audit Correction');
  const [quantityDelta, setQuantityDelta] = useState<string>('1');
  const [direction, setDirection] = useState<'add' | 'deduct'>('add');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'All') params.append('movementType', selectedType);
      if (search.trim()) params.append('search', search.trim());
      params.append('page', page.toString());
      params.append('limit', '30');

      const res = await api.get(`/inventory/movements?${params.toString()}`);
      setMovements(res.data.data || []);
      setTotalCount(res.data.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching movements:', err);
      addToast('Failed to load stock audit movements', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [selectedType, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMovements();
  };

  const handleCreateManualMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) {
      addToast('Please select an inventory item', 'warning');
      return;
    }
    const qty = parseFloat(quantityDelta);
    if (!qty || qty <= 0) {
      addToast('Quantity must be greater than zero', 'warning');
      return;
    }

    const finalChange = direction === 'deduct' ? -qty : qty;

    setIsSubmitting(true);
    try {
      const res = await api.post('/inventory/movements', {
        inventoryItemId: selectedItemId,
        movementType: manualType,
        quantityChange: finalChange,
        notes,
        referenceId: `MANUAL-${Date.now().toString().slice(-4)}`,
      });

      addToast(res.data.message || 'Movement recorded successfully', 'success');
      setIsManualModalOpen(false);
      setSelectedItemId('');
      setNotes('');
      setQuantityDelta('1');
      fetchMovements();
      onRefreshInventory();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to record movement', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeBadge = (type: StockMovementType) => {
    switch (type) {
      case 'Purchase':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ArrowUpRight className="w-3 h-3 text-emerald-600" />
            Purchase (+)
          </span>
        );
      case 'Customer Order':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <ArrowDownRight className="w-3 h-3 text-rose-600" />
            Customer Sale (-)
          </span>
        );
      case 'Studio Production':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Package className="w-3 h-3 text-blue-600" />
            Batch Pour (-)
          </span>
        );
      case 'Spillage / Damage':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Spill / Waste (-)
          </span>
        );
      case 'Return':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <ArrowUpRight className="w-3 h-3 text-teal-600" />
            Return (+)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldCheck className="w-3 h-3 text-purple-600" />
            Audit Correction
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner / Title Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-50 via-white to-purple-50 border border-brand-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-brand-900 flex items-center gap-2">
            <History className="w-5 h-5 text-brand-600" />
            <span>Inventory Stock Movement & Audit Trail (In / Out History)</span>
          </h3>
          <p className="text-xs text-art-600">
            Real-time chronological audit trail of all warehouse transactions: purchases, customer sales (BOM auto-deductions), batch pours, spillage, and corrections.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Log Manual Movement</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-art-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-art-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search movement note, reference order, or material..."
            className="w-full bg-art-950 border border-art-800 rounded-xl pl-10 pr-4 py-2 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-art-500 uppercase tracking-wider shrink-0">Filter:</span>
          {[
            'All',
            'Purchase',
            'Customer Order',
            'Studio Production',
            'Spillage / Damage',
            'Audit Correction',
            'Return',
          ].map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedType(type);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedType === type
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-art-950 border border-art-800 text-art-400 hover:text-art-200'
              }`}
            >
              {type}
            </button>
          ))}
          <button
            onClick={fetchMovements}
            className="p-2 rounded-xl bg-art-950 border border-art-800 text-art-400 hover:text-art-200 transition-colors"
            title="Refresh history"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Movement Table */}
      <div className="rounded-3xl bg-white border border-art-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-art-800 bg-art-950 text-art-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 sm:px-6">Timestamp & User</th>
                <th className="py-3.5 px-4">Raw Material Item</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 text-center">Quantity Delta</th>
                <th className="py-3.5 px-4 text-center">Stock Transition</th>
                <th className="py-3.5 px-4">Reference & Reason Note</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Cost Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-art-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-art-500">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-brand-500" />
                    <span>Loading audit log movements...</span>
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-art-500">
                    <History className="w-8 h-8 mx-auto mb-2 text-art-600" />
                    <p className="font-semibold">No stock movements found matching filter.</p>
                  </td>
                </tr>
              ) : (
                movements.map((m) => {
                  const isPositive = m.quantityChange > 0;
                  return (
                    <tr key={m._id} className="hover:bg-art-950/40 transition-colors font-medium">
                      {/* Date & User */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <div className="font-bold text-art-300">
                          {new Date(m.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-art-500 font-mono">
                          {new Date(m.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })} • {m.performedBy || 'Admin'}
                        </div>
                      </td>

                      {/* Material Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-black text-art-300">{m.itemName}</div>
                        <div className="text-[10px] text-art-500">{m.category}</div>
                      </td>

                      {/* Type Pill */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getTypeBadge(m.movementType)}
                      </td>

                      {/* Delta */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`font-mono font-black text-xs px-2.5 py-1 rounded-lg ${
                            isPositive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isPositive ? '+' : ''}{m.quantityChange} {m.unit}
                        </span>
                      </td>

                      {/* Transition: Prev -> New */}
                      <td className="py-3.5 px-4 text-center font-mono text-[11px] whitespace-nowrap">
                        <span className="text-art-400">{m.previousStock}</span>
                        <span className="mx-1.5 text-art-600">→</span>
                        <strong className="text-art-200 font-bold">{m.newStock} {m.unit}</strong>
                      </td>

                      {/* Notes / Ref */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {m.referenceId && (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-art-850 font-mono text-[9px] font-bold text-brand-600 mb-0.5">
                            {m.referenceId}
                          </span>
                        )}
                        <p className="text-[11px] text-art-500 truncate" title={m.notes}>
                          {m.notes || 'Routine stock operation'}
                        </p>
                      </td>

                      {/* Cost Impact */}
                      <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-bold text-art-300 whitespace-nowrap">
                        {m.costImpact && m.costImpact > 0 ? `₹${m.costImpact.toFixed(2)}` : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Movement Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-art-800 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-art-800 flex items-center justify-between bg-gradient-to-r from-brand-50 to-white">
              <h3 className="text-base font-black text-art-300 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-600" />
                <span>Record Manual Stock Movement</span>
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 text-art-400 hover:text-art-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualMovement} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-art-400 block mb-1">Select Material *</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full bg-art-950 border border-art-700 rounded-xl p-2.5 font-bold text-art-300 focus:outline-none focus:border-brand-500"
                  required
                >
                  <option value="">-- Choose Item --</option>
                  {inventoryItems.map((inv) => (
                    <option key={inv._id} value={inv._id}>
                      {inv.name} (Current: {inv.currentStock} {inv.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-art-400 block mb-1">Movement Type</label>
                <select
                  value={manualType}
                  onChange={(e) => setManualType(e.target.value as any)}
                  className="w-full bg-art-950 border border-art-700 rounded-xl p-2.5 font-bold text-art-300 focus:outline-none focus:border-brand-500"
                >
                  <option value="Audit Correction">Audit Correction (+/-)</option>
                  <option value="Spillage / Damage">Spillage / Container Damage (-)</option>
                  <option value="Studio Production">Studio Production Custom Pour (-)</option>
                  <option value="Purchase">Direct Purchase Restock (+)</option>
                  <option value="Return">Supplier / Workshop Return (+)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-art-400 block mb-1">Direction</label>
                  <div className="flex rounded-xl bg-art-950 p-1 border border-art-700">
                    <button
                      type="button"
                      onClick={() => setDirection('add')}
                      className={`flex-1 py-1.5 rounded-lg font-bold ${
                        direction === 'add' ? 'bg-emerald-600 text-white' : 'text-art-400'
                      }`}
                    >
                      + Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirection('deduct')}
                      className={`flex-1 py-1.5 rounded-lg font-bold ${
                        direction === 'deduct' ? 'bg-rose-600 text-white' : 'text-art-400'
                      }`}
                    >
                      - Deduct
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-art-400 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={quantityDelta}
                    onChange={(e) => setQuantityDelta(e.target.value)}
                    className="w-full bg-art-950 border border-art-700 rounded-xl p-2 font-mono font-bold text-art-300 focus:outline-none focus:border-brand-500 text-center"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-art-400 block mb-1">Reason / Note</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Broken measuring cup spill during workshop session"
                  className="w-full bg-art-950 border border-art-700 rounded-xl p-2.5 text-art-300 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-art-700 text-art-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-md disabled:opacity-50"
                >
                  Confirm & Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
