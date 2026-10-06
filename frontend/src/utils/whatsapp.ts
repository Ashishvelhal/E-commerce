import { CartItem } from '../types';

export interface WhatsAppCustomerInfo {
  fullName?: string;
  phone?: string;
  email?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  paymentPreference?: string;
}

export interface WhatsAppOrderParams {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  whatsappNumber?: string;
  customGreeting?: string;
  customerInfo?: WhatsAppCustomerInfo;
}

export const generateWhatsAppOrderUrl = ({
  items,
  subtotal,
  shipping,
  total,
  whatsappNumber = '+91 98765 43210',
  customGreeting = 'Hello Rasin Arts Studio! I would like to place an order for the following items:',
  customerInfo,
}: WhatsAppOrderParams): string => {
  let text = `🛍️ *NEW ORDER - RASIN ARTS LUXURY 3D STUDIO*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `${customGreeting.trim()}\n\n`;
  text += `📦 *ORDERED ITEMS (${items.length} item${items.length !== 1 ? 's' : ''}):*\n`;

  items.forEach((item, index) => {
    const title = item.product.title || (item.product as any).name || 'Handcrafted Resin Piece';
    const unitPrice = item.product.discountPrice || item.product.price;
    const itemTotal = unitPrice * item.quantity;

    text += `\n*${index + 1}. ${title}*\n`;
    text += `   • *Quantity:* ${item.quantity}\n`;
    text += `   • *Price:* ₹${unitPrice.toLocaleString('en-IN')}${
      item.quantity > 1 ? ` (Item Total: ₹${itemTotal.toLocaleString('en-IN')})` : ''
    }\n`;

    if (item.selectedColor) {
      text += `   • *Color / Theme:* ${item.selectedColor}\n`;
    }

    const customOptions = (item.product as any).customizationOptions;
    if (customOptions) {
      if (customOptions.customText) {
        text += `   • *3D Custom Text:* "${customOptions.customText}"\n`;
      }
      if (customOptions.subText) {
        text += `   • *Subtext / Flat No:* "${customOptions.subText}"\n`;
      }
      if (customOptions.shape) {
        text += `   • *Product Category:* ${customOptions.shape}\n`;
      }
      if (customOptions.resinFinish) {
        text += `   • *Resin Colorway:* ${customOptions.resinFinish}\n`;
      }
      if (customOptions.textFinish) {
        text += `   • *Lettering Finish:* ${customOptions.textFinish}\n`;
      }
      if (customOptions.inclusions && Array.isArray(customOptions.inclusions) && customOptions.inclusions.length > 0) {
        text += `   • *Inclusions:* ${customOptions.inclusions.join(', ')}\n`;
      }
      if (customOptions.standOption && customOptions.standOption !== 'none') {
        text += `   • *Mount / Stand:* ${customOptions.standOption}\n`;
      }
    }
  });

  text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `💰 *Subtotal:* ₹${subtotal.toLocaleString('en-IN')}\n`;
  text += `🚚 *Delivery:* ${shipping === 0 ? 'FREE Standard Delivery' : `₹${shipping.toLocaleString('en-IN')}`}\n`;
  text += `🏷️ *Grand Total Payable:* *₹${total.toLocaleString('en-IN')}*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;

  if (customerInfo && customerInfo.fullName && customerInfo.fullName.trim().length > 0) {
    text += `\n👤 *CUSTOMER & DELIVERY DETAILS:*\n`;
    text += `• *Name:* ${customerInfo.fullName.trim()}\n`;
    if (customerInfo.phone && customerInfo.phone.trim()) {
      text += `• *Phone:* ${customerInfo.phone.trim()}\n`;
    }
    if (customerInfo.email && customerInfo.email.trim()) {
      text += `• *Email:* ${customerInfo.email.trim()}\n`;
    }
    const addressParts = [
      customerInfo.street,
      customerInfo.city,
      customerInfo.state,
      customerInfo.postalCode,
    ].filter(Boolean);
    if (addressParts.length > 0) {
      text += `• *Delivery Address:* ${addressParts.join(', ')}\n`;
    }
    if (customerInfo.paymentPreference) {
      text += `• *Payment Preference:* ${customerInfo.paymentPreference}\n`;
    }
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  }

  text += `\n📍 Please confirm this order, estimated dispatch date, and payment instructions. Thank you!`;

  const cleanNumber = cleanWhatsAppPhone(whatsappNumber);

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
};

export const cleanWhatsAppPhone = (phone: string): string => {
  return phone.replace(/[^0-9]/g, '') || '919876543210';
};
