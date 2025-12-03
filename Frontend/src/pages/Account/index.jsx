import React from 'react';
import BottomNav from '../../components/layout/BottomNav';
import { 
  FiEdit3, 
  FiClipboard, 
  FiSmartphone, 
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
  const phoneNumber = '+91 6261387233';

  const menuItems = [
    { id: 1, label: 'My Plans', icon: FiFileText },
    { id: 2, label: 'Wallet', icon: MdAccountBalanceWallet },
    { id: 3, label: 'Plus membership', icon: FiTarget },
    { id: 4, label: 'My rating', icon: FiStar },
    { id: 5, label: 'Manage addresses', icon: FiMapPin },
    { id: 6, label: 'Manage payment methods', icon: FiCreditCard },
    { id: 7, label: 'Settings', icon: FiSettings },
    { id: 8, label: 'About UC', icon: null, customIcon: 'UC' },
  ];

  const handleCardClick = (cardType) => {
    console.log(`${cardType} clicked`);
    // Navigate to respective page
  };

  const handleMenuClick = (item) => {
    console.log(`${item.label} clicked`);
    // Navigate to respective page
  };

  const handleEditClick = () => {
    console.log('Edit clicked');
    // Open edit modal
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <main>
        {/* Top Section - Customer Info */}
        <div className="px-4 py-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-black mb-1">
                Verified Customer
              </h1>
              <p className="text-base text-gray-600">
                {phoneNumber}
              </p>
            </div>
            <button
              onClick={handleEditClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiEdit3 className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Three Cards Section */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-3 gap-4">
            {/* My Bookings */}
            <button
              onClick={() => handleCardClick('bookings')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm active:scale-95 transition-transform"
            >
              <FiClipboard className="w-5 h-5 text-gray-700 mb-2" />
              <span className="text-xs text-gray-700 font-normal text-center">
                My bookings
              </span>
            </button>

            {/* Native Devices */}
            <button
              onClick={() => handleCardClick('devices')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm active:scale-95 transition-transform"
            >
              <FiSmartphone className="w-5 h-5 text-gray-700 mb-2" />
              <span className="text-xs text-gray-700 font-normal text-center">
                Native devices
              </span>
            </button>

            {/* Help & Support */}
            <button
              onClick={() => handleCardClick('support')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm active:scale-95 transition-transform"
            >
              <FiHeadphones className="w-5 h-5 text-gray-700 mb-2" />
              <span className="text-xs text-gray-700 font-normal text-center">
                Help & support
              </span>
            </button>
          </div>
        </div>

        {/* Menu List Section */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center justify-between p-4 active:bg-gray-50 transition-colors ${
                    index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.customIcon ? (
                      <div className="w-5 h-5 border-2 border-gray-700 rounded flex items-center justify-center">
                        <span className="text-[10px] font-normal text-gray-700">uc</span>
                      </div>
                    ) : (
                      IconComponent && <IconComponent className="w-5 h-5 text-gray-700" />
                    )}
                    <span className="text-sm text-gray-800 font-normal">
                      {item.label}
                    </span>
                  </div>
                  <FiChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Refer & Earn Card */}
        <div className="px-4 mb-6">
          <div className="relative bg-purple-50 rounded-xl overflow-hidden p-4">
            {/* Gift Box Illustration */}
            <div className="absolute right-4 top-2">
              <div className="relative">
                <div className="w-16 h-16 bg-pink-300 rounded-lg flex items-center justify-center transform rotate-12">
                  <span className="text-3xl">🎁</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-200 rounded-full"></div>
              </div>
            </div>

            <div className="relative pr-20">
              <h3 className="text-lg font-bold text-black mb-1">
                Refer & earn ₹100
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Get ₹100 when your friend completes their first booking
              </p>
              <button
                onClick={() => handleMenuClick({ label: 'Refer & Earn' })}
                className="bg-purple-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-purple-700 active:scale-95 transition-all"
              >
                Refer now
              </button>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="px-4 mb-4">
          <button
            onClick={() => {
              console.log('Logout clicked');
              // Handle logout
            }}
            className="w-full bg-white border border-gray-200 text-red-600 font-semibold py-3 rounded-lg hover:bg-gray-50 active:scale-98 transition-all"
          >
            Logout
          </button>
        </div>

        {/* Version Number */}
        <div className="px-4 pb-6 text-center">
          <p className="text-xs text-gray-500">
            Version 7.6.27 R547
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Account;

