/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomeTab from './components/HomeTab';
import FavsTab from './components/FavsTab';
import CartTab from './components/CartTab';
import ProfileTab from './components/ProfileTab';
import ItemDetailModal from './components/ItemDetailModal';
import LocationModal from './components/LocationModal';
import { Tab, BakeryItem, CartItem, UserProfile, DeliverySettings } from './types';
import { BAKERY_ITEMS, BAKERY_INFO, DEFAULT_DELIVERY_SETTINGS, CATEGORY_DEFAULT_IMAGES } from './data/bakeryData';
import { getDirectWhatsAppInquiryUrl } from './utils/whatsapp';
import { fetchLiveSheetData, getCachedSheetItems, getCachedDeliverySettings } from './utils/sheetLoader';
import { MessageCircle, Check, X } from 'lucide-react';

interface CartNotification {
  itemName: string;
  itemImage?: string;
  size?: string;
  price: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState('Browse');

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modals state
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState<BakeryItem | null>(null);

  // Google Sheet live menu, Column G images & Column J delivery values
  const [menuItems, setMenuItems] = useState<BakeryItem[]>(() => {
    return getCachedSheetItems() || BAKERY_ITEMS;
  });
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>(() => {
    return getCachedDeliverySettings() || DEFAULT_DELIVERY_SETTINGS;
  });
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);

  // User Profile state (Full Name, Contact Number, Full Address, 5-digit password 🔑)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const activeRaw = localStorage.getItem('angel_bakery_active_user');
      if (activeRaw) {
        const parsed = JSON.parse(activeRaw);
        // Purge any stale demo user
        if (parsed?.fullName === 'Rahul Sharma' || parsed?.contactNumber === '8604888113') {
          localStorage.removeItem('angel_bakery_active_user');
          return null;
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return null;
  });

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('angel_bakery_active_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    showToast(`Logged in as ${user.fullName}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('angel_bakery_active_user');
    } catch {
      // ignore
    }
    showToast('Logged out');
  };

  const handleUpdateProfile = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('angel_bakery_active_user', JSON.stringify(user));
      const storedUsersRaw = localStorage.getItem('angel_bakery_users');
      const users: UserProfile[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      const updated = users.filter((u) => u.contactNumber !== user.contactNumber);
      updated.push(user);
      localStorage.setItem('angel_bakery_users', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast('Profile updated successfully');
  };

  // Automatically sync latest Google Sheet items, column G images & column J delivery value
  useEffect(() => {
    let isMounted = true;
    setIsSyncingSheet(true);
    fetchLiveSheetData()
      .then(({ items, deliverySettings: liveDelivery }) => {
        if (isMounted) {
          if (items && items.length > 0) setMenuItems(items);
          if (liveDelivery) setDeliverySettings(liveDelivery);
        }
      })
      .catch((err) => console.error('Sheet sync error:', err))
      .finally(() => {
        if (isMounted) setIsSyncingSheet(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefreshSheet = async () => {
    setIsSyncingSheet(true);
    showToast('Syncing products, delivery values & video links...');
    try {
      const { items: live, deliverySettings: liveDelivery } = await fetchLiveSheetData();
      if (live && live.length > 0) {
        setMenuItems(live);
        if (liveDelivery) setDeliverySettings(liveDelivery);
        const imgCount = live.filter((i) => i.imageUrl).length;
        const videoCount = live.filter((i) => i.youtubeUrl || i.instagramUrl).length;
        showToast(`Synced ${live.length} items (Delivery Fee: ₹${liveDelivery.deliveryFee})`);
      }
    } catch {
      showToast('Could not fetch sheet. Using cached menu.');
    } finally {
      setIsSyncingSheet(false);
    }
  };

  // Cart state - clean empty initial cart
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Favorites state
  const [favoriteIds, setFavoriteIds] = useState<string[]>([
    'cake-rasmalai',
    'pizza-tandoori-paneer',
    'burger-cheese',
  ]);

  // Quick toast message & rich cart banner matching Screenshot 2
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cartNotification, setCartNotification] = useState<CartNotification | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2200);
  };

  // Add to cart from modal or card
  const handleAddToCart = (newCartItem: CartItem) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (ci) =>
          ci.item.id === newCartItem.item.id &&
          ci.selectedSize === newCartItem.selectedSize &&
          ci.extraCheese === newCartItem.extraCheese &&
          ci.cakeMessage === newCartItem.cakeMessage
      );

      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += newCartItem.quantity;
        return copy;
      }
      return [...prev, newCartItem];
    });

    // Trigger rich floating banner matching Screenshot 2
    setCartNotification({
      itemName: newCartItem.item.name,
      itemImage: newCartItem.item.imageUrl || CATEGORY_DEFAULT_IMAGES[newCartItem.item.category] || CATEGORY_DEFAULT_IMAGES['all'],
      size: newCartItem.selectedSize,
      price: newCartItem.selectedPrice,
    });
    setTimeout(() => {
      setCartNotification(null);
    }, 4500);

    showToast(`Added ${newCartItem.quantity}x ${newCartItem.item.name} (${newCartItem.selectedSize || 'Standard'}) to cart`);
  };

  // Card direct quantity increment/decrement
  const handleUpdateCartItemQty = (itemId: string, delta: number) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((ci) => ci.item.id === itemId);
      if (idx === -1) {
        if (delta > 0) {
          const it = menuItems.find((b) => b.id === itemId) || BAKERY_ITEMS.find((b) => b.id === itemId);
          if (it) {
            return [...prev, { item: it, quantity: 1, selectedPrice: it.price }];
          }
        }
        return prev;
      }

      const copy = [...prev];
      const newQty = copy[idx].quantity + delta;
      if (newQty <= 0) {
        return copy.filter((_, i) => i !== idx);
      }
      copy[idx].quantity = newQty;
      return copy;
    });
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    setCartItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      const copy = [...prev];
      copy[index].quantity = quantity;
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
    showToast('Item removed from cart');
  };

  const handleClearCart = () => {
    setCartItems([]);
    showToast('Cart cleared');
  };

  const handleToggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      if (prev.includes(id)) {
        showToast('Removed from favorites');
        return prev.filter((item) => item !== id);
      }
      showToast('Saved to favorites');
      return [...prev, id];
    });
  };

  const floatingWhatsAppUrl = getDirectWhatsAppInquiryUrl(
    `Hello Angel Bakery, I want to order / inquire about menu items at your Chandpur branch (Patiyapara Chowk).`
  );

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-900 antialiased selection:bg-rose-100 selection:text-rose-900 flex flex-col">
      <div className="w-full max-w-7xl mx-auto bg-stone-100 min-h-screen relative flex flex-col">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          setActiveTab={setActiveTab}
          setPageTitle={setPageTitle}
          onOpenLocation={() => setLocationModalOpen(true)}
        />

        {/* Header (Responsive for Mobile & Desktop) */}
        <Header
          title={pageTitle}
          onToggleSidebar={() => setSidebarOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          activeFilterCount={0}
          onOpenLocation={() => setLocationModalOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          cartCount={cartItems.reduce((acc, c) => acc + c.quantity, 0)}
          onRefreshSheet={handleRefreshSheet}
          isSyncingSheet={isSyncingSheet}
        />

        {/* Tab Content */}
        <main className="flex-1">
          {activeTab === 'home' && (
            <HomeTab
              items={menuItems}
              onSelectItem={(item) => setSelectedItemForModal(item)}
              onAddToCart={handleAddToCart}
              onUpdateCartItemQty={handleUpdateCartItemQty}
              cartItems={cartItems}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              searchQuery={searchQuery}
              showFilters={showFilters}
              onOpenLocation={() => setLocationModalOpen(true)}
              onRefreshSheet={handleRefreshSheet}
              isSyncingSheet={isSyncingSheet}
              deliverySettings={deliverySettings}
            />
          )}

          {activeTab === 'favs' && (
            <FavsTab
              items={menuItems}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              onSelectItem={(item) => setSelectedItemForModal(item)}
              onAddToCart={handleAddToCart}
              onSwitchToHome={() => {
                setActiveTab('home');
                setPageTitle('Browse');
              }}
            />
          )}

          {activeTab === 'cart' && (
            <CartTab
              cartItems={cartItems}
              currentUser={currentUser}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onSwitchToHome={() => {
                setActiveTab('home');
                setPageTitle('Browse');
              }}
              deliverySettings={deliverySettings}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              currentUser={currentUser}
              onLogin={handleLogin}
              onLogout={handleLogout}
              onUpdateProfile={handleUpdateProfile}
              onSwitchToHome={() => {
                setActiveTab('home');
                setPageTitle('Browse');
              }}
              onOpenLocation={() => setLocationModalOpen(true)}
            />
          )}
        </main>

        {/* Floating Quick WhatsApp Chat with Owner (8604888113) */}
        {activeTab !== 'cart' && (
          <a
            href={floatingWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-[130px] md:bottom-8 right-4 md:right-8 z-[997] bg-emerald-600 hover:bg-emerald-500 text-white p-3 md:px-4 md:py-3 rounded-full shadow-xl flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 border-2 border-white"
            title="Chat with owner on WhatsApp (8604888113)"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span className="text-xs font-black pr-1 hidden sm:inline">
              WhatsApp 8604888113
            </span>
          </a>
        )}

        {/* Added To Cart Floating Banner Matching Image 2 */}
        {cartNotification && (
          <div className="fixed top-3 left-3 right-3 max-w-[460px] md:max-w-xl mx-auto z-[2500] bg-stone-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 animate-in slide-in-from-top duration-200">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-stone-800 shrink-0 border border-white/20">
              <img
                src={cartNotification.itemImage || CATEGORY_DEFAULT_IMAGES['all']}
                alt={cartNotification.itemName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = CATEGORY_DEFAULT_IMAGES['all'];
                }}
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border border-stone-900">
                <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                <span>🛒 ADDED TO CART!</span>
              </div>
              <div className="text-xs font-black truncate text-white leading-tight">
                {cartNotification.itemName}
              </div>
              <div className="text-[10px] text-stone-300 truncate mt-0.5">
                <span className="font-bold text-amber-300">
                  {cartNotification.size ? `${cartNotification.size} • ` : ''}₹{cartNotification.price}
                </span>
                <span className="mx-1">|</span>
                <span>
                  Cart: {cartItems.reduce((acc, c) => acc + c.quantity, 0)} {cartItems.reduce((acc, c) => acc + c.quantity, 0) === 1 ? 'dish' : 'dishes'} (₹{cartItems.reduce((acc, c) => acc + c.selectedPrice * c.quantity, 0)})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={floatingWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors shadow-xs"
                title="Chat on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
              </a>
              <button
                onClick={() => {
                  setActiveTab('cart');
                  setCartNotification(null);
                }}
                className="bg-[#b3001e] hover:bg-red-800 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-0.5"
              >
                <span>Cart →</span>
              </button>
              <button
                onClick={() => setCartNotification(null)}
                className="text-stone-400 hover:text-white p-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Toast */}
        {toastMessage && !cartNotification && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[2400] bg-stone-900/95 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm border border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Customization / Detail Modal */}
        <ItemDetailModal
          item={selectedItemForModal}
          onClose={() => setSelectedItemForModal(null)}
          onAddToCart={handleAddToCart}
          isFavorited={selectedItemForModal ? favoriteIds.includes(selectedItemForModal.id) : false}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* Store Location & Directions Modal */}
        <LocationModal
          isOpen={locationModalOpen}
          onClose={() => setLocationModalOpen(false)}
        />

        {/* Bottom Nav with floating cart banner */}
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setPageTitle={setPageTitle}
          cartItems={cartItems}
        />
      </div>
    </div>
  );
}
