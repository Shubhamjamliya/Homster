import React from 'react';
import DetailedServiceCard from '../../../components/common/DetailedServiceCard';

const MostBookedServices = ({ services, onServiceClick }) => {
  // Default electrical services if none provided
  const defaultServices = [
    {
      id: 1,
      title: 'Home Wiring Installation',
      rating: '4.79',
      reviews: '3.7M',
      price: '1,381',
      originalPrice: '1,667',
      discount: '11%',
      image: null,
    },
    {
      id: 2,
      title: 'AC Service and Repair',
      rating: '4.85',
      reviews: '99K',
      price: '49',
      image: null,
    },
    {
      id: 3,
      title: 'Electrical Panel Installation',
      rating: '4.72',
      reviews: '2.1M',
      price: '2,500',
      originalPrice: '3,000',
      discount: '17%',
      image: null,
    },
    {
      id: 4,
      title: 'Smart Switch Installation',
      rating: '4.88',
      reviews: '45K',
      price: '299',
      image: null,
    },
  ];

  const serviceList = services || defaultServices;

  return (
    <div className="mb-6 border-t-2 border-b-2 border-gray-300 pt-6 pb-6">
      <div className="px-4 mb-4">
        <h2 className="text-xl font-bold text-black">
          Most booked services
        </h2>
      </div>

      {/* Horizontal Scrollable Service Cards */}
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {serviceList.map((service) => (
          <DetailedServiceCard
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

export default MostBookedServices;

