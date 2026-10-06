import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Flame,
  Award,
  Archive,
  Trash2,
  Layers,
  Thermometer,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { useBatchCureStore, ResinBatch } from '../../store/useBatchCureStore';
import { getStudioClimate } from '../../services/climateService';
import { useToastStore } from '../../store/useToastStore';

export const BatchCureTrackerModal: React.FC = () => {
  const {
    batches,
    isTrackerModalOpen,
    closeTrackerModal,
    startBatch,
    markStageComplete,
    extendTime,
    logHardness,
    markDemolded,
    archiveBatch,
    deleteBatch,
  } = useBatchCureStore();

  const { addToast } = useToastStore();
  const [filter, setFilter] = useState<'active' | 'demolded' | 'all'>('active');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newBatchNumber, setNewBatchNumber] = useState('');
  const [newGrams, setNewGrams] = useState(350);
  const [newNotes, setNewNotes] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Real-time second tick for dynamic countdown timers
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isTrackerModalOpen) return null;

  const filteredBatches = batches.filter((b) => {
    if (filter === 'active') return b.status === 'curing';
    if (filter === 'demolded') return b.status === 'demolded';
    return true;
  });

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    const b = startBatch({
      batchNumber: newBatchNumber.trim() || undefined,
      productName: newProductName.trim(),
      resinGrams: Number(newGrams),
      notes: newNotes.trim(),
    });

    addToast(`🚀 Cure Tracking Started for Batch ${b.batchNumber} (${b.productName})`, 'success');
    setIsCreatingNew(false);
    setNewProductName('');
    setNewBatchNumber('');
    setNewNotes('');
  };

  const formatRemaining = (targetTs: number) => {
    const diff = targetTs - currentTime;
    if (diff <= 0) return 'Ready Now';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) return `${hours}h ${mins}m remaining`;
    if (mins > 0) return `${mins}m ${secs}s remaining`;
    return `${secs}s remaining`;
  };

  const getStagePercent = (pouredAt: number, targetTs: number) => {
    const total = targetTs - pouredAt;
    const elapsed = currentTime - pouredAt;
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs font-poppins">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl bg-art-950 border border-art-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-art-300"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-art-800 flex items-center justify-between bg-gradient-to-r from-art-950 via-art-900 to-art-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-brand-500 to-rose-600 text-white shadow glow-brand">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-art-300 flex items-center gap-2">
                <span>Multi-Batch Cure Stage & Demold Alarm Tracker</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  Hands-Free Voice Ready
                </span>
              </h2>
              <p className="text-xs text-art-500">
                Track Gel Windows, Doming Topcoats & Demold Shore-D readiness with studio climate compensation.
              </p>
            </div>
          </div>

          <button
            onClick={closeTrackerModal}
            className="p-2 rounded-xl text-art-400 hover:text-art-300 hover:bg-art-900 border border-art-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls Bar */}
        <div className="px-5 py-3 border-b border-art-800 bg-art-900/60 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-art-950 rounded-xl border border-art-800">
            {(['active', 'demolded', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filter === tab
                    ? 'bg-brand-500 text-white shadow'
                    : 'text-art-400 hover:text-art-300'
                }`}
              >
                {tab === 'active' ? `Active Curing (${batches.filter((b) => b.status === 'curing').length})` : tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCreatingNew(!isCreatingNew)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 hover:opacity-90 text-white text-xs font-bold flex items-center gap-1.5 shadow glow-brand transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{isCreatingNew ? 'Cancel Form' : 'Start New Batch'}</span>
          </button>
        </div>

        {/* New Batch Creation Form Drawer */}
        <AnimatePresence>
          {isCreatingNew && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleCreateBatch}
              className="p-5 bg-art-900 border-b border-art-800 space-y-3 overflow-hidden"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400">
                Log New Workshop Pour Batch
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-art-400 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="e.g. Resin Wall Clock (12-inch)"
                    className="w-full px-3 py-2 rounded-xl bg-art-950 border border-art-800 text-xs text-art-300 focus:border-brand-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-art-400 mb-1">Batch # (Optional)</label>
                  <input
                    type="text"
                    value={newBatchNumber}
                    onChange={(e) => setNewBatchNumber(e.target.value)}
                    placeholder="e.g. B-105"
                    className="w-full px-3 py-2 rounded-xl bg-art-950 border border-art-800 text-xs text-art-300 focus:border-brand-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-art-400 mb-1">Total Resin (Grams)</label>
                  <input
                    type="number"
                    value={newGrams}
                    onChange={(e) => setNewGrams(Number(e.target.value))}
                    min={20}
                    max={5000}
                    className="w-full px-3 py-2 rounded-xl bg-art-950 border border-art-800 text-xs text-art-300 focus:border-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1">Batch Formula / Notes</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Sapphire mica swirl + 24K gold foil veins"
                  className="w-full px-3 py-2 rounded-xl bg-art-950 border border-art-800 text-xs text-art-300 focus:border-brand-500 focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3 py-1.5 rounded-xl border border-art-800 text-xs text-art-400 hover:text-art-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-brand-500 text-white text-xs font-bold shadow"
                >
                  Start Curing Clock
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Batch Cards Scrollable List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {filteredBatches.length === 0 ? (
            <div className="py-12 text-center text-art-500 space-y-2">
              <Clock className="w-10 h-10 mx-auto opacity-30 text-brand-500" />
              <p className="text-sm font-semibold text-art-400">No batches match the current filter.</p>
              <p className="text-xs">
                Speak <span className="text-brand-400 font-mono">"Hey Partner, started batch for clock"</span> or click Start New Batch above.
              </p>
            </div>
          ) : (
            filteredBatches.map((b) => {
              const isDemolded = b.status === 'demolded';
              const gelPercent = getStagePercent(b.pouredAt, b.gelWindow.targetTimestamp);
              const topcoatPercent = getStagePercent(b.pouredAt, b.topcoatWindow.targetTimestamp);
              const demoldPercent = getStagePercent(b.pouredAt, b.demoldWindow.targetTimestamp);

              return (
                <div
                  key={b.id}
                  className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                    isDemolded
                      ? 'bg-art-900/40 border-emerald-900/40 opacity-80'
                      : 'bg-art-900 border-art-800 shadow-lg'
                  }`}
                >
                  {/* Top Batch Header Bar */}
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 text-xs font-black font-mono">
                        {b.batchNumber}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-art-300">{b.productName}</h3>
                        <p className="text-xs text-art-500 flex items-center gap-2">
                          <span>{b.resinGrams}g resin</span>
                          <span>·</span>
                          <span className="flex items-center gap-1 text-art-400">
                            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                            {b.temperatureC}°C ({b.humidityPercent}% RH)
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isDemolded ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Demolded & Complete
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30 animate-pulse flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-brand-500" /> Curing Active
                        </span>
                      )}

                      <button
                        onClick={() => deleteBatch(b.id)}
                        title="Delete Batch Record"
                        className="p-1.5 rounded-lg text-art-500 hover:text-rose-500 hover:bg-art-950 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {b.notes && (
                    <div className="mb-4 px-3 py-1.5 rounded-xl bg-art-950 border border-art-800/80 text-xs text-art-400 font-mono">
                      📝 {b.notes}
                    </div>
                  )}

                  {/* 3-Stage Interactive Progress Windows */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Stage 1: Gel Window */}
                    <div
                      className={`p-3.5 rounded-2xl border transition-all ${
                        b.gelWindow.completed
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                          : currentTime >= b.gelWindow.targetTimestamp
                          ? 'bg-amber-950/30 border-amber-500/40 text-amber-300 animate-pulse'
                          : 'bg-art-950 border-art-800 text-art-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Stage 1 · Gel Window
                        </span>
                        {b.gelWindow.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-art-300">
                        {b.gelWindow.completed ? 'Accents Placed' : formatRemaining(b.gelWindow.targetTimestamp)}
                      </p>
                      <p className="text-[10px] text-art-500 mt-0.5 leading-snug">
                        {b.gelWindow.subtext}
                      </p>

                      {!b.gelWindow.completed && !isDemolded && (
                        <button
                          onClick={() => {
                            markStageComplete(b.id, 'gel');
                            addToast(`✨ Marked Stage 1 (Gel Window) done for ${b.batchNumber}`, 'success');
                          }}
                          className="mt-2.5 w-full py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all"
                        >
                          Mark Accents Placed
                        </button>
                      )}
                    </div>

                    {/* Stage 2: Topcoat Doming Window */}
                    <div
                      className={`p-3.5 rounded-2xl border transition-all ${
                        b.topcoatWindow.completed
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                          : currentTime >= b.topcoatWindow.targetTimestamp
                          ? 'bg-brand-950/30 border-brand-500/40 text-brand-300 animate-pulse'
                          : 'bg-art-950 border-art-800 text-art-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Stage 2 · Doming Topcoat
                        </span>
                        {b.topcoatWindow.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Layers className="w-4 h-4 text-brand-400" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-art-300">
                        {b.topcoatWindow.completed ? 'Topcoat Cured' : formatRemaining(b.topcoatWindow.targetTimestamp)}
                      </p>
                      <p className="text-[10px] text-art-500 mt-0.5 leading-snug">
                        {b.topcoatWindow.subtext}
                      </p>

                      {!b.topcoatWindow.completed && !isDemolded && (
                        <button
                          onClick={() => {
                            markStageComplete(b.id, 'topcoat');
                            addToast(`🛡️ Marked Stage 2 (Topcoat) done for ${b.batchNumber}`, 'success');
                          }}
                          className="mt-2.5 w-full py-1 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-500/40 text-[11px] font-bold transition-all"
                        >
                          Mark Topcoat Poured
                        </button>
                      )}
                    </div>

                    {/* Stage 3: Demold & Shore-D Hardness Ready */}
                    <div
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isDemolded
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                          : currentTime >= b.demoldWindow.targetTimestamp
                          ? 'bg-emerald-950/30 border-emerald-500/60 text-emerald-300 animate-pulse'
                          : 'bg-art-950 border-art-800 text-art-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Stage 3 · Demold Ready
                        </span>
                        {isDemolded ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Award className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-art-300">
                        {isDemolded ? 'Demolded & Sanded' : formatRemaining(b.demoldWindow.targetTimestamp)}
                      </p>
                      <p className="text-[10px] text-art-500 mt-0.5 leading-snug">
                        {b.demoldWindow.subtext}
                      </p>

                      {!isDemolded && (
                        <div className="flex items-center gap-1.5 mt-2.5">
                          <button
                            onClick={() => {
                              markDemolded(b.id);
                              addToast(`🏆 Batch ${b.batchNumber} demolded successfully!`, 'success');
                            }}
                            className="flex-1 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow"
                          >
                            Mark Demolded
                          </button>
                          <button
                            onClick={() => {
                              extendTime(b.id, 2);
                              addToast(`⏱️ Extended +2h demold time for Batch ${b.batchNumber}`, 'info');
                            }}
                            title="Extend 2 hours for cold workshop weather"
                            className="px-2 py-1 rounded-xl bg-art-900 border border-art-800 text-art-400 hover:text-art-300 text-[10px] font-bold"
                          >
                            +2h
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-art-800 bg-art-950 flex items-center justify-between text-xs text-art-500">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-500" />
            <span>Voice Shortcut: "Hey Partner, started batch 105 for clock"</span>
          </div>
          <button
            onClick={closeTrackerModal}
            className="px-4 py-1.5 rounded-xl bg-art-900 border border-art-800 text-art-300 font-semibold hover:bg-art-850"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
