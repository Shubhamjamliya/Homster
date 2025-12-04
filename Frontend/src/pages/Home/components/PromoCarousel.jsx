import React from 'react';
import PromoCard from '../../../components/common/PromoCard';
import promo1 from '../../../assets/images/pages/Home/promo-carousel/1764052270908-bae94c.jpg';
import promo2 from '../../../assets/images/pages/Home/promo-carousel/1678450687690-81f922.jpg';
import promo3 from '../../../assets/images/pages/Home/promo-carousel/1745822547742-760034.jpg';
import promo4 from '../../../assets/images/pages/Home/promo-carousel/1711428209166-2d42c0.jpg';
import promo5 from '../../../assets/images/pages/Home/promo-carousel/1762785595543-540198.jpg';
import promo6 from '../../../assets/images/pages/Home/promo-carousel/1678454437383-aa4984.jpg';

const PromoCarousel = ({ promos, onPromoClick }) => {
  // Default promotional cards if none provided
  const defaultPromos = [
    {
      id: 1,
      title: 'Shine your bathroom deserves',
      subtitle: '',
      buttonText: 'Book now',
      className: 'from-green-600 to-green-700',
      image: promo1,
    },
    {
      id: 2,
      title: 'New Service',
      subtitle: 'Smart Home Installation - Get 20% off',
      buttonText: 'Explore',
      className: 'from-blue-600 to-blue-800',
      image: promo2,
    },
    {
      id: 3,
      title: 'Emergency',
      subtitle: '24/7 Emergency Services',
      buttonText: 'Call Now',
      className: 'from-orange-600 to-orange-800',
      image: promo3,
    },
    {
      id: 4,
      title: 'Special Offer',
      subtitle: 'Get amazing deals on all services',
      buttonText: 'Book now',
      className: 'from-purple-600 to-purple-800',
      image: promo4,
    },
    {
      id: 5,
      title: 'Premium Services',
      subtitle: 'Experience the best',
      buttonText: 'Explore',
      className: 'from-indigo-600 to-indigo-800',
      image: promo5,
    },
    {
      id: 6,
      title: 'Limited Time',
      subtitle: 'Hurry up! Limited offers',
      buttonText: 'Book now',
      className: 'from-pink-600 to-pink-800',
      image: promo6,
    },
  ];

  const promotionalCards = promos || defaultPromos;

  return (
    <div className="mb-6 border-t-4 border-gray-300 pt-6">
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {promotionalCards.map((promo) => (
          <PromoCard
            key={promo.id}
            title={promo.title}
            subtitle={promo.subtitle}
            buttonText={promo.buttonText}
            image={promo.image}
            className={promo.className}
            onClick={() => onPromoClick?.(promo)}
          />
        ))}
      </div>
      {/* Carousel indicator dots */}
      <div className="flex justify-center gap-1 mt-2">
        {promotionalCards.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full ${index === 0 ? 'bg-green-600' : 'bg-gray-300'
              }`}
          />
        ))}
      </div>
    </div>
  );
};

export default PromoCarousel;

