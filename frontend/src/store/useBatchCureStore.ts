import { create } from 'zustand';
import { getStudioClimate, calculateCureCompensation } from '../services/climateService';
import { playAudioChime } from '../services/speechService';

export interface BatchStageStatus {
  name: string;
  subtext: string;
  targetTimestamp: number;
  durationMinutes: number;
  completed: boolean;
  completedAt?: number;
}

export interface ResinBatch {
  id: string;
  batchNumber: string;
  productName: string;
  productType: string;
  resinGrams: number;
  pouredAt: number;
  temperatureC: number;
  humidityPercent: number;
  targetDemoldHours: number;
  status: 'curing' | 'demolded' | 'archived';
  shoreDHardness?: number;
  notes?: string;
  gelWindow: BatchStageStatus;
  topcoatWindow: BatchStageStatus;
  demoldWindow: BatchStageStatus;
}

interface BatchCureState {
  batches: ResinBatch[];
  isTrackerModalOpen: boolean;
  openTrackerModal: () => void;
  closeTrackerModal: () => void;
  toggleTrackerModal: () => void;

  startBatch: (params: {
    batchNumber?: string;
    productName: string;
    productType?: string;
    resinGrams?: number;
    notes?: string;
  }) => ResinBatch;

  markStageComplete: (batchId: string, stage: 'gel' | 'topcoat' | 'demold') => void;
  extendTime: (batchId: string, extraHours: number) => void;
  logHardness: (batchId: string, shoreD: number) => void;
  markDemolded: (batchId: string) => void;
  archiveBatch: (batchId: string) => void;
  deleteBatch: (batchId: string) => void;
  getActiveBatches: () => ResinBatch[];
}

const STORAGE_KEY = 'rasin_studio_cure_batches';

const getInitialBatches = (): ResinBatch[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn('Failed to load stored batches:', e);
  }

  // Initial demo workshop batch for live immediate testing
  const now = Date.now();
  const climate = getStudioClimate();
  const cureComp = calculateCureCompensation(climate.temperatureC, climate.humidityPercent);
  const demoldMs = cureComp.demoldHours * 3600 * 1000;

  return [
    {
      id: 'batch-demo-1',
      batchNumber: 'B-101',
      productName: 'Resin Wall Clock (12-inch)',
      productType: 'clock',
      resinGrams: 380,
      pouredAt: now - 35 * 60 * 1000, // Poured 35 mins ago -> in Gel Window
      temperatureC: climate.temperatureC,
      humidityPercent: climate.humidityPercent,
      targetDemoldHours: cureComp.demoldHours,
      status: 'curing',
      notes: 'Deep ocean swirl with metallic gold hour ticks.',
      gelWindow: {
        name: 'Gel Window (Add Foil & Accents)',
        subtext: 'Resin is thickened. Best time to place foil flakes & flowers without sinking.',
        targetTimestamp: now + 15 * 60 * 1000,
        durationMinutes: 50,
        completed: false,
      },
      topcoatWindow: {
        name: 'Topcoat / Doming Window',
        subtext: 'Tack-free surface. Pour clear dome top layer.',
        targetTimestamp: now + 11.5 * 3600 * 1000,
        durationMinutes: 12 * 60,
        completed: false,
      },
      demoldWindow: {
        name: 'Demold & Shore-D Ready',
        subtext: 'Shore-D 80+ hardness reached. Ready for unmolding & edge sanding.',
        targetTimestamp: now + (cureComp.demoldHours - 0.6) * 3600 * 1000,
        durationMinutes: cureComp.demoldHours * 60,
        completed: false,
      },
    },
    {
      id: 'batch-demo-2',
      batchNumber: 'B-102',
      productName: 'Ocean Geode Coaster Set (4 pcs)',
      productType: 'coaster',
      resinGrams: 220,
      pouredAt: now - 14 * 3600 * 1000, // Poured 14 hrs ago -> Ready for demold soon
      temperatureC: 24,
      humidityPercent: 55,
      targetDemoldHours: 24,
      status: 'curing',
      notes: 'Sapphire & Caribbean mica with gold gilded edge.',
      gelWindow: {
        name: 'Gel Window (Add Foil & Accents)',
        subtext: 'Resin is thickened. Best time to place foil flakes.',
        targetTimestamp: now - 13.2 * 3600 * 1000,
        durationMinutes: 50,
        completed: true,
        completedAt: now - 13.2 * 3600 * 1000,
      },
      topcoatWindow: {
        name: 'Topcoat / Doming Window',
        subtext: 'Tack-free surface. Pour clear dome top layer.',
        targetTimestamp: now - 2 * 3600 * 1000,
        durationMinutes: 12 * 60,
        completed: true,
        completedAt: now - 2 * 3600 * 1000,
      },
      demoldWindow: {
        name: 'Demold & Shore-D Ready',
        subtext: 'Shore-D 80+ hardness reached. Ready for unmolding.',
        targetTimestamp: now + 10 * 3600 * 1000,
        durationMinutes: 24 * 60,
        completed: false,
      },
    },
  ];
};

const saveBatches = (batches: ResinBatch[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
    } catch (e) {
      console.warn('Failed to save batches to localStorage:', e);
    }
  }
};

export const useBatchCureStore = create<BatchCureState>((set, get) => ({
  batches: getInitialBatches(),
  isTrackerModalOpen: false,
  openTrackerModal: () => set({ isTrackerModalOpen: true }),
  closeTrackerModal: () => set({ isTrackerModalOpen: false }),
  toggleTrackerModal: () => set((state) => ({ isTrackerModalOpen: !state.isTrackerModalOpen })),

  startBatch: ({ batchNumber, productName, productType = 'general', resinGrams = 300, notes = '' }) => {
    const climate = getStudioClimate();
    const cureComp = calculateCureCompensation(climate.temperatureC, climate.humidityPercent);
    const now = Date.now();

    const nextBatchNum =
      batchNumber ||
      `B-${Math.floor(100 + Math.random() * 900)}`;

    const gelDurationMinutes = 45;
    const topcoatDurationHours = 12;
    const demoldHours = cureComp.demoldHours;

    const newBatch: ResinBatch = {
      id: `batch-${Date.now()}`,
      batchNumber: nextBatchNum,
      productName,
      productType,
      resinGrams,
      pouredAt: now,
      temperatureC: climate.temperatureC,
      humidityPercent: climate.humidityPercent,
      targetDemoldHours: demoldHours,
      status: 'curing',
      notes,
      gelWindow: {
        name: 'Gel Window (Add Foil & Accents)',
        subtext: 'Resin is thickened. Best time to place foil flakes & dried flowers without sinking.',
        targetTimestamp: now + gelDurationMinutes * 60 * 1000,
        durationMinutes: gelDurationMinutes,
        completed: false,
      },
      topcoatWindow: {
        name: 'Topcoat / Doming Window',
        subtext: 'Tack-free surface. Perfect time to pour crystal-clear dome top layer.',
        targetTimestamp: now + topcoatDurationHours * 3600 * 1000,
        durationMinutes: topcoatDurationHours * 60,
        completed: false,
      },
      demoldWindow: {
        name: 'Demold & Shore-D Ready',
        subtext: `Target Shore-D hardness 80+ reached (${cureComp.advice.en}). Ready for unmolding.`,
        targetTimestamp: now + demoldHours * 3600 * 1000,
        durationMinutes: demoldHours * 60,
        completed: false,
      },
    };

    const updated = [newBatch, ...get().batches];
    saveBatches(updated);
    set({ batches: updated });
    playAudioChime('start');
    return newBatch;
  },

  markStageComplete: (batchId, stage) => {
    const now = Date.now();
    const updated = get().batches.map((b) => {
      if (b.id !== batchId) return b;
      if (stage === 'gel') {
        return {
          ...b,
          gelWindow: { ...b.gelWindow, completed: true, completedAt: now },
        };
      }
      if (stage === 'topcoat') {
        return {
          ...b,
          topcoatWindow: { ...b.topcoatWindow, completed: true, completedAt: now },
        };
      }
      if (stage === 'demold') {
        return {
          ...b,
          status: 'demolded' as const,
          demoldWindow: { ...b.demoldWindow, completed: true, completedAt: now },
        };
      }
      return b;
    });

    saveBatches(updated);
    set({ batches: updated });
    playAudioChime('success');
  },

  extendTime: (batchId, extraHours) => {
    const extraMs = extraHours * 3600 * 1000;
    const updated = get().batches.map((b) => {
      if (b.id !== batchId) return b;
      return {
        ...b,
        targetDemoldHours: b.targetDemoldHours + extraHours,
        demoldWindow: {
          ...b.demoldWindow,
          targetTimestamp: b.demoldWindow.targetTimestamp + extraMs,
        },
      };
    });
    saveBatches(updated);
    set({ batches: updated });
  },

  logHardness: (batchId, shoreD) => {
    const updated = get().batches.map((b) => (b.id === batchId ? { ...b, shoreDHardness: shoreD } : b));
    saveBatches(updated);
    set({ batches: updated });
  },

  markDemolded: (batchId) => {
    const now = Date.now();
    const updated = get().batches.map((b) =>
      b.id === batchId
        ? {
            ...b,
            status: 'demolded' as const,
            demoldWindow: { ...b.demoldWindow, completed: true, completedAt: now },
          }
        : b
    );
    saveBatches(updated);
    set({ batches: updated });
    playAudioChime('finish');
  },

  archiveBatch: (batchId) => {
    const updated = get().batches.map((b) =>
      b.id === batchId ? { ...b, status: 'archived' as const } : b
    );
    saveBatches(updated);
    set({ batches: updated });
  },

  deleteBatch: (batchId) => {
    const updated = get().batches.filter((b) => b.id !== batchId);
    saveBatches(updated);
    set({ batches: updated });
  },

  getActiveBatches: () => {
    return get().batches.filter((b) => b.status === 'curing');
  },
}));
