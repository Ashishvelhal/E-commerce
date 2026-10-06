import { create } from 'zustand';

export interface VoiceHUDData {
  text: string;
  subtext?: string;
  intent?: string;
  isError?: boolean;
}

export interface TimerVoiceEvent {
  action: 'start' | 'pause' | 'resume' | 'reset' | 'add';
  seconds?: number;
  timestamp: number;
}

export type StudioLanguage = 'en' | 'hi' | 'mr';

interface VoiceState {
  // Multilingual Support ('en' = English, 'hi' = Hindi, 'mr' = Marathi)
  language: StudioLanguage;
  setLanguage: (lang: StudioLanguage) => void;

  // Assistant Drawer/Modal
  isAssistantOpen: boolean;
  openAssistant: () => void;
  closeAssistant: () => void;
  toggleAssistant: () => void;

  // Ambient Wake Word Continuous Listener
  isWakeWordListening: boolean;
  setWakeWordListening: (active: boolean) => void;
  toggleWakeWordListening: () => void;

  // Live HUD / Notification Island
  activeHUD: VoiceHUDData | null;
  showHUD: (hud: VoiceHUDData) => void;
  clearHUD: () => void;

  // Last Transcript Heard
  lastWakeTranscript: string;
  setLastWakeTranscript: (t: string) => void;

  // Global Timer Event Bus
  timerEvent: TimerVoiceEvent | null;
  emitTimerEvent: (action: 'start' | 'pause' | 'resume' | 'reset' | 'add', seconds?: number) => void;
}

const getInitialWakeWordState = (): boolean => {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('rasin_ambient_wake_word');
  return saved !== null ? saved === 'true' : true; // Default ON for seamless hands-free experience
};

const getInitialLanguage = (): StudioLanguage => {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem('rasin_studio_language') as StudioLanguage;
  if (saved && ['en', 'hi', 'mr'].includes(saved)) {
    return saved;
  }
  return 'en';
};

export const useVoiceStore = create<VoiceState>((set) => ({
  language: getInitialLanguage(),
  setLanguage: (lang: StudioLanguage) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rasin_studio_language', lang);
    }
    set({ language: lang });
  },

  isAssistantOpen: false,
  openAssistant: () => set({ isAssistantOpen: true }),
  closeAssistant: () => set({ isAssistantOpen: false }),
  toggleAssistant: () => set((state) => ({ isAssistantOpen: !state.isAssistantOpen })),

  isWakeWordListening: getInitialWakeWordState(),
  setWakeWordListening: (active: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rasin_ambient_wake_word', String(active));
    }
    set({ isWakeWordListening: active });
  },
  toggleWakeWordListening: () =>
    set((state) => {
      const next = !state.isWakeWordListening;
      if (typeof window !== 'undefined') {
        localStorage.setItem('rasin_ambient_wake_word', String(next));
      }
      return { isWakeWordListening: next };
    }),

  activeHUD: null,
  showHUD: (hud: VoiceHUDData) => set({ activeHUD: hud }),
  clearHUD: () => set({ activeHUD: null }),

  lastWakeTranscript: '',
  setLastWakeTranscript: (lastWakeTranscript: string) => set({ lastWakeTranscript }),

  timerEvent: null,
  emitTimerEvent: (action, seconds) =>
    set({
      timerEvent: {
        action,
        seconds,
        timestamp: Date.now(),
      },
    }),
}));
