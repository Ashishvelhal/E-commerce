import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Trash2, Printer, Send, CheckCircle2,
  Package, DollarSign, Calendar, FileText, Phone, Building2
} from 'lucide-react';
import { PurchaseOrder, Supplier, InventoryItem } from '../../types';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPO?: PurchaseOrder | null;
  suppliers: Supplier[];
  inventoryItems: InventoryItem[];
  onSaved: () => void;
}

export const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  existingPO,
  suppliers,
  inventoryItems,
  onSaved,
}) => {
  const { addToast } = useToastStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [items, setItems] = useState<
    {
      inventoryItem?: string;
      name: string;
      unit: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[]
  >([]);

  const [taxRate, setTaxRate] = useState(18); // Default 18% GST
  const [shippingCost, setShippingCost] = useState('0');
  const [notes, setNotes] = useState('');
  const [expectedDays, setExpectedDays] = useState(5);

  useEffect(() => {
    if (existingPO) {
      const supId = typeof existingPO.supplier === 'object' ? existingPO.supplier._id : existingPO.supplier;
      setSelectedSupplierId(supId || '');
      setItems(
        existingPO.items.map((it) => ({
          inventoryItem: it.inventoryItem,
          name: it.name,
          unit: it.unit,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          totalPrice: it.totalPrice,
        }))
      );
      setShippingCost(existingPO.shippingCost.toString());
      setNotes(existingPO.notes || '');
    } else {
      setSelectedSupplierId(suppliers[0]?._id || '');
      setItems([
        {
          inventoryItem: inventoryItems[0]?._id || '',
          name: inventoryItems[0]?.name || 'Ultra-Clear Casting Resin Part A',
          unit: inventoryItems[0]?.unit || 'kg',
          quantity: 10,
          unitPrice: inventoryItems[0]?.costPerUnit || 800,
          totalPrice: (inventoryItems[0]?.costPerUnit || 800) * 10,
        },
      ]);
      setShippingCost('0');
      setNotes('Please dispatch via priority transport with moisture-barrier packaging.');
    }
  }, [existingPO, isOpen, suppliers, inventoryItems]);

  if (!isOpen) return null;

  const currentSupplier = suppliers.find((s) => s._id === selectedSupplierId);

  const handleAddItem = () => {
    const defaultInv = inventoryItems[0];
    setItems([
      ...items,
      {
        inventoryItem: defaultInv?._id || '',
        name: defaultInv?.name || 'Raw Material',
        unit: defaultInv?.unit || 'pcs',
        quantity: 5,
        unitPrice: defaultInv?.costPerUnit || 100,
        totalPrice: (defaultInv?.costPerUnit || 100) * 5,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    const target = { ...updated[index], [field]: value };

    if (field === 'inventoryItem') {
      const inv = inventoryItems.find((i) => i._id === value);
      if (inv) {
        target.name = inv.name;
        target.unit = inv.unit;
        target.unitPrice = inv.costPerUnit || target.unitPrice;
      }
    }

    if (field === 'quantity' || field === 'unitPrice' || field === 'inventoryItem') {
      const q = parseFloat(target.quantity as any) || 0;
      const p = parseFloat(target.unitPrice as any) || 0;
      target.totalPrice = Number((q * p).toFixed(2));
    }

    updated[index] = target;
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
  const shipping = parseFloat(shippingCost) || 0;
  const grandTotal = Number((subtotal + taxAmount + shipping).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      addToast('Please select a supplier', 'warning');
      return;
    }
    if (items.length === 0) {
      addToast('Please add at least one material to purchase', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        supplierId: selectedSupplierId,
        items,
        taxAmount,
        shippingCost: shipping,
        notes,
      };

      const res = await api.post('/purchase-orders', payload);
      addToast(res.data.message || 'Purchase order created', 'success');
      onSaved();
      onClose();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to create purchase order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReceiveStock = async () => {
    if (!existingPO) return;
    if (!window.confirm(`Mark PO ${existingPO.poNumber} as fully received? Warehouse stock will automatically increment.`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(`/purchase-orders/${existingPO._id}/receive`, {});
      addToast(res.data.message || 'Stock received and inventory updated!', 'success');
      onSaved();
      onClose();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to receive purchase order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!currentSupplier) return;
    const phone = currentSupplier.phone.replace(/[^0-9]/g, '');
    const poNum = existingPO ? existingPO.poNumber : 'DRAFT';
    const lines = items
      .map((it, idx) => `${idx + 1}. ${it.name} - ${it.quantity} ${it.unit} @ ₹${it.unitPrice} = ₹${it.totalPrice}`)
      .join('\n');

    const msg = `*PURCHASE ORDER: ${poNum}*\nFrom: Rasin Arts Studio\nSupplier: ${currentSupplier.name}\n\n*Required Materials:*\n${lines}\n\n*Subtotal:* ₹${subtotal}\n*GST (18%):* ₹${taxAmount}\n*Grand Total:* ₹${grandTotal}\n\n*Notes:* ${notes}\n\nPlease confirm availability and dispatch schedule.`;
    const url = `https://api.whatsapp.com/send?phone=${phone.startsWith('91') ? phone : `91${phone}`}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl border border-art-800 shadow-2xl w-full max-w-4xl overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-art-800 flex items-center justify-between bg-gradient-to-r from-brand-50 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-brand-500 text-white shadow-md">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-art-300">
                  {existingPO ? `Purchase Order: ${existingPO.poNumber}` : 'Create Purchase Order (PO)'}
                </h3>
                <p className="text-xs text-art-500">
                  Manage vendor replenishment orders, print formal PO vouchers, and auto-sync stock
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-art-400 hover:text-art-200 rounded-xl hover:bg-art-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            {/* Top Bar: Supplier Selection & Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-art-950 border border-art-800">
              <div className="space-y-1">
                <label className="text-xs font-bold text-art-400">Select Vendor / Supplier *</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  disabled={Boolean(existingPO)}
                  className="w-full bg-white border border-art-700 rounded-xl px-3 py-2 text-xs font-bold text-art-300 focus:outline-none focus:border-brand-500"
                >
                  <option value="">-- Choose Supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.city || 'India'})
                    </option>
                  ))}
                </select>
              </div>

              {currentSupplier && (
                <>
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-art-400 block">Contact & Phone:</span>
                    <span className="text-art-300 font-semibold block flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-brand-600" />
                      {currentSupplier.phone} ({currentSupplier.contactPerson || 'Vendor Rep'})
                    </span>
                    <span className="text-art-500 text-[11px] block">
                      GSTIN: <strong>{currentSupplier.gstNumber || 'Not provided'}</strong>
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-art-400 block">Delivery Terms:</span>
                    <span className="text-art-300 font-semibold block">
                      Est. Lead Time: <strong>{currentSupplier.leadTimeDays || 5} Days</strong>
                    </span>
                    <span className="text-brand-600 font-bold text-[11px] block">
                      Payment Terms: {currentSupplier.paymentTerms || 'Net 30'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Itemized Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-art-400 uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-500" />
                  <span>Order Items & Raw Materials</span>
                </h4>
                {!existingPO && (
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs flex items-center gap-1 border border-brand-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Material</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 p-2.5 rounded-xl bg-white border border-art-800 items-center text-xs"
                  >
                    <div className="col-span-5 sm:col-span-4">
                      {!existingPO ? (
                        <select
                          value={item.inventoryItem || ''}
                          onChange={(e) => handleItemChange(idx, 'inventoryItem', e.target.value)}
                          className="w-full bg-art-950 border border-art-700 rounded-lg px-2 py-1.5 font-bold text-art-300 truncate"
                        >
                          <option value="">Custom Item</option>
                          {inventoryItems.map((inv) => (
                            <option key={inv._id} value={inv._id}>
                              {inv.name} ({inv.currentStock} {inv.unit} in stock)
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-bold text-art-300">{item.name}</span>
                      )}
                    </div>

                    <div className="col-span-3 sm:col-span-3 flex items-center gap-1">
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        disabled={Boolean(existingPO)}
                        placeholder="Qty"
                        className="w-full bg-art-950 border border-art-700 rounded-lg px-2 py-1.5 text-center font-mono font-bold text-art-300"
                      />
                      <span className="text-[11px] font-bold text-art-500">{item.unit}</span>
                    </div>

                    <div className="col-span-3 sm:col-span-3 flex items-center gap-1">
                      <span className="text-art-400 font-mono">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        disabled={Boolean(existingPO)}
                        placeholder="Price"
                        className="w-full bg-art-950 border border-art-700 rounded-lg px-2 py-1.5 font-mono font-bold text-art-300"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2 flex items-center justify-between">
                      <span className="font-mono font-bold text-art-300 hidden sm:inline">
                        ₹{item.totalPrice}
                      </span>
                      {!existingPO && items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-rose-500 hover:text-rose-700 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-art-800">
              <div className="space-y-2">
                <label className="text-xs font-bold text-art-400">Order Notes / Delivery Instructions</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={Boolean(existingPO)}
                  placeholder="e.g. Ensure UV-protected drums, delivery before Friday..."
                  className="w-full bg-white border border-art-700 rounded-xl p-3 text-xs text-art-300 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="p-4 rounded-2xl bg-art-950 border border-art-800 space-y-2 text-xs font-medium">
                <div className="flex justify-between text-art-400">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-art-300">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-art-400">
                  <span>Estimated GST (18%):</span>
                  <span className="font-mono font-bold text-art-300">₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-art-400 items-center">
                  <span>Shipping Transport:</span>
                  <input
                    type="number"
                    min="0"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    disabled={Boolean(existingPO)}
                    className="w-20 bg-white border border-art-700 rounded-lg px-2 py-0.5 text-right font-mono font-bold text-art-300 text-xs"
                  />
                </div>
                <div className="flex justify-between text-base font-black border-t border-art-800 pt-2 text-brand-600">
                  <span>Grand Total:</span>
                  <span className="font-mono">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-art-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-art-850 hover:bg-art-800 text-art-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4 text-brand-600" />
                  <span>Print PO Voucher</span>
                </button>
                {currentSupplier?.phone && (
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp Vendor</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {existingPO && existingPO.status !== 'Received' && (
                  <button
                    type="button"
                    onClick={handleReceiveStock}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Received & Increment Stock</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-art-800 text-art-400 hover:text-art-200 text-xs font-bold transition-all"
                >
                  Cancel
                </button>

                {!existingPO && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg shadow-brand-500/25 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span>Generate Purchase Order</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
