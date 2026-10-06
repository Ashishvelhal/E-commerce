import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, ArrowRight, Gem } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getIconComponent, getLogoGradientClass, getLogoShapeClass } from '../../utils/iconHelper';

interface WelcomeSplashScreenProps {
  onDismiss?: () => void;
  autoHideDuration?: number;
}

/* Tiny floating particle for ambient sparkle effect */
const FloatingParticle: React.FC<{ delay: number; x: number; y: number; size: number }> = ({
  delay, x, y, size,
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.8, 0],
      scale: [0, 1, 0.5],
      y: [y, y - 60 - Math.random() * 40],
      x: [x, x + (Math.random() - 0.5) * 30],
    }}
    transition={{ duration: 2.5 + Math.random(), repeat: Infinity, delay, ease: 'easeOut' }}
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size,
      height: size,
      background: `radial-gradient(circle, rgba(245,158,11,0.7) 0%, rgba(244,63,94,0.4) 60%, transparent 100%)`,
      filter: 'blur(0.5px)',
    }}
  />
);

export const WelcomeSplashScreen: React.FC<WelcomeSplashScreenProps> = ({
  onDismiss,
  autoHideDuration = 3200,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const { settings } = useSettingsStore();
  const brandTitle = settings?.brandTitle || 'Rasin Arts';
  const logoIconName = settings?.logoIcon || 'Gem';
  const logoGradient = settings?.logoGradient || 'amber-rose';
  const LogoIcon = getIconComponent(logoIconName, Gem);

  /* Generate stable random particles on mount */
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        delay: Math.random() * 2.5,
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 700) * 0.6 +
          (typeof window !== 'undefined' ? window.innerHeight : 700) * 0.3,
        size: 3 + Math.random() * 4,
      })),
    []
  );

  useEffect(() => {
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) onDismiss();
    }, autoHideDuration);
    return () => clearTimeout(hideTimer);
  }, [autoHideDuration, onDismiss]);

  const handleEnter = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none overflow-hidden"
          onClick={handleEnter}
        >
          {/* ── Animated Gradient Background ── */}
          <motion.div
            animate={{
              background: [
                'linear-gradient(135deg, #FAF8F5 0%, #FFF7ED 30%, #FDF2F8 60%, #FAF8F5 100%)',
                'linear-gradient(135deg, #FDF2F8 0%, #FAF8F5 30%, #FFF7ED 60%, #F5F3FF 100%)',
                'linear-gradient(135deg, #FFF7ED 0%, #F5F3FF 30%, #FAF8F5 60%, #FDF2F8 100%)',
                'linear-gradient(135deg, #FAF8F5 0%, #FFF7ED 30%, #FDF2F8 60%, #FAF8F5 100%)',
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0"
          />

          {/* ── Large Ambient Orbs ── */}
          <motion.div
            animate={{ x: [0, 30, -20, 0], y: [0, -20, 10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br from-amber-400/15 via-rose-400/10 to-transparent blur-[140px] pointer-events-none -top-32 -left-32"
          />
          <motion.div
            animate={{ x: [0, -25, 15, 0], y: [0, 15, -25, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-plum-500/12 via-violet-400/8 to-transparent blur-[120px] pointer-events-none -bottom-20 -right-20"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-r from-brand-500/10 to-rose-500/8 blur-[100px] pointer-events-none top-1/3 left-1/2 -translate-x-1/2"
          />

          {/* ── Floating Sparkle Particles ── */}
          {particles.map((p) => (
            <FloatingParticle key={p.id} delay={p.delay} x={p.x} y={p.y} size={p.size} />
          ))}

          {/* ── Main Content ── */}
          <div className="relative z-10 flex flex-col items-center max-w-xl w-full text-center px-6 space-y-7">
            {/* Morphing Resin Orb with Rings */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-24 h-24 flex items-center justify-center"
            >
              {/* Outer rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-3 rounded-full border border-dashed border-amber-400/30"
              />
              {/* Inner counter-rotating ring with glowing dot */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-1 rounded-full border border-rose-400/20"
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50" />
              </motion.div>
              {/* Core morphing orb */}
              <motion.div
                animate={{
                  borderRadius: [
                    '60% 40% 30% 70% / 60% 30% 70% 40%',
                    '30% 60% 70% 40% / 50% 60% 30% 60%',
                    '50% 50% 40% 60% / 40% 50% 60% 50%',
                    '60% 40% 30% 70% / 60% 30% 70% 40%',
                  ],
                  scale: [1, 1.06, 0.97, 1],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className={`w-16 h-16 ${getLogoGradientClass(logoGradient)} shadow-2xl flex items-center justify-center`}
                style={{ boxShadow: '0 0 40px rgba(245,158,11,0.25), 0 0 80px rgba(244,63,94,0.15)' }}
              >
                <LogoIcon className="w-7 h-7 text-white drop-shadow-lg" />
              </motion.div>
              {/* Pulsing sparkle accent */}
              <motion.div
                animate={{ scale: [0, 1.3, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: 0.5 }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-5 h-5 text-amber-400 fill-amber-300" />
              </motion.div>
            </motion.div>

            {/* Welcome Heading — staggered entrance */}
            <div className="space-y-1">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-amber-700/70"
              >
                Welcome to
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
                className="text-4xl sm:text-6xl font-bold leading-tight"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  background: 'linear-gradient(135deg, #92400e 0%, #b45309 25%, #d97706 50%, #c2410c 75%, #9f1239 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {brandTitle}
              </motion.h1>
            </div>

            {/* Ornamental Divider */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.75, duration: 0.6, ease: 'easeOut' }}
              className="flex items-center gap-3 w-full max-w-[200px]"
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-amber-400/60" />
              <Sparkles className="w-3.5 h-3.5 text-amber-500/50" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-amber-400/40 to-amber-400/60" />
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="text-sm sm:text-base text-stone-500 max-w-sm mx-auto leading-relaxed"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Where every piece tells a story — handcrafted with love, poured to perfection, made just for you.
            </motion.p>

            {/* Heart badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200/60 shadow-sm"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
              <span className="text-xs font-semibold text-rose-600/80 tracking-wide">
                Thank you for visiting us
              </span>
            </motion.div>

            {/* Enter Button */}
            <motion.button
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              onClick={(e) => { e.stopPropagation(); handleEnter(); }}
              className="group inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-gradient-to-r from-amber-600 via-rose-600 to-plum-600 hover:from-amber-500 hover:via-rose-500 hover:to-plum-500 text-white text-sm font-bold shadow-xl transition-all active:scale-95 cursor-pointer"
              style={{ boxShadow: '0 8px 30px rgba(245,158,11,0.25), 0 4px 15px rgba(244,63,94,0.2)' }}
            >
              <span>Explore the Gallery</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>

            {/* Tap hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 2, duration: 0.8 }}
              className="text-[10px] text-stone-400 font-medium tracking-widest uppercase"
            >
              or tap anywhere
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

