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

const Home = () => {
  const navigate = useNavigate();
  const [location] = useState('New Palasia- Indore- Madhya Pradesh...');
  const [cartCount] = useState(0);

  const handleSearch = (query) => {
    console.log('Search query:', query);
    // Navigate to search results page
  };

  const handleCategoryClick = (category) => {
    console.log('Category clicked:', category);
    // Navigate to service category page
  };

  const handlePromoClick = (promo) => {
    console.log('Promo clicked:', promo);
    // Navigate to promo page or booking
  };

  const handleServiceClick = (service) => {
    console.log('Service clicked:', service);
    // Navigate to service detail page
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
      image: null,
    },
    {
      id: 2,
      title: 'Panel Upgrade & Repair',
      image: null,
    },
    {
      id: 3,
      title: 'Smart Home Setup',
      image: null,
    },
  ];

  const applianceServices = [
    {
      id: 1,
      title: 'AC Service and Repair',
      image: null,
    },
    {
      id: 2,
      title: 'Washing Machine Repair',
      image: null,
    },
    {
      id: 3,
      title: 'Water Heater Repair',
      image: null,
    },
    {
      id: 4,
      title: 'Refrigerator Repair',
      image: null,
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
    </div>
  );
};

export default Home;

