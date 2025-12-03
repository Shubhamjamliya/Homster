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
import NativeProduct from './components/NativeProduct';
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

      <main className="pt-1">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search for 'Electrical Services'"
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

        <NativeProduct
          onBuyClick={handleBuyClick}
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

