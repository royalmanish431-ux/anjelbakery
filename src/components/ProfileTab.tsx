import { useState, useEffect, type FormEvent } from 'react';
import { 
  User, 
  MapPin, 
  Navigation, 
  Check, 
  KeyRound, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Eye, 
  EyeOff,
  ShieldCheck,
  Phone,
  Download
} from 'lucide-react';
import { UserProfile } from '../types';
import { BAKERY_INFO, APK_DOWNLOAD_URL } from '../data/bakeryData';

interface ProfileTabProps {
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onUpdateProfile: (user: UserProfile) => void;
  onSwitchToHome: () => void;
  onOpenLocation?: () => void;
}

export default function ProfileTab({
  currentUser,
  onLogin,
  onLogout,
  onUpdateProfile,
  onSwitchToHome,
  onOpenLocation,
}: ProfileTabProps) {
  // If not logged in, authMode determines 'signup' (Create a profile) or 'login' (Login with phone & password)
  const [authMode, setAuthMode] = useState<'signup' | 'login'>(currentUser ? 'signup' : 'signup');

  // Fields (Clean by default - no hardcoded demo data)
  const [firstName, setFirstName] = useState(
    currentUser?.fullName ? currentUser.fullName.split(' ')[0] : ''
  );
  const [lastName, setLastName] = useState(
    currentUser?.fullName ? currentUser.fullName.split(' ').slice(1).join(' ') : ''
  );
  const [address, setAddress] = useState(
    currentUser?.fullAddress ? currentUser.fullAddress.replace(/ - \d{6}$/, '') : ''
  );
  const [pincode, setPincode] = useState(() => {
    if (currentUser?.fullAddress) {
      const match = currentUser.fullAddress.match(/\b\d{6}\b/);
      return match ? match[0] : '';
    }
    return '';
  });
  const [contactNumber, setContactNumber] = useState(
    currentUser?.contactNumber || ''
  );
  const [password, setPassword] = useState(currentUser?.password || '');
  const [showPassword, setShowPassword] = useState(false);

  // Sync fields when currentUser changes or logs out
  useEffect(() => {
    if (currentUser) {
      const parts = (currentUser.fullName || '').trim().split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setContactNumber(currentUser.contactNumber || '');
      setPassword(currentUser.password || '');

      const fullAddr = currentUser.fullAddress || '';
      const pinMatch = fullAddr.match(/\b\d{6}\b/);
      if (pinMatch) {
        setPincode(pinMatch[0]);
        setAddress(fullAddr.replace(/ - \d{6}$/, '').replace(/\b\d{6}\b/, '').trim());
      } else {
        setAddress(fullAddr);
        setPincode('');
      }
    } else {
      setFirstName('');
      setLastName('');
      setAddress('');
      setPincode('');
      setContactNumber('');
      setPassword('');
    }
  }, [currentUser]);

  // Login specific state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle Create Profile / Update Profile
  const handleSubmitProfile = (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSuccessMessage('');

    if (!firstName.trim()) {
      setAuthError('Please enter your full name / first name *');
      return;
    }
    if (!contactNumber.trim()) {
      setAuthError('Please enter your 10-digit contact number *');
      return;
    }
    if (!address.trim()) {
      setAuthError('Please enter your complete address *');
      return;
    }
    if (!password.trim() || password.trim().length !== 5 || !/^\d{5}$/.test(password.trim())) {
      setAuthError('Password must be exactly a 5-digit number (e.g. 54321) 🔑');
      return;
    }

    const fullFullName = lastName.trim() ? `${firstName.trim()} ${lastName.trim()}` : firstName.trim();
    const fullFullAddress = pincode.trim() ? `${address.trim()} - ${pincode.trim()}` : address.trim();

    const profileData: UserProfile = {
      fullName: fullFullName,
      contactNumber: contactNumber.trim(),
      fullAddress: fullFullAddress,
      password: password.trim(),
    };

    // Save to user storage
    try {
      const storedUsersRaw = localStorage.getItem('angel_bakery_users');
      const users: UserProfile[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      const existingIdx = users.findIndex((u) => u.contactNumber === profileData.contactNumber);
      if (existingIdx >= 0) {
        users[existingIdx] = profileData;
      } else {
        users.push(profileData);
      }
      localStorage.setItem('angel_bakery_users', JSON.stringify(users));
    } catch {
      // storage unavailable
    }

    onUpdateProfile(profileData);
    setSuccessMessage('✓ Profile saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handle Login
  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSuccessMessage('');

    const phone = loginPhone.trim();
    const pass = loginPassword.trim();

    if (!phone) {
      setAuthError('Please enter your registered contact number');
      return;
    }
    if (pass.length !== 5 || !/^\d{5}$/.test(pass)) {
      setAuthError('Password must be exactly 5 digits (e.g. 54321)');
      return;
    }

    // Check localStorage
    try {
      const storedUsersRaw = localStorage.getItem('angel_bakery_users');
      const users: UserProfile[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      const found = users.find((u) => u.contactNumber === phone && u.password === pass);

      if (found) {
        onLogin(found);
        setSuccessMessage(`Welcome back, ${found.fullName}!`);
        return;
      }
    } catch {
      // fallback
    }

    setAuthError('Account not found with this mobile number and password. Please check or Create Profile.');
  };

  return (
    <div className="min-h-screen bg-stone-100 pb-28 md:pb-12">
      {/* 1. Dark Green Banner (Screenshot 3) */}
      <div className="p-3 sm:p-5 max-w-2xl mx-auto">
        <div className="rounded-2xl bg-[#0f5132] text-white p-4 sm:p-5 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-white/15 border border-white/20 flex items-center justify-center shrink-0 text-white">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
              Customer Profile
            </h1>
            <p className="text-xs text-white/80 font-medium mt-0.5 leading-snug">
              Save your delivery address & details for faster ordering
            </p>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-5 max-w-2xl mx-auto space-y-3 sm:space-y-4">
        {/* Auth Mode Toggle Pill (Create Profile vs Login) */}
        <div className="flex bg-stone-200/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setAuthError('');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              authMode === 'signup'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {currentUser ? 'Edit Profile' : 'Create Profile'}
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setAuthError('');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              authMode === 'login'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Login with Phone 🔑
          </button>
        </div>

        {/* Error / Success Notifications */}
        {authError && (
          <div className="bg-rose-50 border border-rose-200 text-[#b3001e] px-3.5 py-2.5 rounded-xl text-xs font-semibold">
            {authError}
          </div>
        )}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-xl text-xs font-semibold">
            {successMessage}
          </div>
        )}

        {/* MODE: CREATE PROFILE / EDIT PROFILE (Matching Screenshot 3) */}
        {authMode === 'signup' && (
          <form onSubmit={handleSubmitProfile} className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-3.5">
            {/* Full Name * */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                placeholder="Enter your first / full name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            {/* Last Name * */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Last Name
              </label>
              <input
                type="text"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                placeholder="Enter your last name (optional)"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            {/* Address * */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Address *
              </label>
              <input
                type="text"
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                placeholder="House No, Street, Landmark"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Pin code * */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Pin code
              </label>
              <input
                type="text"
                maxLength={6}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                placeholder="Enter 6-digit pin code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>

            {/* Contact number * */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Contact number *
              </label>
              <input
                type="tel"
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                placeholder="Enter 10-digit mobile number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </div>

            {/* 5-digit Password 🔑 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-800">
                  5-Digit Password 🔑 *
                </label>
                <span className="text-[10px] text-stone-500">Only 5 digits (e.g. 54321)</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  maxLength={5}
                  pattern="\d{5}"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors tracking-widest"
                  placeholder="Enter 5-digit password 🔑"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 5))}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button (Screenshot 3: ✓ Create a profile) */}
            <button
              type="submit"
              className="w-full bg-[#0f5132] hover:bg-emerald-800 text-white font-extrabold text-xs py-3 rounded-xl shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <span>✓</span>
              <span>{currentUser ? 'Update Profile' : 'Create a profile'}</span>
            </button>

            {currentUser && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full py-2 text-xs font-bold text-stone-500 hover:text-[#b3001e] flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
          </form>
        )}

        {/* MODE: LOGIN WITH PHONE & 5-DIGIT PASSWORD */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Contact Number *
              </label>
              <input
                type="tel"
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                placeholder="Enter 10-digit registered mobile"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-800">
                  5-Digit Password 🔑 *
                </label>
                <span className="text-[10px] text-stone-500">5-digit PIN</span>
              </div>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  maxLength={5}
                  pattern="\d{5}"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors tracking-widest"
                  placeholder="Enter 5-digit password 🔑"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value.replace(/\D/g, '').slice(0, 5))}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0f5132] hover:bg-emerald-800 text-white font-extrabold text-xs py-3 rounded-xl shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In to Account</span>
            </button>
          </form>
        )}

        {/* Store Location & Directions Card */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#b3001e] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-900">{BAKERY_INFO.name}</h4>
              <p className="text-[10px] text-stone-500 font-medium">Chandpur, Uttar Pradesh</p>
            </div>
          </div>

          <p className="text-[11px] text-stone-600 leading-snug bg-stone-50 p-2.5 rounded-xl border border-stone-200">
            {BAKERY_INFO.address}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <a
              href={BAKERY_INFO.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#b3001e] hover:bg-red-800 text-white text-xs font-bold py-2 rounded-xl text-center flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions</span>
            </a>

            <a
              href={`tel:${BAKERY_INFO.phone}`}
              className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold py-2 px-3.5 rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors border border-stone-200"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>Call</span>
            </a>
          </div>

          <a
            href={APK_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            download="Anjelbakery.apk"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 rounded-xl text-center flex items-center justify-center gap-1.5 shadow-2xs transition-colors mt-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Android App (APK)</span>
          </a>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-stone-400 pt-4">
          <p>© 2026 Angel Bakery. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
