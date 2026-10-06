import React from 'react';
import {
  Home,
  Compass,
  Sparkles,
  Building2,
  BookOpen,
  Heart,
  ShoppingBag,
  Palette,
  Gem,
  Crown,
  Gift,
  Flame,
  Shield,
  Zap,
  Boxes,
  Store,
  Layers,
  Star,
  Globe,
  Camera,
  Sun,
  Package,
} from 'lucide-react';

export const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Compass,
  Sparkles,
  Building2,
  BookOpen,
  Heart,
  ShoppingBag,
  Palette,
  Gem,
  Crown,
  Gift,
  Flame,
  Shield,
  Zap,
  Boxes,
  Store,
  Layers,
  Star,
  Globe,
  Camera,
  Sun,
  Package,
};

export const AVAILABLE_ICON_NAMES = Object.keys(ICON_MAP);

export const getIconComponent = (
  iconName?: string,
  defaultIcon?: React.ComponentType<{ className?: string }>
): React.ComponentType<{ className?: string }> => {
  if (iconName && ICON_MAP[iconName]) {
    return ICON_MAP[iconName];
  }
  return defaultIcon || Compass;
};

export const LOGO_GRADIENT_OPTIONS = [
  { id: 'amber-rose', label: '✨ Golden Amber & Rose', class: 'bg-gradient-to-br from-brand-500 via-rose-500 to-plum-600' },
  { id: 'rose-gold', label: '🌹 Rose Gold Elegance', class: 'bg-gradient-to-br from-rose-500 via-amber-400 to-rose-600' },
  { id: 'cyber-neon', label: '⚡ Cyber Neon Cyan & Blue', class: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600' },
  { id: 'emerald-teal', label: '🌿 Royal Emerald & Teal', class: 'bg-gradient-to-br from-emerald-500 via-teal-400 to-emerald-700' },
  { id: 'sunset-purple', label: '🔮 Sunset Violet & Fuchsia', class: 'bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-700' },
  { id: 'ocean-blue', label: '🌊 Deep Oceanic Blue', class: 'bg-gradient-to-br from-blue-500 via-sky-400 to-indigo-600' },
  { id: 'midnight-gold', label: '🖤 Midnight Charcoal & Gold', class: 'bg-gradient-to-br from-slate-900 via-amber-600 to-slate-800' },
];

export const getLogoGradientClass = (gradientId?: string): string => {
  const match = LOGO_GRADIENT_OPTIONS.find((g) => g.id === gradientId);
  return match ? match.class : 'bg-gradient-to-br from-brand-500 via-rose-500 to-plum-600';
};

export const LOGO_SHAPE_OPTIONS = [
  { id: 'resin-blob', label: '💧 Fluid Resin Blob', class: 'resin-blob' },
  { id: 'circle', label: '⚪ Artisan Circle', class: 'rounded-full' },
  { id: 'squircle', label: '🔲 Luxury Squircle', class: 'rounded-2xl' },
  { id: 'square', label: '⏹ Modern Rounded Box', class: 'rounded-xl' },
];

export const getLogoShapeClass = (shapeId?: string): string => {
  const match = LOGO_SHAPE_OPTIONS.find((s) => s.id === shapeId);
  return match ? match.class : 'resin-blob';
};

