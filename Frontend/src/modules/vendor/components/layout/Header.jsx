import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBell, FiSearch } from 'react-icons/fi';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { vendorTheme as themeColors } from '../../../../theme';
import Logo from '../../../../components/common/Logo';
import api from '../../../../services/api';

const Header = memo(({
  title,
  onBack,
  showBack = true,
  showSearch = false,
  showNotifications = true,
  notificationCount = 0
}) => {
  const navigate = useNavigate();
  const [fetchedCount, setFetchedCount] = useState(0);

  // Fetch unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/notifications/vendor');
        if (res.data.success && typeof res.data.unreadCount === 'number') {
          setFetchedCount(res.data.unreadCount);
        }
      } catch {
        // Silent fail
      }
    };

    if (showNotifications) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 60000); // Poll every minute
      return () => clearInterval(interval);
    }
  }, [showNotifications]);

  const count = notificationCount || fetchedCount;

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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100/90 shadow-xs">
      <div className="px-4 py-2.5 flex items-center justify-between">
        {/* Left: Back button or Logo */}
        <div className="flex items-center gap-2.5">
          {showBack ? (
            <motion.button
              onClick={handleBack}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <FiArrowLeft className="w-5 h-5" style={{ color: themeColors.button }} />
            </motion.button>
          ) : (
            <motion.div
              className="cursor-pointer"
              onClick={handleLogoClick}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Logo className="h-8 w-auto" />
            </motion.div>
          )}
          {showBack && <h1 className="text-base font-bold text-gray-800 tracking-tight">{title || 'Vendor'}</h1>}
        </div>

        {/* Right: Search and Notifications */}
        <div className="flex items-center gap-1.5">
          {showSearch && (
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors active:scale-95"
              onClick={() => navigate('/vendor/jobs')}
            >
              <FiSearch className="w-4.5 h-4.5" style={{ color: themeColors.button }} />
            </button>
          )}
          {showNotifications && (
            <motion.div
              className="relative rounded-full cursor-pointer"
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* 1. Animated Running Border */}
              <div
                className="absolute inset-[-1.5px] rounded-full z-0"
                style={{
                  background: themeColors.brand.conic,
                  animation: 'spin 2s linear infinite',
                  boxShadow: `0 0 6px ${themeColors.brand.orange}20`
                }}
              />

              {/* 2. White Mask */}
              <div className="absolute inset-[1px] rounded-full bg-white z-0" />

              {/* 3. Inner Button */}
              <motion.button
                onClick={handleNotifications}
                className="relative z-10 w-full h-full rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  background: count > 0
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(52, 121, 137, 0.08) 0%, rgba(187, 95, 54, 0.08) 100%)',
                  boxShadow: count > 0
                    ? '0 2px 8px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                    : '0 1px 4px rgba(52, 121, 137, 0.12)',
                }}
              >
                {/* Define Gradient for Icon */}
                <svg width="0" height="0" className="absolute">
                  <linearGradient id="homestr-bell-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={themeColors.brand.teal} />
                    <stop offset="50%" stopColor={themeColors.brand.yellow} />
                    <stop offset="100%" stopColor={themeColors.brand.orange} />
                  </linearGradient>
                </svg>

                <motion.div
                  whileHover={{ rotate: 12 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiBell
                    className="w-4 h-4"
                    style={{
                      stroke: count > 0 ? '#EF4444' : 'url(#homestr-bell-gradient)',
                      strokeWidth: '2.5',
                      color: 'transparent',
                      filter: count > 0
                        ? 'drop-shadow(0 1px 4px rgba(239, 68, 68, 0.35))'
                        : 'drop-shadow(0 1px 2px rgba(52, 121, 137, 0.25))',
                    }}
                  />
                </motion.div>
              </motion.button>
              {/* 4. Active Badge */}
              {count > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center z-20"
                  style={{
                    minWidth: '17px',
                    height: '17px',
                    boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4), 0 0 0 1.5px #fff',
                    border: '1.5px solid #fff'
                  }}
                >
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'VendorHeader';
export default Header;
