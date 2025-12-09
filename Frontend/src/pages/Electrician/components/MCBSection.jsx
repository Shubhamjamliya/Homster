import React from 'react';
import ServiceSection from '../../../components/common/ServiceSection';
import mcb from '../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/mcb.jpg';

const MCBSection = ({ onAddClick, onViewDetails }) => {
  const services = [
    {
      id: 1,
      title: 'MCB installation',
      rating: '4.83',
      reviews: '42K',
      price: '399',
      duration: '1 hr',
      description: 'Install Miniature Circuit Breaker',
      image: mcb,
    },
    {
      id: 2,
      title: 'Submeter installation',
      rating: '4.81',
      reviews: '35K',
      price: '599',
      duration: '1 hr 30 mins',
      description: 'Install electrical submeter',
      image: mcb,
    },
    {
      id: 3,
      title: 'MCB repair',
      rating: '4.82',
      reviews: '28K',
      price: '249',
      duration: '45 mins',
      description: 'Repair MCB and circuit issues',
      image: mcb,
    },
  ];

  return (
    <ServiceSection
      title="MCB & submeter"
      services={services}
      onAddClick={onAddClick}
      onViewDetails={onViewDetails}
    />
  );
};

export default MCBSection;

