import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, CheckCircle2, Radio, Timer, Calculator, Compass, Droplets, Globe } from 'lucide-react';
import { useVoiceStore } from '../../store/useVoiceStore';

export const AdminVoiceHUD: React.FC = () => {
  const { activeHUD, clearHUD } = useVoiceStore();

  useEffect(() => {
    if (!activeHUD) return;
    const timer = setTimeout(() => {
      clearHUD();
    }, 4500);
    return () => clearTimeout(timer);
  }, [activeHUD, clearHUD]);

  if (!activeHUD) return null;

  const getIntentIcon = (intent?: string) => {
    if (intent?.startsWith('TIMER_')) return <Timer className="w-4 h-4 text-amber-500" />;
    if (intent?.startsWith('CALC_')) return <Calculator className="w-4 h-4 text-emerald-500" />;
    if (intent === 'NAVIGATE') return <Compass className="w-4 h-4 text-blue-500" />;
    if (intent === 'LANGUAGE_SWITCH') return <Globe className="w-4 h-4 text-cyan-400" />;
    return <Radio className="w-4 h-4 text-brand-500 animate-pulse" />;
  };

  return (
    <AnimatePresence>
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto select-none font-poppins">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="flex items-center gap-3.5 px-4 py-2.5 rounded-full bg-art-900/90 text-white backdrop-blur-xl border border-art-800 shadow-2xl min-w-[320px] max-w-lg glow-brand"
        >
          {/* Animated Glowing Ring & Visualizer */}
          <div className="relative flex items-center justify-center shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-md">
              {getIntentIcon(activeHUD.intent)}
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-art-900 animate-ping" />
          </div>

          {/* Transcript / Intent Message */}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-art-300 truncate flex items-center gap-1.5">
              <span>{activeHUD.text}</span>
            </div>
            {activeHUD.subtext && (
              <p className="text-[11px] text-art-500 truncate font-normal">
                {activeHUD.subtext}
              </p>
            )}
          </div>

          {/* Audio Waveform Bars */}
          <div className="flex items-center gap-1 h-4 shrink-0">
            {[40, 90, 60, 100, 50].map((h, i) => (
              <motion.div
                key={i}
                animate={{ height: ['25%', `${h}%`, '25%'] }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.08,
                  ease: 'easeInOut',
                }}
                className="w-0.5 rounded-full bg-brand-400"
              />
            ))}
          </div>

          {/* Close HUD */}
          <button
            onClick={clearHUD}
            className="p-1 rounded-full text-art-500 hover:text-white hover:bg-art-800 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
