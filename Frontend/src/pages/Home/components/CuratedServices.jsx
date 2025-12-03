import React from 'react';
import ServiceCard from '../../../components/common/ServiceCard';

const CuratedServices = ({ services, onServiceClick }) => {
  // Default electrical services if none provided
  const defaultServices = [
    {
      id: 1,
      title: 'Home Wiring Installation',
      image: null,
    },
    {
      id: 2,
      title: 'AC Repair & Service',
      image: null,
    },
    {
      id: 3,
      title: 'Smart Home Setup',
      image: null,
    },
    {
      id: 4,
      title: 'Electrical Panel Upgrade',
      image: null,
    },
  ];

  const serviceList = services || defaultServices;

  return (
    <div className="mb-6 border-t-4 border-gray-300 pt-6">
      {/* Progress Indicator */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-1 bg-gray-200 rounded-full">
          <div className="w-8 h-1 bg-gray-600 rounded-full"></div>
        </div>
      </div>

      {/* Title Section */}
      <div className="px-4 mb-4">
        <h2 className="text-2xl font-bold text-black mb-1">
          Thoughtful curations
        </h2>
        <p className="text-base text-black">
          of our finest experiences
        </p>
      </div>

      {/* Horizontal Scrollable Service Cards */}
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {serviceList.map((service) => (
          <ServiceCard
            key={service.id}
            title={service.title}
            image={service.image}
            onClick={() => onServiceClick?.(service)}
          />
        ))}
      </div>
    </div>
  );
};

export default CuratedServices;

