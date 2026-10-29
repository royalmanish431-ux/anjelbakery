import { MapPin, Search, X, ChevronDown, UserCheck, Navigation, ShoppingBag, User, Home, Download, MessageCircle, RotateCw } from 'lucide-react';
import { BAKERY_INFO, APK_DOWNLOAD_URL } from '../data/bakeryData';
import { Tab } from '../types';

interface HeaderProps {
  title?: string;
  onToggleSidebar?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showFilters?: boolean;
  setShowFilters?: (show: boolean) => void;
  activeFilterCount?: number;
  onOpenLocation: () => void;
  activeTab?: Tab;
  setActiveTab?: (tab: Tab) => void;
  cartCount?: number;
  onRefreshSheet?: () => void;
  isSyncingSheet?: boolean;
}

export default function Header({
  searchQuery,
  setSearchQuery,
  onOpenLocation,
  activeTab = 'home',
  setActiveTab,
  cartCount = 0,
  onRefreshSheet,
  isSyncingSheet = false,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-[100] shadow-md bg-[#b3001e] text-white">
      {/* Top micro bar for desktop info announcement */}
      <div className="hidden md:block bg-[#8f0018] text-white/90 text-[11px] font-semibold py-1 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              🌿 <strong className="text-white">100% Pure Veg Bakery</strong>
            </span>
            <span>•</span>
            <span>📍 Patiyapara Chowk, Chandpur, Uttar Pradesh</span>
            <span>•</span>
            <span>⏰ 9:00 AM – 10:30 PM (Daily)</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Free Delivery over ₹600 🛺</span>
            <span>•</span>
            <a 
              href={`tel:${BAKERY_INFO.phone}`} 
              className="text-amber-200 hover:underline font-bold"
            >
              📞 +91 {BAKERY_INFO.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* DESKTOP HEADER (md and above) */}
          <div className="hidden md:flex items-center justify-between gap-6">
            {/* Left: Brand Logo & Location */}
            <div className="flex items-center gap-4 shrink-0">
              <button
                onClick={() => setActiveTab && setActiveTab('home')}
                className="flex items-center gap-2 text-left group"
              >
                <img
                  src={BAKERY_INFO.logo}
                  alt="Angel Bakery Logo"
                  className="w-10 h-10 rounded-full object-cover shadow-md bg-white border border-white/60 group-hover:scale-105 transition-transform shrink-0"
                />
                <div>
                  <div className="text-lg font-black tracking-tight leading-tight flex items-center gap-1.5">
                    <span>Angel Bakery</span>
                  </div>
                  <div className="text-[11px] text-white/80 font-medium">
                    Chandpur, Bijnor (UP)
                  </div>
                </div>
              </button>

              {/* Location Pill */}
              <button
                onClick={onOpenLocation}
                className="flex items-center gap-1.5 bg-black/20 hover:bg-black/30 text-white text-xs px-3 py-1.5 rounded-xl border border-white/20 transition-colors"
                title="View Bakery Location on Google Maps"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="font-bold">Patiyapara Chowk</span>
                <ChevronDown className="w-3 h-3 opacity-80" />
              </button>
            </div>

            {/* Center: Search Box */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <div className="flex items-center bg-white rounded-xl px-3.5 py-2 text-stone-800 gap-2.5 shadow-inner">
                  <Search className="w-4 h-4 text-[#b3001e] shrink-0" />
                  <input
                    type="text"
                    className="w-full bg-transparent text-xs text-stone-800 placeholder-stone-400 outline-none font-medium"
                    placeholder='Search cakes, pizzas, chocolates, pastries, patties...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-0.5 text-stone-400 hover:text-stone-700"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Nav Tabs & Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Navigation links for Desktop */}
              {setActiveTab && (
                <div className="flex items-center bg-black/20 rounded-xl p-1 border border-white/15">
                  <button
                    onClick={() => setActiveTab('home')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'home'
                        ? 'bg-white text-[#b3001e] shadow-xs'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Home</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('cart')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                      activeTab === 'cart'
                        ? 'bg-white text-[#b3001e] shadow-xs'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Cart</span>
                    {cartCount > 0 && (
                      <span className="bg-amber-400 text-stone-950 font-black text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'profile'
                        ? 'bg-white text-[#b3001e] shadow-xs'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Profile</span>
                  </button>
                </div>
              )}

              {/* By Owner Badge */}
              <button
                onClick={onOpenLocation}
                className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-white/25 transition-colors"
                title="Chandpur UP - Verified Owner Store"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>By owner</span>
              </button>

              {/* Download App APK button */}
              <a
                href={APK_DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                download="Anjelbakery.apk"
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-xs"
                title="Download Angel Bakery Android App APK"
              >
                <Download className="w-3.5 h-3.5" />
                <span>App APK</span>
              </a>

              {/* Live sync from sheet if available */}
              {onRefreshSheet && (
                <button
                  onClick={onRefreshSheet}
                  disabled={isSyncingSheet}
                  className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
                  title="Sync with Google Sheet"
                >
                  <RotateCw className={`w-4 h-4 ${isSyncingSheet ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* MOBILE HEADER (< md) Matching original design */}
          <div className="block md:hidden">
            {/* Top Header Row with Logo */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                {/* Angel Bakery Brand Logo */}
                <button
                  onClick={() => setActiveTab && setActiveTab('home')}
                  className="shrink-0 active:scale-95 transition-transform"
                  aria-label="Angel Bakery Home"
                >
                  <img
                    src={BAKERY_INFO.logo}
                    alt="Angel Bakery Logo"
                    className="w-9 h-9 rounded-full object-cover bg-white shadow-xs border border-white/60"
                  />
                </button>

                {/* Location button */}
                <button
                  onClick={onOpenLocation}
                  className="flex items-center gap-1.5 text-left active:opacity-80 transition-opacity min-w-0"
                  title="View Location & Directions"
                >
                  <MapPin className="w-3.5 h-3.5 text-white shrink-0 fill-white/20" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 leading-tight">
                      <span className="text-[13px] font-bold tracking-wide">HOME</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-90" />
                    </div>
                    <div className="text-[11px] text-white/90 truncate max-w-[190px] leading-tight font-medium">
                      Angel Bakery • Patiyapara Chowk
                    </div>
                  </div>
                </button>
              </div>

              {/* Right Action: By Owner Badge */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={onOpenLocation}
                  className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/25 transition-colors"
                  title="Chandpur UP - Verified Owner Store"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>By owner</span>
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative">
              <div className="flex items-center bg-white rounded-lg px-3 py-2 text-stone-800 gap-2 shadow-xs">
                <Search className="w-4 h-4 text-[#b3001e] shrink-0" />
                <input
                  type="text"
                  className="w-full bg-transparent text-xs text-stone-800 placeholder-stone-400 outline-none"
                  placeholder='Search "Gulab Jamun", "Kheer", "Peda", "Cake"...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-0.5 text-stone-400 hover:text-stone-700"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
