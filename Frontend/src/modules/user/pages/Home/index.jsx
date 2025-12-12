import React, { useState, useEffect, useLayoutEffect, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import SearchBar from './components/SearchBar';
import ServiceCategories from './components/ServiceCategories';

// Lazy load heavy components for better initial load performance
const PromoCarousel = lazy(() => import('./components/PromoCarousel'));
const NewAndNoteworthy = lazy(() => import('./components/NewAndNoteworthy'));
const MostBookedServices = lazy(() => import('./components/MostBookedServices'));
const CuratedServices = lazy(() => import('./components/CuratedServices'));
const ServiceSectionWithRating = lazy(() => import('./components/ServiceSectionWithRating'));
const Banner = lazy(() => import('./components/Banner'));
// Salon for Women Images
import salon1Image from '../../../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/salon-1.jpg';
import salon2Image from '../../../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/salon-2.jpg';
import salon3Image from '../../../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/salon-3.jpg';
import salon4Image from '../../../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/salon-4.jpg';
import salon5Image from '../../../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/salon-5.jpg';
import salon6Image from '../../../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/salon-6.jpg';
// Lazy load more heavy components
const ServiceCategorySection = lazy(() => import('./components/ServiceCategorySection'));
const HomeRepairSection = lazy(() => import('./components/HomeRepairSection'));
const BannerWithRefer = lazy(() => import('./components/BannerWithRefer'));
import ACApplianceModal from './components/ACApplianceModal';
import CategoryModal from './components/CategoryModal';
import acRepairImage from '../../../../assets/images/pages/Home/ServiceCategorySection/ApplianceServices/ac-repair.jpg';
import washingMachineRepairImage from '../../../../assets/images/pages/Home/ServiceCategorySection/ApplianceServices/washing-machine-repair].jpg';
import waterHeaterRepairImage from '../../../../assets/images/pages/Home/ServiceCategorySection/ApplianceServices/water heater repair.jpg';
import refrigeratorRepairImage from '../../../../assets/images/pages/Home/ServiceCategorySection/ApplianceServices/refigrator-repair.jpg';
import homeWiringInstallationImage from '../../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/home-wiring.jpg';
import panelUpgradeRepairImage from '../../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/electrical-panel-upgrade.jpg';
import smartHomeSetupImage from '../../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/smart home setup.jpg';
// Cleaning Essentials Images
import intenseBathroom2Image from '../../../../assets/images/pages/Home/ServiceCategorySection/CleaningEssentials/intense-bathroom-2.jpg';
import intenseBathroom3Image from '../../../../assets/images/pages/Home/ServiceCategorySection/CleaningEssentials/intense-bathroom-3.jpg';
import bathroomCleaningImage from '../../../../assets/images/pages/Home/ServiceCategorySection/CleaningEssentials/bathroom-cleaning.png';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [address] = useState('New Palasia- Indore- Madhya Pradesh...');
  const [cartCount, setCartCount] = useState(0);

  // Combined useLayoutEffect - Set background on mount only (optimized)
  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const bgStyle = themeColors.backgroundGradient;

    // Set background on all elements (only once on mount)
    const elements = [html, body, root].filter(Boolean);
    elements.forEach(el => {
      if (el && !el.dataset.bgSet) {
        el.style.backgroundColor = '#ffffff';
        el.style.background = bgStyle;
        el.dataset.bgSet = 'true';
      }
    });

    // Force immediate visibility (only if needed)
    if (body && body.style.opacity !== '1') {
      body.style.opacity = '1';
      body.style.visibility = 'visible';
    }
  }, []); // Empty deps - only run once on mount

  // Handle scroll separately (only when needed)
  useEffect(() => {
    if (location.state?.scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location.state?.scrollToTop, location.pathname]);

  // Load cart count from localStorage on mount and when cart changes (optimized)
  useEffect(() => {
    let updateTimeout = null;
    let lastCount = 0;
    
    const updateCartCount = () => {
      // Debounce rapid updates
      if (updateTimeout) clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        try {
          const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
          const newCount = cartItems.length;
          // Only update if count changed
          if (newCount !== lastCount) {
            lastCount = newCount;
            setCartCount(newCount);
          }
        } catch (error) {
          console.error('Error reading cart:', error);
        }
      }, 100); // Debounce delay for better performance
    };

    updateCartCount();

    // Listen for storage changes (when cart is updated from other tabs/pages)
    window.addEventListener('storage', updateCartCount);

    // Custom event for same-tab updates
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
      if (updateTimeout) clearTimeout(updateTimeout);
    };
  }, []);
  const [isACModalOpen, setIsACModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const handleSearch = (query) => {
    // Navigate to search results page
  };

  const handleCategoryClick = (category) => {
    // Navigate immediately without any delay
    if (category.title === 'Electricity') {
      navigate('/user/electrician');
      return;
    }

    if (category.title === 'Massage for Men') {
      navigate('/user/massage-for-men');
      return;
    }

    // Open modal for AC & Appliance Repair - instant
    if (category.title === 'AC & Appliance Repair') {
      setIsACModalOpen(true);
    } else {
      // Open modal for other categories - instant
      setSelectedCategory(category);
      setIsCategoryModalOpen(true);
    }
  };

  const handlePromoClick = (promo) => {
    if (promo.route) {
      if (promo.scrollToSection) {
        // Navigate to page and scroll to specific section
        navigate(promo.route, { 
          state: { scrollToSection: promo.scrollToSection } 
        });
      } else {
        // Navigate to page
        navigate(promo.route);
      }
    }
  };

  const handleServiceClick = (service) => {
    if (!service || !service.title) return;
    
    const title = service.title.toLowerCase();
    
    // Map services to their respective pages
    if (title.includes('bathroom') || title.includes('kitchen cleaning') || title.includes('intense cleaning')) {
      navigate('/user/bathroom-kitchen-cleaning');
    } else if (title.includes('salon') || title.includes('spa') || title.includes('waxing') || title.includes('facial') || title.includes('cleanup') || title.includes('pedicure') || title.includes('mani pedi') || title.includes('hair studio')) {
      navigate('/user/salon-for-women');
    } else if (title.includes('massage')) {
      navigate('/user/massage-for-men');
    } else if (title.includes('sofa') || title.includes('carpet') || title.includes('professional sofa')) {
      navigate('/user/sofa-carpet-cleaning');
    } else if (title.includes('ac') || title.includes('appliance') || title.includes('water purifier') || title.includes('native')) {
      navigate('/user/ac-service');
    } else if (title.includes('drill') || title.includes('hang') || title.includes('tap repair') || title.includes('fan repair') || title.includes('switch') || title.includes('socket') || title.includes('electrical') || title.includes('wiring') || title.includes('doorbell') || title.includes('mcb') || title.includes('inverter') || title.includes('appliance')) {
      navigate('/user/electrician');
    } else {
      // Default: stay on home or navigate to a general page
      // You can add more specific routes as needed
    }
  };


  const handleBuyClick = () => {
    // Navigate to product page or checkout
  };

  const handleSeeAllClick = (category) => {
    // Navigate to category page based on category identifier
    const categoryRoutes = {
      'salon-women': '/user/salon-for-women',
      'cleaning-essentials': '/user/bathroom-kitchen-cleaning',
      'electrical': '/user/electrician',
      'appliance': '/user/ac-service',
      'home-repair': '/user/electrician',
    };
    
    const route = categoryRoutes[category];
    if (route) {
      navigate(route);
    }
  };

  const handleAddClick = (service) => {
    // Add service to cart
  };

  const handleReferClick = () => {
    navigate('/user/rewards');
  };

  // Service category data
  const electricalServices = [
    {
      id: 1,
      title: 'Home Wiring Installation',
      image: homeWiringInstallationImage,
    },
    {
      id: 2,
      title: 'Panel Upgrade & Repair',
      image: panelUpgradeRepairImage,
    },
    {
      id: 3,
      title: 'Smart Home Setup',
      image: smartHomeSetupImage,
    },
  ];

  const applianceServices = [
    {
      id: 1,
      title: 'AC Service and Repair',
      image: acRepairImage,
    },
    {
      id: 2,
      title: 'Washing Machine Repair',
      image: washingMachineRepairImage,
    },
    {
      id: 3,
      title: 'Water Heater Repair',
      image: waterHeaterRepairImage,
    },
    {
      id: 4,
      title: 'Refrigerator Repair',
      image: refrigeratorRepairImage,
    },
  ];

  const handleLocationClick = () => {
    // Open location selector modal
  };

  const handleCartClick = () => {
    // Navigate to cart page
  };


  return (
    <div
      className="min-h-screen pb-20"
      style={{
        willChange: 'auto',
        opacity: 1,
        visibility: 'visible',
        background: 'linear-gradient(to bottom, rgba(0, 166, 166, 0.03) 0%, rgba(41, 173, 129, 0.02) 10%, #ffffff 20%)',
        backgroundColor: '#ffffff',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1
      }}
    >
      <Header
        location={address}
        onLocationClick={handleLocationClick}
      />

      <main className="pt-0">
        {/* Complete Gradient Section: Header continuation, Search, Categories, and Carousel */}
        <div
          className="relative overflow-hidden"
          style={{
            background: themeColors.gradient
          }}
        >
          {/* Gradient overlay for depth */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.3), transparent 70%)'
            }}
          />

          <div className="relative z-10">
            <SearchBar
              onSearch={handleSearch}
            />

            <ServiceCategories
              onCategoryClick={handleCategoryClick}
              onSeeAllClick={() => { }}
            />

            <Suspense fallback={<div className="h-48" />}>
              <PromoCarousel
                onPromoClick={handlePromoClick}
              />
            </Suspense>
          </div>
        </div>

        <Suspense fallback={<div className="h-32" />}>
          <CuratedServices
            onServiceClick={handleServiceClick}
          />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
          <NewAndNoteworthy
            onServiceClick={handleServiceClick}
          />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
          <MostBookedServices
            onServiceClick={handleServiceClick}
          />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
          <ServiceSectionWithRating
          title="Salon for Women"
          subtitle="Pamper yourself at home"
          services={[
            {
              id: 1,
              title: 'Roll-on waxing (Full arms, legs & underarms)',
              rating: '4.87',
              reviews: '47K',
              price: '799',
              image: salon1Image,
            },
            {
              id: 2,
              title: 'Spatula waxing (Full arms, legs & underarms)',
              rating: '4.86',
              reviews: '31K',
              price: '599',
              image: salon2Image,
            },
            {
              id: 3,
              title: 'Sara Lightening glow facial',
              rating: '4.84',
              reviews: '140K',
              price: '949',
              image: salon3Image,
            },
            {
              id: 4,
              title: 'Sara fruit cleanup',
              rating: '4.86',
              reviews: '147K',
              price: '699',
              image: salon4Image,
            },
            {
              id: 5,
              title: 'Elysian Firming Wine glow',
              rating: '4.85',
              reviews: '111K',
              price: '1,049',
              image: salon5Image,
            },
            {
              id: 6,
              title: 'Elysian British rose pedicure',
              rating: '4.83',
              reviews: '225K',
              price: '759',
              image: salon6Image,
            },
            {
              id: 7,
              title: 'Mani pedi combo',
              rating: '4.83',
              reviews: '327K',
              price: '1,309',
              originalPrice: '1,408',
              discount: '7%',
              image: salon6Image, // Using salon-6 as placeholder for 7th service
            },
          ]}
          onSeeAllClick={() => handleSeeAllClick('salon-women')}
          onServiceClick={handleServiceClick}
          />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
          <Banner
            onBuyClick={handleBuyClick}
          />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
          <ServiceSectionWithRating
          title="Cleaning Essentials"
          subtitle="Monthly cleaning essential services"
          showTopBorder={false}
          services={[
            {
              id: 1,
              title: 'Intense cleaning (2 bathrooms)',
              rating: '4.79',
              reviews: '3.7M',
              price: '950',
              originalPrice: '1,038',
              discount: '8%',
              image: intenseBathroom2Image,
            },
            {
              id: 2,
              title: 'Intense cleaning (3 bathrooms)',
              rating: '4.79',
              reviews: '3.7M',
              price: '1,381',
              originalPrice: '1,557',
              discount: '11%',
              image: intenseBathroom3Image,
            },
            {
              id: 3,
              title: 'Classic cleaning (2 bathrooms)',
              rating: '4.82',
              reviews: '1.5M',
              price: '785',
              originalPrice: '858',
              discount: '9%',
              image: bathroomCleaningImage,
            },
            {
              id: 4,
              title: 'Classic cleaning (3 bathrooms)',
              rating: '4.82',
              reviews: '1.5M',
              price: '1,141',
              originalPrice: '1,287',
              discount: '11%',
              image: bathroomCleaningImage,
            },
            {
              id: 5,
              title: 'Dining table & chairs cleaning',
              rating: '4.82',
              reviews: '57K',
              price: '299',
              image: bathroomCleaningImage,
            },
            {
              id: 6,
              title: 'Chimney cleaning',
              rating: '4.83',
              reviews: '109K',
              price: '599',
              image: bathroomCleaningImage,
            },
          ]}
          onSeeAllClick={() => handleSeeAllClick('cleaning-essentials')}
          onServiceClick={handleServiceClick}
          />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
          <ServiceCategorySection
            title="Electrical Installation & Repair"
            services={electricalServices}
            onSeeAllClick={() => handleSeeAllClick('electrical')}
            onServiceClick={handleServiceClick}
          />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
          <ServiceCategorySection
            title="Appliance repair & service"
            services={applianceServices}
            onSeeAllClick={() => handleSeeAllClick('appliance')}
            onServiceClick={handleServiceClick}
          />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
          <HomeRepairSection
            onSeeAllClick={() => handleSeeAllClick('home-repair')}
            onServiceClick={handleServiceClick}
            onAddClick={handleAddClick}
          />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
          <BannerWithRefer
            onBuyClick={handleBuyClick}
            onReferClick={handleReferClick}
          />
        </Suspense>
      </main>

      <BottomNav />

      {/* AC & Appliance Repair Modal */}
      <ACApplianceModal
        isOpen={isACModalOpen}
        onClose={() => setIsACModalOpen(false)}
        location={address}
        cartCount={cartCount}
      />


      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        location={address}
        cartCount={cartCount}
      />
    </div>
  );
};

export default Home;

