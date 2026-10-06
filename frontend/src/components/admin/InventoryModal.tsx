import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, AlertCircle, Warehouse, Sparkles, Droplets, Box, Layers } from 'lucide-react';
import { InventoryItem } from '../../types';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onSaved: () => void;
}

const CATEGORIES = [
  'Resin & Hardener',
  'Pigments & Inks',
  'Molds & Frames',
  'Hardware & Findings',
  'Packaging & Shipping',
  'Safety & Tools',
  'Other',
] as const;

const TYPES = ['Liquid', 'Powder', 'Solid', 'Units/Pieces'] as const;
const UNITS = ['g', 'kg', 'ml', 'L', 'pcs', 'pack', 'set'] as const;

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  item,
  onSaved,
}) => {
  const { addToast } = useToastStore();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Resin & Hardener' as InventoryItem['category'],
    type: 'Liquid' as InventoryItem['type'],
    unit: 'g' as InventoryItem['unit'],
    currentStock: 0,
    minStockAlert: 10,
    purchasePrice: 0,
    purchaseQuantity: 1,
    supplier: '',
    location: 'Main Warehouse Shelf 1',
    notes: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        type: item.type,
        unit: item.unit,
        currentStock: item.currentStock,
        minStockAlert: item.minStockAlert,
        purchasePrice: item.purchasePrice,
        purchaseQuantity: item.purchaseQuantity || 1,
        supplier: item.supplier || '',
        location: item.location || 'Main Warehouse',
        notes: item.notes || '',
      });
    } else {
      setFormData({
        name: '',
        category: 'Resin & Hardener',
        type: 'Liquid',
        unit: 'g',
        currentStock: 0,
        minStockAlert: 10,
        purchasePrice: 1200,
        purchaseQuantity: 1500,
        supplier: '',
        location: 'Main Warehouse',
        notes: '',
      });
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const costPerUnit =
    formData.purchaseQuantity > 0
      ? Number((formData.purchasePrice / formData.purchaseQuantity).toFixed(4))
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Please enter an item name', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (item) {
        await api.put(`/inventory/${item._id}`, formData);
        addToast('Warehouse item updated successfully ✨', 'success');
      } else {
        await api.post('/inventory', formData);
        addToast('New raw material added to inventory 📦', 'success');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to save inventory item', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-art-800 rounded-2xl sm:rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-3 sm:my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-art-800 bg-art-950/60 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 shrink-0">
              <Warehouse className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-art-300 truncate">
                {item ? 'Edit Warehouse Raw Material' : 'Add New Inventory Item'}
              </h2>
              <p className="text-[11px] sm:text-xs text-art-500 truncate">
                Track material units, purchase batch pricing, and minimum stock alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-art-500 hover:text-art-300 hover:bg-art-900 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1.5">
                Item / Raw Material Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Crystal Clear Epoxy Resin 2:1 Kit"
                required
                className="w-full bg-art-950 border border-art-800 rounded-xl px-4 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1.5">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as InventoryItem['category'],
                    })
                  }
                  className="w-full bg-art-950 border border-art-800 rounded-xl px-3 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 transition-colors"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1.5">
                  Physical Form *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as InventoryItem['type'],
                    })
                  }
                  className="w-full bg-art-950 border border-art-800 rounded-xl px-3 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 transition-colors"
                >
                  <option value="Liquid">Liquid 💧</option>
                  <option value="Powder">Powder ✨</option>
                  <option value="Solid">Solid 🪵</option>
                  <option value="Units/Pieces">Units/Pieces 📦</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1.5">
                  Unit of Measure *
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unit: e.target.value as InventoryItem['unit'],
                    })
                  }
                  className="w-full bg-art-950 border border-art-800 rounded-xl px-3 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 transition-colors font-mono"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-brand-50/50 border border-brand-200/80 space-y-3">
              <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
                <span className="text-xs font-bold text-brand-800 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-brand-700" />
                  Purchase Batch Cost & Unit Price
                </span>
                <span className="text-[11px] font-mono font-bold text-brand-700 px-2.5 py-0.5 rounded-full bg-white border border-brand-300 shrink-0">
                  Unit Cost: ₹{costPerUnit.toFixed(2)} / {formData.unit}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-art-500 mb-1">
                    Batch Purchase Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.purchasePrice}
                    onChange={(e) =>
                      setFormData({ ...formData, purchasePrice: Number(e.target.value) })
                    }
                    placeholder="e.g. 1200"
                    className="w-full bg-white border border-brand-200 rounded-xl px-3 py-2 text-xs text-art-300 font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-art-500 mb-1">
                    Total Batch Quantity ({formData.unit})
                  </label>
                  <input
                    type="number"
                    min="0.001"
                    step="any"
                    value={formData.purchaseQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, purchaseQuantity: Number(e.target.value) })
                    }
                    placeholder="e.g. 1500"
                    className="w-full bg-white border border-brand-200 rounded-xl px-3 py-2 text-xs text-art-300 font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <p className="text-[10px] text-brand-800 font-medium">
                💡 Formula: ₹{formData.purchasePrice || 0} ÷ {formData.purchaseQuantity || 1} {formData.unit} ={' '}
                <span className="font-bold">₹{costPerUnit.toFixed(2)} per {formData.unit}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1.5">
                  Current Warehouse Stock ({formData.unit})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.currentStock}
                  onChange={(e) =>
                    setFormData({ ...formData, currentStock: Number(e.target.value) })
                  }
                  required
                  className="w-full bg-art-950 border border-art-800 rounded-xl px-4 py-2.5 text-xs text-art-300 font-mono focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1.5">
                  Low Stock Reorder Alert ({formData.unit})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.minStockAlert}
                  onChange={(e) =>
                    setFormData({ ...formData, minStockAlert: Number(e.target.value) })
                  }
                  required
                  className="w-full bg-art-950 border border-art-800 rounded-xl px-4 py-2.5 text-xs text-art-300 font-mono focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1.5">
                  Supplier / Vendor Name
                </label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="e.g. AeroResin Lab Supplies"
                  className="w-full bg-art-950 border border-art-800 rounded-xl px-4 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1.5">
                  Warehouse Bin / Shelf Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Rack A - Shelf 2"
                  className="w-full bg-art-950 border border-art-800 rounded-xl px-4 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1.5">
                Technical Notes / Mixing Specs
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. 2:1 ratio resin. Store in cool, dark place away from moisture."
                className="w-full bg-art-950 border border-art-800 rounded-xl px-4 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500 transition-colors resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 sm:pt-4 border-t border-art-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-5 py-2.5 rounded-xl border border-art-800 text-xs font-semibold text-art-400 hover:bg-art-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white text-xs font-bold shadow-md glow-brand transition-all disabled:opacity-50 active:scale-95"
            >
              {submitting ? 'Saving...' : item ? 'Update Item' : 'Add to Warehouse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
