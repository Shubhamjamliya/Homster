import React, { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { themeColors } from '../../theme';
import BottomNav from '../../components/layout/BottomNav';
import {
  FiEdit3,
  FiClipboard,
  FiHeadphones,
  FiFileText,
  FiTarget,
  FiStar,
  FiMapPin,
  FiCreditCard,
  FiSettings,
  FiChevronRight
} from 'react-icons/fi';
import { MdAccountBalanceWallet } from 'react-icons/md';

const Account = () => {
  const navigate = useNavigate();
  const phoneNumber = '+91 6261387233';

  const menuItems = [
    { id: 1, label: 'My Plans', icon: FiFileText },
    { id: 2, label: 'Wallet', icon: MdAccountBalanceWallet },
    { id: 3, label: 'Plus membership', icon: FiTarget },
    { id: 4, label: 'My rating', icon: FiStar },
    { id: 5, label: 'Manage addresses', icon: FiMapPin },
    { id: 6, label: 'Manage payment methods', icon: FiCreditCard },
    { id: 7, label: 'Settings', icon: FiSettings },
    { id: 8, label: 'About Appzeto', icon: null, customIcon: 'Appzeto' },
  ];

  const handleCardClick = (cardType) => {
    if (cardType === 'bookings') {
      navigate('/my-bookings');
    } else if (cardType === 'wallet') {
      navigate('/wallet');
    }
    // Navigate to respective page
  };

  const handleMenuClick = (item) => {
    if (item.label === 'Settings') {
      navigate('/settings');
    } else if (item.label === 'Manage payment methods') {
      navigate('/manage-payment-methods');
    } else if (item.label === 'Manage addresses') {
      navigate('/manage-addresses');
    } else if (item.label === 'My Plans') {
      navigate('/my-plan');
    } else if (item.label === 'Wallet') {
      navigate('/wallet');
    } else if (item.label === 'Plus membership') {
      navigate('/my-subscription');
    } else if (item.label === 'My rating') {
      navigate('/my-rating');
    } else if (item.label === 'About Appzeto') {
      navigate('/about-appzeto');
    }
    // Navigate to respective page
  };

  const handleEditClick = () => {
    navigate('/update-profile');
  };

  // Set background gradient like home page
  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const bgStyle = themeColors.backgroundGradient.home;

    // Set background on all elements
    const elements = [html, body, root].filter(Boolean);
    elements.forEach(el => {
      el.style.backgroundColor = '#ffffff';
      el.style.background = bgStyle;
      el.style.backgroundAttachment = 'fixed';
    });

    return () => {
      // Cleanup on unmount
      elements.forEach(el => {
        el.style.backgroundColor = '';
        el.style.background = '';
        el.style.backgroundAttachment = '';
      });
    };
  }, []);

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient.home }}>
      <main>
        {/* Top Section - Customer Info with Gradient */}
        <div
          className="px-4 pt-4 pb-5 mb-3"
          style={{
            background: themeColors.backgroundGradient.section,
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base"
                  style={{
                    backgroundColor: themeColors.primary,
                    boxShadow: `0 4px 12px ${themeColors.shadow.primary}`,
                  }}
                >
                  {phoneNumber.slice(-2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-black">
                      Verified Customer
                    </h1>
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: '#22c55e' }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {phoneNumber}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleEditClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiEdit3 className="w-4 h-4" style={{ color: themeColors.icon.primary }} />
            </button>
          </div>
        </div>

        {/* Three Cards Section with Modern Design */}
        <div className="px-4 mb-3">
          <div className="grid grid-cols-3 gap-2">
            {/* My Bookings */}
            <button
              onClick={() => handleCardClick('bookings')}
              className="flex flex-col items-center justify-center p-3 rounded-xl active:scale-95 transition-all relative overflow-hidden bg-white shadow-sm border border-gray-200"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-1.5"
                style={{ backgroundColor: themeColors.iconBackground.primary }}
              >
                <FiClipboard className="w-4 h-4" style={{ color: themeColors.icon.primary }} />
              </div>
              <span className="text-[10px] font-semibold text-gray-800 text-center leading-tight">
                My bookings
              </span>
            </button>

            {/* Wallet */}
            <button
              onClick={() => handleCardClick('wallet')}
              className="flex flex-col items-center justify-center p-3 rounded-xl active:scale-95 transition-all relative overflow-hidden bg-white shadow-sm border border-gray-200"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-1.5"
                style={{ backgroundColor: themeColors.iconBackground.primary }}
              >
                <MdAccountBalanceWallet className="w-4 h-4" style={{ color: themeColors.icon.primary }} />
              </div>
              <span className="text-[10px] font-semibold text-gray-800 text-center leading-tight">
                Wallet
              </span>
            </button>

            {/* Help & Support */}
            <button
              onClick={() => handleCardClick('support')}
              className="flex flex-col items-center justify-center p-3 rounded-xl active:scale-95 transition-all relative overflow-hidden bg-white shadow-sm border border-gray-200"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-1.5"
                style={{ backgroundColor: themeColors.iconBackground.primary }}
              >
                <FiHeadphones className="w-4 h-4" style={{ color: themeColors.icon.primary }} />
              </div>
              <span className="text-[10px] font-semibold text-gray-800 text-center leading-tight">
                Help & support
              </span>
            </button>
          </div>
        </div>

        {/* Menu List Section with Modern Design */}
        <div className="px-4 mb-3">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
              boxShadow: `0 4px 12px ${themeColors.shadow.primaryLight}, 0 2px 4px ${themeColors.shadow.card}`,
              border: `1px solid ${themeColors.border.primaryLight}`,
            }}
          >
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center justify-between p-3 transition-all ${index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                    } active:bg-gray-50 hover:bg-white/30`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.customIcon ? (
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: themeColors.iconBackground.primaryLight,
                          border: `2px solid ${themeColors.border.primary}`,
                        }}
                      >
                        <span className="text-[10px] font-bold" style={{ color: themeColors.icon.primary }}>A</span>
                      </div>
                    ) : (
                      IconComponent && (
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: themeColors.iconBackground.primary }}
                        >
                          <IconComponent className="w-4 h-4" style={{ color: themeColors.icon.primary }} />
                        </div>
                      )
                    )}
                    <span className="text-sm font-semibold text-gray-800">
                      {item.label}
                    </span>
                  </div>
                  <FiChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Refer & Earn Card with Enhanced Design */}
        <div className="px-4 mb-3">
          <div
            className="relative rounded-xl overflow-hidden p-4"
            style={{
              background: `linear-gradient(135deg, rgba(41, 173, 129, 0.12) 0%, rgba(0, 166, 166, 0.08) 50%, rgba(41, 173, 129, 0.12) 100%)`,
              boxShadow: `0 4px 16px ${themeColors.shadow.primaryMedium}, 0 2px 8px ${themeColors.shadow.card}`,
              border: `1px solid ${themeColors.border.primary}`,
            }}
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
              <div
                className="absolute top-2 right-2 w-16 h-16 rounded-full"
                style={{ background: themeColors.button.primaryGradient }}
              />
              <div
                className="absolute top-4 right-4 w-10 h-10 rounded-full"
                style={{ background: themeColors.button.primaryGradient }}
              />
            </div>

            {/* Gift Box Illustration */}
            <div className="absolute right-3 top-2">
              <div className="relative">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center transform rotate-12"
                  style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
                  }}
                >
                  <span className="text-3xl">🎁</span>
                </div>
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%)',
                    boxShadow: '0 2px 6px rgba(251, 191, 36, 0.5)',
                  }}
                />
                <div
                  className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #fde68a 0%, #fcd34d 100%)',
                    boxShadow: '0 2px 4px rgba(251, 191, 36, 0.4)',
                  }}
                />
              </div>
            </div>

            <div className="relative pr-20">
              <h3 className="text-lg font-bold text-black mb-1">
                Refer & earn ₹100
              </h3>
              <p className="text-xs text-gray-700 mb-3 leading-relaxed">
                Get ₹100 when your friend completes their first booking
              </p>
              <button
                onClick={() => handleMenuClick({ label: 'Refer & Earn' })}
                className="text-white font-bold px-5 py-2 rounded-lg active:scale-95 transition-all shadow-lg"
                style={{
                  backgroundColor: themeColors.button.primary,
                  boxShadow: `0 4px 12px ${themeColors.shadow.primary}`,
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = `0 6px 16px ${themeColors.shadow.primary}`;
                  e.target.style.backgroundColor = themeColors.button.primaryHover;
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = `0 4px 12px ${themeColors.shadow.primary}`;
                  e.target.style.backgroundColor = themeColors.button.primary;
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Refer now
              </button>
            </div>
          </div>
        </div>

        {/* Logout Button with Modern Design */}
        <div className="px-4 mb-3">
          <button
            onClick={() => {
              // Handle logout
            }}
            className="w-full font-semibold py-3 rounded-xl active:scale-98 transition-all"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
              border: '2px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)';
              e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)';
              e.target.style.borderColor = 'rgba(239, 68, 68, 0.2)';
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

