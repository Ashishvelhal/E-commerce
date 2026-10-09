import React from 'react';
import { Link } from 'react-router-dom';
import {
  Palette,
  Instagram,
  Twitter,
  Heart as PinIcon,
  Truck,
  RefreshCw,
  Headphones,
  Leaf,
  Mail,
  Youtube,
  Globe,
  MessageCircle,
  Linkedin,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getIconComponent, getLogoGradientClass, getLogoShapeClass } from '../../utils/iconHelper';

export const Footer: React.FC = () => {
  const { settings } = useSettingsStore();
  const brandTitle = settings?.brandTitle || 'Rasin Arts';
  const brandSubtitle = settings?.brandSubtitle || 'Luxury 3D Studio';
  const logoIconName = settings?.logoIcon || 'Palette';
  const logoImageUrl = settings?.logoImageUrl || '';
  const logoBlobShape = settings?.logoBlobShape || 'resin-blob';
  const logoGradient = settings?.logoGradient || 'amber-rose';
  const LogoIconComp = getIconComponent(logoIconName, Palette);
  const social = settings?.socialLinks;

  const socialItems = [
    {
      name: 'Instagram',
      href: social?.instagram || 'https://instagram.com/rasinarts',
      Icon: Instagram,
      color: 'hover:text-rose-500 hover:border-rose-500/40 text-art-500',
    },
    {
      name: 'YouTube',
      href: social?.youtube || 'https://youtube.com/@rasinarts',
      Icon: Youtube,
      color: 'hover:text-red-500 hover:border-red-500/40 text-art-500',
    },
    {
      name: 'Pinterest',
      href: social?.pinterest || 'https://pinterest.com/rasinarts',
      Icon: PinIcon,
      color: 'hover:text-rose-600 hover:border-rose-600/40 text-art-500',
    },
    {
      name: 'WhatsApp VIP',
      href: social?.whatsappCommunity || (settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}` : 'https://chat.whatsapp.com/rasinarts'),
      Icon: MessageCircle,
      color: 'hover:text-emerald-500 hover:border-emerald-500/40 text-art-500',
    },
    {
      name: 'Facebook',
      href: social?.facebook || 'https://facebook.com/rasinarts',
      Icon: Globe,
      color: 'hover:text-blue-500 hover:border-blue-500/40 text-art-500',
    },
    {
      name: 'X (Twitter)',
      href: social?.twitter || 'https://twitter.com/rasinarts',
      Icon: Twitter,
      color: 'hover:text-zinc-300 hover:border-zinc-500/40 text-art-500',
    },
    ...(social?.linkedin
      ? [
          {
            name: 'LinkedIn',
            href: social.linkedin,
            Icon: Linkedin,
            color: 'hover:text-sky-500 hover:border-sky-500/40 text-art-500',
          },
        ]
      : []),
  ].filter((item) => Boolean(item.href));

  return (
    <footer className="bg-art-950 border-t border-art-800/80 text-art-400 text-sm mt-20 pb-20 md:pb-8 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-64 h-64 orb-gold opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 orb-plum opacity-8 pointer-events-none" />
      <div className="resin-divider" />
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-12 border-b border-art-800/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { Icon: Truck, color: 'text-brand-700', bg: 'bg-brand-500/10 border-brand-500/20', title: 'Free Delivery', sub: 'On all orders above ₹999' },
            { Icon: RefreshCw, color: 'text-rose-700', bg: 'bg-rose-500/10 border-rose-500/20', title: '7-Day Easy Returns', sub: 'Hassle-free exchange policy' },
            { Icon: Leaf, color: 'text-emerald-700', bg: 'bg-emerald-500/10 border-emerald-500/20', title: 'Eco-Friendly', sub: 'Non-toxic, food-safe resins' },
            { Icon: Headphones, color: 'text-plum-700', bg: 'bg-plum-500/10 border-plum-500/20', title: 'Artisan Support', sub: 'Talk to our craft specialists' },
          ].map(({ Icon, color, bg, title, sub }) => (
            <div key={title} className="flex items-center gap-3.5">
              <div className={`p-3 rounded-2xl border shrink-0 ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <h4 className="font-bold text-art-300 text-xs sm:text-sm">{title}</h4>
                <p className="text-[11px] text-art-500 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative w-10 h-10 flex items-center justify-center">
              {logoImageUrl ? (
                <img
                  src={logoImageUrl}
                  alt={brandTitle}
                  className="w-10 h-10 object-contain rounded-xl shadow-md group-hover:scale-105 transition-transform"
                />
              ) : (
                <>
                  <div
                    className={`absolute inset-0 ${getLogoShapeClass(logoBlobShape)} ${getLogoGradientClass(
                      logoGradient
                    )} group-hover:opacity-90 transition-opacity`}
                  />
                  <LogoIconComp className="relative w-5 h-5 text-white z-10" />
                </>
              )}
            </div>
            <div>
              <span className="font-display text-xl font-bold text-art-300 block" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {brandTitle}
              </span>
              <span className="text-[9px] text-brand-700 tracking-widest font-sans font-bold uppercase">
                {brandSubtitle}
              </span>
            </div>
          </Link>
          <p className="text-xs text-art-500 leading-relaxed">
            Each piece is a one-of-a-kind creation — poured, swirled, and cured with intention. We craft jewellery, home décor, coasters, and art panels using premium UV and epoxy resins.
          </p>
          <div className="pt-1">
            <a
              href={`mailto:${settings?.supportEmail || 'support@rasinarts.com'}`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-brand-700 hover:text-brand-600 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{settings?.supportEmail || 'support@rasinarts.com'}</span>
            </a>
          </div>
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            {socialItems.map(({ name, href, Icon, color }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={`Visit ${name}`}
                className={`p-2 rounded-xl bg-art-900 border border-art-800 transition-all ${color} hover:scale-110 active:scale-95`}
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold text-art-300 uppercase tracking-widest mb-4 font-sans">Our Collections</h4>
          <ul className="space-y-2.5 text-xs">
            {[
              { label: 'Resin Jewellery', to: '/shop?category=Resin+Jewellery' },
              { label: 'Home Décor Panels', to: '/shop?category=Home+Decor' },
              { label: 'Coasters & Trays', to: '/shop?category=Coasters+%26+Trays' },
              { label: 'Custom Art Pieces', to: '/shop?category=Custom+Art' },
              { label: '3D View Collection', to: '/shop?has3D=true', highlight: true },
            ].map(({ label, to, highlight }) => (
              <li key={label}>
                <Link
                  to={to}
                  className={highlight ? 'text-brand-700 font-bold hover:text-brand-600 transition-colors' : 'text-art-400 hover:text-art-300 transition-colors hover:underline'}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold text-art-300 uppercase tracking-widest mb-4 font-sans">Navigate</h4>
          <ul className="space-y-2.5 text-xs">
            {[
              { label: 'Browse Gallery', to: '/shop' },
              { label: 'Corporate & Bulk Gifting', to: '/bulk-gifting', highlight: true },
              { label: 'Artist Stories', to: '/blog' },
              { label: 'Track My Order', to: '/orders' },
              { label: 'Admin Panel', to: '/admin/login' },
            ].map(({ label, to, highlight }) => (
              <li key={label}>
                <Link
                  to={to}
                  className={highlight ? 'text-brand-700 font-bold hover:underline' : 'text-art-400 hover:text-art-300 transition-colors hover:underline'}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold text-art-300 uppercase tracking-widest mb-2 font-sans">
            Join Our Studio Circle
          </h4>
          <p className="text-xs text-art-500 mb-3 leading-relaxed">
            Get early access to new pours, seasonal collections, and behind-the-scenes studio content.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="bg-white border border-art-800 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-art-300 placeholder-art-600 focus:outline-none w-full transition-colors"
            />
            <button className="px-4 py-2 bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white rounded-xl text-xs font-semibold shrink-0 shadow-md glow-brand transition-all">
              Join
            </button>
          </div>
        </div>
      </div>
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-8 border-t border-art-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-art-600">
        <span>© {new Date().getFullYear()} Rasin Arts. All rights reserved. Crafted with ♥ and premium resin.</span>
      </div>
    </footer>
  );
};
