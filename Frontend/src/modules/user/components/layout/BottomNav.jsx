import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiGift, FiShoppingCart, FiUser } from 'react-icons/fi';
import { HiHome, HiGift, HiShoppingCart, HiUser } from 'react-icons/hi';
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
          console.error('Error loading cart count:', error);
          setCartCount(0);
        }
      }
    };

    loadCartCount();
    // Refresh cart count every 10 seconds
    const interval = setInterval(loadCartCount, 10000);

    // Also listen for focus to update when user returns to tab
    const handleFocus = () => {
      loadCartCount();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
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
    { id: 'home', label: 'Appzeto', icon: FiHome, filledIcon: HiHome, path: '/user' },
    { id: 'rewards', label: 'Rewards', icon: FiGift, filledIcon: HiGift, path: '/user/rewards' },
    { id: 'cart', label: 'Cart', icon: FiShoppingCart, filledIcon: HiShoppingCart, path: '/user/cart', isCart: true },
    { id: 'account', label: 'Account', icon: FiUser, filledIcon: HiUser, path: '/user/account' },
  ];

  const getActiveTab = () => {
    if (location.pathname === '/user' || location.pathname === '/user/') return 'home';
    if (location.pathname === '/user/rewards') return 'rewards';
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
      className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 50%, #ffffff 100%)',
        borderTop: '1px solid rgba(0, 166, 166, 0.2)',
        boxShadow: '0 -4px 20px rgba(0, 166, 166, 0.15), 0 -2px 8px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        position: 'fixed',
        width: '100%',
        willChange: 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {/* Gradient overlay for extra depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0, 166, 166, 0.05) 0%, transparent 100%)',
        }}
      />

      <div className="relative flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const IconComponent = activeTab === item.id ? item.filledIcon : item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                handleTabClick(item.path, item.id);
              }}
              className={`flex flex-col items-center justify-center gap-1 py-1.5 px-4 rounded-xl transition-all duration-300 relative ${isActive
                  ? 'transform scale-105'
                  : 'hover:bg-white/50 active:scale-95'
                }`}
              style={isActive ? {
                background: 'linear-gradient(135deg, rgba(0, 166, 166, 0.15) 0%, rgba(41, 173, 129, 0.1) 100%)',
                boxShadow: '0 2px 8px rgba(0, 166, 166, 0.2)',
              } : {}}
            >
              {item.isCart ? (
                <div
                  ref={(el) => {
                    if (el) {
                      iconRefs.current[item.id] = el;
                    }
                  }}
                  className="relative"
                  style={{ transform: 'translateX(0) translateY(0) scale(1) rotate(0deg)' }}
                >
                  <IconComponent
                    className="w-5 h-5"
                    style={{
                      color: isActive ? themeColors.button : '#6b7280',
                      transition: 'opacity 2s ease-in-out, color 2s ease-in-out',
                      transform: 'scale(1)',
                      opacity: iconTransitions[item.id]?.opacity !== undefined ? iconTransitions[item.id].opacity : 1,
                      filter: isActive ? `drop-shadow(0 2px 4px rgba(0, 166, 166, 0.3))` : 'none'
                    }}
                  />
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 z-10"
                      style={{
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
                      }}
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
              ) : (
                <div
                  ref={(el) => {
                    if (el) {
                      iconRefs.current[item.id] = el;
                    }
                  }}
                  style={{ transform: 'translateX(0) translateY(0) scale(1) rotate(0deg)' }}
                >
                  <IconComponent
                    className="w-5 h-5"
                    style={{
                      color: isActive ? themeColors.button : '#6b7280',
                      transition: 'opacity 2s ease-in-out, color 2s ease-in-out',
                      transform: 'scale(1)',
                      opacity: iconTransitions[item.id]?.opacity !== undefined ? iconTransitions[item.id].opacity : 1,
                      filter: isActive ? `drop-shadow(0 2px 4px rgba(0, 166, 166, 0.3))` : 'none'
                    }}
                  />
                </div>
              )}
              <span
                className={`text-[10px] font-semibold transition-all duration-300 ${isActive ? 'text-gray-500' : 'text-gray-500'
                  }`}
                style={{
                  textShadow: isActive ? '0 1px 2px rgba(0, 166, 166, 0.2)' : 'none'
                }}
              >
                {item.label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <div
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.button} 0%, ${themeColors.icon} 100%)`,
                    boxShadow: `0 0 6px rgba(0, 166, 166, 0.6)`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';

export default BottomNav;

