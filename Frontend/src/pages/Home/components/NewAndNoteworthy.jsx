import React from 'react';
import SimpleServiceCard from '../../../components/common/SimpleServiceCard';

const NewAndNoteworthy = ({ services, onServiceClick }) => {
  // Default electrical services if none provided
  const defaultServices = [
    {
      id: 1,
      title: 'Smart Home Automation',
      image: null,
    },
    {
      id: 2,
      title: 'Electrical Panel Upgrade',
      image: null,
    },
    {
      id: 3,
      title: 'LED Lighting Installation',
      image: null,
    },
    {
      id: 4,
      title: 'AC Service and Repair',
      image: null,
    },
  ];

  const serviceList = services || defaultServices;

  return (
    <div className="mb-6 border-t-4 border-gray-300 pt-6">
      <div className="px-4 mb-4">
        <h2 className="text-xl font-bold text-black">
          New and noteworthy
        </h2>
      </div>

      {/* Horizontal Scrollable Service Cards */}
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {serviceList.map((service) => (
          <SimpleServiceCard
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

export default NewAndNoteworthy;

