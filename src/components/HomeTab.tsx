import { useState, useMemo, useEffect, type MouseEvent } from 'react';
import { 
  Star, 
  Plus, 
  Minus, 
  MapPin, 
  Navigation, 
  MessageCircle, 
  Phone,
  RotateCw,
  ExternalLink,
  ShoppingBag,
  Youtube,
  Instagram,
  Download,
  Share2,
  Sparkles,
  Flame,
  ArrowRight
} from 'lucide-react';
import { BakeryCategory, BakeryItem, CartItem, DeliverySettings } from '../types';
import { BAKERY_CATEGORIES, BAKERY_ITEMS, BAKERY_INFO, GOOGLE_SHEET_URL, CATEGORY_DEFAULT_IMAGES, APK_DOWNLOAD_URL } from '../data/bakeryData';
import { getDirectWhatsAppInquiryUrl } from '../utils/whatsapp';

interface HomeTabProps {
  items?: BakeryItem[];
  onSelectItem: (item: BakeryItem) => void;
  onAddToCart: (cartItem: CartItem) => void;
  onUpdateCartItemQty: (itemId: string, delta: number) => void;
  cartItems: CartItem[];
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
  searchQuery: string;
  showFilters: boolean;
  onOpenLocation: () => void;
  onRefreshSheet?: () => void;
  isSyncingSheet?: boolean;
  deliverySettings?: DeliverySettings;
}

export default function HomeTab({
  items,
  onSelectItem,
  onAddToCart,
  onUpdateCartItemQty,
  cartItems,
  searchQuery,
  onOpenLocation,
  onRefreshSheet,
  isSyncingSheet,
  deliverySettings,
}: HomeTabProps) {
  const menuItems = items && items.length > 0 ? items : BAKERY_ITEMS;
  const storeOffer = deliverySettings?.storeOffer;
  const [selectedCategory, setSelectedCategory] = useState<BakeryCategory>('all');
  const [selectedItemSizes, setSelectedItemSizes] = useState<Record<string, string>>({});

  // Filter items that actually have an offer in Google Sheet Column L
  const offerItems = useMemo(() => {
    return menuItems.filter((item) => Boolean(item.offerTag && item.offerTag.trim()));
  }, [menuItems]);

  const [activeOfferIndex, setActiveOfferIndex] = useState(0);

  // Auto-rotate through offer items every 4 seconds with smooth animated transition
  useEffect(() => {
    if (offerItems.length <= 1) return;
    const interval = setInterval(() => {
      setActiveOfferIndex((prev) => (prev + 1) % offerItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [offerItems.length]);

  const currentOfferItem = offerItems.length > 0 ? offerItems[activeOfferIndex % offerItems.length] : null;

  // Dynamically compute category tabs from all current menuItems
  // Supports ANY new category added in Google Sheet Column A!
  const categories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number; image: string; icon: string }>();

    // 1. Always 'all' as the very first category
    map.set('all', {
      id: 'all',
      name: 'All Items',
      count: menuItems.length,
      image: CATEGORY_DEFAULT_IMAGES['all'] || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
      icon: '🍽️',
    });

    // 2. Aggregate all categories present in menuItems
    for (const item of menuItems) {
      const catId = item.category || 'other';
      const catName = item.categoryLabel || item.category || 'Items';
      const catImg = item.imageUrl || CATEGORY_DEFAULT_IMAGES[catId] || CATEGORY_DEFAULT_IMAGES['all'];
      const icon = item.emoji || '🍽️';

      if (!map.has(catId)) {
        map.set(catId, {
          id: catId,
          name: catName,
          count: 1,
          image: catImg,
          icon,
        });
      } else {
        const existing = map.get(catId)!;
        existing.count += 1;
        // Upgrade image if item has real image
        if (item.imageUrl && (!existing.image || existing.image === CATEGORY_DEFAULT_IMAGES['all'])) {
          existing.image = item.imageUrl;
        }
      }
    }

    return Array.from(map.values());
  }, [menuItems]);

  const whatsappInquiryUrl = getDirectWhatsAppInquiryUrl();

  // Helper to find quantity in cart for an item
  const getItemQuantityInCart = (itemId: string): number => {
    return cartItems
      .filter((c) => c.item.id === itemId)
      .reduce((acc, c) => acc + c.quantity, 0);
  };

  // Add click handler
  const handleAddClick = (e: MouseEvent, item: BakeryItem) => {
    e.stopPropagation();
    if (item.isCustomizable) {
      onSelectItem(item);
    } else {
      onAddToCart({
        item,
        quantity: 1,
        selectedPrice: item.price,
      });
    }
  };

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchHindi = item.nameHindi ? item.nameHindi.toLowerCase().includes(q) : false;
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCat = item.categoryLabel.toLowerCase().includes(q);
      if (!matchName && !matchHindi && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  // Recommended carousel items (bestsellers or special offers)
  const recommendedItems = menuItems.filter((item) => item.bestseller || item.badge || item.offerTag).slice(0, 6);

  return (
    <div className="pb-24 bg-stone-100 min-h-screen">
      {/* 1. Animated Hero Banner showing Sheet Item with Offer */}
      <div className="p-3">
        {currentOfferItem ? (
          <div 
            onClick={() => onSelectItem(currentOfferItem)}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-rose-600 to-[#b3001e] text-white p-4 shadow-md cursor-pointer transition-all hover:shadow-lg active:scale-[0.99]"
          >
            {/* Subtle glow / light flare animation */}
            <div className="absolute -top-10 -left-10 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between gap-3">
              {/* Left Column: Offer Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 bg-black/30 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/20">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-spin" />
                    <span>SPECIAL DEAL</span>
                  </span>
                  <span className="inline-flex items-center gap-1 bg-amber-400 text-stone-950 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase shadow-xs animate-bounce">
                    <Flame className="w-2.5 h-2.5 fill-red-600 text-red-600" />
                    <span>{currentOfferItem.offerTag}</span>
                  </span>
                </div>

                <h2 className="text-lg sm:text-2xl font-black tracking-tight leading-tight uppercase drop-shadow-xs truncate group-hover:text-amber-200 transition-colors">
                  {currentOfferItem.name}
                </h2>
                
                {currentOfferItem.nameHindi && (
                  <p className="text-[11px] text-amber-100 font-medium truncate mt-0.5">
                    {currentOfferItem.nameHindi}
                  </p>
                )}

                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-white drop-shadow-xs">
                    ₹{currentOfferItem.price}
                  </span>
                  {currentOfferItem.category === 'cakes' && (
                    <span className="text-xs text-white/80 font-semibold">/ 1 Kg</span>
                  )}
                </div>

                <p className="text-[11px] text-white/95 mt-1 font-medium leading-snug line-clamp-1">
                  {deliverySettings?.deliveryDescription || 'Free delivery on orders over ₹600 🛺'}
                </p>

                {/* Claim Offer CTA Button */}
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="bg-white text-[#b3001e] hover:bg-amber-100 text-[11px] font-black px-3.5 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-transform group-hover:scale-105">
                    <span>Order Deal Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  {offerItems.length > 1 && (
                    <span className="text-[10px] font-bold text-white/80">
                      {activeOfferIndex + 1} of {offerItems.length} offers
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Animated Item Photo */}
              <div className="relative shrink-0">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/80 shadow-lg bg-stone-900 group-hover:scale-105 transition-all duration-300">
                  <img
                    key={currentOfferItem.id}
                    src={currentOfferItem.imageUrl || CATEGORY_DEFAULT_IMAGES[currentOfferItem.category] || CATEGORY_DEFAULT_IMAGES['all']}
                    alt={currentOfferItem.name}
                    className="w-full h-full object-cover transition-all duration-500 hover:scale-110"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.src = CATEGORY_DEFAULT_IMAGES[currentOfferItem.category] || CATEGORY_DEFAULT_IMAGES['all'];
                    }}
                  />
                  {/* Floating badge */}
                  <div className="absolute bottom-1 right-1 bg-[#b3001e] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs border border-white/40">
                    {currentOfferItem.offerTag}
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination dots if multiple items have offers */}
            {offerItems.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-3 pt-2 border-t border-white/20">
                {offerItems.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveOfferIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === activeOfferIndex ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/40'
                    }`}
                    aria-label={`Go to offer ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Clean Default Banner with Angel Bakery Logo */
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-rose-600 to-[#b3001e] text-white p-4 shadow-md">
            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <div className="inline-flex items-center gap-1.5 bg-black/25 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/20">
                    <span>ANGEL BAKERY CHANDPUR</span>
                  </div>
                </div>
                
                <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight uppercase drop-shadow-xs">
                  {deliverySettings?.deliveryFee === 0 ? 'FREE DELIVERY' : `DELIVERY ₹${deliverySettings?.deliveryFee}`}
                </h2>
                <p className="text-xs text-white/95 mt-1 font-medium max-w-[280px] leading-snug">
                  {deliverySettings?.deliveryDescription || 'Authentic Indian Sweets, Fresh Designer Cakes & Fast Food delivered straight to your door!'}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-white/20 text-[10px] font-bold">
                  <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-md">
                    ⏱️ Fast delivery 30-45 mins
                  </span>
                  <span className="flex items-center gap-1 bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                    🌿 100% PURE VEG
                  </span>
                </div>
              </div>

              {/* Brand Logo Display */}
              <div className="shrink-0">
                <img
                  src={BAKERY_INFO.logo}
                  alt="Angel Bakery"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-lg border-2 border-white/80 bg-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Quick Action Cards (Responsive 2 cols on mobile, 4 cols on desktop) */}
      <div className="px-3 sm:px-5 pb-3 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Card 1: YouTube Channel Subscribe Card */}
        <div className="bg-white rounded-xl p-3 border border-stone-200 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Youtube className="w-4 h-4 fill-current" />
              </div>
              <div className="text-[11px] font-bold text-stone-900 leading-tight">
                Subscribe Channel
              </div>
            </div>
            <p className="text-[10px] text-stone-500 leading-tight line-clamp-1">
              Angel Bakery Chandpur
            </p>
          </div>
          <a
            href="https://www.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 w-full bg-[#b3001e] hover:bg-red-800 text-white text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
          >
            <span>Subscribe</span>
          </a>
        </div>

        {/* Card 2: Download App APK */}
        <div className="bg-white rounded-xl p-3 border border-stone-200 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-bold text-stone-900 leading-tight">
                Download App APK
              </div>
            </div>
            <p className="text-[10px] text-stone-500 leading-tight line-clamp-1">
              Fast ordering on Android
            </p>
          </div>
          <a
            href={APK_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            download="Anjelbakery.apk"
            className="mt-2.5 w-full bg-[#b3001e] hover:bg-red-800 text-white text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
          >
            <span>Download</span>
          </a>
        </div>

        {/* Card 3: Chandpur Store Location (Desktop & Tablet) */}
        <div className="bg-white rounded-xl p-3 border border-stone-200 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-bold text-stone-900 leading-tight">
                Bakery Location
              </div>
            </div>
            <p className="text-[10px] text-stone-500 leading-tight line-clamp-1">
              Patiyapara Chowk, Chandpur
            </p>
          </div>
          <button
            onClick={onOpenLocation}
            className="mt-2.5 w-full bg-stone-800 hover:bg-stone-900 text-white text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <Navigation className="w-3 h-3 text-amber-400" />
            <span>Directions</span>
          </button>
        </div>

        {/* Card 4: WhatsApp Inquiry Helpline */}
        <div className="bg-white rounded-xl p-3 border border-stone-200 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4 fill-current" />
              </div>
              <div className="text-[11px] font-bold text-stone-900 leading-tight">
                Direct WhatsApp
              </div>
            </div>
            <p className="text-[10px] text-stone-500 leading-tight line-clamp-1">
              Chat with owner 8604888113
            </p>
          </div>
          <a
            href={whatsappInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
          >
            <span>Chat Now</span>
          </a>
        </div>
      </div>

      {/* 3. Category Story Avatars ("EAT WHAT MAKES YOU HAPPY") */}
      <div className="bg-white py-3.5 mb-2.5 border-y border-stone-200">
        <div className="px-4 mb-2 flex items-center justify-between">
          <span className="text-[11px] font-black tracking-wider text-stone-600 uppercase">
            EAT WHAT MAKES YOU HAPPY
          </span>
          {onRefreshSheet && (
            <button
              onClick={onRefreshSheet}
              disabled={isSyncingSheet}
              className="text-[10px] font-bold text-[#b3001e] flex items-center gap-1 hover:underline"
              title="Sync images & prices from Google Sheet"
            >
              <RotateCw className={`w-3 h-3 ${isSyncingSheet ? 'animate-spin' : ''}`} />
              <span>{isSyncingSheet ? 'Syncing...' : 'Live Sync'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar px-4">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="flex flex-col items-center gap-1.5 shrink-0 focus:outline-none group"
              >
                <div
                  className={`w-16 h-16 rounded-full p-[2px] transition-all shadow-xs flex items-center justify-center overflow-hidden bg-white ${
                    isSelected
                      ? 'border-[2.5px] border-[#b3001e] ring-2 ring-rose-300 scale-105 shadow-md'
                      : 'border border-stone-200 group-hover:border-stone-400 group-hover:scale-102'
                  }`}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-full"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.src = CATEGORY_DEFAULT_IMAGES['all'];
                    }}
                  />
                </div>
                <span
                  className={`text-[11px] max-w-[76px] text-center truncate ${
                    isSelected ? 'font-black text-[#b3001e]' : 'text-stone-700 font-medium'
                  }`}
                  title={cat.name}
                >
                  {cat.name.replace(' & Sandwiches', '').replace(' & Gift Packs', '').replace(' & Energy', '')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Recommended For You Horizontal Carousel (Screenshot 2) */}
      {selectedCategory === 'all' && !searchQuery && recommendedItems.length > 0 && (
        <div className="mb-4 px-3 sm:px-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black tracking-wide text-stone-900 uppercase">
              RECOMMENDED FOR YOU
            </h3>
            <span className="text-[10px] font-bold text-[#b3001e]">Special Deals</span>
          </div>

          <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-1">
            {recommendedItems.map((item) => {
              const qtyInCart = getItemQuantityInCart(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="w-48 shrink-0 bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-sm transition-shadow"
                >
                  <div>
                    {/* Offer Badge Header - only shown if this item actually has an offerTag in the sheet, or bestseller */}
                    {item.offerTag ? (
                      <div className="bg-[#b3001e] text-white text-[9px] font-black px-2 py-0.5 text-center tracking-wider uppercase truncate flex items-center justify-center gap-1 animate-pulse">
                        <Flame className="w-2.5 h-2.5 fill-white text-white" />
                        <span>{item.offerTag}</span>
                      </div>
                    ) : item.bestseller ? (
                      <div className="bg-amber-600 text-white text-[9px] font-black px-2 py-0.5 text-center tracking-wider uppercase truncate">
                        ⭐ BESTSELLER
                      </div>
                    ) : null}

                    {/* Image / Thumbnail */}
                    <div className="relative h-28 bg-stone-100 overflow-hidden">
                      <img
                        src={item.imageUrl || CATEGORY_DEFAULT_IMAGES[item.category] || CATEGORY_DEFAULT_IMAGES['all']}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.src = CATEGORY_DEFAULT_IMAGES[item.category] || CATEGORY_DEFAULT_IMAGES['all'];
                        }}
                      />
                      {/* Veg indicator & Rating */}
                      <div className="absolute bottom-1.5 left-1.5 bg-white/95 px-1.5 py-0.5 rounded text-[10px] font-bold text-stone-800 flex items-center gap-1 shadow-2xs">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                        <span>{item.rating}</span>
                      </div>

                      {/* Video / Reel badge if available */}
                      {item.youtubeUrl && (
                        <a
                          href={item.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="absolute bottom-1.5 right-1.5 bg-red-600/95 hover:bg-red-700 text-white p-1 rounded-full shadow-xs flex items-center justify-center transition-transform hover:scale-110"
                          title="Watch video on YouTube"
                        >
                          <Youtube className="w-2.5 h-2.5 fill-current" />
                        </a>
                      )}
                    </div>

                    <div className="p-2.5">
                      <div className="text-xs font-bold text-stone-900 leading-tight line-clamp-1">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-stone-500 font-medium">
                        {item.nameHindi || item.categoryLabel}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 pt-0 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-stone-900">
                        ₹{item.price}
                      </div>
                      <div className="text-[9px] text-stone-500">
                        {item.category === 'cakes' ? '/1 Kg' : ''}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleAddClick(e, item)}
                      className="bg-[#b3001e] hover:bg-red-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <span>ADD</span>
                      {qtyInCart > 0 && <span className="text-[9px]">({qtyInCart})</span>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Food Item List (Matching Screenshot 2 Food Cards - Responsive Grid for Laptop) */}
      <div className="px-3 sm:px-5">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-stone-900 uppercase tracking-wide">
              {selectedCategory === 'all' ? 'All Products' : categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}
            </span>
            <span className="text-[10px] font-bold bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded-full">
              {filteredItems.length}
            </span>
          </div>

          <button
            onClick={onOpenLocation}
            className="text-[10px] font-bold text-stone-600 flex items-center gap-1 hover:text-[#b3001e]"
          >
            <Navigation className="w-3 h-3 text-[#b3001e]" />
            <span>Chandpur Store</span>
          </button>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 shadow-2xs my-4">
            <div className="text-4xl mb-2">🍰</div>
            <div className="text-sm font-bold text-stone-800">No items found</div>
            <p className="text-xs text-stone-500 mt-1">
              Try searching for something else like "Rasmalai", "Pizza", or "Cake"
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="mt-3 text-xs font-bold text-[#b3001e] underline"
            >
              View all products
            </button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5">
            {filteredItems.map((item) => {
              const qtyInCart = getItemQuantityInCart(item.id);
              const stockCount = item.stock || (item.category === 'cakes' ? 30 : 67);
              const unitSubtitle = item.category === 'cakes' ? '1 Kg' : '';

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden cursor-pointer hover:shadow-md transition-all flex flex-col justify-between h-full group"
                >
                  {/* Hero Food Image Banner (16:9 ratio) */}
                  <div className="relative aspect-[16/9] w-full bg-stone-100 overflow-hidden">
                    <img
                      src={item.imageUrl || CATEGORY_DEFAULT_IMAGES[item.category] || CATEGORY_DEFAULT_IMAGES['all']}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src = CATEGORY_DEFAULT_IMAGES[item.category] || CATEGORY_DEFAULT_IMAGES['all'];
                      }}
                    />

                    {/* Top Overlay Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                      {/* Veg Symbol */}
                      <div className="w-5 h-5 bg-white/95 rounded-sm border-2 border-emerald-600 flex items-center justify-center shadow-xs">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      </div>
                      
                      {item.offerTag ? (
                        <span className="bg-[#b3001e] text-white text-[9px] font-black px-2 py-0.5 rounded shadow-xs uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
                          <Flame className="w-2.5 h-2.5 fill-white text-white" />
                          <span>{item.offerTag}</span>
                        </span>
                      ) : item.badge ? (
                        <span className="bg-amber-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-xs uppercase tracking-wider flex items-center gap-0.5">
                          <span>⭐ {item.badge}</span>
                        </span>
                      ) : null}
                    </div>

                    {/* Rating Pill */}
                    <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{item.rating}</span>
                      <span className="text-[9px] text-white/80">({item.reviewsCount})</span>
                    </div>

                    {/* Social Buttons Chips at bottom right of image (Column H: Instagram, Column I: YouTube) */}
                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-10" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={item.instagramUrl || "https://www.instagram.com"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/95 hover:bg-white text-rose-700 hover:text-rose-800 text-[10px] font-bold px-2 py-1 rounded-md shadow-xs flex items-center gap-1 backdrop-blur-xs border border-rose-200 transition-all hover:scale-105 active:scale-95"
                        title="Open Instagram Reel (Column H)"
                      >
                        <Instagram className="w-3 h-3 text-pink-600 shrink-0" />
                        <span>Reel</span>
                      </a>
                      <a
                        href={item.youtubeUrl || "https://www.youtube.com"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/95 hover:bg-white text-red-700 hover:text-red-800 text-[10px] font-bold px-2 py-1 rounded-md shadow-xs flex items-center gap-1 backdrop-blur-xs border border-red-200 transition-all hover:scale-105 active:scale-95"
                        title="Open YouTube Video/Shorts (Column I)"
                      >
                        <Youtube className="w-3 h-3 fill-red-600 text-red-600 shrink-0" />
                        <span>{item.youtubeUrl && item.youtubeUrl.includes('/shorts/') ? 'Shorts' : 'YouTube'}</span>
                      </a>
                    </div>
                  </div>

                  {/* Card Content Matching Screenshot 2 */}
                  <div className="p-3.5">
                    {/* Category pill & By owner badge */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                        {item.categoryLabel}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <span>👤 By owner</span>
                      </span>
                    </div>

                    {/* Title in English and Hindi */}
                    <h3 className="text-base font-extrabold text-stone-900 leading-snug">
                      {item.name} {item.nameHindi && <span className="text-stone-600 font-medium">/ {item.nameHindi}</span>}
                    </h3>

                    {/* Description */}
                    <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Rates & Sizes row: ONLY show multiple size pills if mediumPrice or largePrice actually exists in Google Sheet */}
                    {(() => {
                      const hasMedium = item.mediumPrice !== undefined && item.mediumPrice > 0;
                      const hasLarge = item.largePrice !== undefined && item.largePrice > 0;
                      const hasMultipleSizes = hasMedium || hasLarge;

                      // If item has only 1 price in the sheet (e.g. Pista Cake ₹600, sweets, snacks), show single real price + ADD / quantity control
                      if (!hasMultipleSizes) {
                        return (
                          <div className="mt-3 flex items-baseline justify-between border-t border-stone-100 pt-2.5">
                            <div>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-lg font-black text-stone-900">
                                  ₹{item.price}
                                </span>
                                {unitSubtitle && (
                                  <span className="text-xs text-stone-500 font-medium">
                                    / {unitSubtitle}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
                              {qtyInCart > 0 ? (
                                <div className="flex items-center gap-1.5 bg-rose-50 rounded-xl px-2 py-1 border border-rose-200">
                                  <button
                                    onClick={() => onUpdateCartItemQty(item.id, -1)}
                                    className="w-6 h-6 rounded-lg bg-white text-stone-800 font-black flex items-center justify-center hover:bg-stone-200 active:scale-95 shadow-2xs text-xs"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-xs font-black w-5 text-center text-[#b3001e] tabular-nums">
                                    {qtyInCart}
                                  </span>
                                  <button
                                    onClick={() => onUpdateCartItemQty(item.id, 1)}
                                    className="w-6 h-6 rounded-lg bg-[#b3001e] text-white font-black flex items-center justify-center hover:bg-red-800 active:scale-95 shadow-2xs text-xs"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => handleAddClick(e, item)}
                                  className="bg-[#b3001e] hover:bg-red-800 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                                >
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                  <span>ADD +</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      }

                      // Only items with real medium or large prices in the sheet (e.g. Pizzas with ₹100, ₹150, ₹200)
                      const isPizza = item.category.includes('pizza');
                      const isCake = item.category === 'cakes';

                      let variants: { letter: string; label: string; key: string; price: number }[] = [];

                      if (isCake) {
                        // User specified ordering: 1st 1kg, 2nd 0.5kg (its half), 3rd 250 gram (its half)
                        variants.push({ letter: '1kg', label: '1.0 kg', key: '1 kg', price: item.price });
                        if (hasMedium) {
                          variants.push({
                            letter: '0.5k',
                            label: item.mediumRaw || '450 Gram (0.5 kg)',
                            key: '0.5 kg',
                            price: item.mediumPrice!,
                          });
                        }
                        if (hasLarge) {
                          const isGram = item.largePrice! < item.price;
                          variants.push({
                            letter: isGram ? '250g' : '2kg',
                            label: isGram ? (item.largeRaw || '250 gram') : '2.0 kg',
                            key: isGram ? '250 Gram' : '2 kg',
                            price: item.largePrice!,
                          });
                        }
                      } else {
                        variants.push({ letter: 'R', label: 'Regular (7")', key: 'Regular', price: item.price });
                        if (hasMedium) {
                          variants.push({ letter: 'M', label: 'Medium (9")', key: 'Medium', price: item.mediumPrice! });
                        }
                        if (hasLarge) {
                          variants.push({ letter: 'L', label: 'Large (12")', key: 'Large', price: item.largePrice! });
                        }
                      }

                      const defaultSizeKey = variants[0]?.key || 'Regular';
                      const activeSizeKey = selectedItemSizes[item.id] || defaultSizeKey;

                      return (
                        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                          {/* All real rates from sheet: pills with + icon */}
                          <div className="flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                            {variants.map((v) => {
                              const isSelected = activeSizeKey === v.key;
                              const sizeQty = cartItems
                                .filter((c) => c.item.id === item.id && c.selectedSize === v.key)
                                .reduce((sum, c) => sum + c.quantity, 0);

                              return (
                                <div
                                  key={v.key}
                                  onClick={() => {
                                    setSelectedItemSizes((prev) => ({ ...prev, [item.id]: v.key }));
                                  }}
                                  className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 transition-all select-none active:scale-95 ${
                                    isSelected
                                      ? 'border-2 border-rose-500 bg-rose-50 text-[#b3001e] shadow-2xs'
                                      : 'border border-amber-300 bg-amber-50/80 text-stone-800 hover:border-amber-400'
                                  }`}
                                  title={`Select ${v.label} (₹${v.price})`}
                                >
                                  <span className={`text-[10px] font-black uppercase ${isSelected ? 'text-[#b3001e]' : 'text-amber-900'}`}>
                                    {v.letter}
                                  </span>
                                  <span className="font-black text-stone-900 tabular-nums">
                                    ₹{v.price}
                                  </span>

                                  {/* + icon on every rate (or count badge if in cart) */}
                                  {sizeQty > 0 ? (
                                    <span className="bg-[#b3001e] text-white text-[10px] px-1.5 py-0.2 rounded-full font-black min-w-[17px] text-center shadow-xs">
                                      {sizeQty}
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedItemSizes((prev) => ({ ...prev, [item.id]: v.key }));
                                        onAddToCart({
                                          item,
                                          quantity: 1,
                                          selectedSize: v.key,
                                          selectedPrice: v.price,
                                        });
                                      }}
                                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black transition-all hover:scale-110 active:scale-90 ${
                                        isSelected
                                          ? 'bg-[#b3001e] text-white'
                                          : 'bg-amber-200/90 text-amber-950 hover:bg-amber-300'
                                      }`}
                                      title={`Add 1 ${v.label} directly`}
                                    >
                                      +
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* ADD + (count) Button matching Screenshot 2 */}
                          <div className="shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                const chosenVariant = variants.find((v) => v.key === activeSizeKey) || variants[0];
                                onAddToCart({
                                  item,
                                  quantity: 1,
                                  selectedSize: chosenVariant.key,
                                  selectedPrice: chosenVariant.price,
                                });
                              }}
                              className="bg-[#b3001e] hover:bg-red-800 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>ADD +</span>
                              {qtyInCart > 0 && (
                                <span className="text-[11px] font-black">({qtyInCart})</span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Branding Matching Screenshot 1 & 5 */}
      <footer className="mt-8 text-center text-xs text-stone-400 py-4 border-t border-stone-200">
        <p className="font-medium">© 2026 Angel Bakery. All rights reserved.</p>
        <p className="text-[10px] text-stone-400 mt-0.5">
          Patiyapara Chowk, Chandpur, Uttar Pradesh 246725 • +91 86048 88113
        </p>
      </footer>
    </div>
  );
}
