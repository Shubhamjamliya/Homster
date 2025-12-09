import React from 'react';
import ServiceSection from '../../../components/common/ServiceSection';
import light from '../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/light.jpg';

const LightSection = ({ onAddClick, onViewDetails }) => {
  const services = [
    {
      id: 1,
      title: 'Wall light installation',
      rating: '4.83',
      reviews: '25K',
      price: '199',
      duration: '30 mins',
      description: 'Install wall-mounted lights',
      image: light,
    },
    {
      id: 2,
      title: 'Ceiling light installation',
      rating: '4.84',
      reviews: '38K',
      price: '249',
      duration: '45 mins',
      description: 'Install ceiling lights and fixtures',
      image: light,
    },
    {
      id: 3,
      title: 'Light repair',
      rating: '4.81',
      reviews: '22K',
      price: '149',
      duration: '30 mins',
      description: 'Repair and fix lighting issues',
      image: light,
    },
  ];

  return (
    <ServiceSection
      title="Wall/ceiling light"
      services={services}
      onAddClick={onAddClick}
      onViewDetails={onViewDetails}
    />
  );
};

export default LightSection;

