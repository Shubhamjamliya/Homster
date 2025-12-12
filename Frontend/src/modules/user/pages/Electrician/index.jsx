import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

// Lazy load all section components for better initial load performance
const ElectricalRepairSection = lazy(() => import('./components/ElectricalRepairSection'));
const InstallationSection = lazy(() => import('./components/InstallationSection'));
const SmartHomeSection = lazy(() => import('./components/SmartHomeSection'));
const SwitchSocketSection = lazy(() => import('./components/SwitchSocketSection'));
const FanSection = lazy(() => import('./components/FanSection'));
const LightSection = lazy(() => import('./components/LightSection'));
const WiringSection = lazy(() => import('./components/WiringSection'));
const DoorbellSection = lazy(() => import('./components/DoorbellSection'));
const MCBSection = lazy(() => import('./components/MCBSection'));
const InverterSection = lazy(() => import('./components/InverterSection'));
const ApplianceSection = lazy(() => import('./components/ApplianceSection'));
const ConsultationSection = lazy(() => import('./components/ConsultationSection'));
const ServiceDetailModal = lazy(() => import('./components/ServiceDetailModal'));
import homeWiring from '../../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/home-wiring.jpg';
import electricalPanel from '../../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/electrical-panel-upgrade.jpg';
import smartHomeSetup from '../../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/smart home setup.jpg';
import electricianIcon from '../../../../assets/images/icons/services/electrician.png';
import switchSocket from '../../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/switch&socket.jpg';
import fan from '../../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/fan.jpg';
import light from '../../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/light.jpg';
import wiring from '../../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/wiring.jpg';
import doorbell from '../../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/dorebell.jpg';
import mcb from '../../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/mcb.jpg';
import inverter from '../../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/invertor.jpg';
import appliance from '../../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/appliance.jpg';
import bookConsultation from '../../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/book.jpg';

const Electrician = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Handle scroll to section from promo banner
  useEffect(() => {
    const scrollToSection = location.state?.scrollToSection;
    if (scrollToSection) {
      // Wait for page to render and sections to load, then scroll to section
      setTimeout(() => {
        const sectionId = scrollToSection.toLowerCase().replace(/\s+/g, '-');
        const element = document.getElementById(sectionId);
        if (element) {
          const headerOffset = 97; // 57px header + 40px subheading
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 800); // Increased delay to allow lazy-loaded sections to render

      // Clear the state to prevent re-scrolling on re-render
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location.state?.scrollToSection]);

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

  // Optimized scroll handler - throttled and cached for better performance
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let sectionCache = null;
    let ticking = false;
    let lastUpdate = 0;
    const throttleDelay = 100; // Throttle to 100ms for better performance

    const handleScroll = (currentScrollY) => {
      const now = Date.now();
      if (now - lastUpdate < throttleDelay) return;
      lastUpdate = now;

      const isScrollingUp = currentScrollY < lastScrollY;
      lastScrollY = currentScrollY;

      if (!bannerRef.current) return;

      const rect = bannerRef.current.getBoundingClientRect();

      // Priority 1: If scrolling up AND near top AND banner is becoming visible, hide header immediately
      const isNearTop = currentScrollY < 150;
      const bannerBecomingVisible = rect.top < 300;

      if (isScrollingUp && isNearTop && bannerBecomingVisible) {
        setShowStickyHeader(false);
        setCurrentSection('');
        return;
      }

      // Priority 2: Normal scrolling - show header when banner is scrolled past
      const bannerScrolledPast = rect.bottom <= 0;
      setShowStickyHeader(bannerScrolledPast);

      // Detect sections when scrolled past banner (only check when needed)
      if (bannerScrolledPast) {
        // Cache section elements on first check (deferred until needed)
        if (!sectionCache) {
          const sectionIds = [
            'electrical-repair',
            'installation',
            'smart-home',
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
          sectionCache = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
        }

        const headerOffset = 57;
        let activeSection = '';
        const titleMap = {
          'electrical-repair': 'Electrical Repair',
          'installation': 'Installation',
          'smart-home': 'Smart Home',
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

        // Check sections in reverse order (bottom to top)
        for (let i = sectionCache.length - 1; i >= 0; i--) {
          const element = sectionCache[i];
          if (element) {
            const sectionRect = element.getBoundingClientRect();
            if (sectionRect.top <= headerOffset + 50) {
              activeSection = titleMap[element.id] || '';
              break;
            }
          }
        }

        setCurrentSection(activeSection);
      } else {
        setCurrentSection('');
      }
    };

    // Optimized scroll handler with throttling and RAF
    const optimizedHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', optimizedHandler, { passive: true });

    // Initial check - deferred to avoid blocking initial render
    const timeoutId = setTimeout(() => {
      handleScroll(window.scrollY);
    }, 300);

    return () => {
      window.removeEventListener('scroll', optimizedHandler);
      clearTimeout(timeoutId);
    };
  }, []); // Empty deps - only run once on mount

  const [isExiting, setIsExiting] = React.useState(false);

  const handleBack = () => {
    setIsExiting(true);
    // Reset scroll position first
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
      style={{
        // Removed willChange: 'transform' as it breaks fixed positioning
        // Removed position: 'relative' and isolation to allow fixed elements to work
      }}
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

        <Suspense fallback={<div className="h-32" />}>
          <ElectricalRepairSection
            onAddClick={handleAddClick}
            onViewDetails={handleViewDetails}
          />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
          <InstallationSection
            onAddClick={handleAddClick}
            onViewDetails={handleViewDetails}
          />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
          <SmartHomeSection
            onAddClick={handleAddClick}
            onViewDetails={handleViewDetails}
          />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
          <SwitchSocketSection
            onAddClick={handleAddClick}
            onViewDetails={handleViewDetails}
          />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
          <FanSection
            onAddClick={handleAddClick}
            onViewDetails={handleViewDetails}
          />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
          <LightSection
            onAddClick={handleAddClick}
            onViewDetails={handleViewDetails}
          />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
          <WiringSection
            onAddClick={handleAddClick}
            onViewDetails={handleViewDetails}
          />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
          <DoorbellSection
            onAddClick={handleAddClick}
            onViewDetails={handleViewDetails}
          />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
          <MCBSection
            onAddClick={handleAddClick}
            onViewDetails={handleViewDetails}
          />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
          <InverterSection
            onAddClick={handleAddClick}
            onViewDetails={handleViewDetails}
          />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
          <ApplianceSection
            onAddClick={handleAddClick}
            onViewDetails={handleViewDetails}
          />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
          <ConsultationSection
            onAddClick={handleAddClick}
            onViewDetails={handleViewDetails}
          />
        </Suspense>
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
        const categoryItems = cartItems.filter(item => item.category === 'Electrician');
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

      {/* Service Detail Modal */}
      <Suspense fallback={null}>
        <ServiceDetailModal
          isOpen={isServiceDetailModalOpen}
          onClose={() => {
            setIsServiceDetailModalOpen(false);
            setSelectedService(null);
          }}
          service={selectedService}
        />
      </Suspense>
    </div>
  );
};

export default Electrician;

