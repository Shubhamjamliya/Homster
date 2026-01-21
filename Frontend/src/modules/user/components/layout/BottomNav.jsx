import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiGift, FiShoppingCart, FiUser, FiTrash2, FiCalendar } from 'react-icons/fi';
import { HiHome, HiGift, HiShoppingCart, HiUser, HiTrash, HiCalendar } from 'react-icons/hi';
import { gsap } from 'gsap';
import { themeColors } from '../../../../theme';

const BottomNav = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const iconRefs = useRef({});
  const activeAnimations = useRef({});
  const [iconTransitions, setIconTransitions] = React.useState({});
  const [cartCount, setCartCount] = useState(0);

  // Load cart count from backend
  useEffect(() => {
    const loadCartCount = async () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setCartCount(0);
          return;
        }

        const { cartService } = await import('../../../../services/cartService');
        const response = await cartService.getCart();
        if (response.success) {
          setCartCount((response.data || []).length);
        }
      } catch (error) {
        // Silently fail if user not authenticated
        if (error.response?.status === 401 || error.response?.status === 403) {
          setCartCount(0);
        } else {
          setCartCount(0);
        }
      }
    };

    loadCartCount();
    // Refresh cart count every 10 seconds
    // const interval = setInterval(loadCartCount, 10000);
    // Remove polling to prevent console spam - relying on focus and route changes instead

    // Also listen for focus to update when user returns to tab
    const handleFocus = () => {
      loadCartCount();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      // clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      Object.values(activeAnimations.current).forEach(anim => {
        if (anim && anim.isActive()) {
          // Don't kill if still active, let it complete
        }
      });
    };
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: FiHome, filledIcon: HiHome, path: '/user' },
    { id: 'bookings', label: 'Bookings', icon: FiCalendar, filledIcon: HiCalendar, path: '/user/my-bookings' },
    { id: 'scrap', label: 'Scrap', icon: FiTrash2, filledIcon: HiTrash, path: '/user/scrap' },
    { id: 'cart', label: 'Cart', icon: FiShoppingCart, filledIcon: HiShoppingCart, path: '/user/cart', isCart: true },
    { id: 'account', label: 'Account', icon: FiUser, filledIcon: HiUser, path: '/user/account' },
  ];

  const getActiveTab = () => {
    if (location.pathname === '/user' || location.pathname === '/user/') return 'home';
    if (location.pathname === '/user/my-bookings') return 'bookings';
    if (location.pathname === '/user/scrap') return 'scrap';
    if (location.pathname === '/user/cart') return 'cart';
    if (location.pathname === '/user/account') return 'account';
    return 'home';
  };

  const activeTab = getActiveTab();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Mark initial load as complete after first render
  useEffect(() => {
    // Use requestIdleCallback or setTimeout to defer after page load
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Smooth icon transition when active state changes - slow fade
  // Only run animations after initial load to avoid blocking page render
  useEffect(() => {
    // Skip animation on initial load
    if (isInitialLoad) {
      // Set initial state without animation
      navItems.forEach((item) => {
        const isActive = activeTab === item.id;
        setIconTransitions(prev => ({
          ...prev,
          [item.id]: { isActive, opacity: 1 }
        }));
      });
      return;
    }

    // Run animation only on route changes (not initial load)
    navItems.forEach((item) => {
      const isActive = activeTab === item.id;
      setIconTransitions(prev => ({
        ...prev,
        [item.id]: { isActive, opacity: 0 }
      }));

      // Slow fade in new icon
      setTimeout(() => {
        setIconTransitions(prev => ({
          ...prev,
          [item.id]: { isActive, opacity: 1 }
        }));
      }, 200);
    });
  }, [activeTab, isInitialLoad]);

  const handleTabClick = (path, itemId) => {
    // Navigate immediately for better performance - no delays
    navigate(path);

    // Optional: Simple CSS animation without blocking navigation
    const iconRef = iconRefs.current[itemId];
    if (iconRef) {
      // Simple scale animation without GSAP delays
      iconRef.style.transition = 'transform 0.2s ease';
      iconRef.style.transform = 'scale(1.15)';
      setTimeout(() => {
        if (iconRef) {
          iconRef.style.transform = 'scale(1)';
        }
      }, 150);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 w-full"
      style={{
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      <div
        className="w-full pb-4 pt-2 px-2"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.05)',
          borderTop: '1px solid rgba(229, 231, 235, 0.5)',
        }}
      >
        <div className="flex items-center justify-around max-w-md mx-auto relative">


          {navItems.map((item) => {
            const IconComponent = activeTab === item.id ? item.filledIcon : item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  handleTabClick(item.path, item.id);
                }}
                className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-300 relative group`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div
                    className="absolute -top-2 w-8 h-1 rounded-b-full"
                    style={{
                      background: themeColors.gradient,
                      boxShadow: `0 2px 8px ${themeColors.brand.teal}4D`,
                    }}
                  />
                )}

                {/* Active Background - Very Subtle Teal Tint */}
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-xl scale-90"
                    style={{ backgroundColor: `${themeColors.brand.teal}0A` }}
                  />
                )}

                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className="relative mb-1">
                    <IconComponent
                      className={`w-6 h-6 transition-all duration-300 ${isActive ? 'scale-110' : 'text-gray-400 group-hover:text-gray-600'}`}
                      style={{
                        color: isActive ? themeColors.button : undefined,
                        filter: isActive ? `drop-shadow(0 2px 4px ${themeColors.brand.teal}1A)` : 'none'
                      }}
                    />
                    {item.isCart && cartCount > 0 && (
                      <span
                        className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-red-500 to-red-600 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center border-2 border-white shadow-sm"
                      >
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] transition-colors duration-300 ${isActive ? 'font-bold' : 'font-medium text-gray-500'}`}
                    style={{ color: isActive ? themeColors.button : undefined }}
                  >
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';

export default BottomNav;

