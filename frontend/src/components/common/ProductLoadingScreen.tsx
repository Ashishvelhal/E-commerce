import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Palette, Layers, Box, Compass } from 'lucide-react';

interface ProductLoadingScreenProps {
  productTitle?: string;
  isFullScreen?: boolean;
}

const LOADING_STEPS = [
  { icon: Palette, text: 'Getting things ready for you...', sub: 'Curating handcrafted art pieces' },
  { icon: Sparkles, text: 'Almost there...', sub: 'Polishing the gallery experience' },
  { icon: Layers, text: 'Setting up the showcase...', sub: 'Arranging the finest creations' },
  { icon: Box, text: 'Just a moment...', sub: 'Your experience is on the way' },
];

export const ProductLoadingScreen: React.FC<ProductLoadingScreenProps> = ({
  productTitle,
  isFullScreen = false,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Step switcher interval
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1200);

    // Progress bar smooth filler
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        return prev + Math.floor(Math.random() * 12) + 5;
      });
    }, 200);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const currentStep = LOADING_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;

  const containerClasses = isFullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF8F5]/95 backdrop-blur-md px-6'
    : 'min-h-[70vh] flex flex-col items-center justify-center bg-transparent px-6 py-12';

  return (
    <div className={containerClasses}>
      {/* Background ambient glowing orbs */}
      <div className="absolute w-72 h-72 rounded-full bg-gradient-to-br from-brand-500/15 via-rose-500/10 to-plum-500/10 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-56 h-56 rounded-full bg-gradient-to-tr from-rose-500/15 to-brand-400/10 blur-2xl pointer-events-none -translate-y-8" />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center space-y-7">
        {/* Animated 3D Resin Droplet / Gem Sphere */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Outer rotating decorative ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-brand-500/30"
          />

          {/* Secondary counter-rotating ring with glowing node */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-2 rounded-full border border-rose-500/20 flex items-start justify-center"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-brand-500 shadow-md glow-gold" />
          </motion.div>

          {/* Core Morphing Fluid Resin Orb */}
          <motion.div
            animate={{
              borderRadius: [
                '60% 40% 30% 70% / 60% 30% 70% 40%',
                '30% 60% 70% 40% / 50% 60% 30% 60%',
                '40% 60% 50% 50% / 30% 40% 60% 70%',
                '60% 40% 30% 70% / 60% 30% 70% 40%',
              ],
              scale: [0.95, 1.05, 0.98, 0.95],
            }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 bg-gradient-to-br from-brand-500 via-rose-500 to-plum-600 shadow-2xl glow-brand flex items-center justify-center text-white"
          >
            {/* Center icon with floating animation */}
            <motion.div
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Palette className="w-8 h-8 text-white drop-shadow-md" />
            </motion.div>
          </motion.div>

          {/* Floating Sparkles */}
          <motion.div
            animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0], x: [0, 18], y: [0, -18] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
            className="absolute top-1 right-2 text-brand-500"
          >
            <Sparkles className="w-4 h-4 fill-brand-400" />
          </motion.div>
          <motion.div
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], x: [0, -16], y: [0, 16] }}
            transition={{ duration: 2.3, repeat: Infinity, delay: 0.8 }}
            className="absolute bottom-2 left-2 text-rose-500"
          >
            <Sparkles className="w-3.5 h-3.5 fill-rose-400" />
          </motion.div>
        </div>

        {/* Product Title & Brand Badge */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-[10px] font-bold tracking-widest uppercase font-mono shadow-sm">
            <Compass className="w-3 h-3 text-brand-600" />
            <span>Rasin Arts 3D Studio</span>
          </div>

          <h2
            className="text-xl sm:text-2xl font-bold text-art-300"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {productTitle ? productTitle : 'Preparing Your Experience'}
          </h2>
        </div>

        {/* Step Progression Message with Smooth Transition */}
        <div className="h-14 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2.5 text-xs font-semibold text-art-400"
            >
              <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-700">
                <StepIcon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-bold text-art-300">{currentStep.text}</div>
                <div className="text-[10px] text-art-500 font-normal">{currentStep.sub}</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Shimmering Progress Bar */}
        <div className="w-full space-y-2">
          <div className="w-full h-2 rounded-full bg-art-900 border border-art-800 overflow-hidden relative p-[1px]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 via-rose-500 to-plum-600 relative overflow-hidden"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            >
              {/* Inner light shimmer line */}
              <div className="absolute inset-0 bg-white/30 skew-x-12 animate-shimmer" />
            </motion.div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-art-500 font-semibold">
            <span>Please wait</span>
            <span>{Math.min(100, progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
