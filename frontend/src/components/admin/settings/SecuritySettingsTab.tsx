import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { User } from '../../../types';

interface SecuritySettingsTabProps {
  adminName: string;
  setAdminName: (val: string) => void;
  adminPassword: string;
  setAdminPassword: (val: string) => void;
  user: User | null;
}

export const SecuritySettingsTab: React.FC<SecuritySettingsTabProps> = ({
  adminName,
  setAdminName,
  adminPassword,
  setAdminPassword,
  user,
}) => {
  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-white border border-stone-200 space-y-4 shadow-xl">
      <h2 className="text-sm font-bold text-art-400 uppercase tracking-wider flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-brand-600" />
        <span>Administrator Account &amp; Credentials</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        <div>
          <label className="block text-xs font-semibold text-art-400 mb-1">
            Admin Name
          </label>
          <input
            type="text"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            required
            className="w-full bg-white border border-art-700 rounded-xl px-3.5 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-art-400 mb-1">
            Admin Login Email
          </label>
          <input
            type="email"
            value={user?.email || 'admin@ecommerce.com'}
            disabled
            className="w-full bg-white border border-art-800/80 rounded-xl px-3.5 py-2.5 text-xs text-art-600 cursor-not-allowed font-mono"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-art-400 mb-1">
            Change Security Password (leave blank to retain current)
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-art-600" />
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter new 6+ character password"
              className="w-full bg-white border border-art-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-art-300 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
