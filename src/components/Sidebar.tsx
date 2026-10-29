import { 
  Home, 
  Receipt, 
  Heart, 
  ShoppingBag, 
  User, 
  ExternalLink,
  Phone, 
  MapPin, 
  X,
  Award,
  Navigation,
  MessageCircle,
  Download
} from 'lucide-react';
import { Tab } from '../types';
import { BAKERY_INFO, GOOGLE_SHEET_URL, APK_DOWNLOAD_URL } from '../data/bakeryData';
import { getDirectWhatsAppInquiryUrl } from '../utils/whatsapp';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: Tab) => void;
  setPageTitle: (title: string) => void;
  onOpenLocation: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  setActiveTab,
  setPageTitle,
  onOpenLocation,
}: SidebarProps) {
  const whatsappUrl = getDirectWhatsAppInquiryUrl();

  const menuItems = [
    { label: 'Explore Menu', icon: Home, tab: 'home' as Tab, title: 'Browse' },
    { label: 'Favorites & Saved', icon: Heart, tab: 'favs' as Tab, title: 'Favorites' },
    { label: 'My Cart & Checkout', icon: ShoppingBag, tab: 'cart' as Tab, title: 'Cart' },
    { label: 'User Profile & Login 🔑', icon: User, tab: 'profile' as Tab, title: 'Profile & Login' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-stone-950/60 backdrop-blur-xs z-[2000] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 w-[280px] h-full bg-[#1c1c1c] z-[2001] transition-transform duration-300 ease-in-out flex flex-col text-stone-200 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-[#e23744] text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={BAKERY_INFO.logo}
              alt="Angel Bakery Logo"
              className="w-12 h-12 rounded-full object-cover bg-white shadow-md border-2 border-white/60 shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight">
                  Angel Bakery
                </span>
                <span className="text-[9px] bg-white text-[#e23744] font-extrabold px-1.5 py-0.2 rounded-xs">
                  STORE
                </span>
              </div>
              <p className="text-[11px] text-white/90 mt-0.5">
                Chandpur, Uttar Pradesh
              </p>
              <div className="mt-1 flex items-center gap-1 text-[10px] text-white bg-white/15 px-2 py-0.5 rounded w-fit">
                <Award className="w-3 h-3 text-amber-300" />
                <span>100% Pure Veg · 4.8 ★ Rated</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 -mr-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable menu */}
        <div className="flex-1 overflow-y-auto py-2 divide-y divide-white/5">
          {/* Main App Navigation */}
          <div className="py-2">
            <p className="px-4 text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">
              Menu Navigation
            </p>
            <ul className="space-y-0.5">
              {menuItems.map((item, idx) => (
                <li key={idx}>
                  <button
                    className="flex items-center gap-3 px-4 py-2.5 text-stone-300 text-xs hover:text-white hover:bg-white/5 w-full text-left transition-colors"
                    onClick={() => {
                      setActiveTab(item.tab);
                      setPageTitle(item.title);
                      onClose();
                    }}
                  >
                    <item.icon className="w-4 h-4 text-[#e23744] shrink-0" />
                    <span className="font-semibold">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Owner Actions (WhatsApp & Directions) */}
          <div className="p-3 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">
              Direct Contact & Directions
            </p>

            {/* WhatsApp to 8604888113 */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs font-bold hover:bg-emerald-900/60 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="block leading-tight">Order via WhatsApp</span>
                <span className="text-[10px] text-emerald-400/80 font-normal">8604888113</span>
              </div>
            </a>

            {/* Download Android APK */}
            <a
              href={APK_DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              download="Anjelbakery.apk"
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-purple-950/60 border border-purple-700/50 text-purple-300 text-xs font-bold hover:bg-purple-900/60 transition-colors text-left"
            >
              <Download className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="block leading-tight">Download Android App</span>
                <span className="text-[10px] text-purple-400/80 font-normal">Direct APK Download</span>
              </div>
            </a>

            {/* Get Directions */}
            <button
              onClick={() => {
                onClose();
                onOpenLocation();
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-950/60 border border-blue-700/50 text-blue-300 text-xs font-bold hover:bg-blue-900/60 transition-colors text-left"
            >
              <Navigation className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="block leading-tight">Get Directions</span>
                <span className="text-[10px] text-blue-400/80 font-normal">Patiyapara Chowk, Chandpur</span>
              </div>
            </button>
          </div>

          {/* Google Sheet Live Source Link */}
          <div className="p-3 mx-3 my-1 bg-stone-900 border border-stone-800 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live Catalog
              </span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </div>
            <p className="text-[11px] text-stone-300 font-medium">
              Connected with Google Sheets product database (52 items).
            </p>
            <a
              href={GOOGLE_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[11px] font-bold text-amber-400 hover:text-amber-300 underline"
            >
              Open Original Sheet &rarr;
            </a>
          </div>

          {/* Bakery Info */}
          <div className="p-4 text-stone-400 text-[11px] space-y-2">
            <div className="flex items-center gap-2 text-stone-300">
              <Phone className="w-3.5 h-3.5 text-[#e23744]" />
              <a href={`tel:${BAKERY_INFO.phone}`} className="hover:underline">
                Call: {BAKERY_INFO.phone}
              </a>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#e23744] mt-0.5 shrink-0" />
              <span>{BAKERY_INFO.address}</span>
            </div>
            <p className="text-[10px] text-stone-500 pt-1">
              Timing: {BAKERY_INFO.timing}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#141414] text-center border-t border-white/5">
          <p className="text-[11px] text-stone-400 font-medium">
            Angel Bakery · Chandpur, UP
          </p>
        </div>
      </div>
    </>
  );
}
