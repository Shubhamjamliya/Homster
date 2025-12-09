import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiGift, FiShoppingCart, FiUser } from 'react-icons/fi';
import { HiHome, HiGift, HiShoppingCart, HiUser } from 'react-icons/hi';
import { gsap } from 'gsap';

const BottomNav = ({ cartCount, onCartClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const iconRefs = useRef({});
  const activeAnimations = useRef({});
  const [iconTransitions, setIconTransitions] = React.useState({});

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
    { id: 'home', label: 'Appzeto', icon: FiHome, filledIcon: HiHome, path: '/' },
    { id: 'rewards', label: 'Rewards', icon: FiGift, filledIcon: HiGift, path: '/rewards' },
    { id: 'cart', label: 'Cart', icon: FiShoppingCart, filledIcon: HiShoppingCart, path: '/cart', isCart: true },
    { id: 'account', label: 'Account', icon: FiUser, filledIcon: HiUser, path: '/account' },
  ];

  const getActiveTab = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname === '/rewards') return 'rewards';
    if (location.pathname === '/cart') return 'cart';
    if (location.pathname === '/account') return 'account';
    return 'home';
  };

  const activeTab = getActiveTab();

  // Smooth icon transition when active state changes - slow fade
  useEffect(() => {
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
  }, [activeTab]);

  const handleTabClick = (path, itemId) => {
    // Animate icon on click - get ref immediately
    const iconRef = iconRefs.current[itemId];
    
    if (iconRef) {
      // Different animations for different icons
      let animation;
      switch (itemId) {
        case 'rewards':
          // Gift opening animation - scale and rotate - make it more visible
          gsap.killTweensOf(iconRef);
          // Reset to initial state first
          gsap.set(iconRef, { scale: 1, rotation: 0, x: 0, y: 0 });
          // Start animation immediately
          // Create timeline for better control over exit animation
          const tl = gsap.timeline({
            onStart: () => {
              iconRef.style.willChange = 'transform';
            },
            onComplete: () => {
              gsap.set(iconRef, { scale: 1, rotation: 0 });
              iconRef.style.willChange = 'auto';
              delete activeAnimations.current[itemId];
            }
          });
          
          // Forward animation - fast
          tl.to(iconRef, {
            scale: 1.5,
            rotation: 25,
            duration: 1.0,
            ease: 'power2.out',
          })
          // Exit animation - slow
          .to(iconRef, {
            scale: 1,
            rotation: 0,
            duration: 2.0,
            ease: 'power1.inOut',
          });
          
          animation = tl;
          activeAnimations.current[itemId] = animation;
          
          // Delay navigation significantly to let animation be visible and continue
          setTimeout(() => {
            navigate(path);
          }, 800);
          return; // Return early to prevent double navigation
          break;
        case 'cart':
          // Cart moving animation - translate X - slow and visible
          gsap.killTweensOf(iconRef);
          gsap.set(iconRef, { scale: 1, rotation: 0, x: 0, y: 0 });
          animation = gsap.to(iconRef, {
            x: 8,
            duration: 0.5,
            yoyo: true,
            repeat: 2,
            ease: 'power1.inOut',
            onStart: () => {
              iconRef.style.willChange = 'transform';
            },
            onComplete: () => {
              gsap.set(iconRef, { x: 0 });
              iconRef.style.willChange = 'auto';
              delete activeAnimations.current[itemId];
            }
          });
          activeAnimations.current[itemId] = animation;
          
          // Delay navigation to let animation be visible
          setTimeout(() => {
            navigate(path);
          }, 600);
          return;
          break;
        case 'account':
          // Pulse animation - slow and visible
          gsap.killTweensOf(iconRef);
          gsap.set(iconRef, { scale: 1, rotation: 0, x: 0, y: 0 });
          animation = gsap.to(iconRef, {
            scale: 1.3,
            duration: 1.2,
            yoyo: true,
            repeat: 1,
            ease: 'power2.out',
            onStart: () => {
              iconRef.style.willChange = 'transform';
            },
            onComplete: () => {
              gsap.set(iconRef, { scale: 1 });
              iconRef.style.willChange = 'auto';
              delete activeAnimations.current[itemId];
            }
          });
          activeAnimations.current[itemId] = animation;
          
          // Delay navigation to let animation be visible
          setTimeout(() => {
            navigate(path);
          }, 800);
          return;
          break;
        case 'home':
          // Bounce animation - slow and visible
          gsap.killTweensOf(iconRef);
          gsap.set(iconRef, { scale: 1, rotation: 0, x: 0, y: 0 });
          animation = gsap.to(iconRef, {
            y: -10,
            duration: 1.2,
            yoyo: true,
            repeat: 1,
            ease: 'power2.out',
            onStart: () => {
              iconRef.style.willChange = 'transform';
            },
            onComplete: () => {
              gsap.set(iconRef, { y: 0 });
              iconRef.style.willChange = 'auto';
              delete activeAnimations.current[itemId];
            }
          });
          activeAnimations.current[itemId] = animation;
          
          // Delay navigation to let animation be visible
          setTimeout(() => {
            navigate(path);
          }, 800);
          return;
          break;
        default:
          // Default scale animation
          gsap.killTweensOf(iconRef);
          gsap.set(iconRef, { scale: 1, rotation: 0, x: 0, y: 0 });
          animation = gsap.to(iconRef, {
            scale: 1.2,
            duration: 0.5,
            yoyo: true,
            repeat: 1,
            ease: 'power2.out',
            onComplete: () => {
              gsap.set(iconRef, { scale: 1 });
              delete activeAnimations.current[itemId];
            }
          });
          activeAnimations.current[itemId] = animation;
      }
    }
    
    // Default navigation (should not reach here for rewards, cart, account, home)
    setTimeout(() => {
      navigate(path);
    }, 100);
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
              className={`flex flex-col items-center justify-center gap-1 py-1.5 px-4 rounded-xl transition-all duration-300 relative ${
                isActive 
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
                      color: isActive ? '#00a6a6' : '#6b7280',
                      transition: 'opacity 2s ease-in-out, color 2s ease-in-out',
                      transform: 'scale(1)',
                      opacity: iconTransitions[item.id]?.opacity !== undefined ? iconTransitions[item.id].opacity : 1,
                      filter: isActive ? 'drop-shadow(0 2px 4px rgba(0, 166, 166, 0.3))' : 'none'
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
                      color: isActive ? '#00a6a6' : '#6b7280',
                      transition: 'opacity 2s ease-in-out, color 2s ease-in-out',
                      transform: 'scale(1)',
                      opacity: iconTransitions[item.id]?.opacity !== undefined ? iconTransitions[item.id].opacity : 1,
                      filter: isActive ? 'drop-shadow(0 2px 4px rgba(0, 166, 166, 0.3))' : 'none'
                    }}
                  />
                </div>
              )}
              <span 
                className={`text-[10px] font-semibold transition-all duration-300 ${
                  isActive ? 'text-[#00a6a6]' : 'text-gray-500'
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
                    background: 'linear-gradient(135deg, #00a6a6 0%, #29ad81 100%)',
                    boxShadow: '0 0 6px rgba(0, 166, 166, 0.6)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

