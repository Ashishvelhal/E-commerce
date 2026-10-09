import React from 'react';
import {
  Share2,
  Instagram,
  AtSign,
  Globe,
  Youtube,
  Linkedin,
  Twitter,
  MessageCircle,
  ExternalLink,
  Heart as PinIcon,
} from 'lucide-react';
import { ISocialLinks } from '../../../store/useSettingsStore';

interface SocialSettingsTabProps {
  socialLinks: ISocialLinks;
  setSocialLinks: React.Dispatch<React.SetStateAction<ISocialLinks>>;
}

export const SocialSettingsTab: React.FC<SocialSettingsTabProps> = ({
  socialLinks,
  setSocialLinks,
}) => {
  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-white border border-art-800 space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-art-800">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-art-400 uppercase tracking-wider flex items-center gap-2">
            <Share2 className="w-4 h-4 text-brand-500" />
            <span>Social Media &amp; Community Channels</span>
          </h2>
          <p className="text-xs text-art-500">
            Connect your Instagram, YouTube, Pinterest, WhatsApp community, and social channels across your storefront footer, product shares, and home showcase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={socialLinks.showSocialFeed ?? true}
              onChange={(e) =>
                setSocialLinks({ ...socialLinks, showSocialFeed: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-art-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-art-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500"></div>
            <span className="ml-2 text-xs font-semibold text-art-300">
              Show Social Banner on Storefront
            </span>
          </label>
        </div>
      </div>

      {/* Social Media Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Instagram URL */}
        <div className="p-4 rounded-xl bg-art-950 border border-art-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-art-300 flex items-center gap-2">
              <div className="p-1 rounded-lg bg-rose-50 text-rose-600">
                <Instagram className="w-3.5 h-3.5" />
              </div>
              <span>Instagram Profile URL</span>
            </label>
            {socialLinks.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-brand-500 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Test Link</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
          <input
            type="url"
            value={socialLinks.instagram || ''}
            onChange={(e) =>
              setSocialLinks({ ...socialLinks, instagram: e.target.value })
            }
            placeholder="https://instagram.com/rasinarts"
            className="w-full bg-white border border-art-700 rounded-xl px-3 py-2 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-mono"
          />
        </div>

        {/* Instagram Handle */}
        <div className="p-4 rounded-xl bg-art-950 border border-art-800 space-y-2">
          <label className="text-xs font-bold text-art-300 flex items-center gap-2">
            <div className="p-1 rounded-lg bg-pink-50 text-pink-600">
              <AtSign className="w-3.5 h-3.5" />
            </div>
            <span>Instagram Handle / Tag</span>
          </label>
          <input
            type="text"
            value={socialLinks.instagramHandle || ''}
            onChange={(e) =>
              setSocialLinks({ ...socialLinks, instagramHandle: e.target.value })
            }
            placeholder="@rasinarts.studio"
            className="w-full bg-white border border-art-700 rounded-xl px-3 py-2 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-mono"
          />
        </div>

        {/* Facebook URL */}
        <div className="p-4 rounded-xl bg-art-950 border border-art-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-art-300 flex items-center gap-2">
              <div className="p-1 rounded-lg bg-blue-50 text-blue-600">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <span>Facebook Page URL</span>
            </label>
            {socialLinks.facebook && (
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-brand-500 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Test Link</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
          <input
            type="url"
            value={socialLinks.facebook || ''}
            onChange={(e) =>
              setSocialLinks({ ...socialLinks, facebook: e.target.value })
            }
            placeholder="https://facebook.com/rasinarts"
            className="w-full bg-white border border-art-700 rounded-xl px-3 py-2 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-mono"
          />
        </div>

        {/* YouTube Channel */}
        <div className="p-4 rounded-xl bg-art-950 border border-art-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-art-300 flex items-center gap-2">
              <div className="p-1 rounded-lg bg-red-50 text-red-600">
                <Youtube className="w-3.5 h-3.5" />
              </div>
              <span>YouTube Channel URL</span>
            </label>
            {socialLinks.youtube && (
              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-brand-500 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Test Link</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
          <input
            type="url"
            value={socialLinks.youtube || ''}
            onChange={(e) =>
              setSocialLinks({ ...socialLinks, youtube: e.target.value })
            }
            placeholder="https://youtube.com/@rasinarts"
            className="w-full bg-white border border-art-700 rounded-xl px-3 py-2 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-mono"
          />
        </div>

        {/* Pinterest Portfolio */}
        <div className="p-4 rounded-xl bg-art-950 border border-art-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-art-300 flex items-center gap-2">
              <div className="p-1 rounded-lg bg-rose-50 text-rose-700">
                <PinIcon className="w-3.5 h-3.5" />
              </div>
              <span>Pinterest Portfolio URL</span>
            </label>
            {socialLinks.pinterest && (
              <a
                href={socialLinks.pinterest}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-brand-500 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Test Link</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
          <input
            type="url"
            value={socialLinks.pinterest || ''}
            onChange={(e) =>
              setSocialLinks({ ...socialLinks, pinterest: e.target.value })
            }
            placeholder="https://pinterest.com/rasinarts"
            className="w-full bg-white border border-art-700 rounded-xl px-3 py-2 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-mono"
          />
        </div>

        {/* WhatsApp Community / VIP Channel */}
        <div className="p-4 rounded-xl bg-art-950 border border-art-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-art-300 flex items-center gap-2">
              <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
                <MessageCircle className="w-3.5 h-3.5" />
              </div>
              <span>WhatsApp VIP Community / Channel</span>
            </label>
            {socialLinks.whatsappCommunity && (
              <a
                href={socialLinks.whatsappCommunity}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-brand-500 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Test Link</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
          <input
            type="url"
            value={socialLinks.whatsappCommunity || ''}
            onChange={(e) =>
              setSocialLinks({ ...socialLinks, whatsappCommunity: e.target.value })
            }
            placeholder="https://chat.whatsapp.com/..."
            className="w-full bg-white border border-art-700 rounded-xl px-3 py-2 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-mono"
          />
        </div>

        {/* X / Twitter */}
        <div className="p-4 rounded-xl bg-art-950 border border-art-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-art-300 flex items-center gap-2">
              <div className="p-1 rounded-lg bg-zinc-100 text-zinc-700">
                <Twitter className="w-3.5 h-3.5" />
              </div>
              <span>X (Twitter) Profile URL</span>
            </label>
            {socialLinks.twitter && (
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-brand-500 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Test Link</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
          <input
            type="url"
            value={socialLinks.twitter || ''}
            onChange={(e) =>
              setSocialLinks({ ...socialLinks, twitter: e.target.value })
            }
            placeholder="https://x.com/rasinarts"
            className="w-full bg-white border border-art-700 rounded-xl px-3 py-2 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-mono"
          />
        </div>

        {/* LinkedIn Page */}
        <div className="p-4 rounded-xl bg-art-950 border border-art-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-art-300 flex items-center gap-2">
              <div className="p-1 rounded-lg bg-blue-50 text-blue-700">
                <Linkedin className="w-3.5 h-3.5" />
              </div>
              <span>LinkedIn Page URL</span>
            </label>
            {socialLinks.linkedin && (
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-brand-500 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Test Link</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
          <input
            type="url"
            value={socialLinks.linkedin || ''}
            onChange={(e) =>
              setSocialLinks({ ...socialLinks, linkedin: e.target.value })
            }
            placeholder="https://linkedin.com/company/rasinarts"
            className="w-full bg-white border border-art-700 rounded-xl px-3 py-2 text-xs text-art-300 focus:outline-none focus:border-brand-500 font-mono"
          />
        </div>
      </div>

      {/* Social Links Live Preview Badge Strip */}
      <div className="p-4 rounded-xl bg-art-950 border border-art-800 space-y-2">
        <div className="text-[11px] font-bold text-art-400 uppercase tracking-wider">
          Active Storefront Footer Social Icons Preview:
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {socialLinks.instagram && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold">
              <Instagram className="w-3.5 h-3.5" /> Instagram ({socialLinks.instagramHandle || '@rasinarts'})
            </span>
          )}
          {socialLinks.whatsappCommunity && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp VIP
            </span>
          )}
          {socialLinks.youtube && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-semibold">
              <Youtube className="w-3.5 h-3.5" /> YouTube
            </span>
          )}
          {socialLinks.pinterest && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-semibold">
              <PinIcon className="w-3.5 h-3.5" /> Pinterest
            </span>
          )}
          {socialLinks.facebook && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5" /> Facebook
            </span>
          )}
          {socialLinks.twitter && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-500/10 text-zinc-300 border border-zinc-500/30 text-xs font-semibold">
              <Twitter className="w-3.5 h-3.5" /> X / Twitter
            </span>
          )}
          {socialLinks.linkedin && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 text-blue-300 border border-blue-600/30 text-xs font-semibold">
              <Linkedin className="w-3.5 h-3.5" /> LinkedIn
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
