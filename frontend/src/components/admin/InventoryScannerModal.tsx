import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Camera, Barcode, QrCode, Search, CheckCircle2,
  AlertTriangle, Plus, Minus, ArrowRight, Sparkles, MapPin, Box
} from 'lucide-react';
import { InventoryItem, StockMovementType } from '../../types';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

interface InventoryScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItems: InventoryItem[];
  onStockUpdated: () => void;
}

export const InventoryScannerModal: React.FC<InventoryScannerModalProps> = ({
  isOpen,
  onClose,
  inventoryItems,
  onStockUpdated,
}) => {
  const { addToast } = useToastStore();
  const [scanInput, setScanInput] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [adjustmentDelta, setAdjustmentDelta] = useState(1);
  const [movementType, setMovementType] = useState<StockMovementType>('Audit Correction');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setScanInput('');
      setSelectedItem(null);
      setNote('');
    }
  }, [isOpen]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (cameraActive && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.warn('Camera access unavailable or declined:', err);
          setCameraActive(false);
          addToast('Camera unavailable. You can use handheld scanner or type barcode SKU.', 'info');
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  if (!isOpen) return null;

  const handleLookup = (searchTerm: string) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return;

    // Check if it's a barcode string like ART-INV-XXXXXX
    const found = inventoryItems.find((item) => {
      const barcodeStr = `art-inv-${item._id.slice(-6).toLowerCase()}`;
      return (
        barcodeStr === term ||
        item._id.toLowerCase() === term ||
        item._id.slice(-6).toLowerCase() === term ||
        item.name.toLowerCase().includes(term)
      );
    });

    if (found) {
      setSelectedItem(found);
      addToast(`Found: ${found.name}`, 'success');
    } else {
      addToast('No matching inventory item found for this barcode SKU', 'warning');
    }
  };

  const handleApplyAdjustment = async (sign: 1 | -1) => {
    if (!selectedItem) return;
    const delta = adjustmentDelta * sign;

    setIsSubmitting(true);
    try {
      const res = await api.patch(`/inventory/${selectedItem._id}/stock`, {
        delta,
        movementType,
        notes: note || `Scanner quick adjustment (${delta > 0 ? '+' : ''}${delta} ${selectedItem.unit})`,
        referenceId: `SCAN-${Date.now().toString().slice(-4)}`,
      });

      addToast(
        `✅ Updated "${selectedItem.name}" to ${res.data.data?.currentStock} ${selectedItem.unit}`,
        'success'
      );
      setSelectedItem(res.data.data);
      onStockUpdated();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to update stock', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl border border-art-800 shadow-2xl w-full max-w-2xl overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-art-800 flex items-center justify-between bg-gradient-to-r from-brand-50 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-brand-500 text-white shadow-md">
                <Barcode className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-art-300">
                  Live Barcode & QR Stock Scanner
                </h3>
                <p className="text-xs text-art-500">
                  Scan physical shelf/bin labels with camera or barcode gun to adjust stock in 1 click
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

          <div className="p-4 sm:p-6 space-y-6">
            {/* Viewfinder / Input Box */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLookup(scanInput);
                      }
                    }}
                    placeholder="Scan or type barcode (e.g. ART-INV-A1B2C3 or item name)..."
                    className="w-full bg-art-950 border border-art-700 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm font-mono font-bold text-art-300 focus:outline-none focus:border-brand-500"
                    autoFocus
                  />
                  <Search className="w-4 h-4 text-art-500 absolute left-3.5 top-3.5" />
                </div>
                <button
                  type="button"
                  onClick={() => handleLookup(scanInput)}
                  className="px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-2xl shadow-md transition-all shrink-0"
                >
                  Lookup
                </button>
                <button
                  type="button"
                  onClick={() => setCameraActive(!cameraActive)}
                  className={`p-3 rounded-2xl border font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 ${
                    cameraActive
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'bg-art-850 hover:bg-art-800 border-art-700 text-art-300'
                  }`}
                  title={cameraActive ? 'Stop Camera' : 'Start Camera'}
                >
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">{cameraActive ? 'Stop Camera' : 'Camera'}</span>
                </button>
              </div>

              {/* Camera Video Viewfinder */}
              {cameraActive && (
                <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-brand-500 h-48 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {/* Laser Scan Animation Line */}
                  <motion.div
                    animate={{ y: [-80, 80, -80] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="absolute left-8 right-8 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444]"
                  />
                  <div className="absolute bottom-2 px-3 py-1 bg-black/70 backdrop-blur-xs rounded-full text-[10px] text-white font-mono font-bold">
                    Center barcode or QR sticker in viewport
                  </div>
                </div>
              )}

              {/* Quick Preset Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                <span className="text-[10px] font-bold text-art-500 shrink-0">Quick Select:</span>
                {inventoryItems.slice(0, 5).map((inv) => (
                  <button
                    key={inv._id}
                    type="button"
                    onClick={() => {
                      setSelectedItem(inv);
                      setScanInput(`ART-INV-${inv._id.slice(-6).toUpperCase()}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-art-950 border border-art-800 hover:border-brand-300 text-art-400 hover:text-art-200 text-[10px] font-bold whitespace-nowrap transition-colors"
                  >
                    {inv.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Item Details & Quick Adjustment */}
            {selectedItem ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-brand-50/60 via-white to-amber-50/40 border border-brand-200 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-brand-200/60 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-brand-500 text-white font-mono text-[10px] font-black uppercase">
                        ART-INV-{selectedItem._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-art-500">{selectedItem.category}</span>
                    </div>
                    <h4 className="text-base font-black text-art-300">{selectedItem.name}</h4>
                    <p className="text-xs text-art-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-600" />
                      <span>{selectedItem.location || 'Main Warehouse'}</span>
                      <span className="mx-1.5">•</span>
                      <span>Unit Cost: ₹{selectedItem.costPerUnit || 0}</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-brand-200 text-center shadow-xs shrink-0 min-w-[120px]">
                    <div className="text-[10px] font-bold text-art-500 uppercase">Current Stock</div>
                    <div className="text-xl font-black font-mono text-brand-600">
                      {selectedItem.currentStock} <span className="text-xs text-art-500 font-bold">{selectedItem.unit}</span>
                    </div>
                    {selectedItem.currentStock <= selectedItem.minStockAlert && (
                      <span className="text-[10px] font-bold text-rose-600 flex items-center justify-center gap-1 mt-0.5">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        Low Stock Alert
                      </span>
                    )}
                  </div>
                </div>

                {/* Adjustment Controls */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-art-400 block mb-1">Reason / Movement Type:</label>
                      <select
                        value={movementType}
                        onChange={(e) => setMovementType(e.target.value as any)}
                        className="w-full bg-white border border-brand-200 rounded-xl px-3 py-2 font-bold text-art-300 focus:outline-none"
                      >
                        <option value="Audit Correction">Audit Correction (+/-)</option>
                        <option value="Purchase">Purchase Delivery (+)</option>
                        <option value="Studio Production">Studio Production Pour (-)</option>
                        <option value="Spillage / Damage">Spillage / Leakage Damage (-)</option>
                        <option value="Return">Supplier / Workshop Return (+)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-art-400 block mb-1">Audit Note (Optional):</label>
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g. Broken measuring cup spill..."
                        className="w-full bg-white border border-brand-200 rounded-xl px-3 py-2 text-art-300 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <span className="text-xs font-bold text-art-400 mr-1">Delta:</span>
                      {[1, 5, 10, 25, 50].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setAdjustmentDelta(num)}
                          className={`px-3 py-1.5 rounded-xl font-mono font-bold text-xs transition-all ${
                            adjustmentDelta === num
                              ? 'bg-brand-500 text-white shadow-md'
                              : 'bg-white border border-brand-200 text-art-400 hover:text-art-200'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => handleApplyAdjustment(-1)}
                        disabled={isSubmitting || selectedItem.currentStock === 0}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all disabled:opacity-40"
                      >
                        <Minus className="w-4 h-4" />
                        <span>Deduct -{adjustmentDelta} {selectedItem.unit}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyAdjustment(1)}
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add +{adjustmentDelta} {selectedItem.unit}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl border-2 border-dashed border-art-800 text-center space-y-2 text-art-500">
                <Box className="w-8 h-8 mx-auto text-art-600" />
                <p className="text-xs font-semibold">
                  No item currently selected. Scan an item barcode sticker or select from quick presets above.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
