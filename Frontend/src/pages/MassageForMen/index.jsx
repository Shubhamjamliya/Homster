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
import PainReliefSection from './components/PainReliefSection';
import StressReliefSection from './components/StressReliefSection';
import PostWorkoutSection from './components/PostWorkoutSection';
import menBanner1 from '../../assets/images/pages/Home/ServiceCategorySection/SalonForMen/men-banner.jpg';
import menBanner2 from '../../assets/images/pages/Home/ServiceCategorySection/SalonForMen/men-banner-2.jpg';
import menBanner3 from '../../assets/images/pages/Home/ServiceCategorySection/SalonForMen/men-banner-3.jpg';
import painReliefImage from '../../assets/images/pages/Home/ServiceCategorySection/SalonForMen/pain-relief.jpg';
import stressReliefImage from '../../assets/images/pages/Home/ServiceCategorySection/SalonForMen/stress-relief.jpg';
import postWorkoutImage from '../../assets/images/pages/Home/ServiceCategorySection/SalonForMen/post-workout.jpg';

const MassageForMen = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [currentSection, setCurrentSection] = useState('');
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [showCategoryCartModal, setShowCategoryCartModal] = useState(false);

  // Refs for sections
  const bannerRef = useRef(null);
  const painReliefRef = useRef(null);
  const stressReliefRef = useRef(null);
  const postWorkoutRef = useRef(null);

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
          // Check if banner is still visible on screen
          let bannerVisible = false;
          if (bannerRef.current) {
            const rect = bannerRef.current.getBoundingClientRect();
            // Banner is visible if its bottom edge is still below the top of viewport
            bannerVisible = rect.bottom > 0;
          }

          // Show sticky header when banner is completely out of screen
          const shouldShowHeader = !bannerVisible;
          setShowStickyHeader(shouldShowHeader);

          // Detect sections when scrolled past banner
          if (shouldShowHeader) {
            const sections = [
              { ref: painReliefRef, title: 'Pain relief' },
              { ref: stressReliefRef, title: 'Stress relief' },
              { ref: postWorkoutRef, title: 'Post workout' },
            ];

            // Find the section that's currently at the top of viewport
            const headerOffset = 57; // Header height only (subheading is separate)
            let activeSection = '';

            // Check sections in reverse order (bottom to top) to get the most recent one
            for (let i = sections.length - 1; i >= 0; i--) {
              const section = sections[i];
              if (section.ref.current) {
                const sectionRect = section.ref.current.getBoundingClientRect();
                
                // Section is active if it has scrolled past the header position
                if (sectionRect.top <= headerOffset + 50) {
                  activeSection = section.title;
                  break; // Use the first (most recent) section found
                }
              }
            }

            setCurrentSection(activeSection);
          } else {
            setCurrentSection('');
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const timeoutId = setTimeout(handleScroll, 300);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  const [isExiting, setIsExiting] = React.useState(false);

  const handleBack = () => {
    setIsExiting(true);
    // Reset scroll position first
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
      category: 'Massage for Men',
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
    if (category.title === 'Pain relief') {
      painReliefRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (category.title === 'Stress relief') {
      stressReliefRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (category.title === 'Post workout') {
      postWorkoutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        title="Massage for Men"
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
        className={`transition-all ${showStickyHeader ? 'duration-200' : 'duration-150'} ease-out ${
          showStickyHeader ? 'h-[57px]' : 'h-0'
        }`}
        style={{ willChange: showStickyHeader ? 'height' : 'auto' }}
        aria-hidden="true"
      ></div>

      {/* Spacer for sticky sub-heading to prevent layout shift */}
      <div 
        className={`transition-all ${showStickyHeader && currentSection ? 'duration-200' : 'duration-150'} ease-out ${
          showStickyHeader && currentSection ? 'h-10' : 'h-0'
        }`}
        style={{ willChange: showStickyHeader && currentSection ? 'height' : 'auto' }}
        aria-hidden="true"
      ></div>

      <main>
        <BannerSection
          banners={[
            { id: 1, image: menBanner1, text: 'Relax and rejuvenate with professional massage' },
            { id: 2, image: menBanner2, text: 'Experience ultimate comfort and relief' },
            { id: 3, image: menBanner3, text: 'Expert therapists for your wellness' },
          ]}
          onBack={handleBack}
          onSearch={handleSearch}
          onShare={handleShare}
          showStickyNav={showStickyHeader}
          bannerRef={bannerRef}
        />

        <RatingSection
          title="Massage for Men"
          rating="4.85"
          bookings="2.5 M bookings"
        />

        <PaymentOffers />

        <ServiceCategoriesGrid
          categories={[
            { id: 1, title: 'Pain relief', image: painReliefImage },
            { id: 2, title: 'Stress relief', image: stressReliefImage },
            { id: 3, title: 'Post workout', image: postWorkoutImage },
            { id: 4, title: 'Add-ons', image: null },
          ]}
          onCategoryClick={handleCategoryClick}
          layout="grid"
        />

        <div ref={painReliefRef}>
          <PainReliefSection
            onAddClick={handleAddClick}
            onViewDetails={handleViewDetails}
          />
        </div>

        <div ref={stressReliefRef}>
          <StressReliefSection
            onAddClick={handleAddClick}
            onViewDetails={handleViewDetails}
          />
        </div>

        <div ref={postWorkoutRef}>
          <PostWorkoutSection
            onAddClick={handleAddClick}
            onViewDetails={handleViewDetails}
          />
        </div>
      </main>

      {/* Compact Cart Summary - Fixed at bottom when cart has items from this category */}
      {(() => {
        // Filter cart items by category
        const categoryItems = cartItems.filter(item => item.category === 'Massage for Men');
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
        const categoryItems = cartItems.filter(item => item.category === 'Massage for Men');
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
          { id: 1, title: 'Pain relief', image: painReliefImage },
          { id: 2, title: 'Stress relief', image: stressReliefImage },
          { id: 3, title: 'Post workout', image: postWorkoutImage },
        ]}
      />

      {/* Category Cart Modal */}
      <CategoryCart
        isOpen={showCategoryCartModal}
        onClose={handleCategoryCartClose}
        category="Massage for Men"
        categoryTitle="Massage Cart"
      />
    </div>
  );
};

export default MassageForMen;

