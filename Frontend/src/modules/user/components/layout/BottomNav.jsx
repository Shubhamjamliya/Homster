import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiShoppingCart, FiUser, FiTrash2, FiCalendar } from 'react-icons/fi';
import { HiHome, HiShoppingCart, HiUser, HiTrash, HiCalendar } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useCart } from '../../../../context/CartContext';

// Unified Brand Teal Palette for Premium Cohesion
const brandNavTheme = {
  primary: '#347989',
  gradient: 'linear-gradient(135deg, #347989 0%, #27616e 100%)',
  bg: 'rgba(52, 121, 137, 0.08)',
  shadow: 'rgba(52, 121, 137, 0.35)',
};

const BottomNav = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  const navItems = useMemo(() => [
    { id: 'home', label: 'Home', icon: FiHome, filledIcon: HiHome, path: '/user' },
    { id: 'bookings', label: 'Bookings', icon: FiCalendar, filledIcon: HiCalendar, path: '/user/my-bookings' },
    { id: 'scrap', label: 'Scrap', icon: FiTrash2, filledIcon: HiTrash, path: '/user/scrap' },
    { id: 'cart', label: 'Cart', icon: FiShoppingCart, filledIcon: HiShoppingCart, path: '/user/cart', isCart: true },
    { id: 'account', label: 'Account', icon: FiUser, filledIcon: HiUser, path: '/user/account' },
  ], []);

  const getActiveTab = () => {
    if (location.pathname === '/user' || location.pathname === '/user/') return 'home';
    if (location.pathname === '/user/my-bookings') return 'bookings';
    if (location.pathname === '/user/scrap') return 'scrap';
    if (location.pathname === '/user/cart') return 'cart';
    if (location.pathname === '/user/account') return 'account';
    return 'home';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (path) => {
    navigate(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 w-full lg:hidden select-none"
      style={{
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      <div
        className="w-full pb-3 pt-2 px-3 rounded-t-[24px]"
        style={{
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.05)',
          borderTop: '1px solid rgba(226, 232, 240, 0.8)',
        }}
      >
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          {navItems.map((item) => {
            const IconComponent = activeTab === item.id ? item.filledIcon : item.icon;
            const isActive = activeTab === item.id;

            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.path)}
                whileTap={{ scale: 0.92 }}
                className="flex flex-col items-center justify-center w-16 h-13 rounded-2xl transition-colors duration-200 relative py-1 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none [-webkit-tap-highlight-color:transparent]"
              >
                {/* Active Top Sliding Bar Indicator via Framer Motion LayoutId */}
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -top-2 h-[3px] w-7 rounded-full pointer-events-none"
                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 35,
                    }}
                    style={{
                      background: brandNavTheme.gradient,
                      boxShadow: `0 2px 8px ${brandNavTheme.shadow}`,
                    }}
                  />
                )}

                {/* Active Pill Background */}
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-bg"
                    className="absolute inset-x-1 inset-y-0.5 rounded-xl pointer-events-none"
                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 35,
                    }}
                    style={{
                      background: brandNavTheme.bg,
                    }}
                  />
                )}

                <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                  <motion.div
                    className="relative mb-0.5"
                    animate={{
                      scale: isActive ? 1.08 : 1,
                      y: isActive ? -1 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  >
                    <IconComponent
                      className="w-5.5 h-5.5 transition-colors duration-200"
                      style={{
                        color: isActive ? brandNavTheme.primary : '#94A3B8',
                      }}
                    />
                    {item.isCart && cartCount > 0 && (
                      <span
                        className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9px] font-extrabold rounded-full min-w-[17px] h-[17px] flex items-center justify-center border-2 border-white shadow-sm"
                      >
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </motion.div>
                  <span
                    className={`text-[10px] tracking-tight transition-colors duration-200 ${
                      isActive ? 'font-bold text-[#347989]' : 'font-medium text-slate-500'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';

export default BottomNav;
