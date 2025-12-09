import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import BottomNav from '../../components/layout/BottomNav';
import StickyHeader from '../../components/common/StickyHeader';
import StickySubHeading from '../../components/common/StickySubHeading';
import BannerSection from '../../components/common/BannerSection';
import RatingSection from '../../components/common/RatingSection';
import PaymentOffers from '../../components/common/PaymentOffers';
import ServiceCategoriesGrid from '../../components/common/ServiceCategoriesGrid';
import MenuModal from '../../components/common/MenuModal';
import CategoryCart from '../../components/common/CategoryCart';
import SuperSaverPackages from './components/SuperSaverPackages';
import WaxingThreadingSection from './components/WaxingThreadingSection';
import KoreanFacialSection from './components/KoreanFacialSection';
import parlorBanner from '../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/parlor-banner.jpg';
import spaBanner from '../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/spa-banner.jpg';
import salon1Image from '../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/salon-1.jpg';
import waxingImage from '../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/waxing.jpg';
import koreanFacialImage from '../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/koreanfacial.jpg';
import signatureFacialImage from '../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/signature facial.jpg';
import cleanupImage from '../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/cleanup.jpg';
import salon3Image from '../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/salon-3.jpg';
import salon5Image from '../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/salon-5.jpg';
import salon6Image from '../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/salon-6.jpg';

const SalonForWomen = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [currentSection, setCurrentSection] = useState('');
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [showCategoryCartModal, setShowCategoryCartModal] = useState(false);

  // Refs for sections
  const bannerRef = useRef(null);
  const superSaverRef = useRef(null);
  const waxingRef = useRef(null);
  const koreanFacialRef = useRef(null);

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
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (bannerRef.current) {
            const rect = bannerRef.current.getBoundingClientRect();
            // Show header when banner bottom goes above viewport top
            // Check if banner has scrolled completely out of view
            // Show header when banner bottom goes above viewport (even slightly)
            const shouldShowHeader = rect.bottom <= 0;
            
            // Always update state immediately
            setShowStickyHeader(shouldShowHeader);

            // Detect sections when scrolled past banner
            if (shouldShowHeader) {
              const sections = [
                { ref: superSaverRef, title: 'Super saver packages' },
                { ref: waxingRef, title: 'Waxing & threading' },
                { ref: koreanFacialRef, title: 'Korean facial' },
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
  }, []); // Empty deps - only run once on mount

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
    // Navigate to specific category section or page
  };

  const handleServiceClick = (service) => {
  };

  const handleAddClick = (service) => {
    
    // Get existing cart items from localStorage
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    
    // Create cart item object
    const cartItem = {
      id: Date.now(), // Unique ID
      title: service.title || service.name || 'Service',
      price: parseInt(service.price?.replace(/,/g, '') || service.price || 0),
      serviceCount: 1,
      description: service.description || service.subtitle || service.title || 'Service',
      icon: service.icon || service.image || null,
      category: 'Salon for Women',
      originalPrice: service.originalPrice ? parseInt(service.originalPrice.replace(/,/g, '')) : null,
      rating: service.rating || null,
      reviews: service.reviews || null,
    };
    
    // Add item to cart
    cartItems.push(cartItem);
    
    // Save to localStorage
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
    // Update cart count
    setCartCount(cartItems.length);
    
    // Dispatch custom event to update cart count in other components
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Show success message (optional - you can add a toast notification here)
    toast.success(`${service.title || 'Item'} added to cart!`);
  };

  const handleViewDetails = (service) => {
  };

  const handleEditPackage = (packageId) => {
  };

  const handleMenuClick = () => {
    setIsMenuModalOpen(true);
  };

  const handleMenuCategoryClick = (category) => {
    // Scroll to the section or handle navigation
    if (category.title === 'Super saver packages') {
      superSaverRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (category.title === 'Waxing & threading') {
      waxingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (category.title === 'Korean facial') {
      koreanFacialRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      className="min-h-screen bg-white pb-20"
      style={{ willChange: isExiting ? 'transform' : 'auto' }}
    >
      {/* Sticky Header - appears on scroll */}
      <StickyHeader
        title="Salon Prime"
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
      {/* Always reserve space for header (57px) when visible */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          showStickyHeader ? 'h-[57px]' : 'h-0'
        }`}
        aria-hidden="true"
      ></div>

      {/* Spacer for sticky sub-heading to prevent layout shift */}
      {/* Reserve space for sub-heading (40px) when visible */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          showStickyHeader && currentSection ? 'h-10' : 'h-0'
        }`}
        aria-hidden="true"
      ></div>

      <main>
        <BannerSection
          banners={[
            { id: 1, image: parlorBanner, text: 'Parlor Services' },
            { id: 2, image: spaBanner, text: 'Spa Services' },
            { id: 3, image: salon1Image, text: 'Salon Services' },
          ]}
          onBack={handleBack}
          onSearch={handleSearch}
          onShare={handleShare}
          showStickyNav={showStickyHeader}
          bannerRef={bannerRef}
        />

        <RatingSection
          title="Salon Prime"
          rating="4.85"
          bookings="15.9 M bookings"
        />

        <PaymentOffers />

        <ServiceCategoriesGrid
          categories={[
            { id: 1, title: 'Super saver packages', image: salon1Image, badge: 'Upto 25% OFF' },
            { id: 2, title: 'Waxing & threading', image: waxingImage, badge: 'Offer' },
            { id: 3, title: 'Korean facial', image: koreanFacialImage },
            { id: 4, title: 'Signature facials', image: signatureFacialImage },
            { id: 5, title: 'Ayurvedic facial', image: salon3Image },
            { id: 6, title: 'Cleanup', image: cleanupImage },
            { id: 7, title: 'Pedicure & manicure', image: salon5Image },
            { id: 8, title: 'Hair, bleach & detan', image: salon6Image },
          ]}
          onCategoryClick={handleCategoryClick}
          layout="grid"
        />

        <div ref={superSaverRef}>
          <SuperSaverPackages
            onAddClick={handleAddClick}
            onEditPackage={handleEditPackage}
          />
        </div>

        <div ref={waxingRef}>
          <WaxingThreadingSection
            onAddClick={handleAddClick}
            onViewDetails={handleViewDetails}
          />
        </div>

        <div ref={koreanFacialRef}>
          <KoreanFacialSection
            onAddClick={handleAddClick}
            onViewDetails={handleViewDetails}
          />
        </div>
      </main>

      {/* Compact Cart Summary - Fixed at bottom when cart has items from this category */}
      {(() => {
        // Filter cart items by category
        const categoryItems = cartItems.filter(item => item.category === 'Salon for Women');
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
        const categoryItems = cartItems.filter(item => item.category === 'Salon for Women');
        const categoryCount = categoryItems.length;
        return (
          <button
            key="menu-button"
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

      {/* Bottom Navigation - Removed from Salon page */}

      {/* Menu Modal */}
      <MenuModal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        onCategoryClick={handleMenuCategoryClick}
        categories={[
          { id: 1, title: 'Super saver packages', image: salon1Image, badge: 'Upto 25% OFF' },
          { id: 2, title: 'Waxing & threading', image: waxingImage, badge: 'Offer' },
          { id: 3, title: 'Korean facial', image: koreanFacialImage },
          { id: 4, title: 'Signature facials', image: signatureFacialImage },
          { id: 5, title: 'Ayurvedic facial', image: salon3Image },
          { id: 6, title: 'Cleanup', image: cleanupImage },
          { id: 7, title: 'Pedicure & manicure', image: salon5Image },
          { id: 8, title: 'Hair, bleach & detan', image: salon6Image },
        ]}
      />
    </div>
  );
};

export default SalonForWomen;

