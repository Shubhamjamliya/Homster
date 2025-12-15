import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBell, FiSearch } from 'react-icons/fi';
import { gsap } from 'gsap';
import { workerTheme as themeColors } from '../../../../theme';
import { animateLogo } from '../../../../utils/gsapAnimations';

const Header = ({ title, onBack, showBack = true, showSearch = false, showNotifications = true, notificationCount = 0 }) => {
  const navigate = useNavigate();
  const logoRef = useRef(null);
  const bellRef = useRef(null);
  const bellButtonRef = useRef(null);

  useEffect(() => {
    if (logoRef.current && !showBack) {
      animateLogo(logoRef.current);
      gsap.fromTo(logoRef.current,
        {
          opacity: 0,
          scale: 0.8,
          y: -10
        },
        {
          opacity: 1,
          scale: 1.0,
          y: 0,
          duration: 0.6,
          ease: 'back.out(1.7)'
        }
      );
    }
  }, [showBack]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleNotifications = () => {
    navigate('/worker/notifications');
  };

  const handleLogoClick = () => {
    navigate('/worker/dashboard');
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
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-white/30 transition-colors active:scale-95"
            >
              <FiArrowLeft className="w-5 h-5" style={{ color: themeColors.button }} />
            </button>
          ) : (
            <div
              className="cursor-pointer"
              onClick={handleLogoClick}
              onMouseEnter={() => {
                if (logoRef.current) {
                  gsap.to(logoRef.current, {
                    scale: 1.2,
                    duration: 0.3,
                    ease: 'power2.out',
                  });
                }
              }}
              onMouseLeave={() => {
                if (logoRef.current) {
                  gsap.to(logoRef.current, {
                    scale: 1.0,
                    duration: 0.3,
                    ease: 'power2.out',
                  });
                }
              }}
            >
              <img
                ref={logoRef}
                src="/Appzeto-logo.png"
                alt="Appzeto"
                className="h-12 w-auto object-contain"
              />
            </div>
          )}
          {showBack && <h1 className="text-lg font-bold text-gray-800">{title || 'Worker'}</h1>}
        </div>

        {/* Right: Search and Notifications */}
        <div className="flex items-center gap-2">
          {showSearch && (
            <button
              className="p-2 rounded-full hover:bg-white/30 transition-colors active:scale-95"
              onClick={() => navigate('/worker/jobs')}
            >
              <FiSearch className="w-5 h-5" style={{ color: themeColors.button }} />
            </button>
          )}
          {showNotifications && (
            <button
              ref={bellButtonRef}
              onClick={handleNotifications}
              className="relative p-2.5 rounded-full transition-all duration-300 active:scale-95"
              style={{
                background: notificationCount > 0
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.12) 100%)'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)',
                boxShadow: notificationCount > 0
                  ? '0 3px 12px rgba(239, 68, 68, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                  : '0 2px 6px rgba(59, 130, 246, 0.15)',
                border: notificationCount > 0
                  ? '1px solid rgba(239, 68, 68, 0.3)'
                  : '1px solid rgba(59, 130, 246, 0.2)',
              }}
              onMouseEnter={() => {
                if (bellButtonRef.current && bellRef.current) {
                  gsap.to(bellButtonRef.current, {
                    scale: 1.15,
                    boxShadow: notificationCount > 0
                      ? '0 6px 20px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                      : '0 4px 12px rgba(59, 130, 246, 0.25)',
                    duration: 0.3,
                    ease: 'power2.out',
                  });
                  gsap.to(bellRef.current, {
                    rotation: 15,
                    scale: 1.1,
                    duration: 0.3,
                    ease: 'power2.out',
                  });
                }
              }}
              onMouseLeave={() => {
                if (bellButtonRef.current && bellRef.current) {
                  gsap.to(bellButtonRef.current, {
                    scale: 1.0,
                    boxShadow: notificationCount > 0
                      ? '0 3px 12px rgba(239, 68, 68, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                      : '0 2px 6px rgba(59, 130, 246, 0.15)',
                    duration: 0.3,
                    ease: 'power2.out',
                  });
                  gsap.to(bellRef.current, {
                    rotation: 0,
                    scale: 1.0,
                    duration: 0.3,
                    ease: 'power2.out',
                  });
                }
              }}
            >
              <FiBell
                ref={bellRef}
                className="w-6 h-6 transition-all duration-300"
                style={{
                  color: notificationCount > 0 ? '#EF4444' : themeColors.button,
                  filter: notificationCount > 0
                    ? 'drop-shadow(0 2px 6px rgba(239, 68, 68, 0.4))'
                    : 'drop-shadow(0 1px 3px rgba(59, 130, 246, 0.3))',
                }}
              />
              {notificationCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  style={{
                    minWidth: '22px',
                    height: '22px',
                    padding: '0 6px',
                    fontSize: '11px',
                    boxShadow: '0 3px 10px rgba(239, 68, 68, 0.6), 0 0 0 2.5px rgba(255, 255, 255, 0.9)',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  }}
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

