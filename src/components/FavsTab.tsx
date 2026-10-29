import { Heart, Plus, Star, ArrowRight } from 'lucide-react';
import { BakeryItem, CartItem } from '../types';
import { BAKERY_ITEMS } from '../data/bakeryData';

interface FavsTabProps {
  items?: BakeryItem[];
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
  onSelectItem: (item: BakeryItem) => void;
  onAddToCart: (cartItem: CartItem) => void;
  onSwitchToHome: () => void;
}

export default function FavsTab({
  items,
  favoriteIds,
  onToggleFavorite,
  onSelectItem,
  onAddToCart,
  onSwitchToHome,
}: FavsTabProps) {
  const allItems = items && items.length > 0 ? items : BAKERY_ITEMS;
  const favoriteItems = allItems.filter((item) => favoriteIds.includes(item.id));

  return (
    <div className="p-4 sm:p-6 pb-28 md:pb-12 bg-stone-100 min-h-screen max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-stone-900">
            Your Favorite Items
          </h2>
          <p className="text-[11px] text-stone-500 font-medium">
            {favoriteItems.length} saved delicacies
          </p>
        </div>
      </div>

      {favoriteItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 my-6 space-y-3">
          <div className="w-14 h-14 bg-rose-50 text-[#b3001e] rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-stone-800 text-sm">
            No Favorites Saved Yet
          </h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            Tap the heart icon on any cake, pizza, burger or chocolate to add it to your favorites!
          </p>
          <button
            onClick={onSwitchToHome}
            className="mt-2 px-5 py-2.5 bg-[#b3001e] text-white rounded-xl text-xs font-bold flex items-center gap-2 mx-auto hover:bg-red-800 transition-colors"
          >
            <span>Explore Angel Bakery Menu</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4">
          {favoriteItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="bg-white rounded-2xl border border-stone-200 p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer flex justify-between gap-3 relative"
            >
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-600 rounded-xs flex items-center justify-center p-[1.5px] shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  </div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                    {item.categoryLabel}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-stone-900 leading-snug line-clamp-1">
                  {item.name}
                </h3>

                <div className="text-sm font-extrabold text-stone-900 tabular-nums mt-1">
                  ₹{item.price}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-1">
                  <span className="bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                    {item.rating} <Star className="w-2.5 h-2.5 fill-current" />
                  </span>
                  <span>({item.reviewsCount})</span>
                </div>

                <p className="text-[11px] text-stone-500 line-clamp-1 mt-1">
                  {item.description}
                </p>
              </div>

              <div className="w-24 shrink-0 flex flex-col items-center justify-between">
                <div className="w-20 h-20 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden relative">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full flex items-center justify-center text-3xl"
                    style={{ display: item.imageUrl ? 'none' : 'flex' }}
                  >
                    {item.emoji}
                  </div>
                </div>

                <button
                  onClick={(e) => {
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
                  }}
                  className="mt-1 h-7 px-4 rounded-lg border border-[#e23744] bg-white text-[#e23744] font-bold text-xs uppercase shadow-xs hover:bg-rose-50 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
