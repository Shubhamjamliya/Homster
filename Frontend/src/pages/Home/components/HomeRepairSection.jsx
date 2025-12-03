import React from 'react';
import ServiceCardWithAdd from '../../../components/common/ServiceCardWithAdd';
import drillHangImage from '../../../assets/images/pages/Home/HomeRepairSection/drill&hang.jpg';
import tapRepairImage from '../../../assets/images/pages/Home/HomeRepairSection/tap-repair.jpg';
import fanRepairImage from '../../../assets/images/pages/Home/HomeRepairSection/fan-repair.jpg';
import switchSocketImage from '../../../assets/images/pages/Home/HomeRepairSection/switch socket installation.jpg';

const HomeRepairSection = ({ services, onSeeAllClick, onServiceClick, onAddClick }) => {
  // Default home repair services if none provided
  const defaultServices = [
    {
      id: 1,
      title: 'Drill & hang (wall decor)',
      rating: '4.85',
      reviews: '99K',
      price: '49',
      image: drillHangImage,
    },
    {
      id: 2,
      title: 'Tap repair',
      rating: '4.80',
      reviews: '119K',
      price: '49',
      image: tapRepairImage,
    },
    {
      id: 3,
      title: 'Fan repair, exhaust, etc.',
      rating: '4.81',
      reviews: '9K',
      price: '109',
      image: fanRepairImage,
    },
    {
      id: 4,
      title: 'Switch & Socket Installation',
      rating: '4.79',
      reviews: '45K',
      price: '99',
      image: switchSocketImage,
    },
  ];

  const serviceList = services || defaultServices;

  return (
    <div className="mb-6 border-t-4 border-gray-300 pt-6">
      {/* Title and See All */}
      <div className="px-4 mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-black">
          Home repair & installation
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
        {serviceList.map((service) => (
          <ServiceCardWithAdd
            key={service.id}
            title={service.title}
            rating={service.rating}
            reviews={service.reviews}
            price={service.price}
            image={service.image}
            onClick={() => onServiceClick?.(service)}
            onAddClick={() => onAddClick?.(service)}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeRepairSection;

