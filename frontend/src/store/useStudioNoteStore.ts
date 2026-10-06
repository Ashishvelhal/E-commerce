import { create } from 'zustand';
import api from '../services/api';

export interface StudioNoteItem {
  _id: string;
  title: string;
  content: string;
  category: 'formula' | 'order_customization' | 'todo' | 'idea' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isCompleted: boolean;
  isPinned: boolean;
  tags: string[];
  productType?: string;
  rawResinGramsDeducted?: number;
  materialCost?: number;
  author?: string;
  createdAt: string;
  updatedAt: string;
}

interface StudioNoteState {
  notes: StudioNoteItem[];
  isLoading: boolean;
  isNotepadOpen: boolean;
  isGuideModalOpen: boolean;
  filterCategory: string;
  searchQuery: string;
  uncompletedTodoCount: number;

  openNotepad: () => void;
  closeNotepad: () => void;
  toggleNotepad: () => void;

  openGuideModal: () => void;
  closeGuideModal: () => void;
  toggleGuideModal: () => void;

  setFilterCategory: (cat: string) => void;
  setSearchQuery: (q: string) => void;

  fetchNotes: () => Promise<void>;
  addNote: (noteData: {
    content: string;
    title?: string;
    category?: string;
    priority?: string;
    productType?: string;
    rawResinGramsDeducted?: number;
    materialCost?: number;
  }) => Promise<StudioNoteItem | null>;
  toggleComplete: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getLatestNote: () => StudioNoteItem | undefined;
  deductBatchStock: (params: {
    totalGrams: number;
    ratioA?: number;
    ratioB?: number;
    productName?: string;
    batchNotes?: string;
  }) => Promise<any>;
}

const OFFLINE_NOTES_KEY = 'rasin_studio_notes_offline';

const loadOfflineNotes = (): StudioNoteItem[] => {
  try {
    const raw = localStorage.getItem(OFFLINE_NOTES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
};

const saveOfflineNotes = (notes: StudioNoteItem[]) => {
  try {
    localStorage.setItem(OFFLINE_NOTES_KEY, JSON.stringify(notes));
  } catch (_) {}
};

const syncOfflineNotesToBackend = async () => {
  const offlineNotes = loadOfflineNotes();
  if (offlineNotes.length === 0) return;

  const synced: string[] = [];
  for (const note of offlineNotes) {
    try {
      await api.post('/studio-notes', {
        content: note.content,
        title: note.title,
        category: note.category,
        priority: note.priority,
        productType: note.productType,
        rawResinGramsDeducted: note.rawResinGramsDeducted,
        materialCost: note.materialCost,
      });
      synced.push(note._id);
    } catch (_) {
      break;
    }
  }

  if (synced.length > 0) {
    const remaining = offlineNotes.filter((n) => !synced.includes(n._id));
    saveOfflineNotes(remaining);
  }
};

export const useStudioNoteStore = create<StudioNoteState>((set, get) => ({
  notes: [],
  isLoading: false,
  isNotepadOpen: false,
  isGuideModalOpen: false,
  filterCategory: 'all',
  searchQuery: '',
  uncompletedTodoCount: 0,

  openNotepad: () => set({ isNotepadOpen: true }),
  closeNotepad: () => set({ isNotepadOpen: false }),
  toggleNotepad: () => set((state) => ({ isNotepadOpen: !state.isNotepadOpen })),

  openGuideModal: () => set({ isGuideModalOpen: true }),
  closeGuideModal: () => set({ isGuideModalOpen: false }),
  toggleGuideModal: () => set((state) => ({ isGuideModalOpen: !state.isGuideModalOpen })),

  setFilterCategory: (filterCategory: string) => set({ filterCategory }),
  setSearchQuery: (searchQuery: string) => set({ searchQuery }),

  fetchNotes: async () => {
    try {
      set({ isLoading: true });
      const { data } = await api.get('/studio-notes');
      if (data.success) {
        const backendNotes: StudioNoteItem[] = data.data || [];

        await syncOfflineNotesToBackend();
        const remainingOffline = loadOfflineNotes();

        const allNotes = [...remainingOffline, ...backendNotes];

        set({
          notes: allNotes,
          uncompletedTodoCount:
            (data.uncompletedTodoCount || 0) +
            remainingOffline.filter((n) => n.category === 'todo' && !n.isCompleted).length,
        });
      }
    } catch (err) {
      console.warn('Could not fetch studio notes from backend, loading offline:', err);
      const offlineNotes = loadOfflineNotes();
      set({
        notes: offlineNotes,
        uncompletedTodoCount: offlineNotes.filter((n) => n.category === 'todo' && !n.isCompleted).length,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addNote: async (noteData) => {
    try {
      const { data } = await api.post('/studio-notes', noteData);
      if (data.success && data.data) {
        const newNote = data.data;
        set((state) => ({
          notes: [newNote, ...state.notes],
          uncompletedTodoCount:
            newNote.category === 'todo' && !newNote.isCompleted
              ? state.uncompletedTodoCount + 1
              : state.uncompletedTodoCount,
        }));
        return newNote;
      }
      return null;
    } catch (err) {
      console.warn('Error saving note to backend, saving offline:', err);
      const fallbackNote: StudioNoteItem = {
        _id: 'local_' + Date.now(),
        title: noteData.title || (noteData.content || '').slice(0, 30),
        content: noteData.content,
        category: (noteData.category as any) || 'general',
        priority: (noteData.priority as any) || 'medium',
        isCompleted: false,
        isPinned: false,
        tags: [],
        productType: noteData.productType,
        rawResinGramsDeducted: noteData.rawResinGramsDeducted || 0,
        materialCost: noteData.materialCost || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const offlineNotes = loadOfflineNotes();
      offlineNotes.unshift(fallbackNote);
      saveOfflineNotes(offlineNotes);

      set((state) => ({
        notes: [fallbackNote, ...state.notes],
        uncompletedTodoCount:
          fallbackNote.category === 'todo'
            ? state.uncompletedTodoCount + 1
            : state.uncompletedTodoCount,
      }));
      return fallbackNote;
    }
  },

  toggleComplete: async (id: string) => {
    set((state) => ({
      notes: state.notes.map((n) =>
        n._id === id ? { ...n, isCompleted: !n.isCompleted } : n
      ),
      uncompletedTodoCount: Math.max(
        0,
        state.notes.find((n) => n._id === id)?.isCompleted
          ? state.uncompletedTodoCount + 1
          : state.uncompletedTodoCount - 1
      ),
    }));

    if (id.startsWith('local_')) {
      const offlineNotes = loadOfflineNotes();
      const updated = offlineNotes.map((n) =>
        n._id === id ? { ...n, isCompleted: !n.isCompleted } : n
      );
      saveOfflineNotes(updated);
      return;
    }

    try {
      await api.patch(`/studio-notes/${id}/toggle-complete`);
    } catch (err) {
      console.warn('Error syncing toggleComplete:', err);
    }
  },

  togglePin: async (id: string) => {
    set((state) => ({
      notes: state.notes
        .map((n) => (n._id === id ? { ...n, isPinned: !n.isPinned } : n))
        .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)),
    }));

    if (id.startsWith('local_')) {
      const offlineNotes = loadOfflineNotes();
      const updated = offlineNotes.map((n) =>
        n._id === id ? { ...n, isPinned: !n.isPinned } : n
      );
      saveOfflineNotes(updated);
      return;
    }

    try {
      await api.patch(`/studio-notes/${id}/toggle-pin`);
    } catch (err) {
      console.warn('Error syncing togglePin:', err);
    }
  },

  deleteNote: async (id: string) => {
    set((state) => ({
      notes: state.notes.filter((n) => n._id !== id),
    }));

    if (id.startsWith('local_')) {
      const offlineNotes = loadOfflineNotes();
      saveOfflineNotes(offlineNotes.filter((n) => n._id !== id));
      return;
    }

    try {
      await api.delete(`/studio-notes/${id}`);
    } catch (err) {
      console.warn('Error syncing deleteNote:', err);
    }
  },

  getLatestNote: () => {
    const { notes } = get();
    return notes[0];
  },

  deductBatchStock: async (params) => {
    try {
      const { data } = await api.post('/inventory/consume-batch', params);
      return data;
    } catch (err) {
      console.warn('Error deducting batch stock:', err);
      return null;
    }
  },
}));
