import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { themeColors } from '../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import SearchBar from './components/SearchBar';
import ServiceCategories from './components/ServiceCategories';
import PromoCarousel from './components/PromoCarousel';
import NewAndNoteworthy from './components/NewAndNoteworthy';
import MostBookedServices from './components/MostBookedServices';
import CuratedServices from './components/CuratedServices';
import ServiceSectionWithRating from './components/ServiceSectionWithRating';
import Banner from './components/Banner';
// Salon for Women Images
import salon1Image from '../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/salon-1.jpg';
import salon2Image from '../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/salon-2.jpg';
import salon3Image from '../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/salon-3.jpg';
import salon4Image from '../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/salon-4.jpg';
import salon5Image from '../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/salon-5.jpg';
import salon6Image from '../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/salon-6.jpg';
import ServiceCategorySection from './components/ServiceCategorySection';
import HomeRepairSection from './components/HomeRepairSection';
import BannerWithRefer from './components/BannerWithRefer';
import ACApplianceModal from './components/ACApplianceModal';
import CategoryModal from './components/CategoryModal';
import acRepairImage from '../../assets/images/pages/Home/ServiceCategorySection/ApplianceServices/ac-repair.jpg';
import washingMachineRepairImage from '../../assets/images/pages/Home/ServiceCategorySection/ApplianceServices/washing-machine-repair].jpg';
import waterHeaterRepairImage from '../../assets/images/pages/Home/ServiceCategorySection/ApplianceServices/water heater repair.jpg';
import refrigeratorRepairImage from '../../assets/images/pages/Home/ServiceCategorySection/ApplianceServices/refigrator-repair.jpg';
import homeWiringInstallationImage from '../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/home-wiring.jpg';
import panelUpgradeRepairImage from '../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/electrical-panel-upgrade.jpg';
import smartHomeSetupImage from '../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/smart home setup.jpg';
// Cleaning Essentials Images
import intenseBathroom2Image from '../../assets/images/pages/Home/ServiceCategorySection/CleaningEssentials/intense-bathroom-2.jpg';
import intenseBathroom3Image from '../../assets/images/pages/Home/ServiceCategorySection/CleaningEssentials/intense-bathroom-3.jpg';
import bathroomCleaningImage from '../../assets/images/pages/Home/ServiceCategorySection/CleaningEssentials/bathroom-cleaning.png';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [address] = useState('New Palasia- Indore- Madhya Pradesh...');
  const [cartCount, setCartCount] = useState(0);

  // Combined useLayoutEffect - Set background and handle scroll on mount and location change
  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const bgStyle = themeColors.backgroundGradient.home;

    // Set background on all elements
    const elements = [html, body, root].filter(Boolean);
    elements.forEach(el => {
      el.style.backgroundColor = '#ffffff';
      el.style.background = bgStyle;
    });

    // Force immediate visibility
    body.style.opacity = '1';
    body.style.visibility = 'visible';

    // Handle scroll to top if needed
    if (location.state?.scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location.state?.scrollToTop]);

  // Load cart count from localStorage on mount and when cart changes
  useEffect(() => {
    const updateCartCount = () => {
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      setCartCount(cartItems.length);
    };

    updateCartCount();

    // Listen for storage changes (when cart is updated from other tabs/pages)
    window.addEventListener('storage', updateCartCount);

    // Custom event for same-tab updates
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);
  const [isACModalOpen, setIsACModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const handleSearch = (query) => {
    // Navigate to search results page
  };

  const handleCategoryClick = (category) => {

    // Show immediate feedback
    if (category.title === 'Electricity') {
      // Use requestIdleCallback for better performance
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          navigate('/electrician');
        }, { timeout: 100 });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => navigate('/electrician'), 0);
      }
      return;
    }

    if (category.title === 'Massage for Men') {
      // Use requestIdleCallback for better performance
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          navigate('/massage-for-men');
        }, { timeout: 100 });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => navigate('/massage-for-men'), 0);
      }
      return;
    }

    // Open modal for AC & Appliance Repair
    if (category.title === 'AC & Appliance Repair') {
      setIsACModalOpen(true);
    } else {
      // Open modal for other categories
      setSelectedCategory(category);
      setIsCategoryModalOpen(true);
    }
  };

  const handlePromoClick = (promo) => {
    // Navigate to promo page or booking
  };

  const handleServiceClick = (service) => {
    // Navigate to service detail page if needed
    // No modal popup
  };


  const handleBuyClick = () => {
    // Navigate to product page or checkout
  };

  const handleSeeAllClick = (category) => {
    // Navigate to category page
  };

  const handleAddClick = (service) => {
    // Add service to cart
  };

  const handleReferClick = () => {
    navigate('/rewards');
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
            background: 'linear-gradient(135deg, #FCD34D 0%, #FDE68A 50%, #FFFFFF 100%)'
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

            <PromoCarousel
              onPromoClick={handlePromoClick}
            />
          </div>
        </div>

        <CuratedServices
          onServiceClick={handleServiceClick}
        />

        <NewAndNoteworthy
          onServiceClick={handleServiceClick}
        />

        <MostBookedServices
          onServiceClick={handleServiceClick}
        />

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

        <Banner
          onBuyClick={handleBuyClick}
        />

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

        <ServiceCategorySection
          title="Electrical Installation & Repair"
          services={electricalServices}
          onSeeAllClick={() => handleSeeAllClick('electrical')}
          onServiceClick={handleServiceClick}
        />

        <ServiceCategorySection
          title="Appliance repair & service"
          services={applianceServices}
          onSeeAllClick={() => handleSeeAllClick('appliance')}
          onServiceClick={handleServiceClick}
        />

        <HomeRepairSection
          onSeeAllClick={() => handleSeeAllClick('home-repair')}
          onServiceClick={handleServiceClick}
          onAddClick={handleAddClick}
        />

        <BannerWithRefer
          onBuyClick={handleBuyClick}
          onReferClick={handleReferClick}
        />
      </main>

      <BottomNav
        cartCount={cartCount}
        onCartClick={handleCartClick}
      />

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

