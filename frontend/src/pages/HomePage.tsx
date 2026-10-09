import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Sparkles, Palette, Box, ChevronRight, ChevronLeft, Leaf,
  Star, TrendingUp, BookOpen, Zap, Instagram, MessageCircle, ExternalLink, Heart,
} from 'lucide-react';
import { Product, Post, Banner, Category } from '../types';
import { ProductCanvas } from '../components/3d/ProductCanvas';
import { ProductCard } from '../components/product/ProductCard';
import { Quick3DModal } from '../components/product/Quick3DModal';
import { BannerSkeleton, ProductCardSkeleton } from '../components/common/Skeletons';
import { useSettingsStore } from '../store/useSettingsStore';
import api from '../services/api';

/* ── Floating ambient orb helper ── */
const Orb: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`absolute rounded-full blur-[80px] pointer-events-none ${className}`} />
);

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [heroProduct, setHeroProduct] = useState<Product | null>(null);
  const [heroColor, setHeroColor] = useState<string | undefined>(undefined);
  const [heroColorName, setHeroColorName] = useState<string | undefined>(undefined);
  const [posts, setPosts] = useState<Post[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettingsStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, postsRes, bannersRes, categoriesRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/posts?all=false'),
          api.get('/banners'),
          api.get('/products/categories'),
        ]);
        const with3D = featuredRes.data.data.with3D || [];
        setFeaturedProducts(featuredRes.data.data.featured || []);
        setTrendingProducts(featuredRes.data.data.trending || []);
        setPosts(postsRes.data.data?.slice(0, 2) || []);
        setBanners(bannersRes.data.data || []);
        setCategories(categoriesRes.data.data.all || []);
        if (with3D.length > 0) {
          const sel = with3D[0];
          setHeroProduct(sel);
          if (sel.model3d?.availableColors?.[0]) {
            setHeroColor(sel.model3d.availableColors[0].hex);
            setHeroColorName(sel.model3d.availableColors[0].name);
          }
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setActiveBannerIndex(i => (i + 1) % banners.length), 6000);
    return () => clearInterval(t);
  }, [banners.length]);

  const activeBanner = banners[activeBannerIndex];

  return (
    <div className="space-y-12 sm:space-y-20 md:space-y-24 pb-20 relative overflow-hidden">
      <Orb className="w-[500px] h-[500px] top-0 left-1/4 bg-brand-500/10" />
      <Orb className="w-[400px] h-[400px] top-[40%] right-0 bg-rose-600/8" />
      <Orb className="w-[350px] h-[350px] bottom-0 left-0 bg-plum-600/8" />
      {banners.length > 0 && activeBanner && (
        <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-2">
          <div className="group relative rounded-2xl sm:rounded-[2.5rem] overflow-hidden border border-art-700/50 shadow-2xl min-h-[280px] xs:min-h-[320px] sm:min-h-[380px] md:min-h-[440px] lg:min-h-[500px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeBanner._id}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                <img
                  src={activeBanner.image}
                  alt={activeBanner.title}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-y-0 left-0 w-full sm:w-[45%] lg:w-[45%] bg-gradient-to-r from-art-950/95 via-art-950/80 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-art-950/80 via-transparent to-transparent sm:hidden pointer-events-none" />
              </motion.div>
            </AnimatePresence>

            <div className="relative z-10 w-full p-4 xs:p-5 sm:p-8 md:p-10 max-w-xl lg:max-w-[32%] flex flex-col justify-center space-y-2 xs:space-y-3 sm:space-y-4">
              {activeBanner.badge && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="w-fit">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/20 backdrop-blur-md border border-brand-500/35 text-[10px] sm:text-xs font-black tracking-wider uppercase text-brand-700 shadow-sm">
                    <Sparkles className="w-3 h-3 text-brand-600" />
                    {activeBanner.badge}
                  </span>
                </motion.div>
              )}

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-art-300 leading-[1.2] line-clamp-2 sm:line-clamp-none"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {activeBanner.title}
              </motion.h2>

              {activeBanner.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-xs sm:text-sm text-art-500 leading-snug sm:leading-relaxed line-clamp-2 max-w-md"
                >
                  {activeBanner.subtitle}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="pt-1 sm:pt-2"
              >
                <Link
                  to={activeBanner.linkUrl || '/shop'}
                  className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white text-xs sm:text-sm font-bold shadow-xl glow-brand transition-all active:scale-95"
                >
                  <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{activeBanner.buttonText || 'Explore Collection'}</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Link>
              </motion.div>
            </div>

            {banners.length > 1 && (
              <>
                <button
                  onClick={() => setActiveBannerIndex((i) => (i - 1 + banners.length) % banners.length)}
                  aria-label="Previous banner"
                  className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white items-center justify-center backdrop-blur-sm border border-slate-700/60 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveBannerIndex((i) => (i + 1) % banners.length)}
                  aria-label="Next banner"
                  className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white items-center justify-center backdrop-blur-sm border border-slate-700/60 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-md"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 flex items-center gap-1 sm:gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-slate-700/60 shadow-lg">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveBannerIndex(i)}
                      aria-label={`Slide ${i + 1}`}
                      className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                        activeBannerIndex === i ? 'w-5 sm:w-6 bg-brand-400' : 'w-1.5 sm:w-2 bg-art-600 hover:bg-art-400'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}
      <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-4 sm:space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-700 text-xs font-bold tracking-wider">
              <Leaf className="w-3.5 h-3.5 text-brand-600" />
              <span>Handcrafted. One-of-a-Kind. Yours.</span>
            </div>

            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-bold text-art-300 leading-[1.15]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Where Resin Becomes{' '}
              <span className="text-resin italic">Art.</span>
            </h1>

            <p className="text-sm sm:text-base text-art-500 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Each piece from Rasin Arts is poured by hand — jewels of coloured resin swirled with intention, cured under UV light, and polished to a flawless finish. No two pieces are alike.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              {['UV Resin', 'Epoxy Art', 'Non-Toxic', 'Custom Orders', 'Eco-Friendly'].map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full text-[11px] font-semibold bg-art-900 border border-art-850 text-art-500">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                to="/shop"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-rose-500 hover:from-brand-500 hover:to-rose-400 text-white font-bold text-sm shadow-xl glow-brand transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Palette className="w-4 h-4" />
                <span>Browse Gallery</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/shop?has3D=true"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-art-900 hover:bg-art-850 text-plum-700 hover:text-plum-800 border border-plum-500/30 hover:border-plum-400 text-sm font-semibold transition-all flex items-center justify-center gap-2 animate-none"
              >
                <Box className="w-4 h-4" />
                <span>3D Art Preview</span>
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-art-800/80">
              {[
                { num: '2,400+', label: 'Art Pieces Sold' },
                { num: '4.9★', label: 'Average Rating' },
                { num: '100%', label: 'Handcrafted' },
              ].map(({ num, label }) => (
                <div key={label} className="text-center lg:text-left">
                  <div className="text-xl font-bold text-art-300" style={{ fontFamily: "'Playfair Display', serif" }}>{num}</div>
                  <div className="text-[11px] text-art-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-500/10 via-rose-500/5 to-plum-600/10 blur-xl" />

            {heroProduct ? (
              <div className="relative space-y-3">
                <div className="rounded-3xl overflow-hidden border border-art-700/60 shadow-2xl" style={{ boxShadow: '0 0 60px rgba(245,144,16,0.1), 0 0 30px rgba(244,63,94,0.07)' }}>
                  <ProductCanvas
                    modelConfig={heroProduct.model3d}
                    selectedColor={heroColor}
                    className="h-[420px] sm:h-[480px] lg:h-[540px] w-full"
                  />
                </div>
                <div className="p-3.5 bg-white/95 backdrop-blur-md rounded-2xl border border-art-800 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-xs font-semibold text-art-300 truncate max-w-[200px]"
                       style={{ fontFamily: "'Playfair Display', serif" }}>
                      {heroProduct.title}
                    </p>
                    <p className="text-[11px] text-art-500 mt-0.5 font-medium">Interactive 3D — drag to rotate</p>
                  </div>
                  {heroProduct.model3d?.availableColors && heroProduct.model3d.availableColors.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      {heroProduct.model3d.availableColors.map(color => (
                        <button
                          key={color.name}
                          onClick={() => { setHeroColor(color.hex); setHeroColorName(color.name); }}
                          title={color.name}
                          className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                            heroColor === color.hex
                              ? 'border-brand-400 scale-125 ring-2 ring-brand-500/40 ring-offset-1 ring-offset-white'
                              : 'border-art-800 opacity-70 hover:opacity-100 hover:scale-110'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-[420px] rounded-3xl bg-art-900 border border-art-700/60 animate-pulse" />
            )}
          </motion.div>
        </div>
      </section>
      <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-xs font-bold text-brand-700 uppercase tracking-[0.2em] flex items-center gap-1.5 mb-2 font-sans">
              <Sparkles className="w-3.5 h-3.5" /> Our Collections
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-art-300" style={{ fontFamily: "'Playfair Display', serif" }}>
              Shop by Category
            </h2>
          </div>
          <Link to="/shop" className="text-xs font-bold text-brand-700 hover:text-brand-600 flex items-center gap-1 group hidden sm:flex font-sans">
            <span>View All</span><ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {categories.slice(0, 4).map((cat, i) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="group relative rounded-[1.5rem] overflow-hidden block border border-art-700/50 hover:border-brand-600/60 transition-all shadow-lg hover:shadow-gold"
                  style={{ aspectRatio: '4/3' }}
                >
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80'}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Bottom scrim so category images stay vivid and crisp */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors drop-shadow"
                        style={{ fontFamily: "'Playfair Display', serif" }}>
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-[11px] text-slate-200 line-clamp-1 mt-0.5 drop-shadow">{cat.description}</p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Category skeleton */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-[1.5rem] bg-art-900 border border-art-700/40 animate-pulse" style={{ aspectRatio: '4/3' }} />
            ))}
          </div>
        )}
      </section>
      <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-xs font-bold text-rose-700 uppercase tracking-[0.2em] flex items-center gap-1.5 mb-2 font-sans">
              <Zap className="w-3.5 h-3.5" /> Handpicked Picks
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-art-300" style={{ fontFamily: "'Playfair Display', serif" }}>
              Featured Creations
            </h2>
          </div>
          <Link to="/shop?featured=true" className="text-xs font-bold text-rose-700 hover:text-rose-600 flex items-center gap-1 group hidden sm:flex font-sans">
            <span>View All</span><ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <ProductCardSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {featuredProducts.map(p => (
              <ProductCard key={p._id} product={p} onQuickView3D={setQuickViewProduct} />
            ))}
          </div>
        )}
      </section>
      <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="relative rounded-[2.5rem] overflow-hidden border border-art-800 shadow-xl">
          <div className="absolute inset-0 bg-white" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 via-rose-500/5 to-plum-600/10" />
          <div className="absolute top-0 right-0 w-96 h-96 orb-gold opacity-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 orb-plum opacity-10 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="p-10 sm:p-16 flex flex-col justify-center space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-700 text-xs font-bold w-fit font-sans">
                <Star className="w-3.5 h-3.5 text-brand-600 fill-brand-600" />
                <span>Our Craft Story</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold text-art-300 leading-snug"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                Poured with Love.<br />
                <span className="text-resin italic">Finished to Perfection.</span>
              </h3>
              <p className="text-sm text-art-500 leading-relaxed">
                Every piece from our studio starts with hand-selected pigments, mixed slowly into epoxy or UV resin, and poured in layers to create depth, movement, and life. We use only non-toxic, food-safe resins suitable for home and gifting.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { val: 'Premium', label: 'UV & Epoxy Resin' },
                  { val: 'Custom', label: 'Colour Requests' },
                  { val: 'Gift', label: 'Ready Packaging' },
                  { val: 'Eco', label: 'Sustainable Craft' },
                ].map(({ val, label }) => (
                  <div key={label} className="p-3 rounded-xl bg-white/70 border border-art-800">
                    <div className="text-sm font-bold text-brand-700">{val}</div>
                    <div className="text-[11px] text-art-600">{label}</div>
                  </div>
                ))}
              </div>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg glow-brand transition-all w-fit"
              >
                <BookOpen className="w-4 h-4" />
                <span>Read Artist Stories</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {posts[0] && (
              <div className="relative min-h-[320px] lg:min-h-full overflow-hidden">
                <img
                  src={posts[0].bannerImage}
                  alt="Resin art studio"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-xs font-bold text-plum-700 uppercase tracking-[0.2em] flex items-center gap-1.5 mb-2 font-sans">
              <TrendingUp className="w-3.5 h-3.5" /> Most Loved
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-art-300" style={{ fontFamily: "'Playfair Display', serif" }}>
              Trending Pieces
            </h2>
          </div>
          <Link to="/shop?trending=true" className="text-xs font-bold text-plum-700 hover:text-plum-600 flex items-center gap-1 group hidden sm:flex font-sans">
            <span>View All</span><ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <ProductCardSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {trendingProducts.map(p => (
              <ProductCard key={p._id} product={p} onQuickView3D={setQuickViewProduct} />
            ))}
          </div>
        )}
      </section>

      {/* Instagram & Artisan Community Showcase */}
      {settings.socialLinks?.showSocialFeed !== false && (
        <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="rounded-3xl bg-gradient-to-b from-art-900/60 to-art-950/90 border border-art-800 p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-2xl">
            <Orb className="w-[300px] h-[300px] -top-20 -right-20 bg-pink-500/10" />
            <Orb className="w-[300px] h-[300px] -bottom-20 -left-20 bg-brand-500/10" />

            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10 relative z-10">
              <div>
                <div className="text-xs font-bold text-pink-600 uppercase tracking-[0.2em] flex items-center gap-1.5 mb-2 font-sans">
                  <Instagram className="w-4 h-4" /> Live from the Studio
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-art-300" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Follow Our Resin Journey
                </h2>
                <p className="text-xs sm:text-sm text-art-500 mt-2 max-w-xl">
                  Watch behind-the-scenes pigment mixes, demolding ASMR videos, and bespoke commissioned pieces created daily in our master studio.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {settings.socialLinks?.whatsappCommunity && (
                  <a
                    href={settings.socialLinks.whatsappCommunity}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 border border-emerald-500/20 text-xs font-bold transition-all shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Join VIP Drop Club</span>
                  </a>
                )}
                <a
                  href={settings.socialLinks?.instagram || 'https://instagram.com/rasinarts.studio'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-500 hover:to-rose-400 text-white text-xs font-bold shadow-lg glow-brand transition-all active:scale-[0.98]"
                >
                  <Instagram className="w-4 h-4" />
                  <span>{settings.socialLinks?.instagramHandle || '@rasinarts.studio'}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>
            </div>

            {/* Curated Studio Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 relative z-10">
              {[
                {
                  img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
                  title: 'Ocean Geode Wall Art',
                  likes: '1.4k',
                },
                {
                  img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
                  title: '24K Gold Leaf Coasters',
                  likes: '980',
                },
                {
                  img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80',
                  title: 'Preserved Rose Tray',
                  likes: '2.1k',
                },
                {
                  img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80',
                  title: 'Midnight Nebula Clock',
                  likes: '1.8k',
                },
                {
                  img: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=600&auto=format&fit=crop&q=80',
                  title: 'Resin River Walnut Board',
                  likes: '3.2k',
                },
                {
                  img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
                  title: 'Opal Sheen Trinket Dish',
                  likes: '1.1k',
                },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={settings.socialLinks?.instagram || 'https://instagram.com/rasinarts.studio'}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative aspect-square rounded-2xl overflow-hidden border border-art-800/80 bg-art-900 shadow-md transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:border-pink-500/50"
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                    <div className="flex justify-end">
                      <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                        <Instagram className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-white line-clamp-1">{item.title}</div>
                      <div className="flex items-center gap-1 text-[10px] text-pink-300 mt-0.5">
                        <Heart className="w-3 h-3 fill-pink-400 text-pink-400" />
                        <span>{item.likes}</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Community Highlight Footer */}
            <div className="mt-8 pt-6 border-t border-art-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-art-500 relative z-10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>Tag <strong className="text-art-300 font-semibold">{settings.socialLinks?.instagramHandle || '@rasinarts.studio'}</strong> or use <strong className="text-art-300 font-semibold">#ResinArtsStudio</strong> on your posts to be featured!</span>
              </div>
              <div className="text-[11px] text-art-600">
                Weekly curated feature drops & VIP community giveaways
              </div>
            </div>
          </div>
        </section>
      )}

      <Quick3DModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
};
