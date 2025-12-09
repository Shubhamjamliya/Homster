import React from 'react';
import ServiceSection from '../../../components/common/ServiceSection';
import doorbell from '../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/dorebell.jpg';

const DoorbellSection = ({ onAddClick, onViewDetails }) => {
  const services = [
    {
      id: 1,
      title: 'Doorbell installation',
      rating: '4.82',
      reviews: '35K',
      price: '299',
      duration: '30 mins',
      description: 'Install doorbell system',
      image: doorbell,
    },
    {
      id: 2,
      title: 'Smart doorbell installation',
      rating: '4.84',
      reviews: '28K',
      price: '599',
      duration: '1 hr',
      description: 'Install smart doorbell with video',
      image: doorbell,
    },
    {
      id: 3,
      title: 'Doorbell repair',
      rating: '4.80',
      reviews: '18K',
      price: '149',
      duration: '20 mins',
      description: 'Repair doorbell issues',
      image: doorbell,
    },
  ];

  return (
    <ServiceSection
      title="Doorbell"
      services={services}
      onAddClick={onAddClick}
      onViewDetails={onViewDetails}
    />
  );
};

export default DoorbellSection;

