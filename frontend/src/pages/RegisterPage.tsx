import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Palette, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const location = useLocation();

  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      addToast('Password must be at least 6 characters', 'warning');
      return;
    }

    setIsSubmitting(true);
    const res = await register({ name, email, password });
    setIsSubmitting(false);

    if (res.success) {
      addToast('Account created successfully!', 'success');
      navigate(redirect);
    } else {
      addToast(res.message || 'Registration failed', 'error');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 resin-blob bg-gradient-to-br from-brand-500 via-rose-500 to-plum-600 shadow-xl glow-gold" />
            <Palette className="relative w-7 h-7 text-white z-10 drop-shadow" />
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-art-300"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Create Your Account
          </h1>
          <p className="text-xs text-art-500">
            Join Rasin Arts to explore 3D spatial models and save pieces to your wishlist.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white border border-art-800 space-y-4 shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-art-500 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-art-600" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ashish Sharma"
                required
                className="w-full bg-art-950 border border-art-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-art-500 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-art-600" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ashish@example.com"
                required
                className="w-full bg-art-950 border border-art-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-art-500 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-art-600" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="w-full bg-art-950 border border-art-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-rose-600 hover:from-brand-500 hover:to-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg glow-brand flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? <span>Creating Account...</span> : <span>Register Account</span>}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center pt-2 text-xs text-art-500">
            Already have an account?{' '}
            <Link to={`/login?redirect=${redirect}`} className="text-brand-700 font-bold hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
