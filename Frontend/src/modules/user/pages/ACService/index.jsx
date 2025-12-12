import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../../theme';
import StickyHeader from '../../components/common/StickyHeader';
import StickySubHeading from '../../components/common/StickySubHeading';
import BannerSection from '../../components/common/BannerSection';
import RatingSection from '../../components/common/RatingSection';
import PaymentOffers from '../../components/common/PaymentOffers';
import ServiceCategoriesGrid from '../../components/common/ServiceCategoriesGrid';
import MenuModal from '../../components/common/MenuModal';
import CategoryCart from '../../components/common/CategoryCart';
import SuperSaverPackages from './components/SuperSaverPackages';
import ServiceSection from './components/ServiceSection';
import RepairGasRefillSection from './components/RepairGasRefillSection';
import InstallationSection from './components/InstallationSection';
import acRepair from '../../../../assets/images/pages/Home/ServiceCategorySection/ApplianceServices/ac-repair.jpg';
import acRepairService from '../../../../assets/images/pages/Home/CuratedServices/ac-repair-service.jpg';

const ACService = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [currentSection, setCurrentSection] = useState('');
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [showCategoryCartModal, setShowCategoryCartModal] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Refs for sections
  const bannerRef = useRef(null);

  // Load cart count and items from localStorage on mount
  useEffect(() => {
    const updateCart = () => {
      const items = JSON.parse(localStorage.getItem('cartItems') || '[]');
      setCartItems(items);
      setCartCount(items.length);
    };

    updateCart();

    // Listen for cart updates
    window.addEventListener('cartUpdated', updateCart);

    return () => {
      window.removeEventListener('cartUpdated', updateCart);
    };
  }, []);

  // Handle scroll to show/hide sticky header and detect current section
  useEffect(() => {
    // Use scroll-based detection (simple and reliable)
    let ticking = false;
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const isScrollingUp = currentScrollY < lastScrollY;
          lastScrollY = currentScrollY;
          
          if (bannerRef.current) {
            const rect = bannerRef.current.getBoundingClientRect();
            
            // Priority 1: If scrolling up AND near top AND banner is becoming visible, hide header immediately
            const isNearTop = currentScrollY < 150;
            const bannerBecomingVisible = rect.top < 300; // Banner is close to or in viewport
            
            if (isScrollingUp && isNearTop && bannerBecomingVisible) {
              setShowStickyHeader(false);
              setCurrentSection('');
              ticking = false;
              return;
            }
            
            // Priority 2: Normal scrolling - show header when banner is scrolled past
            const bannerScrolledPast = rect.bottom <= 0;
            setShowStickyHeader(bannerScrolledPast);

            // Detect sections when scrolled past banner
            if (bannerScrolledPast) {
              const sectionIds = [
                'super-saver-packages',
                'service',
                'repair-gas-refill',
                'installation-uninstallation',
              ];

              const headerOffset = 57;
              let activeSection = '';

              // Check sections in reverse order (bottom to top)
              for (let i = sectionIds.length - 1; i >= 0; i--) {
                const element = document.getElementById(sectionIds[i]);
                if (element) {
                  const sectionRect = element.getBoundingClientRect();
                  if (sectionRect.top <= headerOffset + 50) {
                    const titleMap = {
                      'super-saver-packages': 'Super saver packages',
                      'service': 'Service',
                      'repair-gas-refill': 'Repair & gas refill',
                      'installation-uninstallation': 'Installation/uninstallation',
                    };
                    activeSection = titleMap[sectionIds[i]];
                    break;
                  }
                }
              }

              setCurrentSection(activeSection);
            } else {
              setCurrentSection('');
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check - wait a bit for refs to be ready
    const timeoutId = setTimeout(() => {
      handleScroll();
    }, 200);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleBack = () => {
    setIsExiting(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Navigate immediately
    navigate('/user', { replace: true, state: { scrollToTop: true } });
  };

  const handleSearch = () => {
  };

  const handleShare = () => {
  };

  const handleCategoryClick = (category) => {
    // Scroll to the corresponding section on the same page
    const sectionId = category.title.toLowerCase().replace(/\s+/g, '-');
    
    // Account for sticky header offset
    const headerOffset = showStickyHeader ? 97 : 0; // 57px header + 40px subheading when visible
    
    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleAddClick = (service) => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    
    const cartItem = {
      id: Date.now(),
      title: service.title || service.name,
      price: parseInt(service.price?.replace(/,/g, '') || service.price || 0),
      serviceCount: 1,
      description: service.description || service.subtitle || service.title || 'Service',
      icon: service.icon || service.image || null,
      category: 'AC Service',
      originalPrice: service.originalPrice ? parseInt(service.originalPrice.replace(/,/g, '')) : null,
      rating: service.rating || null,
      reviews: service.reviews || null,
    };
    
    cartItems.push(cartItem);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    setCartCount(cartItems.length);
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success(`${service.title || 'Item'} added to cart!`);
  };

  const handleViewDetails = (service) => {
  };

  const handleMenuClick = () => {
    setIsMenuModalOpen(true);
  };

  const handleMenuCategoryClick = (category) => {
    if (category.title === 'Super saver packages') {
      const element = document.getElementById('super-saver-packages');
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (category.title === 'Service') {
      const element = document.getElementById('service');
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (category.title === 'Repair & gas refill') {
      const element = document.getElementById('repair-gas-refill');
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (category.title === 'Installation/uninstallation') {
      const element = document.getElementById('installation-uninstallation');
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleViewCartClick = () => {
    setShowCategoryCartModal(true);
  };

  const handleCategoryCartClose = () => {
    setShowCategoryCartModal(false);
  };

  // Show CategoryCart component when view cart is clicked
  if (showCategoryCartModal) {
    return (
      <CategoryCart
        isOpen={true}
        onClose={handleCategoryCartClose}
        category="AC Service"
        categoryTitle="AC Service Cart"
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-white pb-20"
      style={{ willChange: isExiting ? 'transform' : 'auto' }}
    >
      {/* Sticky Header - appears on scroll */}
      <StickyHeader
        title="AC Service"
        onBack={handleBack}
        onSearch={handleSearch}
        onShare={handleShare}
        isVisible={showStickyHeader}
      />

      {/* Sticky Sub-heading - shows current section */}
      <StickySubHeading
        title={currentSection}
        isVisible={showStickyHeader && !!currentSection}
      />

      {/* Spacer to prevent layout shift when sticky header appears */}
      <div
        className={`transition-all duration-300 ease-in-out ${showStickyHeader ? 'h-[57px]' : 'h-0'
          }`}
        aria-hidden="true"
      ></div>

      {/* Spacer for sticky sub-heading to prevent layout shift */}
      <div
        className={`transition-all duration-300 ease-in-out ${showStickyHeader && currentSection ? 'h-10' : 'h-0'
          }`}
        aria-hidden="true"
      ></div>

      <main>
        <BannerSection
          bannerRef={bannerRef}
          banners={[
            { id: 1, image: acRepair, text: 'Professional AC services' },
            { id: 2, image: acRepairService, text: 'Expert AC repair and installation' },
            { id: 3, image: acRepair, text: 'Cooling solutions at your service' },
          ]}
          onBack={handleBack}
          onSearch={handleSearch}
          onShare={handleShare}
          showStickyNav={showStickyHeader}
        />

        <RatingSection
          title="AC Service"
          rating="4.82"
          bookings="1.2 M bookings"
        />

        <PaymentOffers />

        <ServiceCategoriesGrid
          categories={[
            { id: 1, title: 'Super saver packages', image: acRepair },
            { id: 2, title: 'Service', image: acRepairService },
            { id: 3, title: 'Repair & gas refill', image: acRepair },
            { id: 4, title: 'Installation/uninstallation', image: acRepairService },
          ]}
          onCategoryClick={handleCategoryClick}
          layout="grid"
        />

        <SuperSaverPackages
          onViewDetails={handleViewDetails}
          onAddClick={handleAddClick}
        />

        <ServiceSection
          onViewDetails={handleViewDetails}
          onAddClick={handleAddClick}
        />

        <RepairGasRefillSection
          onViewDetails={handleViewDetails}
          onAddClick={handleAddClick}
        />

        <InstallationSection
          onViewDetails={handleViewDetails}
          onAddClick={handleAddClick}
        />
      </main>

      {/* Compact Cart Summary - Fixed at bottom when cart has items from this category */}
      {(() => {
        // Filter cart items by category
        const categoryItems = cartItems.filter(item => item.category === 'AC Service');
        const categoryCount = categoryItems.length;
        const totalPrice = categoryItems.reduce((sum, item) => sum + (item.price || 0), 0);
        const totalOriginalPrice = categoryItems.reduce((sum, item) => sum + (item.originalPrice || item.price || 0), 0);

        if (categoryCount === 0) return null;

        return (
          <div 
            className="shadow-lg border-t border-gray-200 px-4 py-3 flex items-center justify-between" 
            style={{ 
              backgroundColor: '#f8f8f8',
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 9996,
              willChange: 'transform',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-black">₹{totalPrice.toLocaleString('en-IN')}</span>
                {totalOriginalPrice > totalPrice && (
                  <span className="text-sm text-gray-400 line-through">₹{totalOriginalPrice.toLocaleString('en-IN')}</span>
                )}
                <span className="text-sm text-gray-600">({categoryCount} {categoryCount === 1 ? 'item' : 'items'})</span>
              </div>
            </div>
            <button
              onClick={handleViewCartClick}
              className="bg-brand text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-brand-hover transition-colors whitespace-nowrap"
              style={{ backgroundColor: themeColors.button }}
              onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.button}
              onMouseLeave={(e) => e.target.style.backgroundColor = themeColors.button}
            >
              View Cart
            </button>
          </div>
        );
      })()}

      {/* Floating Menu Button - Small at bottom */}
      {(() => {
        const categoryItems = cartItems.filter(item => item.category === 'AC Service');
        const categoryCount = categoryItems.length;
        
        return (
          <button
            key="menu-button"
            onClick={handleMenuClick}
            className="bg-black text-white px-4 py-2 rounded-full flex items-center gap-1.5 shadow-lg hover:bg-gray-800 transition-colors"
            style={{
              position: 'fixed',
              bottom: categoryCount > 0 ? '80px' : '16px',
              left: '50%',
              transform: 'translateX(-50%) translateZ(0)',
              zIndex: 9995,
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-sm font-medium">Menu</span>
          </button>
        );
      })()}

      {/* Menu Modal */}
      <MenuModal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        onCategoryClick={handleMenuCategoryClick}
        categories={[
          { id: 1, title: 'Super saver packages', image: acRepair },
          { id: 2, title: 'Service', image: acRepairService },
          { id: 3, title: 'Repair & gas refill', image: acRepair },
          { id: 4, title: 'Installation/uninstallation', image: acRepairService },
        ]}
      />
    </div>
  );
};

export default ACService;
