import { X, MapPin, Navigation, Phone, MessageCircle, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import { BAKERY_INFO } from '../data/bakeryData';
import { getDirectWhatsAppInquiryUrl } from '../utils/whatsapp';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationModal({ isOpen, onClose }: LocationModalProps) {
  if (!isOpen) return null;

  const whatsappInquiryUrl = getDirectWhatsAppInquiryUrl(
    `Hello Angel Bakery, I am visiting your store at Patiyapara Chowk, Chandpur. Please help me with directions.`
  );

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#b3001e] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-extrabold text-sm text-white">
                Store Location & Directions
              </h3>
              <p className="text-[11px] text-white/90">
                Angel Bakery · Chandpur, UP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs text-stone-700">
          {/* Address Card */}
          <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-xl space-y-2">
            <div className="flex items-start gap-2.5">
              <img
                src={BAKERY_INFO.logo}
                alt="Angel Bakery Logo"
                className="w-11 h-11 rounded-full object-cover bg-white shadow-xs border border-rose-300 shrink-0 mt-0.5"
              />
              <div>
                <h4 className="font-black text-stone-900 text-sm">
                  {BAKERY_INFO.name}
                </h4>
                <p className="font-bold text-stone-800 text-xs mt-0.5 leading-snug">
                  {BAKERY_INFO.address}
                </p>
                <div className="text-[11px] text-stone-500 mt-1">
                  Landmark: <span className="font-semibold text-stone-700">{BAKERY_INFO.landmark}</span> · PIN: <span className="font-semibold text-stone-700">{BAKERY_INFO.pincode}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-stone-600 pt-2 border-t border-rose-200/60">
              <Clock className="w-3.5 h-3.5 text-[#e23744] shrink-0" />
              <span>Open Daily: <strong>{BAKERY_INFO.timing}</strong></span>
            </div>
          </div>

          {/* Primary Action: Get Directions on Google Maps */}
          <a
            href={BAKERY_INFO.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
          >
            <Navigation className="w-4 h-4" />
            <span>Open Google Maps Directions</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-200 ml-0.5" />
          </a>

          {/* Secondary Actions: Call & WhatsApp */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${BAKERY_INFO.phone}`}
              className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl text-stone-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#e23744]" />
              <span>Call: {BAKERY_INFO.phone}</span>
            </a>

            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-600 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-stone-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Store Pickup & Dine-In Available</span>
            </div>
            <p className="text-stone-500 leading-normal">
              You can also pick up fresh orders directly from our counter at Patiyapara Chowk, Chandpur with zero delivery charge.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
