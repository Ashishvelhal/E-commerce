/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Resin Arts primary palette ── warm amber-gold
        brand: {
          50:  '#FFF9EB',
          100: '#FFF0C8',
          200: '#FEDC8A',
          300: '#FDC24B',
          400: '#FBAB27',
          500: '#F59010',   // Golden Amber — main CTA
          600: '#D97006',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          950: '#451A03',
        },
        // ── Rose-gold accent ──
        rose: {
          50:  '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
          800: '#9F1239',
          900: '#881337',
          950: '#4C0519',
        },
        // ── Deep plum / amethyst accent ──
        plum: {
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },
        // ── Fresh art-studio light backgrounds & deep rich espresso text ──
        art: {
          950: '#FAF8F5',   // Fresh bright alabaster linen background
          900: '#F5EFE6',   // Soft warm cream
          850: '#EAE2D5',   // Muted clay / sand tone
          800: '#DFD5C6',   // Soft linen border / card backgrounds
          700: '#C8B9A6',   // Taupe outline
          600: '#8A7A68',   // Medium warm taupe
          500: '#5F5142',   // Deep bronze/wood
          400: '#3D3126',   // Rich warm charcoal / espresso
          300: '#2E2218',   // Extra deep espresso text
          200: '#1F150E',   
          100: '#0F0906',
        },
        cyber: {
          neon:  '#06b6d4',
          lime:  '#10b981',
          rose:  '#f43f5e',
          amber: '#f59e0b',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif:   ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'serif'],
        poppins: ['"Poppins"', 'sans-serif'],
      },
      backgroundImage: {
        'resin-gradient': 'linear-gradient(135deg, #F59010 0%, #E11D48 40%, #7C3AED 80%, #F59010 100%)',
        'warm-dark-gradient': 'linear-gradient(to bottom right, #F5EFE6, #FAF8F5)',
        'gold-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(245,144,16,0.08) 50%, transparent 100%)',
      },
      animation: {
        'float':          'float 6s ease-in-out infinite',
        'float-delayed':  'float 6s ease-in-out 2s infinite',
        'pulse-slow':     'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow':           'glow 3s ease-in-out infinite alternate',
        'shimmer':        'shimmer 2.5s linear infinite',
        'pour':           'pour 8s ease-in-out infinite',
        'spin-slow':      'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-14px)' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 20px rgba(245,144,16,0.2)' },
          '100%': { boxShadow: '0 0 40px rgba(245,144,16,0.6), 0 0 80px rgba(225,29,72,0.2)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        pour: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '33%':      { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
          '66%':      { borderRadius: '40% 60% 50% 50% / 30% 40% 60% 70%' },
        },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'gold':      '0 0 30px -5px rgba(245,144,16,0.4)',
        'gold-lg':   '0 0 60px -10px rgba(245,144,16,0.5), 0 0 30px -5px rgba(225,29,72,0.2)',
        'plum':      '0 0 30px -5px rgba(124,58,237,0.4)',
        'art-card':  '0 8px 30px rgba(45,34,28,0.06), 0 1px 2px rgba(45,34,28,0.03), inset 0 1px 0 rgba(255,255,255,0.6)',
      },
    },
  },
  plugins: [],
};
