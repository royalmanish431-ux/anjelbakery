import { CartItem } from '../types';
import { BAKERY_INFO } from '../data/bakeryData';

export function generateWhatsAppOrderUrl({
  cartItems,
  grandTotal,
  subtotal,
  deliveryCharge,
  packagingCharge,
  discountAmount,
  promoCode,
  orderType,
  customerName,
  customerAddress,
  customerPhone,
  specialInstructions,
  orderId,
}: {
  cartItems: CartItem[];
  grandTotal: number;
  subtotal: number;
  deliveryCharge: number;
  packagingCharge: number;
  discountAmount?: number;
  promoCode?: string;
  orderType: 'delivery' | 'dinein' | 'takeaway' | 'pickup';
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
  specialInstructions?: string;
  orderId?: string;
}): string {
  const dateStr = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const orderTypeLabel = 
    orderType === 'dinein' ? 'Dine-In 🍽️' :
    orderType === 'takeaway' ? 'Takeaway 🛍️' : 'Home Delivery 🚀';

  let message = `🎂 *NEW ORDER - ${BAKERY_INFO.name.toUpperCase()}* 🎂\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  if (orderId) {
    message += `📋 *Order ID:* ${orderId}\n`;
  }
  message += `⏱ *Time:* ${dateStr}\n`;
  message += `🚚 *Order Preference:* ${orderTypeLabel}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  message += `🛍️ *ORDER ITEMS:*\n`;
  cartItems.forEach((item, index) => {
    message += `${index + 1}. *${item.item.name}* x ${item.quantity} = ₹${item.selectedPrice * item.quantity}\n`;
    if (item.selectedSize) {
      message += `   • Size/Weight: ${item.selectedSize}\n`;
    }
    if (item.extraCheese) {
      message += `   • Extra Cheese Burst (+₹${item.extraCheesePrice || 20})\n`;
    }
    if (item.cakeMessage) {
      message += `   • Plaque Message: "${item.cakeMessage}"\n`;
    }
    if (item.specialNote) {
      message += `   • Note: ${item.specialNote}\n`;
    }
  });

  message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💵 *BILL SUMMARY:*\n`;
  message += `• Items Subtotal: ₹${subtotal}\n`;
  message += `• Delivery Fee: ${deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}\n`;
  message += `• Packaging: ₹${packagingCharge}\n`;
  if (discountAmount && discountAmount > 0) {
    message += `• Discount (${promoCode || 'PROMO'}): -₹${discountAmount}\n`;
  }
  message += `\n💰 *TOTAL PAYABLE: ₹${grandTotal}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  message += `📍 *DELIVERY / CUSTOMER DETAILS:*\n`;
  message += `• Customer: ${customerName || 'Customer'}\n`;
  message += `• Address: ${customerAddress || 'Patiyapara Chowk, Chandpur, Uttar Pradesh 246725'}\n`;
  if (customerPhone) {
    message += `• Phone: ${customerPhone}\n`;
  }
  if (specialInstructions && specialInstructions.trim()) {
    message += `• Note/Instructions: ${specialInstructions.trim()}\n`;
  }
  message += `\n📍 *Bakery Location:* ${BAKERY_INFO.address}\n`;
  message += `📞 *Owner Phone:* ${BAKERY_INFO.phone}\n\n`;
  message += `_Please confirm my order and share the estimated preparation/delivery time. Thank you!_ 🙏`;

  const encoded = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${BAKERY_INFO.whatsappNumber}&text=${encoded}`;
}

export function getDirectWhatsAppInquiryUrl(customMessage?: string): string {
  const text = customMessage || `Hello Angel Bakery, I want to inquire about cakes and menu items at your Chandpur branch (Patiyapara Chowk).`;
  return `https://api.whatsapp.com/send?phone=${BAKERY_INFO.whatsappNumber}&text=${encodeURIComponent(text)}`;
}
