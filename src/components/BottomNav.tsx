import { Compass, Heart, ShoppingBag, User, ArrowRight } from 'lucide-react';
import { Tab, CartItem } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  setPageTitle: (title: string) => void;
  cartItems: CartItem[];
}

export default function BottomNav({
  activeTab,
  setActiveTab,
  setPageTitle,
  cartItems,
}: BottomNavProps) {
  const totalCount = cartItems.reduce((acc, c) => acc + c.quantity, 0);
  const totalAmount = cartItems.reduce((sum, c) => sum + c.selectedPrice * c.quantity, 0);

  return (
    <>
      {/* Signature Zomato Floating Cart Bar (appears when items > 0 and not on cart tab) */}
      {totalCount > 0 && activeTab !== 'cart' && (
        <div className="fixed bottom-[68px] md:bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[456px] md:max-w-lg z-[998] animate-in slide-in-from-bottom-2 duration-150">
          <div 
            onClick={() => {
              setActiveTab('cart');
              setPageTitle('Cart');
            }}
            className="bg-[#e23744] text-white rounded-xl px-4 py-3 shadow-lg flex items-center justify-between cursor-pointer hover:bg-[#cb2a37] transition-all"
          >
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/90 font-bold">
                {totalCount} {totalCount === 1 ? 'ITEM' : 'ITEMS'} ADDED
              </div>
              <div className="text-sm font-black tabular-nums">
                ₹{totalAmount} <span className="text-[10px] font-normal text-white/80">plus taxes</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide">
              <span>View Cart</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Bar (Mobile Only: hidden on md and up) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full h-[58px] bg-white flex justify-around items-center border-t border-stone-200 z-[999] shadow-lg px-6">
        {/* Home */}
        <button
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] text-[11px] transition-colors ${
            activeTab === 'home'
              ? 'text-[#b3001e] font-bold'
              : 'text-stone-500 hover:text-stone-800 font-medium'
          }`}
          onClick={() => {
            setActiveTab('home');
            setPageTitle('Angel Bakery');
          }}
          aria-label="Home"
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === 'home' ? 2.5 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Home</span>
        </button>

        {/* Cart */}
        <button
          className={`relative flex flex-col items-center justify-center min-w-[64px] min-h-[44px] text-[11px] transition-colors ${
            activeTab === 'cart'
              ? 'text-[#b3001e] font-bold'
              : 'text-stone-500 hover:text-stone-800 font-medium'
          }`}
          onClick={() => {
            setActiveTab('cart');
            setPageTitle('Your Cart');
          }}
          aria-label="Cart"
        >
          <div className="relative">
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === 'cart' ? 2.5 : 2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#b3001e] text-white font-black text-[10px] min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center shadow-xs">
                {totalCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>

        {/* Profile */}
        <button
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] text-[11px] transition-colors ${
            activeTab === 'profile'
              ? 'text-[#b3001e] font-bold'
              : 'text-stone-500 hover:text-stone-800 font-medium'
          }`}
          onClick={() => {
            setActiveTab('profile');
            setPageTitle('Customer Profile');
          }}
          aria-label="Profile"
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === 'profile' ? 2.5 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Profile</span>
        </button>
      </nav>
    </>
  );
}
