import React from 'react';
import ServiceSection from '../../../components/common/ServiceSection';
import inverter from '../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/invertor.jpg';

const InverterSection = ({ onAddClick, onViewDetails }) => {
  const services = [
    {
      id: 1,
      title: 'Inverter installation',
      rating: '4.84',
      reviews: '55K',
      price: '1,499',
      duration: '2 hrs',
      description: 'Install inverter system',
      image: inverter,
    },
    {
      id: 2,
      title: 'Stabiliser installation',
      rating: '4.82',
      reviews: '38K',
      price: '599',
      duration: '1 hr',
      description: 'Install voltage stabiliser',
      image: inverter,
    },
    {
      id: 3,
      title: 'Inverter repair',
      rating: '4.81',
      reviews: '32K',
      price: '499',
      duration: '1 hr 30 mins',
      description: 'Repair inverter issues',
      image: inverter,
    },
  ];

  return (
    <ServiceSection
      title="Inverter & stabiliser"
      services={services}
      onAddClick={onAddClick}
      onViewDetails={onViewDetails}
    />
  );
};

export default InverterSection;

