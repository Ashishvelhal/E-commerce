import React, { useState, useEffect } from 'react';
import {
  Clock,
  Sparkles,
  Layers,
  Award,
  ChevronRight,
  Flame,
  Thermometer,
  Plus,
} from 'lucide-react';
import { useBatchCureStore } from '../../store/useBatchCureStore';

export const BatchCureWidget: React.FC = () => {
  const { batches, openTrackerModal } = useBatchCureStore();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeBatches = batches.filter((b) => b.status === 'curing');

  const formatRemaining = (targetTs: number) => {
    const diff = targetTs - now;
    if (diff <= 0) return 'Ready Now';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-art-900 border border-art-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-brand-500 to-rose-600 text-white shadow">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-art-300 flex items-center gap-2">
              <span>Multi-Batch Cure Tracker</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30">
                {activeBatches.length} Active
              </span>
            </h3>
            <p className="text-[11px] text-art-500">Live 3-stage workshop curing countdowns</p>
          </div>
        </div>

        <button
          onClick={openTrackerModal}
          className="px-3 py-1.5 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 text-brand-400 text-xs font-bold transition-all flex items-center gap-1"
        >
          <span>Manage Batches</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {activeBatches.length === 0 ? (
        <div className="p-4 rounded-2xl bg-art-950 border border-art-800/80 text-center text-xs text-art-500 space-y-1">
          <p className="font-semibold text-art-400">No active batches curing right now.</p>
          <p className="text-[11px]">
            Say <span className="text-brand-400 font-mono">"Hey Partner, started batch for clock"</span> or click below.
          </p>
          <button
            onClick={openTrackerModal}
            className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-500 text-white font-bold text-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Start Batch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeBatches.slice(0, 2).map((b) => (
            <div
              key={b.id}
              onClick={openTrackerModal}
              className="p-3.5 rounded-2xl bg-art-950 border border-art-800 hover:border-brand-500/40 cursor-pointer transition-all space-y-2.5 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-brand-500/20 text-brand-400 font-mono text-xs font-bold">
                    {b.batchNumber}
                  </span>
                  <span className="text-xs font-bold text-art-300 truncate max-w-[140px]">
                    {b.productName}
                  </span>
                </div>
                <span className="text-[10px] text-art-500 flex items-center gap-1 font-mono">
                  <Thermometer className="w-3 h-3 text-amber-500" />
                  {b.temperatureC}°C
                </span>
              </div>

              {/* Mini 3-Stage Progress Timeline */}
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div
                  className={`p-1.5 rounded-xl border text-[10px] ${
                    b.gelWindow.completed
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-bold'
                      : 'bg-art-900 border-art-800 text-art-400'
                  }`}
                >
                  <span className="block font-mono text-[9px] uppercase">Gel</span>
                  <span>{b.gelWindow.completed ? 'Done' : formatRemaining(b.gelWindow.targetTimestamp)}</span>
                </div>

                <div
                  className={`p-1.5 rounded-xl border text-[10px] ${
                    b.topcoatWindow.completed
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-bold'
                      : 'bg-art-900 border-art-800 text-art-400'
                  }`}
                >
                  <span className="block font-mono text-[9px] uppercase">Topcoat</span>
                  <span>{b.topcoatWindow.completed ? 'Done' : formatRemaining(b.topcoatWindow.targetTimestamp)}</span>
                </div>

                <div
                  className={`p-1.5 rounded-xl border text-[10px] ${
                    b.status === 'demolded'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-bold'
                      : 'bg-art-900 border-art-800 text-amber-300 font-bold'
                  }`}
                >
                  <span className="block font-mono text-[9px] uppercase">Demold</span>
                  <span>{formatRemaining(b.demoldWindow.targetTimestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
