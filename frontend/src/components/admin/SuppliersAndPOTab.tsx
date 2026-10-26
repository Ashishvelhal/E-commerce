import React, { useState, useEffect } from 'react';
import {
  Truck, Plus, Search, RefreshCw, Send, Printer, CheckCircle2,
  Phone, Mail, MapPin, Building2, Calendar, FileText, Zap, DollarSign, X
} from 'lucide-react';
import { Supplier, PurchaseOrder, InventoryItem } from '../../types';
import { PurchaseOrderModal } from './PurchaseOrderModal';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

interface SuppliersAndPOTabProps {
  inventoryItems: InventoryItem[];
  onRefreshInventory: () => void;
}

export const SuppliersAndPOTab: React.FC<SuppliersAndPOTabProps> = ({
  inventoryItems,
  onRefreshInventory,
}) => {
  const { addToast } = useToastStore();
  const [subView, setSubView] = useState<'orders' | 'suppliers'>('orders');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingAutoPO, setIsGeneratingAutoPO] = useState(false);

  // Modals
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [activePO, setActivePO] = useState<PurchaseOrder | null>(null);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);

  // New Supplier Form
  const [supName, setSupName] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supCity, setSupCity] = useState('');
  const [supGst, setSupGst] = useState('');
  const [supLeadDays, setSupLeadDays] = useState('5');
  const [supTerms, setSupTerms] = useState('Net 30');
  const [supCategory, setSupCategory] = useState('Resin & Hardener');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [supRes, poRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/purchase-orders'),
      ]);
      setSuppliers(supRes.data.data || []);
      setPurchaseOrders(poRes.data.data || []);
    } catch (err) {
      console.error('Error fetching suppliers and POs:', err);
      addToast('Failed to load supplier & purchase order data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOneClickAutoPO = async () => {
    setIsGeneratingAutoPO(true);
    try {
      const res = await api.post('/purchase-orders/one-click-auto', {});
      addToast(res.data.message || 'Auto POs generated successfully', 'success');
      fetchData();
      onRefreshInventory();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to auto-generate POs', 'error');
    } finally {
      setIsGeneratingAutoPO(false);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim() || !supPhone.trim()) {
      addToast('Supplier name and phone are required', 'warning');
      return;
    }

    try {
      const payload = {
        name: supName.trim(),
        phone: supPhone.trim(),
        email: supEmail.trim(),
        contactPerson: supContact.trim(),
        city: supCity.trim(),
        gstNumber: supGst.trim().toUpperCase(),
        leadTimeDays: parseInt(supLeadDays) || 5,
        paymentTerms: supTerms.trim() || 'Net 30',
        suppliedCategories: [supCategory],
      };

      await api.post('/suppliers', payload);
      addToast(`Vendor "${supName}" added to supplier directory`, 'success');
      setIsAddSupplierOpen(false);
      setSupName('');
      setSupPhone('');
      setSupEmail('');
      setSupContact('');
      setSupCity('');
      setSupGst('');
      fetchData();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to create supplier', 'error');
    }
  };

  const handleReceiveStock = async (po: PurchaseOrder) => {
    if (!window.confirm(`Mark PO ${po.poNumber} as fully received? Raw material stock will increment automatically.`)) {
      return;
    }

    try {
      const res = await api.post(`/purchase-orders/${po._id}/receive`, {});
      addToast(res.data.message || 'Stock received and updated in inventory!', 'success');
      fetchData();
      onRefreshInventory();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to receive stock', 'error');
    }
  };

  const getStatusPill = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'Received':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Received & In Stock
          </span>
        );
      case 'Partially Received':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
            Partially Received
          </span>
        );
      case 'Sent':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Dispatched / Sent
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with One-Click PO */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-white to-brand-50 border border-emerald-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            <span>Supplier & Purchase Order (PO) Management</span>
          </h3>
          <p className="text-xs text-slate-600">
            Vendor records, automatic one-click replenishment from low stock alerts, WhatsApp PO dispatch, and receiving logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOneClickAutoPO}
            disabled={isGeneratingAutoPO}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
            title="Auto-scans low-stock materials and groups purchase orders by vendor"
          >
            <Zap className={`w-4 h-4 ${isGeneratingAutoPO ? 'animate-spin' : 'fill-white'}`} />
            <span>⚡ 1-Click Replenishment PO</span>
          </button>

          <button
            onClick={() => {
              setActivePO(null);
              setIsPOModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Purchase Order</span>
          </button>

          <button
            onClick={() => setIsAddSupplierOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
          >
            <span>+ Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Subview Toggle Switcher */}
      <div className="flex items-center justify-between border-b border-art-800 pb-3">
        <div className="flex rounded-xl bg-white p-1 border border-art-800 text-xs font-bold shadow-xs">
          <button
            onClick={() => setSubView('orders')}
            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              subView === 'orders' ? 'bg-brand-500 text-white shadow-sm' : 'text-art-400 hover:text-art-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Purchase Orders ({purchaseOrders.length})</span>
          </button>
          <button
            onClick={() => setSubView('suppliers')}
            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              subView === 'suppliers' ? 'bg-brand-500 text-white shadow-sm' : 'text-art-400 hover:text-art-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Vendor Directory ({suppliers.length})</span>
          </button>
        </div>

        <button
          onClick={fetchData}
          className="p-2 rounded-xl bg-white border border-art-800 text-art-400 hover:text-art-200 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* VIEW: PURCHASE ORDERS */}
      {subView === 'orders' && (
        <div className="rounded-3xl bg-white border border-art-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-art-800 bg-art-950 text-art-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 sm:px-6">PO Number</th>
                  <th className="py-3.5 px-4">Vendor / Supplier</th>
                  <th className="py-3.5 px-4">Items Summary</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Grand Total</th>
                  <th className="py-3.5 px-4">Est. Delivery</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-art-800/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-art-500">
                      <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-brand-500" />
                      <span>Loading purchase orders...</span>
                    </td>
                  </tr>
                ) : purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-art-500">
                      <Truck className="w-8 h-8 mx-auto mb-2 text-art-600" />
                      <p className="font-semibold">No purchase orders found.</p>
                      <p className="text-[11px] text-art-600 mt-1">
                        Click "⚡ 1-Click Replenishment PO" above to generate POs from low-stock materials automatically.
                      </p>
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map((po) => (
                    <tr key={po._id} className="hover:bg-art-950/40 transition-colors">
                      {/* PO Number */}
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-black text-brand-600 whitespace-nowrap">
                        {po.poNumber}
                        <div className="text-[10px] text-art-500 font-normal font-sans">
                          {new Date(po.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="py-3.5 px-4">
                        <strong className="text-art-300 font-bold block">{po.supplierName}</strong>
                        <span className="text-[10px] text-art-500">
                          {typeof po.supplier === 'object' ? po.supplier.phone : 'Vendor'}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <div className="text-art-300 font-semibold truncate max-w-xs">
                          {po.items.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}
                        </div>
                        <div className="text-[10px] text-art-500 font-mono">
                          {po.items.length} line items
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {getStatusPill(po.status)}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-center font-mono font-black text-sm text-art-300 whitespace-nowrap">
                        ₹{po.grandTotal.toFixed(2)}
                      </td>

                      {/* Delivery */}
                      <td className="py-3.5 px-4 text-art-500 whitespace-nowrap">
                        {po.expectedDeliveryDate
                          ? new Date(po.expectedDeliveryDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                            })
                          : 'Standard'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setActivePO(po);
                              setIsPOModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-art-850 hover:bg-art-800 text-art-300 transition-colors"
                            title="View / Print PO"
                          >
                            <Printer className="w-3.5 h-3.5 text-brand-600" />
                          </button>

                          {po.status !== 'Received' && (
                            <button
                              onClick={() => handleReceiveStock(po)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs flex items-center gap-1"
                              title="Increment stock from PO"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Receive</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: VENDOR DIRECTORY */}
      {subView === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((sup) => (
            <div
              key={sup._id}
              className="p-5 rounded-3xl bg-white border border-art-800 shadow-sm hover:border-brand-300 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-black text-art-300">{sup.name}</h4>
                    <p className="text-xs text-art-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>{sup.city || 'India'}</span>
                      {sup.gstNumber && <span>• GST: {sup.gstNumber}</span>}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200 shrink-0">
                    {sup.leadTimeDays || 5}d Lead
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-art-950 border border-art-800 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-art-400">
                    <Phone className="w-3.5 h-3.5 text-brand-600" />
                    <span className="font-mono font-bold text-art-300">{sup.phone}</span>
                    <span className="text-art-500">({sup.contactPerson || 'Vendor Rep'})</span>
                  </div>
                  {sup.email && (
                    <div className="flex items-center gap-2 text-art-400">
                      <Mail className="w-3.5 h-3.5 text-brand-600" />
                      <span className="truncate">{sup.email}</span>
                    </div>
                  )}
                  <div className="text-[11px] text-art-500 font-semibold pt-1 border-t border-art-800/60">
                    Payment Terms: <strong className="text-art-300">{sup.paymentTerms || 'Net 30'}</strong>
                  </div>
                </div>

                {sup.suppliedCategories && sup.suppliedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {sup.suppliedCategories.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-art-850 text-art-400 text-[10px] font-bold">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-art-800 flex items-center justify-between gap-2">
                <a
                  href={`https://api.whatsapp.com/send?phone=${sup.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>

                <button
                  onClick={() => {
                    setActivePO(null);
                    setIsPOModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-xs transition-all"
                >
                  Draft PO
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PO View & Create Modal */}
      <PurchaseOrderModal
        isOpen={isPOModalOpen}
        onClose={() => {
          setIsPOModalOpen(false);
          setActivePO(null);
        }}
        existingPO={activePO}
        suppliers={suppliers}
        inventoryItems={inventoryItems}
        onSaved={fetchData}
      />

      {/* Add Supplier Modal */}
      {isAddSupplierOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-art-800 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-art-800 flex items-center justify-between bg-gradient-to-r from-brand-50 to-white">
              <h3 className="text-base font-black text-art-300 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-600" />
                <span>Add Vendor / Raw Material Supplier</span>
              </h3>
              <button
                onClick={() => setIsAddSupplierOpen(false)}
                className="p-1 text-art-400 hover:text-art-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-art-400 block mb-1">Company / Vendor Name *</label>
                  <input
                    type="text"
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                    placeholder="e.g. Master Resin Chemical Industries Ltd."
                    className="w-full bg-art-950 border border-art-700 rounded-xl p-2.5 font-bold text-art-300 focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-art-400 block mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-art-950 border border-art-700 rounded-xl p-2.5 font-mono text-art-300 focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-art-400 block mb-1">Contact Rep Name</label>
                  <input
                    type="text"
                    value={supContact}
                    onChange={(e) => setSupContact(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full bg-art-950 border border-art-700 rounded-xl p-2.5 text-art-300 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-art-400 block mb-1">Email</label>
                  <input
                    type="email"
                    value={supEmail}
                    onChange={(e) => setSupEmail(e.target.value)}
                    placeholder="sales@masterresin.com"
                    className="w-full bg-art-950 border border-art-700 rounded-xl p-2.5 text-art-300 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-art-400 block mb-1">City / Region</label>
                  <input
                    type="text"
                    value={supCity}
                    onChange={(e) => setSupCity(e.target.value)}
                    placeholder="e.g. Ahmedabad, Gujarat"
                    className="w-full bg-art-950 border border-art-700 rounded-xl p-2.5 text-art-300 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-art-400 block mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={supGst}
                    onChange={(e) => setSupGst(e.target.value)}
                    placeholder="24ABCDE1234F1Z5"
                    className="w-full bg-art-950 border border-art-700 rounded-xl p-2.5 font-mono uppercase text-art-300 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-art-400 block mb-1">Avg Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={supLeadDays}
                    onChange={(e) => setSupLeadDays(e.target.value)}
                    className="w-full bg-art-950 border border-art-700 rounded-xl p-2.5 font-mono text-center text-art-300 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-bold text-art-400 block mb-1">Primary Material Category</label>
                  <select
                    value={supCategory}
                    onChange={(e) => setSupCategory(e.target.value)}
                    className="w-full bg-art-950 border border-art-700 rounded-xl p-2.5 text-art-300 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Resin & Hardener">Resin & Hardener</option>
                    <option value="Pigments & Inks">Pigments & Inks</option>
                    <option value="Molds & Frames">Molds & Silicone Frames</option>
                    <option value="Hardware & Findings">Hardware, Clocks & Keychain Hooks</option>
                    <option value="Packaging & Shipping">Luxury Boxes & Bubble Wrap</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierOpen(false)}
                  className="px-4 py-2 rounded-xl border border-art-700 text-art-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-md"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
