/**
 * Centralized Resin Art Pricing & Chemistry Calculator Engine
 */

export interface CostBreakdownInputs {
  resinWeightGrams: number;
  resinPricePerGram: number;
  pigmentCost: number;
  hardwareCost: number;
  packagingCost: number;
  laborMinutes: number;
  hourlyWage: number;
  overheadCost: number;
  profitMarginPercent: number;
}

export interface PricingCalculationResult {
  resinCost: number;
  laborCost: number;
  totalMaterialCost: number;
  totalUnitCost: number;
  recommendedPrice: number;
  profitPerPiece: number;
  markupPercent: number;
}

export interface ProductCostingTemplate {
  label: string;
  name: string;
  resin: number;
  pigment: number;
  hardware: number;
  packaging: number;
  laborMins: number;
  margin: number;
}

export const PRODUCT_COSTING_TEMPLATES: ProductCostingTemplate[] = [
  { label: '💎 Keychain', name: 'Custom Alphabet / Shaker Keychain', resin: 30, pigment: 15, hardware: 20, packaging: 15, laborMins: 15, margin: 60 },
  { label: '☕ Coaster', name: 'Ocean Wave Geode Coaster', resin: 80, pigment: 25, hardware: 0, packaging: 25, laborMins: 20, margin: 55 },
  { label: '📖 Bookmark', name: 'Floral Gold Flake Bookmark', resin: 30, pigment: 15, hardware: 10, packaging: 15, laborMins: 12, margin: 60 },
  { label: '💍 Jewelry Pendant', name: 'Preserved Flower Pendant Necklace', resin: 20, pigment: 20, hardware: 35, packaging: 20, laborMins: 25, margin: 65 },
  { label: '🪴 Trinket Tray', name: 'Marble Agate Vanity Tray', resin: 160, pigment: 40, hardware: 60, packaging: 35, laborMins: 35, margin: 55 },
  { label: '🏷️ Name Plate', name: 'Personalized Acrylic & Resin Desk Plate', resin: 250, pigment: 50, hardware: 40, packaging: 40, laborMins: 45, margin: 55 },
  { label: '🕰️ Wall Clock', name: '12-inch Luxury Crystal Wall Clock', resin: 350, pigment: 80, hardware: 120, packaging: 60, laborMins: 60, margin: 60 },
  { label: '🌸 Flower Cube', name: 'Wedding Floral Keepsake Cube', resin: 300, pigment: 30, hardware: 0, packaging: 50, laborMins: 50, margin: 65 },
];

/**
 * Calculates total unit cost, recommended selling price, and profit margin
 */
export const calculatePricing = (inputs: CostBreakdownInputs): PricingCalculationResult => {
  const {
    resinWeightGrams,
    resinPricePerGram,
    pigmentCost,
    hardwareCost,
    packagingCost,
    laborMinutes,
    hourlyWage,
    overheadCost,
    profitMarginPercent,
  } = inputs;

  const resinCost = resinWeightGrams * resinPricePerGram;
  const laborCost = (laborMinutes / 60) * hourlyWage;
  const totalMaterialCost = resinCost + pigmentCost + hardwareCost + packagingCost;
  const totalUnitCost = totalMaterialCost + laborCost + overheadCost;

  const marginDecimal = profitMarginPercent / 100;
  const recommendedPrice =
    marginDecimal < 1
      ? Math.round(totalUnitCost / (1 - marginDecimal))
      : Math.round(totalUnitCost * 2);

  const profitPerPiece = recommendedPrice - totalUnitCost;
  const markupPercent = totalUnitCost > 0 ? (profitPerPiece / totalUnitCost) * 100 : 0;

  return {
    resinCost,
    laborCost,
    totalMaterialCost,
    totalUnitCost,
    recommendedPrice,
    profitPerPiece,
    markupPercent,
  };
};

export interface QuoteGenerationParams {
  itemName: string;
  resinWeightGrams: number;
  resinCost: number;
  pigmentCost: number;
  hardwareCost: number;
  laborMinutes: number;
  laborCost: number;
  packagingCost: number;
  overheadCost: number;
  recommendedPrice: number;
  language: 'en' | 'hi' | 'mr';
}

/**
 * Generates formatted, multilingual client quotation text ready for WhatsApp/Email sharing
 */
export const generateMultilingualQuote = (params: QuoteGenerationParams): string => {
  const {
    itemName,
    resinWeightGrams,
    resinCost,
    pigmentCost,
    hardwareCost,
    laborMinutes,
    laborCost,
    packagingCost,
    overheadCost,
    recommendedPrice,
    language,
  } = params;

  if (language === 'hi') {
    return `🎨 *रेज़िन आर्ट्स — ग्राहक कोटेशन*
━━━━━━━━━━━━━━━━━━━━
📦 *उत्पाद*: ${itemName}
🧪 *कच्चा रेजिन*: ${resinWeightGrams}g (₹${resinCost.toFixed(0)})
🎨 *रंग व पिगमेंट*: ₹${pigmentCost}
🧰 *हार्डवेयर व फिटिंग*: ₹${hardwareCost}
⏱️ *कारीगरी मजदूरी*: ${laborMinutes} मिनट (₹${laborCost.toFixed(0)})
🎁 *उपहार पैकेजिंग*: ₹${packagingCost}
⚡ *स्टूडियो खर्च*: ₹${overheadCost}
━━━━━━━━━━━━━━━━━━━━
💰 *अंतिम विक्रय मूल्य*: ₹${recommendedPrice.toLocaleString('en-IN')}
✨ *निर्माण समय*: 3 से 5 कार्य दिवस
━━━━━━━━━━━━━━━━━━━━`;
  }

  if (language === 'mr') {
    return `🎨 *रेझिन आर्ट्स — ग्राहक कोटेशन*
━━━━━━━━━━━━━━━━━━━━
📦 *उत्पाद*: ${itemName}
🧪 *कच्चा रेझिन*: ${resinWeightGrams}g (₹${resinCost.toFixed(0)})
🎨 *रंग व मायका पिगमेंट*: ₹${pigmentCost}
🧰 *हार्डवेअर व कड्या*: ₹${hardwareCost}
⏱️ *कारीगरी मजुरी*: ${laborMinutes} मिनिटे (₹${laborCost.toFixed(0)})
🎁 *गिफ्ट पॅकेजिंग*: ₹${packagingCost}
⚡ *स्टुडिओ खर्च*: ₹${overheadCost}
━━━━━━━━━━━━━━━━━━━━
💰 *अंतिम विक्री किंमत*: ₹${recommendedPrice.toLocaleString('en-IN')}
✨ *तयार करण्याचा कालावधी*: 3 ते 5 कामकाजाचे दिवस
━━━━━━━━━━━━━━━━━━━━`;
  }

  return `🎨 *Rasin Arts — Client Quotation*
━━━━━━━━━━━━━━━━━━━━
📦 *Item*: ${itemName}
🧪 *Raw Resin*: ${resinWeightGrams}g (₹${resinCost.toFixed(0)})
🎨 *Pigments & Inks*: ₹${pigmentCost}
🧰 *Hardware & Findings*: ₹${hardwareCost}
⏱️ *Crafting Labor*: ${laborMinutes} mins (₹${laborCost.toFixed(0)})
🎁 *Luxury Gift Packaging*: ₹${packagingCost}
⚡ *Studio Overheads*: ₹${overheadCost}
━━━━━━━━━━━━━━━━━━━━
💰 *Quoted Selling Price*: ₹${recommendedPrice.toLocaleString('en-IN')}
✨ *Production Window*: 3 to 5 business days
━━━━━━━━━━━━━━━━━━━━`;
};
