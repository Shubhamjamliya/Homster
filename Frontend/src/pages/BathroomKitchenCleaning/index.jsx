import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import StickyHeader from '../../components/common/StickyHeader';
import StickySubHeading from '../../components/common/StickySubHeading';
import BannerSection from '../../components/common/BannerSection';
import RatingSection from '../../components/common/RatingSection';
import PaymentOffers from '../../components/common/PaymentOffers';
import ServiceCategoriesGrid from '../../components/common/ServiceCategoriesGrid';
import MenuModal from '../../components/common/MenuModal';
import CategoryCart from '../../components/common/CategoryCart';
import CombosSection from './components/CombosSection';
import BathroomCleaningSection from './components/BathroomCleaningSection';
import MiniServicesSection from './components/MiniServicesSection';
import cleaningBanner from '../../assets/images/pages/Home/ServiceCategorySection/CleaningEssentials/cleaning-banner.jpg';
import intenseBathroom2 from '../../assets/images/pages/Home/ServiceCategorySection/CleaningEssentials/intense-bathroom-2.jpg';
import intenseBathroom3 from '../../assets/images/pages/Home/ServiceCategorySection/CleaningEssentials/intense-bathroom-3.jpg';
import intenseCleaning from '../../assets/images/pages/Home/ServiceCategorySection/CleaningEssentials/intense-cleaning.jpg';
import bathroomCleaning from '../../assets/images/pages/Home/ServiceCategorySection/CleaningEssentials/bathroom-cleaning.png';
import miniServices from '../../assets/images/pages/Home/ServiceCategorySection/CleaningEssentials/mini servies.jpg';
import bathroomCleanIcon from '../../assets/images/icons/services/bathroom-clean.png';
import sofaIcon from '../../assets/images/icons/services/sofa.png';

const BathroomKitchenCleaning = () => {
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
  const combosRef = useRef(null);
  const bathroomCleaningRef = useRef(null);
  const miniServicesRef = useRef(null);

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
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (bannerRef.current) {
            const rect = bannerRef.current.getBoundingClientRect();
            const shouldShowHeader = rect.bottom <= 0;

            setShowStickyHeader(shouldShowHeader);

            if (shouldShowHeader) {
              const sections = [
                { ref: combosRef, title: 'Combos' },
                { ref: bathroomCleaningRef, title: 'Bathroom cleaning' },
                { ref: miniServicesRef, title: 'Mini services' },
              ];

              const headerOffset = 57;
              let activeSection = '';

              for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section.ref.current) {
                  const sectionRect = section.ref.current.getBoundingClientRect();
                  if (sectionRect.top <= headerOffset + 50) {
                    activeSection = section.title;
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
    // Delay navigation to let home page preload and render, then show it
    setTimeout(() => {
      navigate('/', { replace: true, state: { scrollToTop: true } });
    }, 300);
  };

  const handleSearch = () => {
  };

  const handleShare = () => {
  };

  const handleCategoryClick = (category) => {
  };

  const handleServiceClick = (service) => {
  };

  const handleAddClick = (service) => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');

    const cartItem = {
      id: Date.now(),
      title: service.title || service.name || 'Service',
      price: parseInt(service.price?.replace(/,/g, '') || service.price || 0),
      serviceCount: 1,
      description: service.description || service.subtitle || service.title || 'Service',
      icon: service.icon || service.image || null,
      category: 'Bathroom & Kitchen Cleaning',
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
    if (category.title === 'Combos') {
      combosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (category.title === 'Bathroom cleaning') {
      bathroomCleaningRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (category.title === 'Mini services') {
      miniServicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleViewCartClick = () => {
    setShowCategoryCartModal(true);
  };

  const handleCategoryCartClose = () => {
    setShowCategoryCartModal(false);
  };

  return (
    <div
      className={`min-h-screen bg-white pb-20 ${isExiting ? 'animate-page-exit' : 'animate-page-enter'}`}
      style={{ willChange: isExiting ? 'transform' : 'auto' }}
    >
      {/* Sticky Header - appears on scroll */}
      <StickyHeader
        title="Bathroom & Kitchen Cleaning"
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
          ref={bannerRef}
          banners={[
            { id: 1, image: cleaningBanner, text: 'Professional cleaning services' },
            { id: 2, image: intenseBathroom2, text: 'Deep cleaning for your home' },
            { id: 3, image: intenseBathroom3, text: 'Expert cleaners at your service' },
          ]}
          onBack={handleBack}
          onSearch={handleSearch}
          onShare={handleShare}
          showStickyNav={showStickyHeader}
        />

        <RatingSection
          rating="4.82"
          bookings="1.2 M bookings"
          showBorder={true}
        />

        <PaymentOffers />

        <ServiceCategoriesGrid
          categories={[
            { id: 1, title: 'Combos', image: intenseCleaning, badge: 'COMBO DEALS' },
            { id: 2, title: 'Bathroom cleaning', image: bathroomCleaning },
            { id: 3, title: 'Mini services', image: miniServices },
          ]}
          onCategoryClick={handleCategoryClick}
          layout="grid"
        />

        <div ref={combosRef}>
          <CombosSection
            onAddClick={handleAddClick}
            onViewDetails={handleViewDetails}
          />
        </div>

        <div ref={bathroomCleaningRef}>
          <BathroomCleaningSection
            onAddClick={handleAddClick}
            onViewDetails={handleViewDetails}
          />
        </div>

        <div ref={miniServicesRef}>
          <MiniServicesSection
            onAddClick={handleAddClick}
            onViewDetails={handleViewDetails}
          />
        </div>
      </main>

      {/* Compact Cart Summary - Fixed at bottom when cart has items from this category */}
      {(() => {
        // Filter cart items by category
        const categoryItems = cartItems.filter(item => item.category === 'Bathroom & Kitchen Cleaning');
        const categoryCount = categoryItems.length;
        const totalPrice = categoryItems.reduce((sum, item) => sum + (item.price || 0), 0);
        const totalOriginalPrice = categoryItems.reduce((sum, item) => sum + (item.originalPrice || item.price || 0), 0);

        if (categoryCount === 0) return null;

        return (
          <div className="fixed bottom-0 left-0 right-0 z-40 shadow-lg border-t border-gray-200 px-4 py-3 flex items-center justify-between" style={{ backgroundColor: '#f8f8f8' }}>
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
              style={{ backgroundColor: '#00a6a6' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#008a8a'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#00a6a6'}
            >
              View Cart
            </button>
          </div>
        );
      })()}

      {/* Floating Menu Button - Small at bottom */}
      {(() => {
        const categoryItems = cartItems.filter(item => item.category === 'Bathroom & Kitchen Cleaning');
        const categoryCount = categoryItems.length;
        return (
          <button
            onClick={handleMenuClick}
            className={`fixed ${categoryCount > 0 ? 'bottom-20' : 'bottom-4'} left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full flex items-center gap-1.5 z-40 shadow-lg hover:bg-gray-800 transition-colors`}
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
          { id: 1, title: 'Combos', icon: null, badge: 'COMBO DEALS' },
          { id: 2, title: 'Bathroom cleaning', icon: bathroomCleanIcon },
          { id: 3, title: 'Mini services', icon: sofaIcon },
        ]}
      />

      {/* Category Cart Modal */}
      <CategoryCart
        isOpen={showCategoryCartModal}
        onClose={handleCategoryCartClose}
        category="Bathroom & Kitchen Cleaning"
        categoryTitle="Cleaning Cart"
      />
    </div>
  );
};

export default BathroomKitchenCleaning;

