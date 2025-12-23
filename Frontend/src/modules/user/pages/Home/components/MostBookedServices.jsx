import React, { useRef, useEffect } from 'react';
import { createOptimizedScrollAnimation, createOptimizedStaggerAnimation } from '../../../../../utils/optimizedScrollTrigger';
import DetailedServiceCard from '../../../components/common/DetailedServiceCard';
import intenseBathroom2Image from '../../../../../assets/images/pages/Home/MostBookedServices/intense-bathroom-2.jpg';
import intenseBathroom3Image from '../../../../../assets/images/pages/Home/MostBookedServices/intense-bathroom-3.jpg';
import drillHangImage from '../../../../../assets/images/pages/Home/MostBookedServices/dreill&hang.jpg';
import rollOnWaxImage from '../../../../../assets/images/pages/Home/MostBookedServices/roll-on-wax.webp';
import tapRepairImage from '../../../../../assets/images/pages/Home/MostBookedServices/tap-repai.jpg';
import automaticTopLoadImage from '../../../../../assets/images/pages/Home/MostBookedServices/automatic-top-load-machine.webp';
import spatulaWaxingImage from '../../../../../assets/images/pages/Home/MostBookedServices/spacula-waxing.jpg';
import fanRepairImage from '../../../../../assets/images/pages/Home/MostBookedServices/fan-repairs.jpg';
import switchBoardImage from '../../../../../assets/images/pages/Home/MostBookedServices/switch-board.jpg';

const MostBookedServices = React.memo(({ services, onServiceClick, onAddClick }) => {
  // Default electrical services if none provided
  const defaultServices = [
    {
      id: 1,
      title: 'Intense cleaning (2 bathrooms)',
      rating: '4.79',
      reviews: '3.7M',
      price: '950',
      originalPrice: '1,038',
      discount: '8%',
      image: intenseBathroom2Image,
    },
    {
      id: 2,
      title: 'Intense cleaning (3 bathrooms)',
      rating: '4.79',
      reviews: '3.7M',
      price: '1,381',
      originalPrice: '1,667',
      discount: '11%',
      image: intenseBathroom3Image,
    },
    {
      id: 3,
      title: 'Drill & hang (wall decor)',
      rating: '4.85',
      reviews: '99K',
      price: '49',
      image: drillHangImage,
    },
    {
      id: 4,
      title: 'Roll-on waxing (Full arms, legs & underarms)',
      rating: '4.87',
      reviews: '47K',
      price: '799',
      image: rollOnWaxImage,
    },
    {
      id: 5,
      title: 'Tap repair',
      rating: '4.80',
      reviews: '119K',
      price: '49',
      image: tapRepairImage,
    },
    {
      id: 6,
      title: 'Automatic top load machine check-up',
      rating: '4.78',
      reviews: '339K',
      price: '160',
      image: automaticTopLoadImage,
    },
    {
      id: 7,
      title: 'Spatula waxing (Full arms)',
      rating: '4.86',
      reviews: '31K',
      price: '599',
      image: spatulaWaxingImage,
    },
    {
      id: 8,
      title: 'Fan repair (ceiling/exhaust/wall)',
      rating: '4.81',
      reviews: '92K',
      price: '109',
      image: fanRepairImage,
    },
    {
      id: 9,
      title: 'Switch/socket replacement',
      rating: '4.84',
      reviews: '78K',
      price: '49',
      image: switchBoardImage,
    },
    {
      id: 10,
      title: 'Semi-automatic machine check-up',
      rating: '4.76',
      reviews: '83K',
      price: '160',
      image: automaticTopLoadImage, // Using automatic top load image as placeholder
    },
  ];

  const serviceList = (services && services.length > 0) ? services : defaultServices;
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef(null);

  // Defer GSAP scroll animations until after initial render for better performance
  useEffect(() => {
    // Skip animations on initial load to improve performance
    const shouldAnimate = typeof window !== 'undefined' &&
      (window.requestIdleCallback || window.setTimeout);

    if (!shouldAnimate || !sectionRef.current || !titleRef.current || !cardsRef.current) {
      // Show content immediately without animation
      if (titleRef.current) titleRef.current.style.opacity = '1';
      if (cardsRef.current) {
        Array.from(cardsRef.current.children).forEach(card => {
          card.style.opacity = '1';
          card.style.transform = 'none';
        });
      }
      return;
    }

    // Defer animation initialization until browser is idle
    const initAnimations = () => {
      const cards = Array.from(cardsRef.current?.children || []);
      if (cards.length === 0) return;

      const cleanupFunctions = [];

      // Animate title
      const titleCleanup = createOptimizedScrollAnimation(
        titleRef.current,
        {
          from: { y: 30, opacity: 0 },
          to: { y: 0, opacity: 1 },
          duration: 0.6,
          ease: 'power2.out',
        },
        { rootMargin: '100px' }
      );
      if (titleCleanup) cleanupFunctions.push(titleCleanup);

      // Stagger animate cards
      const cardsCleanup = createOptimizedStaggerAnimation(
        cards,
        {
          from: { x: 50, opacity: 0, scale: 0.9 },
          to: { x: 0, opacity: 1, scale: 1 },
          duration: 0.5,
          stagger: 0.08,
          ease: 'back.out(1.7)',
        },
        { rootMargin: '150px' }
      );
      if (cardsCleanup) cleanupFunctions.push(cardsCleanup);

      return () => {
        cleanupFunctions.forEach(cleanup => cleanup?.());
      };
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if (window.requestIdleCallback) {
      const idleCallback = window.requestIdleCallback(initAnimations, { timeout: 2000 });
      return () => {
        if (idleCallback) window.cancelIdleCallback(idleCallback);
      };
    } else {
      const timeout = setTimeout(initAnimations, 500);
      return () => clearTimeout(timeout);
    }
  }, []); // Empty deps - only run once on mount

  return (
    <div ref={sectionRef} className="mb-6">
      <div ref={titleRef} className="px-4 mb-5" style={{ opacity: 1 }}>
        <h2
          className="text-xl font-bold text-black"
        >
          Most booked services
        </h2>
      </div>

      {/* Horizontal Scrollable Service Cards */}
      <div ref={cardsRef} className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
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
            onAddClick={() => onAddClick?.(service)}
          />
        ))}
      </div>
    </div>
  );
});

MostBookedServices.displayName = 'MostBookedServices';

export default MostBookedServices;

