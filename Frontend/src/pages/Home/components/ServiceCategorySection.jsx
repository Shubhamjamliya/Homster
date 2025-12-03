import React from 'react';
import SimpleServiceCard from '../../../components/common/SimpleServiceCard';

const ServiceCategorySection = ({ title, services, onSeeAllClick, onServiceClick }) => {
  return (
    <div className="mb-6 border-t-4 border-gray-300 pt-6">
      {/* Title and See All */}
      <div className="px-4 mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-black">
          {title}
        </h2>
        <button
          onClick={onSeeAllClick}
          className="text-purple-600 font-medium text-sm hover:underline"
        >
          See all
        </button>
      </div>

      {/* Horizontal Scrollable Service Cards */}
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {services.map((service) => (
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

export default ServiceCategorySection;

