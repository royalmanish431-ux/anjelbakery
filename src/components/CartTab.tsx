import { useState, useEffect } from 'react';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft,
  MessageCircle,
  Truck,
  CheckCircle,
  ShoppingBag
} from 'lucide-react';
import { CartItem, UserProfile, DeliverySettings } from '../types';
import { BAKERY_INFO } from '../data/bakeryData';
import { generateWhatsAppOrderUrl } from '../utils/whatsapp';

interface CartTabProps {
  cartItems: CartItem[];
  currentUser?: UserProfile | null;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onSwitchToHome: () => void;
  deliverySettings?: DeliverySettings;
}

export default function CartTab({
  cartItems,
  currentUser,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSwitchToHome,
  deliverySettings,
}: CartTabProps) {
  // Order Preference: Delivery, Dine-In, Takeaway (Matching Screenshot 4)
  const [orderPreference, setOrderPreference] = useState<'delivery' | 'dinein' | 'takeaway'>('delivery');

  // Customer Information (Prefilled from Profile or blank for user input)
  const [customerName, setCustomerName] = useState(currentUser?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.contactNumber || '');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.fullAddress || '');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Sync when currentUser changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.fullName) setCustomerName(currentUser.fullName);
      if (currentUser.contactNumber) setCustomerPhone(currentUser.contactNumber);
      if (currentUser.fullAddress) setDeliveryAddress(currentUser.fullAddress);
    }
  }, [currentUser]);

  // Calculations
  const totalCount = cartItems.reduce((acc, c) => acc + c.quantity, 0);
  const itemsTotal = cartItems.reduce((sum, item) => sum + item.selectedPrice * item.quantity, 0);

  // Delivery fee dynamically set by Owner in Google Sheet Column J (Delivery value) and Column K (Delivery discription)
  const deliveryFee = deliverySettings?.deliveryFee ?? BAKERY_INFO.deliveryFee ?? 50;
  const freeThreshold = deliverySettings?.freeDeliveryThreshold ?? BAKERY_INFO.freeDeliveryThreshold ?? 600;
  const deliveryDescription = deliverySettings?.deliveryDescription || `if till you take a ${freeThreshold} rupay then you get free delivery 🛺`;

  const isFreeDelivery = itemsTotal >= freeThreshold || orderPreference !== 'delivery';
  const estimatedDelivery = orderPreference === 'delivery' ? (isFreeDelivery ? 0 : deliveryFee) : 0;
  const totalAmount = itemsTotal + estimatedDelivery;
  const amountNeededForFreeDelivery = Math.max(0, freeThreshold - itemsTotal);

  // WhatsApp Order Submission link
  const whatsAppOrderUrl = generateWhatsAppOrderUrl({
    cartItems,
    grandTotal: totalAmount,
    subtotal: itemsTotal,
    deliveryCharge: estimatedDelivery,
    packagingCharge: 0,
    promoCode: deliverySettings?.storeOffer,
    orderType: orderPreference,
    customerName,
    customerAddress: deliveryAddress,
    customerPhone,
    specialInstructions,
    orderId: `AB-${Math.floor(10000 + Math.random() * 90000)}`,
  });

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-stone-100 pb-24">
        {/* Top Header */}
        <div className="bg-white px-4 py-3 border-b border-stone-200 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <button
              onClick={onSwitchToHome}
              className="p-1 -ml-1 text-stone-600 hover:text-stone-900"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-extrabold text-stone-900 leading-tight">Your Cart</h1>
              <p className="text-[11px] text-stone-500 font-medium">0 items selected</p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="p-6 text-center mt-12">
          <div className="w-20 h-20 bg-rose-50 text-[#b3001e] rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-xs">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-lg font-bold text-stone-900">Your Cart is Empty</h2>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Explore freshly baked cakes, pizzas, authentic sweets, and snacks from Angel Bakery Chandpur.
          </p>
          <button
            onClick={onSwitchToHome}
            className="mt-6 bg-[#b3001e] hover:bg-red-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs active:scale-95 transition-all"
          >
            Explore Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 pb-28 md:pb-12">
      {/* 1. Header (Matching Screenshot 1 & 4) */}
      <div className="bg-white px-4 sm:px-6 py-3 border-b border-stone-200 sticky top-0 z-50 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onSwitchToHome}
              className="p-1 -ml-1 text-stone-700 hover:text-stone-900 active:scale-95 transition-transform"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-black text-stone-900 leading-tight">Your Cart</h1>
              <p className="text-[11px] text-stone-500 font-medium">
                {totalCount} {totalCount === 1 ? 'item' : 'items'} selected
              </p>
            </div>
          </div>

          <button
            onClick={onClearCart}
            className="text-xs font-bold text-[#b3001e] hover:underline px-2 py-1"
          >
            Clear Cart
          </button>
        </div>
      </div>

      <div className="p-3.5 sm:p-6 max-w-6xl mx-auto lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start space-y-4 lg:space-y-0">
        {/* Left Column (Items, Preference & Customer Info) */}
        <div className="lg:col-span-7 space-y-4">
        {/* 2. Order Preference Segmented Controls (Delivery, Dine-In, Takeaway) */}
        <div>
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 px-1">
            Order Preference
          </div>
          <div className="grid grid-cols-3 gap-2 bg-stone-200/80 p-1 rounded-2xl">
            <button
              onClick={() => setOrderPreference('delivery')}
              className={`py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
                orderPreference === 'delivery'
                  ? 'bg-[#b3001e] text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              <span>Delivery</span>
              <span>🚀</span>
            </button>

            <button
              onClick={() => setOrderPreference('dinein')}
              className={`py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
                orderPreference === 'dinein'
                  ? 'bg-[#b3001e] text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              <span>Dine-In</span>
              <span>🍽️</span>
            </button>

            <button
              onClick={() => setOrderPreference('takeaway')}
              className={`py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
                orderPreference === 'takeaway'
                  ? 'bg-[#b3001e] text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              <span>Takeaway</span>
              <span>🛍️</span>
            </button>
          </div>
        </div>

        {/* 3. Customer Information Card (Screenshot 4) */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-stone-100">
            <h3 className="text-sm font-black text-stone-900 tracking-tight">
              Customer Information
            </h3>
            <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
              Customer Details
            </span>
          </div>

          <div>
            <input
              type="text"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#b3001e] focus:bg-white transition-colors"
              placeholder="Enter your name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div>
            <input
              type="tel"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#b3001e] focus:bg-white transition-colors"
              placeholder="Enter 10-digit mobile number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          {orderPreference === 'delivery' && (
            <div>
              <textarea
                rows={2}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#b3001e] focus:bg-white transition-colors resize-none"
                placeholder="Complete Delivery Address (House No, Street, Landmark, Chandpur)"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </div>
          )}

          <div>
            <input
              type="text"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#b3001e] focus:bg-white transition-colors"
              placeholder="Special instructions (e.g. extra cheese, less spicy)"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
            />
          </div>
        </div>

        {/* 4. ITEMS IN CART Card (Screenshot 4) */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs">
          <div className="text-[11px] font-black text-stone-600 uppercase tracking-wider mb-3">
            ITEMS IN CART ({totalCount})
          </div>

          <div className="divide-y divide-stone-100">
            {cartItems.map((cartItem, index) => {
              const item = cartItem.item;
              const lineTotal = cartItem.selectedPrice * cartItem.quantity;

              return (
                <div key={index} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    {/* Item info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-extrabold text-stone-900 leading-tight">
                          {item.name}
                        </span>
                        {cartItem.selectedSize && (
                          <span className="text-[9px] font-bold bg-rose-50 text-[#b3001e] px-1.5 py-0.5 rounded border border-rose-200">
                            {cartItem.selectedSize}
                          </span>
                        )}
                      </div>

                      {item.nameHindi && (
                        <div className="text-[11px] text-stone-500 font-medium">
                          {item.nameHindi}
                        </div>
                      )}

                      <div className="text-xs font-bold text-[#b3001e] mt-1">
                        ₹{cartItem.selectedPrice}
                        {cartItem.selectedSize ? (
                          <span className="text-[10px] text-stone-500 font-normal ml-1">
                            ({cartItem.selectedSize})
                          </span>
                        ) : (item.category === 'cakes' ? (
                          <span className="text-[10px] text-stone-500 font-normal ml-1">
                            / 1 Kg
                          </span>
                        ) : null)}
                      </div>

                      {cartItem.cakeMessage && (
                        <div className="text-[10px] text-stone-500 italic mt-0.5">
                          "{cartItem.cakeMessage}"
                        </div>
                      )}
                    </div>

                    {/* Quantity controls & Line Total */}
                    <div className="flex items-center gap-3">
                      {/* [- 1 +] counter */}
                      <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200">
                        <button
                          onClick={() => onUpdateQuantity(index, cartItem.quantity - 1)}
                          className="w-6 h-6 rounded bg-white text-stone-800 flex items-center justify-center hover:bg-stone-200 active:scale-95 shadow-2xs"
                          aria-label="Decrease"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black w-6 text-center text-stone-900 tabular-nums">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(index, cartItem.quantity + 1)}
                          className="w-6 h-6 rounded bg-white text-stone-800 flex items-center justify-center hover:bg-stone-200 active:scale-95 shadow-2xs"
                          aria-label="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line total */}
                      <div className="text-sm font-black text-stone-900 tabular-nums min-w-[42px] text-right">
                        ₹{lineTotal}
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => onRemoveItem(index)}
                        className="text-stone-400 hover:text-red-600 p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column (Summary & Checkout on Desktop) */}
      <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
        {/* 5. Order Summary Card (Screenshot 4) */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between text-xs text-stone-700">
            <span>Items Total</span>
            <span className="font-bold text-stone-900 tabular-nums">₹{itemsTotal}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-700">
            <div className="flex items-center gap-1.5">
              <span>Estimated Delivery</span>
              {orderPreference === 'delivery' && estimatedDelivery > 0 && (
                <span className="text-[10px] text-stone-500 font-medium">
                  (Rate: ₹{deliveryFee})
                </span>
              )}
            </div>
            <span className={`font-bold tabular-nums ${estimatedDelivery === 0 ? 'text-emerald-700 font-extrabold' : 'text-stone-900'}`}>
              {estimatedDelivery === 0 ? 'FREE' : `₹${estimatedDelivery}`}
            </span>
          </div>

          {/* Active Store Offer Banner from Column L */}
          {deliverySettings?.storeOffer && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex items-center justify-between text-xs font-bold text-stone-900 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#b3001e] text-white flex items-center justify-center shrink-0 text-xs font-black">
                  🏷️
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500">Owner Special Offer</span>
                  <div className="text-xs font-black text-[#b3001e]">{deliverySettings.storeOffer}</div>
                </div>
              </div>
              <span className="bg-[#b3001e] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Applied
              </span>
            </div>
          )}

          {/* Free Delivery Announcement Alert Banner (Google Sheet Column K: Delivery discription) */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center my-1.5 shadow-2xs">
            <div className="text-[11px] font-bold text-amber-900 leading-tight">
              {deliveryDescription}
            </div>
            <div className="text-[11px] font-black text-amber-700 mt-1">
              {amountNeededForFreeDelivery > 0
                ? `Add ₹${amountNeededForFreeDelivery} more to get FREE Delivery!`
                : `🎉 Congratulations! You unlocked FREE Delivery!`}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-200">
            <span className="text-sm font-extrabold text-stone-900">Total Amount</span>
            <span className="text-base font-black text-emerald-800 tabular-nums">
              ₹{totalAmount}
            </span>
          </div>
        </div>

        {/* 6. Primary Action: Submit Order & Share on WhatsApp (Screenshot 4) */}
        <div className="pt-2">
          <a
            href={whatsAppOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98 transition-all"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Submit Order & Share on WhatsApp</span>
          </a>

          <p className="text-[11px] text-center text-stone-500 font-medium mt-2">
            Order directly to Owner on WhatsApp (+91 {BAKERY_INFO.phone})
          </p>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-stone-400 pt-6">
          <p>© 2026 Angel Bakery. All rights reserved.</p>
        </footer>
      </div>
      </div>
    </div>
  );
}
