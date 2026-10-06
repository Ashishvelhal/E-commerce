import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, MapPin, ShieldCheck, CheckCircle2, Plus } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import api from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const { addToast } = useToastStore();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [street, setStreet] = useState(user?.addresses?.[0]?.street || '');
  const [city, setCity] = useState(user?.addresses?.[0]?.city || '');
  const [state, setState] = useState(user?.addresses?.[0]?.state || '');
  const [postalCode, setPostalCode] = useState(user?.addresses?.[0]?.postalCode || '');
  const [country, setCountry] = useState(user?.addresses?.[0]?.country || 'United States');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: any = {
        name,
        phone,
        avatar,
        addresses: [
          {
            street,
            city,
            state,
            postalCode,
            country,
            isDefault: true,
          },
        ],
      };

      if (password.trim().length >= 6) {
        payload.password = password.trim();
      }

      const res = await api.put('/auth/profile', payload);
      updateUser(res.data.data);
      addToast('Profile updated successfully!', 'success');
      setPassword('');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-art-300">Account Settings</h1>
        <p className="text-xs text-art-500 mt-1">Manage your identity, shipping address, and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 rounded-2xl bg-white border border-art-800 flex flex-col items-center text-center space-y-4 h-fit shadow-sm">
          <img
            src={
              avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
            }
            alt={user?.name}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-500/30"
          />
          <div>
            <h3 className="text-base font-bold text-art-300">{user?.name}</h3>
            <p className="text-xs text-art-500">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-[10px] font-bold">
              {user?.role === 'admin' ? 'Super Administrator' : 'Verified Customer'}
            </span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="md:col-span-2 p-6 rounded-2xl bg-white border border-art-800 space-y-6 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-700">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-art-900 border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-white border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1">Avatar Image URL</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full bg-white border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-700 pt-4 border-t border-art-800">
            Primary Delivery Address
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-art-400 mb-1">Street Address</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="123 Luxury Way"
                className="w-full bg-white border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1">State / Province</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-white border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1">Postal Code</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full bg-white border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-art-400 mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-white border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <h2 className="text-xs font-bold uppercase tracking-wider text-rose-700 pt-4 border-t border-art-800">
            Security & Password
          </h2>

          <div>
            <label className="block text-xs font-semibold text-art-400 mb-1">
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-art-800 rounded-xl px-3.5 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="pt-4 border-t border-art-800">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold shadow-lg glow-brand flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
