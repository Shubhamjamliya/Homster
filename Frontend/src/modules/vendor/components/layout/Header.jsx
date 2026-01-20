import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBell, FiSearch } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { vendorTheme as themeColors } from '../../../../theme';
import Logo from '../../../../components/common/Logo';

const Header = memo(({ title, onBack, showBack = true, showSearch = false, showNotifications = true, notificationCount = 0 }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleNotifications = () => {
    navigate('/vendor/notifications');
  };

  const handleLogoClick = () => {
    navigate('/vendor/dashboard');
  };

  return (
    <header
      className="sticky top-0 z-40 w-full bg-white"
      style={{
        borderBottom: '2px solid rgba(156, 163, 175, 0.3)',
        borderBottomLeftRadius: '20px',
        borderBottomRightRadius: '20px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left: Back button or Logo */}
        <div className="flex items-center gap-3">
          {showBack ? (
            <motion.button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-white/30 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <FiArrowLeft className="w-5 h-5" style={{ color: themeColors.button }} />
            </motion.button>
          ) : (
            <motion.div
              className="cursor-pointer"
              onClick={handleLogoClick}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Logo className="h-12 w-auto" />
            </motion.div>
          )}
          {showBack && <h1 className="text-lg font-bold text-gray-800">{title || 'Vendor'}</h1>}
        </div>

        {/* Right: Search and Notifications */}
        <div className="flex items-center gap-2">
          {showSearch && (
            <button
              className="p-2 rounded-full hover:bg-white/30 transition-colors active:scale-95"
              onClick={() => navigate('/vendor/jobs')}
            >
              <FiSearch className="w-5 h-5" style={{ color: themeColors.button }} />
            </button>
          )}
          {showNotifications && (
            <motion.div
              className="relative rounded-full cursor-pointer"
              style={{
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '2px'
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* 1. Animated Running Border */}
              <div
                className="absolute inset-[-2px] rounded-full z-0"
                style={{
                  background: themeColors.brand.conic,
                  animation: 'spin 2s linear infinite',
                  boxShadow: `0 0 8px ${themeColors.brand.orange}26`
                }}
              />

              {/* 2. White Mask (to hide center of conic gradient) */}
              <div className="absolute inset-[1px] rounded-full bg-white z-0" />

              {/* 3. Inner Button */}
              <motion.button
                onClick={handleNotifications}
                className="relative z-10 w-full h-full rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  background: notificationCount > 0
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.12) 100%)'
                    : 'linear-gradient(135deg, rgba(52, 121, 137, 0.1) 0%, rgba(187, 95, 54, 0.1) 100%)',
                  boxShadow: notificationCount > 0
                    ? '0 3px 12px rgba(239, 68, 68, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                    : '0 2px 6px rgba(52, 121, 137, 0.15)',
                }}
              >
                {/* Define Gradient for Icon */}
                <svg width="0" height="0" className="absolute">
                  <linearGradient id="homster-bell-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={themeColors.brand.teal} />
                    <stop offset="50%" stopColor={themeColors.brand.yellow} />
                    <stop offset="100%" stopColor={themeColors.brand.orange} />
                  </linearGradient>
                </svg>

                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiBell
                    className="w-5 h-5"
                    style={{
                      stroke: notificationCount > 0 ? '#EF4444' : 'url(#homster-bell-gradient)',
                      strokeWidth: '2.5',
                      color: 'transparent',
                      filter: notificationCount > 0
                        ? 'drop-shadow(0 2px 6px rgba(239, 68, 68, 0.4))'
                        : 'drop-shadow(0 1px 3px rgba(52, 121, 137, 0.3))',
                    }}
                  />
                </motion.div>
                {notificationCount > 0 && (
                  <span
                    className="absolute top-2 right-2 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center transform translate-x-1/2 -translate-y-1/2"
                    style={{
                      minWidth: '18px',
                      height: '18px',
                      fontSize: '10px',
                      boxShadow: '0 2px 5px rgba(239, 68, 68, 0.5), 0 0 0 2px #fff',
                    }}
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'VendorHeader';
export default Header;

