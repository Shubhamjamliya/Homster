import React from 'react';
import ServiceWithRatingCard from '../../../components/common/ServiceWithRatingCard';

const ServiceSectionWithRating = ({ title, subtitle, services, onSeeAllClick, onServiceClick, showTopBorder = true }) => {
  return (
    <div className={`mb-6 ${showTopBorder ? 'border-t-4 border-gray-300 pt-6' : ''}`}>
      {/* Title and Subtitle Section */}
      <div className="px-4 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-black mb-1">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-black">
              {subtitle}
            </p>
          )}
        </div>
        {onSeeAllClick && (
          <button
            onClick={onSeeAllClick}
            className="text-purple-600 font-medium text-sm hover:underline"
          >
            See all
          </button>
        )}
      </div>

      {/* Horizontal Scrollable Service Cards */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {services.map((service) => (
          <ServiceWithRatingCard
            key={service.id}
            title={service.title}
            rating={service.rating}
            reviews={service.reviews}
            price={service.price}
            originalPrice={service.originalPrice}
            discount={service.discount}
            image={service.image}
            onClick={() => onServiceClick?.(service)}
          />
        ))}
      </div>
    </div>
  );
};

export default ServiceSectionWithRating;

