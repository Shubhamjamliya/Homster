import React from 'react';
import PromoCard from '../../../components/common/PromoCard';
import promotion1 from '../../../assets/images/pages/Home/promo-carousel/promotion1.jpg';
import promotion2 from '../../../assets/images/pages/Home/promo-carousel/promotion2.jpg';
import promiton3 from '../../../assets/images/pages/Home/promo-carousel/promiton3.jpg';

const PromoCarousel = ({ promos, onPromoClick }) => {
  // Default promotional cards if none provided
  const defaultPromos = [
    {
      id: 1,
      title: 'Price drop',
      subtitle: 'Wedding-ready packages upto 25% off',
      buttonText: 'Book now',
      className: 'from-purple-600 to-purple-800',
      image: promotion1,
    },
    {
      id: 2,
      title: 'New Service',
      subtitle: 'Smart Home Installation - Get 20% off',
      buttonText: 'Explore',
      className: 'from-blue-600 to-blue-800',
      image: promotion2,
    },
    {
      id: 3,
      title: 'Emergency',
      subtitle: '24/7 Emergency Electrical Services',
      buttonText: 'Call Now',
      className: 'from-orange-600 to-orange-800',
      image: promiton3,
    },
  ];

  const promotionalCards = promos || defaultPromos;

  return (
    <div className="mb-6 border-t-2 border-b border-gray-300 pt-6 pb-6">
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
            className={`w-1.5 h-1.5 rounded-full ${index === 0 ? 'bg-purple-600' : 'bg-gray-300'
              }`}
          />
        ))}
      </div>
    </div>
  );
};

export default PromoCarousel;

