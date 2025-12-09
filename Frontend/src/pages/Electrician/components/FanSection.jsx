import React from 'react';
import ServiceSection from '../../../components/common/ServiceSection';
import fan from '../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/fan.jpg';

const FanSection = ({ onAddClick, onViewDetails }) => {
  const services = [
    {
      id: 1,
      title: 'Ceiling fan installation',
      rating: '4.85',
      reviews: '45K',
      price: '299',
      duration: '1 hr',
      description: 'Professional ceiling fan installation',
      image: fan,
    },
    {
      id: 2,
      title: 'Fan repair',
      rating: '4.82',
      reviews: '32K',
      price: '199',
      duration: '45 mins',
      description: 'Fan repair and maintenance',
      image: fan,
    },
    {
      id: 3,
      title: 'Fan replacement',
      rating: '4.80',
      reviews: '28K',
      price: '349',
      duration: '1 hr',
      description: 'Replace old fan with new one',
      image: fan,
    },
  ];

  return (
    <ServiceSection
      title="Fan"
      services={services}
      onAddClick={onAddClick}
      onViewDetails={onViewDetails}
    />
  );
};

export default FanSection;

