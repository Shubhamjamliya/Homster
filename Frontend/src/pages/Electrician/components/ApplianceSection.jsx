import React from 'react';
import ServiceSection from '../../../components/common/ServiceSection';
import appliance from '../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/appliance.jpg';

const ApplianceSection = ({ onAddClick, onViewDetails }) => {
  const services = [
    {
      id: 1,
      title: 'Appliance installation',
      rating: '4.83',
      reviews: '48K',
      price: '399',
      duration: '1 hr',
      description: 'Install electrical appliances',
      image: appliance,
    },
    {
      id: 2,
      title: 'Appliance repair',
      rating: '4.82',
      reviews: '65K',
      price: '299',
      duration: '45 mins',
      description: 'Repair electrical appliances',
      image: appliance,
    },
    {
      id: 3,
      title: 'Appliance wiring',
      rating: '4.81',
      reviews: '28K',
      price: '249',
      duration: '30 mins',
      description: 'Wiring for appliances',
      image: appliance,
    },
  ];

  return (
    <ServiceSection
      title="Appliance"
      services={services}
      onAddClick={onAddClick}
      onViewDetails={onViewDetails}
    />
  );
};

export default ApplianceSection;

