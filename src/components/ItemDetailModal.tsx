import { useState, useEffect } from 'react';
import { X, Star, Plus, Minus, Check, Sparkles, Youtube, Instagram, ExternalLink } from 'lucide-react';
import { BakeryItem, CartItem } from '../types';
import { CATEGORY_DEFAULT_IMAGES } from '../data/bakeryData';

interface ItemDetailModalProps {
  item: BakeryItem | null;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
}

export default function ItemDetailModal({
  item,
  onClose,
  onAddToCart,
  isFavorited,
  onToggleFavorite,
}: ItemDetailModalProps) {
  const isPizza = Boolean(item?.category.includes('pizza'));
  const isCake = Boolean(item?.category === 'cakes');

  const hasMedium = Boolean(item?.mediumPrice && item.mediumPrice > 0);
  const hasLarge = Boolean(item?.largePrice && item.largePrice > 0);
  const hasMultipleSizes = Boolean(hasMedium || hasLarge);

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [extraCheese, setExtraCheese] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cakeMessage, setCakeMessage] = useState('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Sync state whenever opened item changes
  useEffect(() => {
    if (!item) return;
    const hasMed = Boolean(item.mediumPrice && item.mediumPrice > 0);
    const hasLrg = Boolean(item.largePrice && item.largePrice > 0);
    const hasMult = hasMed || hasLrg;
    const isC = item.category === 'cakes';

    if (hasMult) {
      if (isC) {
        setSelectedSize(hasMed ? '0.5 kg' : '1 kg');
      } else {
        setSelectedSize('Regular');
      }
    } else {
      setSelectedSize('');
    }
    setQuantity(1);
    setExtraCheese(false);
    setCakeMessage('');
    setAddedSuccess(false);
  }, [item?.id]);

  if (!item) return null;

  // Real size variants only when present in Google Sheet
  const pizzaSizes = hasMultipleSizes ? [
    { label: 'Regular (7")', price: item.price, key: 'Regular' },
    ...(hasMedium ? [{ label: 'Medium (9")', price: item.mediumPrice!, key: 'Medium' }] : []),
    ...(hasLarge ? [{ label: 'Large (12")', price: item.largePrice!, key: 'Large' }] : []),
  ] : [];

  const cakeSizes = hasMultipleSizes ? [
    ...(hasMedium ? [{ label: item.mediumRaw || '450 Gram (0.5 kg)', price: item.mediumPrice!, key: '0.5 kg' }] : []),
    { label: '1.0 kg', price: item.price, key: '1 kg' },
    ...(hasLarge ? [{
      label: item.largePrice! < item.price ? (item.largeRaw || '225 Gram') : (item.largeRaw || '2.0 kg'),
      price: item.largePrice!,
      key: item.largePrice! < item.price ? '225 Gram' : '2 kg',
    }] : []),
  ] : [];

  // Calculate unit price strictly based on real sheet price
  let unitPrice = item.price;
  if (hasMultipleSizes) {
    if (isPizza) {
      const matched = pizzaSizes.find((s) => s.key === selectedSize);
      unitPrice = matched ? matched.price : item.price;
    } else if (isCake) {
      const matched = cakeSizes.find((s) => s.key === selectedSize);
      unitPrice = matched ? matched.price : item.price;
    }
  }

  // Extra cheese cost
  const cheesePrice = isPizza && extraCheese 
    ? (selectedSize === 'Large' ? 40 : selectedSize === 'Medium' ? 30 : 20) 
    : 0;

  const finalUnitPrice = unitPrice + cheesePrice;
  const totalPrice = finalUnitPrice * quantity;

  const handleAdd = () => {
    onAddToCart({
      item,
      quantity,
      selectedSize: hasMultipleSizes ? selectedSize : undefined,
      selectedPrice: finalUnitPrice,
      extraCheese: isPizza ? extraCheese : undefined,
      extraCheesePrice: cheesePrice > 0 ? cheesePrice : undefined,
      cakeMessage: isCake && cakeMessage ? cakeMessage : undefined,
    });
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[2200] flex items-end sm:items-center justify-center bg-stone-950/70 backdrop-blur-sm p-0 sm:p-4">
      <div 
        className="w-full max-w-lg md:max-w-xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Visual Box with Real Photo or Fallback */}
        <div className="relative h-56 bg-stone-900 flex items-center justify-center overflow-hidden border-b border-stone-200">
          <img
            src={item.imageUrl || CATEGORY_DEFAULT_IMAGES[item.category] || CATEGORY_DEFAULT_IMAGES['all']}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              target.src = CATEGORY_DEFAULT_IMAGES[item.category] || CATEGORY_DEFAULT_IMAGES['all'];
            }}
          />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-stone-700 hover:text-stone-950 z-20 backdrop-blur-xs transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {(item.offerTag || item.badge) && (
            <span className="absolute top-3 left-3 bg-[#b3001e] text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm uppercase tracking-wide z-20 flex items-center gap-1">
              <span>🔥 {item.offerTag || item.badge}</span>
            </span>
          )}

          {item.imageUrl && (
            <div className="absolute bottom-2 left-3 bg-stone-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1 z-20 border border-white/20">
              <span>📷 Original Product Photo</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          <div>
            <div className="flex items-center gap-2">
              {/* Zomato Pure Veg symbol */}
              <div className="w-4 h-4 border-2 border-emerald-600 rounded-xs flex items-center justify-center p-[2px] shrink-0">
                <div className="w-2 h-2 rounded-full bg-emerald-600" />
              </div>
              <h3 className="font-bold text-base text-stone-900 leading-snug">
                {item.name}
              </h3>
            </div>

            <div className="flex items-center gap-2 text-stone-500 text-[11px] mt-1 ml-6">
              <span className="flex items-center text-white bg-emerald-700 text-[10px] font-bold px-1.5 py-0.2 rounded gap-0.5">
                {item.rating} <Star className="w-2.5 h-2.5 fill-current" />
              </span>
              <span>({item.reviewsCount} reviews)</span>
              <span>·</span>
              <span>{item.prepTimeMinutes} mins</span>
            </div>

            <p className="text-stone-600 text-xs mt-2 ml-6 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Social Media Links (Column H: Instagram, Column I: YouTube from Sheet) */}
          {(item.youtubeUrl || item.instagramUrl) && (
            <div className="pt-2 border-t border-stone-100">
              <div className="text-[10px] font-black uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
                <span>📹 Product Video & Reels</span>
                <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">HD Video</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {item.youtubeUrl ? (
                  <a
                    href={item.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition-all shadow-2xs"
                  >
                    <Youtube className="w-4 h-4 fill-red-600 text-red-600" />
                    <span className="truncate">{item.youtubeUrl.includes('/shorts/') ? 'YouTube Shorts' : 'YouTube Video'}</span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-70 shrink-0" />
                  </a>
                ) : (
                  <a
                    href="https://www.youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 text-xs font-medium"
                  >
                    <Youtube className="w-4 h-4 text-stone-400" />
                    <span>YouTube</span>
                  </a>
                )}

                {item.instagramUrl ? (
                  <a
                    href={item.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 border border-pink-200 text-pink-700 text-xs font-bold transition-all shadow-2xs"
                  >
                    <Instagram className="w-4 h-4 text-pink-600" />
                    <span className="truncate">Instagram Reel</span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-70 shrink-0" />
                  </a>
                ) : (
                  <a
                    href="https://www.instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 text-xs font-medium"
                  >
                    <Instagram className="w-4 h-4 text-stone-400" />
                    <span>Instagram</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Pizza Size Selection - only rendered if multiple real sizes exist in sheet */}
          {isPizza && hasMultipleSizes && pizzaSizes.length > 1 && (
            <div className="pt-3 border-t border-stone-100">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wide">
                  Choose Pizza Size <span className="text-rose-600">*</span>
                </h4>
                <span className="text-[10px] text-stone-400">Required</span>
              </div>
              <div className="space-y-2">
                {pizzaSizes.map((size) => (
                  <label
                    key={size.key}
                    onClick={() => setSelectedSize(size.key)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedSize === size.key
                        ? 'border-[#e23744] bg-rose-50/70 font-semibold shadow-2xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <input
                        type="radio"
                        name="pizza-size"
                        checked={selectedSize === size.key}
                        onChange={() => setSelectedSize(size.key)}
                        className="text-[#e23744] focus:ring-[#e23744] accent-[#e23744] w-4 h-4 shrink-0"
                      />
                      <span className="text-xs truncate">{size.label}</span>
                    </div>
                    <span className="font-bold tabular-nums text-stone-900 shrink-0 whitespace-nowrap ml-3 text-xs sm:text-sm">
                      ₹{size.price}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Cake Weight Selection - only rendered if multiple real prices exist in sheet */}
          {isCake && hasMultipleSizes && cakeSizes.length > 1 && (
            <div className="pt-3 border-t border-stone-100">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wide">
                  Select Cake Weight <span className="text-rose-600">*</span>
                </h4>
                <span className="text-[10px] text-stone-400">100% Pure Veg</span>
              </div>
              <div className="space-y-2">
                {cakeSizes.map((size) => (
                  <label
                    key={size.key}
                    onClick={() => setSelectedSize(size.key)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedSize === size.key
                        ? 'border-[#e23744] bg-rose-50/70 font-semibold shadow-2xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <input
                        type="radio"
                        name="cake-size"
                        checked={selectedSize === size.key}
                        onChange={() => setSelectedSize(size.key)}
                        className="text-[#e23744] focus:ring-[#e23744] accent-[#e23744] w-4 h-4 shrink-0"
                      />
                      <span className="text-xs truncate">{size.label}</span>
                    </div>
                    <span className="font-bold tabular-nums text-stone-900 shrink-0 whitespace-nowrap ml-3 text-xs sm:text-sm">
                      ₹{size.price}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Cake Inscription Message for all cakes */}
          {isCake && (
            <div className="pt-3 border-t border-stone-100">
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Cake Message / Name on Plaque (Optional):
              </label>
              <input
                type="text"
                maxLength={35}
                value={cakeMessage}
                onChange={(e) => setCakeMessage(e.target.value)}
                placeholder="e.g. Happy Birthday 🎉"
                className="w-full p-2.5 border border-stone-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#e23744]"
              />
            </div>
          )}

          {/* Pizza Add-ons (Extra Cheese) */}
          {isPizza && (
            <div className="pt-3 border-t border-stone-100">
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wide mb-2">
                Add-ons & Extras
              </h4>
              <label 
                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                  extraCheese ? 'border-[#e23744] bg-rose-50/70' : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={extraCheese}
                    onChange={(e) => setExtraCheese(e.target.checked)}
                    className="rounded text-[#e23744] focus:ring-[#e23744] w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-semibold text-stone-900">Add Extra Cheese Burst</span>
                    <span className="block text-[10px] text-stone-500">100% Mozzarella blend</span>
                  </div>
                </div>
                <span className="font-bold tabular-nums text-stone-900 text-xs">
                  +₹{selectedSize === 'Large' ? 40 : selectedSize === 'Medium' ? 30 : 20}
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer Checkout Strip (Zomato Style) */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center gap-3">
          {/* Quantity selector */}
          <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden shadow-xs">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 flex items-center justify-center text-stone-700 hover:bg-stone-100"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 text-center font-bold text-xs tabular-nums text-stone-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-stone-700 hover:bg-stone-100"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add item button */}
          <button
            onClick={handleAdd}
            disabled={addedSuccess}
            className={`flex-1 h-11 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-between shadow-md transition-all active:scale-[0.99] ${
              addedSuccess ? 'bg-emerald-600' : 'bg-[#b3001e] hover:bg-red-800'
            }`}
          >
            {addedSuccess ? (
              <span className="mx-auto flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Added to Cart!
              </span>
            ) : (
              <>
                <span>Add Item · {quantity} {quantity > 1 ? 'items' : 'item'}</span>
                <span className="text-sm font-extrabold tabular-nums">₹{totalPrice}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
