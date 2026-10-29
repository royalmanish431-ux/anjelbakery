export type Tab = 'home' | 'favs' | 'cart' | 'profile';

export type BakeryCategory = 
  | 'all'
  | 'cakes'
  | 'classic-pizza'
  | 'signature-pizza'
  | 'supreme-pizza'
  | 'burger-sandwich'
  | 'chocolates'
  | 'beverages'
  | 'snacks'
  | 'fast-food'
  | (string & {});

export interface ProductVariant {
  name: string;
  price: number;
}

export interface ItemVariant {
  id: string;
  label: string;
  price: number;
  subLabel?: string;
  isDefault?: boolean;
}

export interface BakeryItem {
  id: string;
  name: string;
  category: BakeryCategory;
  categoryLabel: string;
  price: number; // base price (Regular / 1 unit or per kg)
  mediumPrice?: number;
  largePrice?: number;
  halfKgPrice?: number;
  mediumRaw?: string; // Column E in Google Sheet (e.g. "450 Gram" / "0.5 kg")
  largeRaw?: string; // Column F in Google Sheet (e.g. "250 Gram")
  variants?: ItemVariant[];
  description: string;
  nameHindi?: string;
  unitLabel?: string;
  stock?: number;
  offerTag?: string;
  imageUrl?: string; // Column G in Google Sheet
  instagramUrl?: string; // Column H
  youtubeUrl?: string; // Column I
  deliveryValue?: number; // Column J
  deliveryDescription?: string; // Column K
  isVegetarian: boolean;
  isCustomizable: boolean;
  rating: number;
  reviewsCount: number;
  prepTimeMinutes: number;
  bestseller?: boolean;
  badge?: string;
  emoji: string;
  gradient: string;
}

export interface DeliverySettings {
  deliveryFee: number; // Column J: "Delivery value" (e.g. 50)
  deliveryDescription: string; // Column K: "Delivery discription" (e.g. "if till you take a 600 rupay then you get free delivery 🛺")
  freeDeliveryThreshold: number; // e.g. 600
  storeOffer?: string; // Column L: "Offers" from owner (e.g. "900%off")
}

export interface CartItem {
  item: BakeryItem;
  quantity: number;
  selectedSize?: string; // 'Regular' | 'Medium' | 'Large' | '0.5 kg' | '1 kg' | '2 kg'
  selectedPrice: number;
  extraCheese?: boolean;
  extraCheesePrice?: number;
  cakeMessage?: string;
  specialNote?: string;
}

export interface PromoCode {
  code: string;
  discountPercent?: number;
  discountFixed?: number;
  minSpend: number;
  description: string;
}

export interface OrderHistoryItem {
  id: string;
  date: string;
  items: { name: string; quantity: number; price: number; size?: string }[];
  total: number;
  status: 'Delivered' | 'Baking in Oven' | 'Out for Delivery';
}

export interface UserProfile {
  fullName: string;
  contactNumber: string;
  fullAddress: string;
  password: string; // 5-digit password
}

