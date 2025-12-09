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
import ElectricalRepairSection from './components/ElectricalRepairSection';
import InstallationSection from './components/InstallationSection';
import SmartHomeSection from './components/SmartHomeSection';
import SwitchSocketSection from './components/SwitchSocketSection';
import FanSection from './components/FanSection';
import LightSection from './components/LightSection';
import WiringSection from './components/WiringSection';
import DoorbellSection from './components/DoorbellSection';
import MCBSection from './components/MCBSection';
import InverterSection from './components/InverterSection';
import ApplianceSection from './components/ApplianceSection';
import ConsultationSection from './components/ConsultationSection';
import ServiceDetailModal from './components/ServiceDetailModal';
import homeWiring from '../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/home-wiring.jpg';
import electricalPanel from '../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/electrical-panel-upgrade.jpg';
import smartHomeSetup from '../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/smart home setup.jpg';
import electricianIcon from '../../assets/images/icons/services/electrician.png';
import switchSocket from '../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/switch&socket.jpg';
import fan from '../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/fan.jpg';
import light from '../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/light.jpg';
import wiring from '../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/wiring.jpg';
import doorbell from '../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/dorebell.jpg';
import mcb from '../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/mcb.jpg';
import inverter from '../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/invertor.jpg';
import appliance from '../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/appliance.jpg';
import bookConsultation from '../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/book.jpg';

const Electrician = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [currentSection, setCurrentSection] = useState('');
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [showCategoryCartModal, setShowCategoryCartModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isServiceDetailModalOpen, setIsServiceDetailModalOpen] = useState(false);

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
              const sectionIds = [
                'switch-socket',
                'fan',
                'wall-ceiling-light',
                'wiring',
                'doorbell',
                'mcb-submeter',
                'inverter-stabiliser',
                'appliance',
                'book-a-consultation',
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
                      'switch-socket': 'Switch & socket',
                      'fan': 'Fan',
                      'wall-ceiling-light': 'Wall/ceiling light',
                      'wiring': 'Wiring',
                      'doorbell': 'Doorbell',
                      'mcb-submeter': 'MCB & submeter',
                      'inverter-stabiliser': 'Inverter & stabiliser',
                      'appliance': 'Appliance',
                      'book-a-consultation': 'Book a consultation',
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
    // Scroll to the corresponding section on the same page
    // Use the same ID generation logic as ServiceSection component
    // ServiceSection uses: title.toLowerCase().replace(/\s+/g, '-')
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
    } else {
      // Fallback: try to find by partial match if exact ID doesn't work
      const allElements = document.querySelectorAll('[id]');
      for (let el of allElements) {
        if (el.id.toLowerCase().includes(category.title.toLowerCase().replace(/\s+/g, '-'))) {
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          break;
        }
      }
    }
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
      category: 'Electrician',
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
    setSelectedService(service);
    setIsServiceDetailModalOpen(true);
  };

  const handleMenuClick = () => {
    setIsMenuModalOpen(true);
  };

  const handleMenuCategoryClick = (category) => {
    if (category.title === 'Electrical Repair') {
      electricalRepairRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (category.title === 'Installation') {
      installationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (category.title === 'Smart Home') {
      smartHomeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        category="Electrician"
        categoryTitle="Electrician Cart"
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
        title="Electrician Services"
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
        className={`transition-all duration-300 ease-in-out ${showStickyHeader ? 'h-[57px]' : 'h-0'
          }`}
        aria-hidden="true"
      ></div>

      {/* Spacer for sticky sub-heading to prevent layout shift */}
      {/* Reserve space for sub-heading (40px) when visible */}
      <div
        className={`transition-all duration-300 ease-in-out ${showStickyHeader && currentSection ? 'h-10' : 'h-0'
          }`}
        aria-hidden="true"
      ></div>

      <main>
        <BannerSection
          banners={[
            { id: 1, image: homeWiring, text: 'Professional electrical services' },
            { id: 2, image: electricalPanel, text: 'Expert electricians at your service' },
            { id: 3, image: smartHomeSetup, text: 'Safe and reliable solutions' },
          ]}
          onBack={handleBack}
          onSearch={handleSearch}
          onShare={handleShare}
          showStickyNav={showStickyHeader}
          bannerRef={bannerRef}
        />

        <RatingSection
          title="Electrician Services"
          rating="4.82"
          bookings="1.2 M bookings"
        />

        <PaymentOffers />

        <ServiceCategoriesGrid
          categories={[
            { id: 1, title: 'Switch & socket', image: switchSocket },
            { id: 2, title: 'Fan', image: fan },
            { id: 3, title: 'Wall/ceiling light', image: light },
            { id: 4, title: 'Wiring', image: wiring },
            { id: 5, title: 'Doorbell', image: doorbell },
            { id: 6, title: 'MCB & submeter', image: mcb },
            { id: 7, title: 'Inverter & stabiliser', image: inverter },
            { id: 8, title: 'Appliance', image: appliance },
            { id: 9, title: 'Book a consultation', image: bookConsultation },
          ]}
          onCategoryClick={handleCategoryClick}
          layout="grid"
        />

        <SwitchSocketSection
          onAddClick={handleAddClick}
          onViewDetails={handleViewDetails}
        />

        <FanSection
          onAddClick={handleAddClick}
          onViewDetails={handleViewDetails}
        />

        <LightSection
          onAddClick={handleAddClick}
          onViewDetails={handleViewDetails}
        />

        <WiringSection
          onAddClick={handleAddClick}
          onViewDetails={handleViewDetails}
        />

        <DoorbellSection
          onAddClick={handleAddClick}
          onViewDetails={handleViewDetails}
        />

        <MCBSection
          onAddClick={handleAddClick}
          onViewDetails={handleViewDetails}
        />

        <InverterSection
          onAddClick={handleAddClick}
          onViewDetails={handleViewDetails}
        />

        <ApplianceSection
          onAddClick={handleAddClick}
          onViewDetails={handleViewDetails}
        />

        <ConsultationSection
          onAddClick={handleAddClick}
          onViewDetails={handleViewDetails}
        />
      </main>

      {/* Compact Cart Summary - Fixed at bottom when cart has items from this category */}
      {(() => {
        // Filter cart items by category
        const categoryItems = cartItems.filter(item => item.category === 'Electrician');
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
        const categoryItems = cartItems.filter(item => item.category === 'Electrician');
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

      {/* Bottom Navigation - Removed from Electrician page */}

      {/* Menu Modal */}
      <MenuModal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        onCategoryClick={handleMenuCategoryClick}
        categories={[
          { id: 1, title: 'Electrical Repair', image: electricianIcon },
          { id: 2, title: 'Installation', image: homeWiring },
          { id: 3, title: 'Smart Home', image: smartHomeSetup },
        ]}
      />

      {/* Category-specific Cart Modal */}
      {showCategoryCartModal && (
        <CategoryCart
          isOpen={showCategoryCartModal}
          onClose={() => setShowCategoryCartModal(false)}
          category="Electrician"
          categoryTitle="Electrician Cart"
        />
      )}

      {/* Service Detail Modal */}
      <ServiceDetailModal
        isOpen={isServiceDetailModalOpen}
        onClose={() => {
          setIsServiceDetailModalOpen(false);
          setSelectedService(null);
        }}
        service={selectedService}
      />
    </div>
  );
};

export default Electrician;

