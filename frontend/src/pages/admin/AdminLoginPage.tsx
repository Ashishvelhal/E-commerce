import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Palette, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { recordAdminAccess } from '../../services/securityLog';

const MAX_ATTEMPTS   = 3;
const LOCKOUT_SECS   = 60;

export const AdminLoginPage: React.FC = () => {
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempts,    setAttempts]    = useState(0);
  const [lockedOut,   setLockedOut]   = useState(false);
  const [lockCountdown, setLockCountdown] = useState(LOCKOUT_SECS);

  const { login }    = useAuthStore();
  const { addToast } = useToastStore();
  const navigate     = useNavigate();

  useEffect(() => {
    // Record that the login page was accessed
    recordAdminAccess('Admin Login Page View');
  }, []);

  useEffect(() => {
    if (!lockedOut) return;
    setLockCountdown(LOCKOUT_SECS);
    const interval = setInterval(() => {
      setLockCountdown(c => {
        if (c <= 1) {
          clearInterval(interval);
          setLockedOut(false);
          setAttempts(0);
          return LOCKOUT_SECS;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedOut]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockedOut) return;

    setIsSubmitting(true);

    // 1. Hit API immediately when user clicks "Enter Admin Studio" / presses Enter
    recordAdminAccess('Login Attempt', email);

    const res = await login({ email, password });
    setIsSubmitting(false);

    if (res.success) {
      // 2. Hit API for Login Success
      recordAdminAccess('Login Success', email);
      addToast('Welcome back to Rasin Arts Admin ✨', 'success');
      navigate('/admin');
    } else {
      // 3. Hit API for Login Failed
      recordAdminAccess('Login Failed', email || 'Unknown Email');
      const next = attempts + 1;
      setAttempts(next);
      if (next >= MAX_ATTEMPTS) {
        setLockedOut(true);
        addToast(`Too many failed attempts. Locked for ${LOCKOUT_SECS} seconds.`, 'error');
      } else {
        addToast(`Invalid credentials. ${MAX_ATTEMPTS - next} attempt${MAX_ATTEMPTS - next === 1 ? '' : 's'} remaining.`, 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-art-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] orb-gold opacity-15 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] orb-plum opacity-10 pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-3">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 resin-blob bg-gradient-to-br from-brand-500 via-rose-500 to-plum-600 shadow-2xl glow-gold" />
            <Palette className="relative w-8 h-8 text-white z-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-art-300 font-poppins">
              Rasin Arts
            </h1>
            <p className="text-xs tracking-[0.25em] text-brand-700 font-bold uppercase mt-1">
              Admin Studio Portal
            </p>
          </div>
          <p className="text-xs text-art-500 max-w-xs mx-auto font-medium">
            Secure access to manage your resin art catalog, orders, banners, and store settings.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-7 rounded-3xl bg-white border border-art-800 space-y-5 shadow-lg"
        >
          <div>
            <label className="block text-xs font-semibold text-art-400 mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-art-600" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@rasinarts.com"
                required
                className="w-full bg-art-950 border border-art-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500 transition-colors font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-art-400 mb-1.5">
              Security Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-art-600" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-art-950 border border-art-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>


          {lockedOut && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold"
              style={{ background: '#fff5f5', borderColor: '#fca5a5', color: '#991b1b' }}>
              <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: '#dc2626' }} />
              <span>
                Too many failed attempts. Try again in{' '}
                <span className="font-black">{lockCountdown}s</span>.
              </span>
            </div>
          )}

          {!lockedOut && attempts > 0 && (
            <p className="text-[11px] font-semibold text-center" style={{ color: '#b45309' }}>
              {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts === 1 ? '' : 's'} remaining before lockout
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || lockedOut}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-rose-500 hover:from-brand-500 hover:to-rose-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold shadow-xl glow-brand flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : lockedOut ? (
              <span>Locked — wait {lockCountdown}s</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Enter Admin Studio</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-1">
            <Link to="/" className="text-xs text-art-500 hover:text-art-300 font-semibold transition-colors">
              ← Return to Rasin Arts Gallery
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
