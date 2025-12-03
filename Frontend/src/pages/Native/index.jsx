import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import NativeSmartLocks from './components/NativeSmartLocks';
import NativeROPurifiers from './components/NativeROPurifiers';
import BestInClassFeatures from './components/BestInClassFeatures';
import TestimonialsSection from './components/TestimonialsSection';
import BrandPhilosophy from './components/BrandPhilosophy';

const Native = () => {
  const [location] = useState('New Palasia- Indore- Madhya Pradesh...');
  const [cartCount] = useState(0);

  const handleLocationClick = () => {
    console.log('Location selector clicked');
  };

  const handleCartClick = () => {
    console.log('Cart clicked');
  };

  const handleKnowMoreClick = (productType) => {
    console.log('Know more clicked for:', productType);
  };

  const handleFeatureClick = (feature) => {
    console.log('Feature clicked:', feature);
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
        <BestInClassFeatures onFeatureClick={handleFeatureClick} />
        <NativeSmartLocks onKnowMoreClick={handleKnowMoreClick} />
        <NativeROPurifiers onKnowMoreClick={handleKnowMoreClick} />
        <TestimonialsSection />
        <BrandPhilosophy />
      </main>

      <BottomNav />
    </div>
  );
};

export default Native;

