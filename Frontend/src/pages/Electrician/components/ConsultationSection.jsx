import React from 'react';
import ServiceSection from '../../../components/common/ServiceSection';
import bookConsultation from '../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/book.jpg';

const ConsultationSection = ({ onAddClick, onViewDetails }) => {
  const services = [
    {
      id: 1,
      title: 'Electrical consultation',
      rating: '4.85',
      reviews: '15K',
      price: '199',
      duration: '1 hr',
      description: 'Expert electrical consultation',
      image: bookConsultation,
    },
    {
      id: 2,
      title: 'Home electrical audit',
      rating: '4.83',
      reviews: '12K',
      price: '499',
      duration: '2 hrs',
      description: 'Complete home electrical safety audit',
      image: bookConsultation,
    },
  ];

  return (
    <ServiceSection
      title="Book a consultation"
      services={services}
      onAddClick={onAddClick}
      onViewDetails={onViewDetails}
    />
  );
};

export default ConsultationSection;

