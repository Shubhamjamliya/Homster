import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../../theme';
import { userAuthService } from '../../../../services/authService';
import BottomNav from '../../components/layout/BottomNav';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  FiArrowLeft,
  FiUser,
  FiEdit3,
  FiClipboard,
  FiHeadphones,
  FiFileText,
  FiTarget,
  FiStar,
  FiMapPin,
  FiCreditCard,
  FiSettings,
  FiChevronRight,
  FiBell
} from 'react-icons/fi';
import { MdAccountBalanceWallet } from 'react-icons/md';

const Account = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({
    name: 'Verified Customer',
    phone: '',
    email: '',
    isPhoneVerified: false,
    isEmailVerified: false
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from database
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // First check localStorage
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setUserProfile({
            name: userData.name || 'Verified Customer',
            phone: userData.phone || '',
            email: userData.email || '',
            isPhoneVerified: userData.isPhoneVerified || false,
            isEmailVerified: userData.isEmailVerified || false,
            profilePhoto: userData.profilePhoto || ''
          });
        }

        // Fetch fresh data from API
        const response = await userAuthService.getProfile();
        if (response.success && response.user) {
          setUserProfile({
            name: response.user.name || 'Verified Customer',
            phone: response.user.phone || '',
            email: response.user.email || '',
            isPhoneVerified: response.user.isPhoneVerified || false,
            isEmailVerified: response.user.isEmailVerified || false,
            profilePhoto: response.user.profilePhoto || ''
          });
        }
      } catch (error) {
        // Use localStorage data if API fails
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setUserProfile({
            name: userData.name || 'Verified Customer',
            phone: userData.phone || '',
            email: userData.email || '',
            isPhoneVerified: userData.isPhoneVerified || false,
            isEmailVerified: userData.isEmailVerified || false
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    if (phone.startsWith('+91')) return phone;
    if (phone.length === 10) return `+91 ${phone}`;
    return phone;
  };

  // Get initials for avatar
  const getInitials = () => {
    if (userProfile.name && userProfile.name !== 'Verified Customer') {
      const names = userProfile.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    if (userProfile.phone) {
      return userProfile.phone.slice(-2);
    }
    return 'VC';
  };

  const menuItems = [
    { id: 1, label: 'My Plans', icon: FiFileText },
    { id: 2, label: 'Wallet', icon: MdAccountBalanceWallet },
    { id: 4, label: 'My rating', icon: FiStar },
    { id: 5, label: 'Manage addresses', icon: FiMapPin },
    { id: 6, label: 'Manage payment methods', icon: FiCreditCard },
    { id: 7, label: 'Settings', icon: FiSettings },
    { id: 9, label: 'Help & Support', icon: FiHeadphones },
    { id: 8, label: 'About Homster', icon: null, customIcon: 'Homster' },
  ];

  const handleCardClick = (cardType) => {
    if (cardType === 'bookings') {
      navigate('/user/my-bookings');
    } else if (cardType === 'wallet') {
      navigate('/user/wallet');
    } else if (cardType === 'support') {
      navigate('/user/help-support');
    }
    // Navigate to respective page
  };

  const handleMenuClick = (item) => {
    if (item.label === 'Settings') {
      navigate('/user/settings');
    } else if (item.label === 'Manage payment methods') {
      navigate('/user/manage-payment-methods');
    } else if (item.label === 'Manage addresses') {
      navigate('/user/manage-addresses');
    } else if (item.label === 'My Plans') {
      navigate('/user/my-plan');
    } else if (item.label === 'Wallet') {
      navigate('/user/wallet');
    } else if (item.label === 'My rating') {
      navigate('/user/my-rating');
    } else if (item.label === 'Help & Support') {
      navigate('/user/help-support');
    } else if (item.label === 'About Homster') {
      navigate('/user/about-homster');
    }
    // Navigate to respective page
  };

  const handleEditClick = () => {
    navigate('/user/update-profile');
  };

  const handleLogout = async () => {
    try {
      await userAuthService.logout();
      toast.success('Logged out successfully');
      navigate('/user/login');
    } catch (error) {
      // Even if API call fails, clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      toast.success('Logged out successfully');
      navigate('/user/login');
    }
  };


  if (isLoading) {
    return <LoadingSpinner />;
  }
  return (
    <div
      className="min-h-screen pb-48"
      style={{ background: themeColors.backgroundGradient }}
    >
      {/* 1. Header Section */}
      <div className="bg-white sticky top-0 z-50 border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-gray-50 rounded-full transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <div className="flex items-center gap-2">
            <FiUser className="w-5 h-5" style={{ color: themeColors.button }} />
            <h1 className="text-lg font-bold text-gray-900">Account</h1>
          </div>
        </div>
        <button
          onClick={() => navigate('/user/notifications')}
          className="p-2 hover:bg-gray-50 rounded-full transition-colors"
        >
          <FiBell className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      <main className="pt-4 space-y-4">
        {/* 2. Customer Profile Card - Colorful & Modern Design */}
        <div className="px-4">
          <div
            className="rounded-3xl p-5 shadow-lg relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${themeColors.button} 0%, ${themeColors.brand.teal}cc 100%)`,
              boxShadow: `0 10px 30px -5px ${themeColors.button}66`,
            }}
          >
            {/* Background Decorative Circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black opacity-5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                {/* Avatar with Ring */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full p-0.5 bg-white/30 backdrop-blur-sm">
                    {userProfile.profilePhoto ? (
                      <img
                        src={userProfile.profilePhoto}
                        alt={userProfile.name}
                        className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div
                        className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-2xl border-2 border-white shadow-sm"
                        style={{
                          background: `linear-gradient(to bottom right, ${themeColors.brand.gold}, ${themeColors.brand.orange})`
                        }}
                      >
                        {isLoading ? '...' : getInitials()}
                      </div>
                    )}
                  </div>
                  {/* Verified Badge */}
                  {userProfile.isPhoneVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-white text-green-500 rounded-full p-1 shadow-md">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex flex-col text-white">
                  <h2 className="text-xl font-bold leading-tight flex items-center gap-2">
                    {isLoading ? 'Loading...' : userProfile.name}
                  </h2>
                  <p className="text-sm font-medium text-white/80 mt-1">
                    {isLoading ? 'Loading...' : (userProfile.phone ? formatPhoneNumber(userProfile.phone) : 'No phone number')}
                  </p>
                  <p className="text-xs font-medium text-white/70 mt-0.5 truncate max-w-[150px]">
                    {userProfile.email || 'Add email address'}
                  </p>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={handleEditClick}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all active:scale-95 border border-white/20"
              >
                <FiEdit3 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Three Cards Section with Modern Design */}
        {/* Three Cards Section with Modern Design */}
        <div className="px-4 mb-4 pb-2">
          <div className="grid grid-cols-3 gap-3">
            {/* My Bookings */}
            <button
              onClick={() => handleCardClick('bookings')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl active:scale-95 transition-all relative overflow-hidden bg-white shadow-sm border border-gray-100 hover:border-teal-100 hover:shadow-md"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${themeColors.brand.teal}1A` }}
              >
                <FiClipboard className="w-6 h-6" style={{ color: themeColors.button }} />
              </div>
              <span className="text-xs font-bold text-gray-800 text-center leading-tight">
                My bookings
              </span>
            </button>

            {/* Wallet */}
            <button
              onClick={() => handleCardClick('wallet')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl active:scale-95 transition-all relative overflow-hidden bg-white shadow-sm border border-gray-100 hover:border-teal-100 hover:shadow-md"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${themeColors.brand.teal}1A` }}
              >
                <MdAccountBalanceWallet className="w-6 h-6" style={{ color: themeColors.button }} />
              </div>
              <span className="text-xs font-bold text-gray-800 text-center leading-tight">
                Wallet
              </span>
            </button>

            {/* Help & Support */}
            <button
              onClick={() => handleCardClick('support')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl active:scale-95 transition-all relative overflow-hidden bg-white shadow-sm border border-gray-100 hover:border-teal-100 hover:shadow-md"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${themeColors.brand.teal}1A` }}
              >
                <FiHeadphones className="w-6 h-6" style={{ color: themeColors.button }} />
              </div>
              <span className="text-xs font-bold text-gray-800 text-center leading-tight">
                Help & support
              </span>
            </button>
          </div>
        </div>

        {/* Menu List Section with Separated Mobile-Friendly Cards */}
        <div className="px-4 mb-4 space-y-3">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  {item.customIcon ? (
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors group-hover:bg-teal-50"
                      style={{
                        backgroundColor: `${themeColors.brand.teal}10`,
                        border: `1px solid ${themeColors.brand.teal}20`,
                      }}
                    >
                      <span className="text-sm font-bold" style={{ color: themeColors.button }}>{item.customIcon[0]}</span>
                    </div>
                  ) : (
                    IconComponent && (
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors"
                        style={{ backgroundColor: `${themeColors.brand.teal}10` }}
                      >
                        <IconComponent className="w-6 h-6" style={{ color: themeColors.button }} />
                      </div>
                    )
                  )}
                  <span className="text-[15px] font-bold text-gray-800 text-left">
                    {item.label}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                  <FiChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Refer & Earn Card with Enhanced Design */}
        <div className="px-4 mb-3">
          <div
            className="relative rounded-2xl overflow-hidden p-5"
            style={{
              background: `linear-gradient(135deg, ${themeColors.brand.teal}0D 0%, ${themeColors.brand.teal}14 100%)`,
              boxShadow: `0 10px 30px -4px ${themeColors.brand.teal}26`,
              border: `1px solid ${themeColors.brand.teal}33`,
            }}
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none">
              <div className="absolute top-[-20px] right-[-20px] w-24 h-24 rounded-full blur-2xl" style={{ backgroundColor: themeColors.button }}></div>
            </div>

            {/* Gift Box Illustration */}
            <div className="absolute right-4 top-4">
              <div className="relative animate-bounce-slow">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transform rotate-6 shadow-sm bg-white"
                >
                  <span className="text-2xl">🎁</span>
                </div>
              </div>
            </div>

            <div className="relative pr-16">
              <h3 className="text-lg font-bold mb-1" style={{ color: themeColors.brand.teal }}>
                Refer & earn ₹100
              </h3>
              <p className="text-xs font-medium mb-3 leading-relaxed max-w-[200px]" style={{ color: `${themeColors.brand.teal}CC` }}>
                Invite your friends and earn rewards when they book a service.
              </p>
              <button
                onClick={() => handleMenuClick({ label: 'Refer & Earn' })}
                className="text-white text-xs font-bold px-5 py-2.5 rounded-xl active:scale-95 transition-all shadow-md hover:shadow-lg"
                style={{
                  backgroundColor: themeColors.button,
                  boxShadow: `0 4px 12px ${themeColors.brand.teal}4D`,
                }}
              >
                Refer Now
              </button>
            </div>
          </div>
        </div>

        {/* Logout Button with Modern Design */}
        <div className="px-4 mb-3">
          <button
            onClick={handleLogout}
            className="w-full font-semibold py-3 rounded-xl active:scale-98 transition-all text-white"
            style={{
              backgroundColor: '#EF4444',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#DC2626';
              e.target.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#EF4444';
              e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
            }}
          >
            Logout
          </button>
        </div>

        {/* Version Number */}
        <div className="px-4 pb-4 text-center">
          <p className="text-xs text-gray-400 font-medium">
            Version 7.6.27 R547
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Account;

