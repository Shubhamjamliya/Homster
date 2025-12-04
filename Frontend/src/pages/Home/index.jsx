import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import SearchBar from './components/SearchBar';
import ServiceCategories from './components/ServiceCategories';
import PromoCarousel from './components/PromoCarousel';
import CuratedServices from './components/CuratedServices';
import NewAndNoteworthy from './components/NewAndNoteworthy';
import MostBookedServices from './components/MostBookedServices';
import CelebratingProfessionals from './components/CelebratingProfessionals';
import ServiceSectionWithRating from './components/ServiceSectionWithRating';
import NativeProduct from './components/NativeProduct';
// Salon for Women Images
import salon1Image from '../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/salon-1.jpg';
import salon2Image from '../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/salon-2.jpg';
import salon3Image from '../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/salon-3.jpg';
import salon4Image from '../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/salon-4.jpg';
import salon5Image from '../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/salon-5.jpg';
import salon6Image from '../../assets/images/pages/Home/ServiceCategorySection/SalonForWomen/salon-6.jpg';
import ServiceCategorySection from './components/ServiceCategorySection';
import HomeRepairSection from './components/HomeRepairSection';
import NativeProductWithRefer from './components/NativeProductWithRefer';
import ACApplianceModal from './components/ACApplianceModal';
import acRepairImage from '../../assets/images/pages/Home/ServiceCategorySection/ApplianceServices/ac-repair.jpg';
import washingMachineRepairImage from '../../assets/images/pages/Home/ServiceCategorySection/ApplianceServices/washing-machine-repair].jpg';
import waterHeaterRepairImage from '../../assets/images/pages/Home/ServiceCategorySection/ApplianceServices/water heater repair.jpg';
import refrigeratorRepairImage from '../../assets/images/pages/Home/ServiceCategorySection/ApplianceServices/refigrator-repair.jpg';
import homeWiringInstallationImage from '../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/home-wiring.jpg';
import panelUpgradeRepairImage from '../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/electrical-panel-upgrade.jpg';
import smartHomeSetupImage from '../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/smart home setup.jpg';

const Home = () => {
  const navigate = useNavigate();
  const [location] = useState('New Palasia- Indore- Madhya Pradesh...');
  const [cartCount] = useState(0);
  const [isACModalOpen, setIsACModalOpen] = useState(false);

  const handleSearch = (query) => {
    console.log('Search query:', query);
    // Navigate to search results page
  };

  const handleCategoryClick = (category) => {
    console.log('Category clicked:', category);
    // Open modal for AC & Appliance Repair
    if (category.title === 'AC & Appliance Repair') {
      setIsACModalOpen(true);
    } else {
      // Navigate to service category page for other categories
    }
  };

  const handlePromoClick = (promo) => {
    console.log('Promo clicked:', promo);
    // Navigate to promo page or booking
  };

  const handleServiceClick = (service) => {
    console.log('Service clicked:', service);
    // Navigate to AC Service page if AC service is clicked
    if (service.title === 'AC Service and Repair' || service.title?.includes('AC')) {
      navigate('/ac-service');
    } else {
      // Navigate to other service detail pages
    }
  };

  const handleProfessionalClick = (professional) => {
    console.log('Professional clicked:', professional);
    // Navigate to professional profile or story
  };

  const handleBuyClick = () => {
    console.log('Buy now clicked');
    // Navigate to product page or checkout
  };

  const handleSeeAllClick = (category) => {
    console.log('See all clicked for:', category);
    // Navigate to category page
  };

  const handleAddClick = (service) => {
    console.log('Add clicked for service:', service);
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
    console.log('Location selector clicked');
    // Open location selector modal
  };

  const handleCartClick = () => {
    console.log('Cart clicked');
    // Navigate to cart page
  };


  return (
    <div className="min-h-screen bg-white pb-20">
      <Header
        location={location}
        cartCount={cartCount}
        onLocationClick={handleLocationClick}
        onCartClick={handleCartClick}
      />

      <main className="pt-0">
        <SearchBar 
          onSearch={handleSearch}
        />

        <ServiceCategories
          onCategoryClick={handleCategoryClick}
        />

        <PromoCarousel
          onPromoClick={handlePromoClick}
        />

        <CuratedServices
          onServiceClick={handleServiceClick}
        />

        <NewAndNoteworthy
          onServiceClick={handleServiceClick}
        />

        <MostBookedServices
          onServiceClick={handleServiceClick}
        />

        <CelebratingProfessionals
          onProfessionalClick={handleProfessionalClick}
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

        <NativeProduct
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
              image: null,
            },
            {
              id: 2,
              title: 'Intense cleaning (3 bathrooms)',
              rating: '4.79',
              reviews: '3.7M',
              price: '1,381',
              originalPrice: '1,557',
              discount: '11%',
              image: null,
            },
            {
              id: 3,
              title: 'Classic cleaning (2 bathrooms)',
              rating: '4.82',
              reviews: '1.5M',
              price: '785',
              originalPrice: '858',
              discount: '9%',
              image: null,
            },
            {
              id: 4,
              title: 'Classic cleaning (3 bathrooms)',
              rating: '4.82',
              reviews: '1.5M',
              price: '1,141',
              originalPrice: '1,287',
              discount: '11%',
              image: null,
            },
            {
              id: 5,
              title: 'Dining table & chairs cleaning',
              rating: '4.82',
              reviews: '57K',
              price: '299',
              image: null,
            },
            {
              id: 6,
              title: 'Chimney cleaning',
              rating: '4.83',
              reviews: '109K',
              price: '599',
              image: null,
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

        <NativeProductWithRefer
          onBuyClick={handleBuyClick}
          onReferClick={handleReferClick}
        />
      </main>

      <BottomNav />

      {/* AC & Appliance Repair Modal */}
      <ACApplianceModal
        isOpen={isACModalOpen}
        onClose={() => setIsACModalOpen(false)}
        location={location}
        cartCount={cartCount}
      />
    </div>
  );
};

export default Home;

