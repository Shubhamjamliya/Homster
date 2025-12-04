import React from 'react';
import ServiceCard from '../../../components/common/ServiceCard';

const CuratedServices = ({ services, onServiceClick }) => {
  // Default electrical services if none provided
  const defaultServices = [
    {
      id: 1,
      title: 'Bathroom Deep Cleaning',
      gif: null, // Add GIF path here when available
    },
    {
      id: 2,
      title: 'SPA for WOMEN',
      gif: null, // Add GIF path here when available
    },
    {
      id: 3,
      title: 'Massage for Men',
      gif: null, // Add GIF path here when available
    },
    {
      id: 4,
      title: 'Roll-on waxing',
      gif: null, // Add GIF path here when available
    },
    {
      id: 5,
      title: 'FACIALS & CLEANUPS',
      gif: null, // Add GIF path here when available
    },
    {
      id: 6,
      title: 'Professional Sofa Cleaning',
      gif: null, // Add GIF path here when available
    },
  ];

  const serviceList = services || defaultServices;

  return (
    <div className="mb-6 border-t-4 border-gray-300 pt-6">
      {/* Title Section */}
      <div className="px-4 mb-4">
        <h2 className="text-lg font-bold text-black mb-1">
          Thoughtful curations
        </h2>
        <p className="text-sm text-black">
          of our finest experiences
        </p>
      </div>

      {/* Horizontal Scrollable Service Cards */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {serviceList.map((service) => (
          <ServiceCard
            key={service.id}
            title={service.title}
            gif={service.gif}
            onClick={() => onServiceClick?.(service)}
          />
        ))}
      </div>
    </div>
  );
};

export default CuratedServices;

