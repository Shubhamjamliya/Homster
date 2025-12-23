import React, { useRef, useEffect, useState, memo, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiBriefcase, FiUsers, FiUser } from 'react-icons/fi';
import { HiHome, HiBriefcase, HiUsers, HiUser } from 'react-icons/hi';
import { FaWallet } from 'react-icons/fa';
import { gsap } from 'gsap';
import { vendorTheme as themeColors } from '../../../../theme';

const BottomNav = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const iconRefs = useRef({});
  const activeAnimations = useRef({});
  const [pendingJobsCount, setPendingJobsCount] = useState(0);

  // Load pending jobs count from localStorage (mock data for now)
  useEffect(() => {
    const updatePendingCount = () => {
      try {
        // Count active jobs (PENDING only) to show new requests
        const acceptedBookings = JSON.parse(localStorage.getItem('vendorAcceptedBookings') || '[]');
        const activeJobs = acceptedBookings.filter(job => job.status === 'PENDING');
        setPendingJobsCount(activeJobs.length);
      } catch (error) {
        console.error('Error reading pending jobs:', error);
      }
    };

    updatePendingCount();
    window.addEventListener('storage', updatePendingCount);
    window.addEventListener('vendorJobsUpdated', updatePendingCount);

    return () => {
      window.removeEventListener('storage', updatePendingCount);
      window.removeEventListener('vendorJobsUpdated', updatePendingCount);
    };
  }, []);

  // Use useMemo to update navItems when pendingJobsCount changes
  const navItems = useMemo(() => {
    // Count jobs that require attention (Pending, Accepted, In Progress)
    const badgeCount = pendingJobsCount;

    return [
      { path: '/vendor/dashboard', icon: FiHome, activeIcon: HiHome, label: 'Home' },
      { path: '/vendor/jobs', icon: FiBriefcase, activeIcon: HiBriefcase, label: 'Jobs', badge: badgeCount },
      { path: '/vendor/workers', icon: FiUsers, activeIcon: HiUsers, label: 'Workers' },
      { path: '/vendor/wallet', icon: FaWallet, activeIcon: FaWallet, label: 'Wallet' },
      { path: '/vendor/profile', icon: FiUser, activeIcon: HiUser, label: 'Profile' },
    ];
  }, [pendingJobsCount]);

  const handleNavClick = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  // Animate icons on mount and when location changes
  useEffect(() => {
    navItems.forEach((item, index) => {
      const iconKey = item.path;
      const isActive = location.pathname === item.path ||
        (item.path === '/vendor/dashboard' && location.pathname === '/vendor');

      if (iconRefs.current[iconKey]) {
        // Kill any existing animation
        if (activeAnimations.current[iconKey]) {
          activeAnimations.current[iconKey].kill();
        }

        if (isActive) {
          // Active state animation
          activeAnimations.current[iconKey] = gsap.to(iconRefs.current[iconKey], {
            scale: 1.2,
            color: themeColors.button,
            duration: 0.3,
            ease: 'back.out(1.7)',
          });
        } else {
          // Inactive state
          activeAnimations.current[iconKey] = gsap.to(iconRefs.current[iconKey], {
            scale: 1,
            color: '#6B7280',
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      }
    });
  }, [location.pathname, navItems]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 9999,
        willChange: 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        borderTop: '2px solid rgba(0, 0, 0, 0.35)',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.15), 0 -4px 12px rgba(0, 0, 0, 0.1), 0 -2px 6px rgba(0, 0, 0, 0.08)',
        background: 'linear-gradient(to top, #FFFFFF 0%, #FAFAFA 100%)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/vendor/dashboard' && location.pathname === '/vendor');
          const IconComponent = isActive ? item.activeIcon : item.icon;

          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className="flex flex-col items-center justify-center relative px-4 py-2 rounded-xl transition-all duration-300"
              style={{
                minWidth: '60px',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(0, 166, 166, 0.1) 0%, rgba(0, 166, 166, 0.05) 100%)'
                  : 'transparent',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  gsap.to(e.currentTarget, {
                    background: 'linear-gradient(135deg, rgba(0, 166, 166, 0.08) 0%, rgba(0, 166, 166, 0.03) 100%)',
                    scale: 1.05,
                    duration: 0.2,
                    ease: 'power2.out',
                  });
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  gsap.to(e.currentTarget, {
                    background: 'transparent',
                    scale: 1.0,
                    duration: 0.2,
                    ease: 'power2.out',
                  });
                }
              }}
            >
              <div className="relative" style={{ position: 'relative' }}>
                <IconComponent
                  ref={(el) => {
                    iconRefs.current[item.path] = el;
                  }}
                  className="w-5 h-5"
                  style={{
                    color: isActive ? themeColors.button : '#6B7280',
                  }}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className="absolute bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                    style={{
                      top: '-6px',
                      right: '-8px',
                      minWidth: '20px',
                      height: '20px',
                      padding: '0 5px',
                      fontSize: '11px',
                      lineHeight: '20px',
                      border: '2px solid white',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)',
                      fontWeight: '700',
                      zIndex: 50,
                    }}
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className="text-[10px] font-semibold mt-1"
                style={{
                  color: isActive ? themeColors.button : '#6B7280',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';
export default BottomNav;

