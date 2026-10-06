import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Building2,
  Gift,
  Heart,
  Percent,
  Calculator,
  CheckCircle2,
  Clock,
  Package,
  ShieldCheck,
  Send,
  MessageCircle,
  ArrowRight,
  Phone,
  Mail,
  Sliders,
  Award,
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useToastStore } from '../store/useToastStore';
import { formatINR } from '../utils/formatters';
import { cleanWhatsAppPhone } from '../utils/whatsapp';
import api from '../services/api';

interface BulkProductConfig {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  minQty: number;
  image: string;
  description: string;
  features: string[];
}

const BULK_PRODUCTS: BulkProductConfig[] = [
  {
    id: 'bulk-keychain',
    name: 'Custom Resin Initial / Logo Keychains',
    category: 'Corporate Merch & Wedding Favors',
    basePrice: 299,
    minQty: 25,
    image: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?w=600&auto=format&fit=crop&q=80',
    description: 'Gold foil flakes, dried real flowers, or company metallic logos sealed in crystal-clear epoxy with luxury suede tassel & brass ring.',
    features: ['Custom Metallic Logo / Monogram', '24K Gold Foil Accent', 'Individual Velvet Pouch Packaging'],
  },
  {
    id: 'bulk-coasters',
    name: 'Agate Geode Coasters (Set of 2 / 4)',
    category: 'VIP Corporate & Festive Gifting',
    basePrice: 699,
    minQty: 15,
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    description: 'Natural geode pattern with metallic gilded gold leaf rims. Ideal for luxury office desks and wedding return gifts.',
    features: ['Metallic Gilded Edges', 'Heat & Scratch Resistant UV Resin', 'Matching Ribbon & Custom Tag'],
  },
  {
    id: 'bulk-clocks',
    name: 'Bespoke Resin Geode Desk Clocks',
    category: 'Executive & Milestone Awards',
    basePrice: 1599,
    minQty: 10,
    image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&auto=format&fit=crop&q=80',
    description: 'Tabletop ocean wave or geode clock with silent sweep quartz movement, metallic Roman numerals, and corporate plaque engraving.',
    features: ['Silent Quartz Movement', 'Polished Natural Crystals Inlay', 'Branded Metal Plaque Engraving'],
  },
  {
    id: 'bulk-thalis',
    name: 'Luxury Pooja Thalis & Platter Trays',
    category: 'Festive & Housewarming Hampers',
    basePrice: 1999,
    minQty: 10,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    description: 'Grand festive thalis and resin serving platters with embedded pearl flowers and solid brass designer handles.',
    features: ['Solid Brass Handles', 'Food-Safe Gloss Finish', 'Custom Wooden Box Packaging'],
  },
];

export const BulkGiftingPage: React.FC = () => {
  const { settings } = useSettingsStore();
  const { addToast } = useToastStore();

  // Tiered Pricing Calculator State
  const [selectedProduct, setSelectedProduct] = useState<BulkProductConfig>(BULK_PRODUCTS[0]);
  const [quantity, setQuantity] = useState<number>(50);

  // Inquiry Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyOrEvent, setCompanyOrEvent] = useState('');
  const [eventType, setEventType] = useState('Corporate Event / Employee Gifting');
  const [productInterest, setProductInterest] = useState(selectedProduct.name);
  const [targetDate, setTargetDate] = useState('');
  const [budgetRange, setBudgetRange] = useState('Standard Tier (15-20% Savings)');
  const [customizationDetails, setCustomizationDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInquiryId, setSubmittedInquiryId] = useState<string | null>(null);

  // Calculate Volume Tier Discounts
  const getTierDiscount = (qty: number) => {
    if (qty >= 250) return { percent: 35, tierName: 'Diamond Enterprise (35% Off)', leadDays: '10-14 days' };
    if (qty >= 100) return { percent: 28, tierName: 'Platinum Bulk (28% Off)', leadDays: '7-10 days' };
    if (qty >= 50) return { percent: 20, tierName: 'Gold Volume (20% Off)', leadDays: '5-7 days' };
    return { percent: 15, tierName: 'Silver Starter (15% Off)', leadDays: '3-5 days' };
  };

  const discountTier = getTierDiscount(quantity);
  const originalUnitPrice = selectedProduct.basePrice;
  const discountedUnitPrice = Math.round(originalUnitPrice * (1 - discountTier.percent / 100));
  const totalOriginal = originalUnitPrice * quantity;
  const totalDiscounted = discountedUnitPrice * quantity;
  const totalSavings = totalOriginal - totalDiscounted;

  const handleProductSelect = (p: BulkProductConfig) => {
    setSelectedProduct(p);
    setProductInterest(p.name);
    if (quantity < p.minQty) {
      setQuantity(p.minQty);
    }
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await api.post('/bulk-inquiries', {
        name,
        email,
        phone,
        companyOrEvent,
        eventType,
        productInterest: selectedProduct.name,
        estimatedQuantity: quantity,
        targetDate,
        budgetRange,
        customizationDetails: `${customizationDetails}\n(Estimated Tier: ${discountTier.tierName}, Est. Unit Price: ₹${discountedUnitPrice}, Total: ₹${totalDiscounted})`,
      });

      if (res.data?.success) {
        setSubmittedInquiryId(res.data.data?._id || 'INQ-SUCCESS');
        addToast('✨ Bulk inquiry submitted successfully! Our lead artisan will contact you.', 'success');
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to submit inquiry. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenWhatsAppQuote = () => {
    const rawNumber = settings.whatsappNumber || '+91 98765 43210';
    const cleanNumber = cleanWhatsAppPhone(rawNumber);

    const message = `✨ *BULK / CORPORATE GIFTING INQUIRY - RASIN ARTS STUDIO* ✨
-----------------------------------------
🏢 *Client / Company:* ${companyOrEvent || 'Corporate Client'}
👤 *Contact Name:* ${name || 'Prospective Client'}
📱 *Phone:* ${phone || 'N/A'}
✉️ *Email:* ${email || 'N/A'}

📦 *Selected Product:* ${selectedProduct.name}
🔢 *Estimated Quantity:* ${quantity} units
💰 *Estimated Price:* ${formatINR(discountedUnitPrice)} / unit (${discountTier.percent}% Bulk Off)
💵 *Estimated Budget:* ${formatINR(totalDiscounted)} (Savings: ${formatINR(totalSavings)})
🎉 *Occasion / Event:* ${eventType}
📅 *Target Delivery Date:* ${targetDate || 'Flexible'}

📝 *Custom Requirements / Notes:*
${customizationDetails || 'Interested in custom logo branding & luxury box packaging.'}
-----------------------------------------
Please provide an official quotation and digital sample preview.`;

    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full max-w-[1760px] mx-auto space-y-16 py-10 px-4 sm:px-8 lg:px-12 xl:px-16">
      {/* 1. HERO HEADER */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#FFFDF9] via-amber-50/90 to-rose-50/80 p-8 sm:p-14 border border-amber-200/80 shadow-xl text-center space-y-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-400/20 via-rose-300/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-400/15 via-amber-300/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-900 text-xs font-bold uppercase tracking-widest shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>B2B Corporate Gifting &bull; Wedding Favors &bull; Bulk Orders</span>
        </div>

        <h1
          className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight max-w-4xl mx-auto leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Handcrafted Luxury Resin Favors &amp; Bespoke Corporate Gifts
        </h1>

        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Elevate your brand and celebrations with custom gold-leaf resin artistry. From company logo keychains to geode agate coasters and executive clocks, we offer volume pricing and luxury custom packaging.
        </p>

        {/* Quick Highlights Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6 max-w-4xl mx-auto">
          {[
            { title: 'Volume Discounts', desc: 'Up to 35% Off Tiered Savings', icon: Percent },
            { title: 'Custom Branding', desc: 'Metallic Logo & Name Inlay', icon: Sparkles },
            { title: 'Luxury Packaging', desc: 'Velvet Pouch & Gift Boxes', icon: Gift },
            { title: 'Doorstep Delivery', desc: 'Safe Bubble-Crated Shipping', icon: ShieldCheck },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-amber-200/70 text-left space-y-1 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 text-amber-700">
                  <Icon className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-stone-900">{item.title}</span>
                </div>
                <p className="text-[11px] text-stone-600 font-medium">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. INTERACTIVE LIVE VOLUME DISCOUNT CALCULATOR */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-stone-200 space-y-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700 mb-1">
              <Calculator className="w-4 h-4" />
              <span>Interactive Pricing Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Instant Tiered Volume Discount Calculator
            </h2>
            <p className="text-xs text-stone-600 mt-1 max-w-xl">
              Select a handcrafted resin product and adjust the quantity slider to view your instant unit price, savings, and production timeline.
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0 self-start sm:self-auto shadow-sm">
            {discountTier.tierName}
          </div>
        </div>

        {/* Step 1: Select Product */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
            Step 1: Choose Product Category
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {BULK_PRODUCTS.map((prod) => {
              const isSelected = selectedProduct.id === prod.id;
              return (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleProductSelect(prod)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-3 group cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/80 border-amber-500 shadow-md ring-2 ring-amber-500/30'
                      : 'bg-stone-50/70 border-stone-200 hover:border-amber-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 bg-stone-100 border border-stone-200 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] text-amber-700 uppercase font-bold block truncate">
                        {prod.category}
                      </span>
                      <h3 className="text-xs font-bold text-stone-900 truncate">{prod.name}</h3>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-stone-200">
                    <span className="text-stone-500">Min: {prod.minQty} pcs</span>
                    <span className="font-bold text-stone-900 font-mono">{formatINR(prod.basePrice)} / pc</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Slider for Quantity */}
        <div className="p-6 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="text-xs font-bold text-stone-900 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-amber-600" />
                <span>Step 2: Adjust Desired Order Quantity</span>
              </label>
              <span className="text-[11px] text-stone-600">
                Minimum order quantity for this item is {selectedProduct.minQty} units.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={selectedProduct.minQty}
                max={1000}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(selectedProduct.minQty, parseInt(e.target.value) || selectedProduct.minQty))}
                className="w-24 bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-center text-sm font-bold text-stone-900 font-mono focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-sm"
              />
              <span className="text-xs text-stone-600 font-bold">Units</span>
            </div>
          </div>

          <input
            type="range"
            min={selectedProduct.minQty}
            max={500}
            step={5}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {[25, 50, 100, 200, 500].map((qty) => (
              <button
                key={qty}
                type="button"
                onClick={() => setQuantity(Math.max(selectedProduct.minQty, qty))}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  quantity === qty
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-white text-stone-700 hover:text-stone-900 border border-stone-200 hover:border-amber-300'
                }`}
              >
                {qty} pcs
              </button>
            ))}
          </div>
        </div>

        {/* Live Calculation Results Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-2xl bg-gradient-to-br from-emerald-50/40 via-white to-amber-50/30 border border-emerald-300 shadow-md">
          <div className="space-y-1">
            <span className="text-[11px] text-stone-500 uppercase font-bold tracking-wider block">
              Discounted Unit Price
            </span>
            <div className="text-2xl font-black text-emerald-700 font-mono">
              {formatINR(discountedUnitPrice)}
            </div>
            <div className="text-[11px] text-stone-400 line-through">
              Standard: {formatINR(originalUnitPrice)}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-stone-500 uppercase font-bold tracking-wider block">
              Estimated Total Order Value
            </span>
            <div className="text-2xl font-black text-stone-900 font-mono">
              {formatINR(totalDiscounted)}
            </div>
            <div className="text-[11px] text-emerald-700 font-bold">
              You Save: {formatINR(totalSavings)} ({discountTier.percent}% OFF)
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-stone-500 uppercase font-bold tracking-wider block">
              Estimated Studio Turnaround
            </span>
            <div className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{discountTier.leadDays}</span>
            </div>
            <div className="text-[11px] text-stone-500">
              Includes 48h full resin curing &amp; polishing
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-2">
            <button
              type="button"
              onClick={handleOpenWhatsAppQuote}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Instant WhatsApp Quote</span>
            </button>
            <a
              href="#inquiry-form"
              className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold text-center transition-colors block border border-stone-300"
            >
              Submit Custom Request
            </a>
          </div>
        </div>
      </div>

      {/* 3. PRODUCT CATALOG SHOWCASE */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Artisanal Collections
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            Curated Bulk Gifting Favourites
          </h2>
          <p className="text-xs text-stone-600 max-w-xl mx-auto">
            Each item is handcrafted with premium non-yellowing epoxy resin, sealed real botanical elements, and custom metallic monogram engravings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BULK_PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              className="p-6 rounded-3xl bg-white border border-stone-200 flex flex-col sm:flex-row gap-6 items-start hover:border-amber-300 hover:shadow-lg transition-all shadow-md"
            >
              <img
                src={prod.image}
                alt={prod.name}
                className="w-full sm:w-44 h-44 rounded-2xl object-cover bg-stone-100 border border-stone-200 shrink-0"
              />
              <div className="space-y-3 flex-1">
                <div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                    {prod.category}
                  </span>
                  <h3 className="text-base font-bold text-stone-900">{prod.name}</h3>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{prod.description}</p>
                <div className="space-y-1.5 pt-1">
                  {prod.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-stone-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-stone-200">
                  <div>
                    <span className="text-[10px] text-stone-500">Starting from</span>
                    <div className="text-sm font-bold text-stone-900 font-mono">
                      {formatINR(Math.round(prod.basePrice * 0.8))} <span className="text-[10px] text-stone-500 font-normal">/ unit (Bulk)</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleProductSelect(prod);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all flex items-center gap-1.5 border border-amber-200 cursor-pointer"
                  >
                    <span>Calculate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. WORKFLOW / HOW IT WORKS */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-stone-50 via-white to-amber-50/40 border border-stone-200 space-y-8 text-center shadow-sm">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Seamless Execution
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            Our 4-Step Luxury Gifting Workflow
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {[
            {
              step: '01',
              title: 'Concept & Consultation',
              desc: 'Select product, resin color palette, custom corporate logo or event initials, and packaging style.',
            },
            {
              step: '02',
              title: '3D Sample & Approval',
              desc: 'We share digital 3D renders and physical prototype photos before casting the full batch.',
            },
            {
              step: '03',
              title: 'Handcrafted Pouring',
              desc: 'Our artisans pour, swirl color pigments, cure for 48 hours, and hand-polish each piece to perfection.',
            },
            {
              step: '04',
              title: 'Gift Packaging & Dispatch',
              desc: 'Each piece is placed in velvet bags or luxury wooden boxes with ribbons, bubble-crated, and shipped.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-amber-200/70 space-y-2 relative shadow-sm">
              <span className="text-2xl font-black text-amber-600/40 font-mono block">
                {item.step}
              </span>
              <h3 className="text-sm font-bold text-stone-900">{item.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. INQUIRY FORM */}
      <div id="inquiry-form" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Get in Touch
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Request a Bespoke Quotation
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Fill out this form with your event requirements. Our studio director will provide an itemized quote, digital mockups, and bulk discount breakdown within 2–4 hours.
            </p>
          </div>

          <div className="space-y-3 p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
            <div className="flex items-center gap-3 text-xs text-stone-700">
              <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Direct Studio WhatsApp: <strong>{settings.whatsappNumber || '+91 98765 43210'}</strong></span>
            </div>
            <div className="flex items-center gap-3 text-xs text-stone-700">
              <Mail className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Corporate Email: <strong>{settings.supportEmail || 'support@rasinarts.com'}</strong></span>
            </div>
            <div className="flex items-center gap-3 text-xs text-stone-700">
              <Award className="w-4 h-4 text-amber-700 shrink-0" />
              <span>GST Invoicing &bull; Input Tax Credit Available</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xl">
            {submittedInquiryId ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-stone-900">Inquiry Received!</h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  Thank you, <strong>{name}</strong>! Your bulk inquiry for <strong>{quantity} units</strong> of <strong>{productInterest}</strong> has been logged in our studio queue.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleOpenWhatsAppQuote}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat with Artisan on WhatsApp Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmittedInquiryId(null)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold cursor-pointer border border-stone-300"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="priya@company.com"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1">
                      Company / Organization / Event Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyOrEvent}
                      onChange={(e) => setCompanyOrEvent(e.target.value)}
                      placeholder="e.g. Acme Tech / Rohit &amp; Sneha Wedding"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1">
                      Occasion / Event Type
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
                    >
                      <option value="Corporate Event / Employee Gifting">Corporate Event / Employee Gifting</option>
                      <option value="Wedding Favors &amp; Return Gifts">Wedding Favors &amp; Return Gifts</option>
                      <option value="Diwali &amp; Festive Hampers">Diwali &amp; Festive Hampers</option>
                      <option value="Housewarming / Luxury Mementos">Housewarming / Luxury Mementos</option>
                      <option value="Brand Promotional Merch">Brand Promotional Merch</option>
                      <option value="VIP Client Appreciation">VIP Client Appreciation</option>
                      <option value="Other">Other Custom Event</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1">
                      Target Delivery Date
                    </label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Custom Branding &amp; Color Preferences
                  </label>
                  <textarea
                    rows={3}
                    value={customizationDetails}
                    onChange={(e) => setCustomizationDetails(e.target.value)}
                    placeholder="e.g. We need emerald green &amp; gold foil swirls with 'TechCorp' metallic logo engraved, packed in individual velvet pouches."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Submitting Inquiry...' : 'Submit Inquiry for Quote'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenWhatsAppQuote}
                    className="w-full sm:w-auto py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Direct WhatsApp</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
