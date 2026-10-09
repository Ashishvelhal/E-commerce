import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, ExternalLink, Sliders } from 'lucide-react';
import { StoreSettings } from '../../../store/useSettingsStore';

interface CustomizerSettingsTabProps {
  settings: StoreSettings;
  customizerEnabled: boolean;
  isTogglingCustomizer: boolean;
  onToggleCustomizer: () => void;
  onUpdateProductToggles: (newList: string[]) => void;
}

export const CustomizerSettingsTab: React.FC<CustomizerSettingsTabProps> = ({
  settings,
  customizerEnabled,
  isTogglingCustomizer,
  onToggleCustomizer,
  onUpdateProductToggles,
}) => {
  const CUSTOMIZER_ITEMS = [
    {
      id: 'keychain-initial',
      name: 'Custom Initial Keychains',
      icon: '🔑',
      price: '₹299',
      desc: 'Initial letter & name keychains with 24K gold foil & suede tassel.',
    },
    {
      id: 'nameplate-rect',
      name: 'Luxury Custom Nameplates',
      icon: '🏡',
      price: '₹1,899',
      desc: 'Architectural slabs with 3D embossed name, bungalow no. & brass standoffs.',
    },
    {
      id: 'thali-puja',
      name: 'Royal Pooja & Wedding Thalis',
      icon: '🪔',
      price: '₹2,299',
      desc: 'Festive thalis with 2 brass katoris, illuminated diya & pearl border.',
    },
    {
      id: 'frame-photo',
      name: 'Flower & Photo Preservation Frames',
      icon: '🖼️',
      price: '₹1,999',
      desc: 'Photo window with real wedding flower petals & fairy LEDs.',
    },
    {
      id: 'clock-round-12',
      name: '12" Geode Wall Clocks',
      icon: '⏱️',
      price: '₹2,499',
      desc: '12-inch radial clocks with raw quartz crystal border & sweep quartz machine.',
    },
  ];

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-art-900/90 border border-art-800 space-y-4 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-brand-500/10 via-rose-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-500 mb-1">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Interactive Customer Experience</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-art-200 flex items-center gap-2">
            <span>3D Live Customizer &amp; Co-Creator Studio</span>
          </h2>
          <p className="text-xs text-art-400 mt-1 max-w-xl">
            Control whether the 3D Customizer tab is shown to storefront visitors. When disabled, the tab is completely hidden from navigation, and direct visits automatically redirect to the shop.
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              customizerEnabled
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-950'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-sm shadow-rose-950'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                customizerEnabled ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
              }`}
            />
            <span>{customizerEnabled ? '🟢 Visible on Store' : '🔴 Hidden / Closed'}</span>
          </span>
        </div>
      </div>

      {/* Toggle Switch Card */}
      <div className="p-4 rounded-2xl bg-art-950/80 border border-art-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              customizerEnabled
                ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                : 'bg-art-900 border-art-800 text-art-500'
            }`}
          >
            {customizerEnabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-xs font-bold text-art-200">
              {customizerEnabled
                ? 'Customizer Tab is Currently ENABLED'
                : 'Customizer Tab is Currently DISABLED'}
            </h3>
            <p className="text-[11px] text-art-500">
              {customizerEnabled
                ? 'Customers can browse and design keychains, nameplates, thalis, frames, and clocks in real-time.'
                : 'Navigation link is hidden across desktop & mobile navbar. Custom orders are paused.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Link
            to="/customizer"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-xl text-xs font-bold text-art-400 hover:text-art-200 bg-art-900 hover:bg-art-850 border border-art-800 transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview 3D</span>
          </Link>

          <button
            type="button"
            disabled={isTogglingCustomizer}
            onClick={onToggleCustomizer}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              customizerEnabled
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {customizerEnabled ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Disable Customizer</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Enable Customizer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Individual Product Toggles Section */}
      <div className="pt-3 border-t border-art-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-art-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-brand-500" />
              <span>Individual Product Category Controls</span>
            </h3>
            <p className="text-[11px] text-art-500 mt-0.5">
              Selectively turn specific products ON or OFF in the 3D Customizer studio (e.g. turn off Keychains during mold maintenance).
            </p>
          </div>
          <span className="text-[10px] font-mono text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/30">
            {settings.enabledCustomizerProducts?.length ?? 5} of 5 Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {CUSTOMIZER_ITEMS.map((item) => {
            const isEnabled = (settings.enabledCustomizerProducts ?? [
              'keychain-initial',
              'nameplate-rect',
              'thali-puja',
              'frame-photo',
              'clock-round-12',
            ]).includes(item.id);

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isEnabled
                    ? 'bg-art-950/80 border-art-800'
                    : 'bg-art-950/40 border-art-900 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-art-200 truncate">{item.name}</h4>
                      <span className="text-[10px] text-brand-400 font-bold shrink-0">{item.price}</span>
                    </div>
                    <p className="text-[10px] text-art-500 truncate">{item.desc}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const currentList = settings.enabledCustomizerProducts ?? [
                      'keychain-initial',
                      'nameplate-rect',
                      'thali-puja',
                      'frame-photo',
                      'clock-round-12',
                    ];
                    let newList: string[];
                    if (currentList.includes(item.id)) {
                      newList = currentList.filter((id) => id !== item.id);
                    } else {
                      newList = [...currentList, item.id];
                    }
                    onUpdateProductToggles(newList);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all shrink-0 ${
                    isEnabled
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                      : 'bg-art-900 border-art-800 text-art-500 hover:text-art-300'
                  }`}
                >
                  {isEnabled ? '✓ Active' : '✕ Disabled'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
