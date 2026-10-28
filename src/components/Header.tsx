import { MapPin, Search, X, ChevronDown, UserCheck, Navigation } from 'lucide-react';
import { BAKERY_INFO, GOOGLE_SHEET_URL } from '../data/bakeryData';

interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  activeFilterCount: number;
  onOpenLocation: () => void;
}

export default function Header({
  searchQuery,
  setSearchQuery,
  onOpenLocation,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-[100] shadow-sm">
      {/* Crimson Red Bar */}
      <div className="bg-[#b3001e] text-white px-4 pt-3 pb-3">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          {/* Location button */}
          <button
            onClick={onOpenLocation}
            className="flex items-center gap-1.5 text-left active:opacity-80 transition-opacity"
            title="View Location & Directions"
          >
            <MapPin className="w-4 h-4 text-white shrink-0 fill-white/20" />
            <div>
              <div className="flex items-center gap-1 leading-tight">
                <span className="text-[13px] font-bold tracking-wide">HOME</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-90" />
              </div>
              <div className="text-[11px] text-white/90 truncate max-w-[210px] leading-tight font-medium">
                Angel Bakery • Patiyapara Chowk, Chandpur
              </div>
            </div>
          </button>

          {/* Right Action: By Owner Badge */}
          <div className="flex items-center gap-2">
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
    </header>
  );
}
