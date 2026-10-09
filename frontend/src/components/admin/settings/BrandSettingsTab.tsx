import React from 'react';
import { Palette, Sparkles, Type, Image as ImageIcon } from 'lucide-react';
import {
  getIconComponent,
  AVAILABLE_ICON_NAMES,
  LOGO_GRADIENT_OPTIONS,
  LOGO_SHAPE_OPTIONS,
  getLogoGradientClass,
  getLogoShapeClass,
} from '../../../utils/iconHelper';

interface BrandSettingsTabProps {
  brandTitle: string;
  setBrandTitle: (val: string) => void;
  brandSubtitle: string;
  setBrandSubtitle: (val: string) => void;
  logoMode: 'icon' | 'image';
  setLogoMode: (val: 'icon' | 'image') => void;
  logoIcon: string;
  setLogoIcon: (val: string) => void;
  logoBlobShape: string;
  setLogoBlobShape: (val: string) => void;
  logoGradient: string;
  setLogoGradient: (val: string) => void;
  logoImageUrl: string;
  setLogoImageUrl: (val: string) => void;
  navbarIconStyle: string;
  setNavbarIconStyle: (val: string) => void;
  navbarAnimation: string;
  setNavbarAnimation: (val: string) => void;
  tabIcons: {
    home: string;
    shop: string;
    customizer: string;
    bulk: string;
    blog: string;
    about: string;
  };
  setTabIcons: React.Dispatch<React.SetStateAction<{
    home: string;
    shop: string;
    customizer: string;
    bulk: string;
    blog: string;
    about: string;
  }>>;
}

export const BrandSettingsTab: React.FC<BrandSettingsTabProps> = ({
  brandTitle,
  setBrandTitle,
  brandSubtitle,
  setBrandSubtitle,
  logoMode,
  setLogoMode,
  logoIcon,
  setLogoIcon,
  logoBlobShape,
  setLogoBlobShape,
  logoGradient,
  setLogoGradient,
  logoImageUrl,
  setLogoImageUrl,
  navbarIconStyle,
  setNavbarIconStyle,
  navbarAnimation,
  setNavbarAnimation,
  tabIcons,
  setTabIcons,
}) => {
  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-art-800 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-art-800">
          <div>
            <h2 className="text-sm font-bold text-art-300 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-brand-600" />
              <span>Storefront Brand Name, Tagline &amp; Logo Customizer</span>
            </h2>
            <p className="text-xs text-art-500 mt-0.5">
              Change the main store brand name, subtitle tagline, and visual logo displayed on your storefront header, footer, and invoices.
            </p>
          </div>

          <div className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-[11px] font-bold border border-brand-200 shrink-0">
            Live Store Branding
          </div>
        </div>

        {/* Live Real-Time Header Brand Preview Card */}
        <div className="p-4 rounded-2xl bg-art-950 border border-art-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-art-400">
            <span>Live Navbar Header Preview</span>
            <span className="text-[10px] text-brand-600 font-mono">Updates in real-time</span>
          </div>

          <div className="p-4 rounded-xl bg-art-900/90 border border-art-800/80 flex items-center gap-3">
            <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
              {logoMode === 'image' && logoImageUrl ? (
                <img
                  src={logoImageUrl}
                  alt={brandTitle}
                  className="w-11 h-11 object-contain rounded-xl shadow-md"
                />
              ) : (
                <>
                  <div
                    className={`absolute inset-0 ${getLogoShapeClass(logoBlobShape)} ${getLogoGradientClass(
                      logoGradient
                    )} shadow-md glow-gold`}
                  />
                  {(() => {
                    const PreviewIcon = getIconComponent(logoIcon, Palette);
                    return <PreviewIcon className="relative w-5 h-5 text-white z-10 drop-shadow" />;
                  })()}
                </>
              )}
            </div>
            <div>
              <span
                className="font-bold text-art-300 tracking-tight text-xl block leading-none"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {brandTitle || 'Rasin Arts'}
              </span>
              <span className="text-[9px] font-bold tracking-[0.25em] text-brand-700 uppercase font-sans">
                {brandSubtitle || 'Luxury 3D Studio'}
              </span>
            </div>
          </div>
        </div>

        {/* Brand Name & Tagline Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-art-400 mb-1.5 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-brand-600" />
              <span>Brand Main Title (e.g. Rasin Arts)</span>
            </label>
            <input
              type="text"
              value={brandTitle}
              onChange={(e) => setBrandTitle(e.target.value)}
              placeholder="Rasin Arts"
              className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 font-semibold focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-art-400 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Brand Subtitle / Tagline (e.g. Luxury 3D Studio)</span>
            </label>
            <input
              type="text"
              value={brandSubtitle}
              onChange={(e) => setBrandSubtitle(e.target.value)}
              placeholder="Luxury 3D Studio"
              className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 font-semibold focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Logo Configuration Mode Selector */}
        <div className="space-y-3 pt-2 border-t border-art-800">
          <label className="block text-xs font-bold uppercase tracking-wider text-art-400">
            Storefront Logo Type &amp; Artwork
          </label>

          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => setLogoMode('icon')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                logoMode === 'icon'
                  ? 'bg-brand-500 text-white border-brand-500 shadow-md glow-gold'
                  : 'bg-art-950 text-art-400 border-art-800 hover:bg-art-900'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Artisan Preset Icon</span>
            </button>

            <button
              type="button"
              onClick={() => setLogoMode('image')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                logoMode === 'image'
                  ? 'bg-brand-500 text-white border-brand-500 shadow-md glow-gold'
                  : 'bg-art-950 text-art-400 border-art-800 hover:bg-art-900'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Custom Image URL</span>
            </button>
          </div>

          {logoMode === 'icon' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1.5">
                  Logo Center Icon
                </label>
                <select
                  value={logoIcon}
                  onChange={(e) => setLogoIcon(e.target.value)}
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-semibold"
                >
                  {AVAILABLE_ICON_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1.5">
                  Logo Badge Shape
                </label>
                <select
                  value={logoBlobShape}
                  onChange={(e) => setLogoBlobShape(e.target.value)}
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-semibold"
                >
                  {LOGO_SHAPE_OPTIONS.map((shape) => (
                    <option key={shape.id} value={shape.id}>
                      {shape.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-art-400 mb-1.5">
                  Logo Color Gradient
                </label>
                <select
                  value={logoGradient}
                  onChange={(e) => setLogoGradient(e.target.value)}
                  className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-semibold"
                >
                  {LOGO_GRADIENT_OPTIONS.map((grad) => (
                    <option key={grad.id} value={grad.id}>
                      {grad.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-art-400">
                Custom Logo Image URL (.png / .svg / .jpg)
              </label>
              <input
                type="url"
                value={logoImageUrl}
                onChange={(e) => setLogoImageUrl(e.target.value)}
                placeholder="https://example.com/your-logo.png"
                className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 font-mono focus:outline-none focus:border-brand-500"
              />
              <p className="text-[11px] text-art-500">
                Provide a transparent background PNG or SVG URL for the best aesthetic appearance.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 🎨 STOREFRONT NAVBAR TABS: CUSTOM ICONS & MOTION EFFECTS */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-art-800 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-art-800">
          <div>
            <h2 className="text-sm font-bold text-art-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Storefront Navbar Tabs: Custom Icons &amp; Motion Effects</span>
            </h2>
            <p className="text-xs text-art-500 mt-0.5">
              Pick individual custom icons, visual theme palettes, and live motion animations for every storefront navigation tab.
            </p>
          </div>

          <div className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-[11px] font-bold border border-brand-200 shrink-0">
            Live Tab Icons
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-art-400 mb-1.5">
              Navigation Tabs Visual Theme Palette
            </label>
            <select
              value={navbarIconStyle}
              onChange={(e) => setNavbarIconStyle(e.target.value)}
              className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-semibold"
            >
              <option value="animated">✨ Golden Amber Resin (Gradient Glow)</option>
              <option value="rose">🌹 Rose Gold Elegance (Soft Rose)</option>
              <option value="cyber">⚡ Cyber Neon Cyan (Vibrant Glow)</option>
              <option value="emerald">🌿 Royal Emerald Studio (Artisan Green)</option>
              <option value="minimal">🖤 Minimalist Charcoal (Clean Classic)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-art-400 mb-1.5">
              Hover &amp; Focus Motion Animation
            </label>
            <select
              value={navbarAnimation}
              onChange={(e) => setNavbarAnimation(e.target.value)}
              className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-semibold"
            >
              <option value="float">💫 Micro Floating Lift (Subtle &amp; Elegant)</option>
              <option value="pulse">💓 Gentle Pulse Heartbeat (Artisan Focus)</option>
              <option value="spin">🔄 Soft Spin on Hover (Dynamic 3D)</option>
              <option value="glow">✨ Ambient Neon Glow (Luxury Night)</option>
              <option value="none">⏹️ Static (No Animation)</option>
            </select>
          </div>
        </div>

        {/* Individual Nav Tab Icon Pickers */}
        <div className="pt-2 border-t border-art-800 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-art-400">
            Custom Icon Assignment Per Storefront Tab
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { key: 'home' as const, label: '🏠 Home Page Tab' },
              { key: 'shop' as const, label: '🛍️ Shop Catalog Tab' },
              { key: 'customizer' as const, label: '✨ 3D Customizer Tab' },
              { key: 'bulk' as const, label: '🎁 Bulk Gifting & B2B Tab' },
              { key: 'blog' as const, label: '📖 Studio Stories & Blog Tab' },
              { key: 'about' as const, label: '🎨 About Us & Studio Tab' },
            ].map(({ key, label }) => {
              const CurrentIcon = getIconComponent(tabIcons[key], Palette);
              return (
                <div key={key} className="p-3 rounded-xl bg-art-950 border border-art-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-art-300">{label}</span>
                    <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
                      <CurrentIcon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <select
                    value={tabIcons[key]}
                    onChange={(e) =>
                      setTabIcons((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    className="w-full bg-art-900 border border-art-700 rounded-lg px-2.5 py-1.5 text-xs text-art-200 focus:outline-none focus:border-brand-500"
                  >
                    {AVAILABLE_ICON_NAMES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
