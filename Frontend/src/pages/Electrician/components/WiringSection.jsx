import React from 'react';
import ServiceSection from '../../../components/common/ServiceSection';
import wiring from '../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/wiring.jpg';

const WiringSection = ({ onAddClick, onViewDetails }) => {
  const services = [
    {
      id: 1,
      title: 'Home wiring installation',
      rating: '4.85',
      reviews: '120K',
      price: '1,499',
      duration: '4 hrs',
      description: 'Complete home wiring installation',
      image: wiring,
    },
    {
      id: 2,
      title: 'Wiring repair',
      rating: '4.83',
      reviews: '95K',
      price: '599',
      duration: '2 hrs',
      description: 'Repair and fix wiring issues',
      image: wiring,
    },
    {
      id: 3,
      title: 'Rewiring service',
      rating: '4.82',
      reviews: '78K',
      price: '1,299',
      duration: '3 hrs',
      description: 'Complete rewiring of home',
      image: wiring,
    },
  ];

  return (
    <ServiceSection
      title="Wiring"
      services={services}
      onAddClick={onAddClick}
      onViewDetails={onViewDetails}
    />
  );
};

export default WiringSection;

