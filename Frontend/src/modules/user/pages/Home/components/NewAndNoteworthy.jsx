import React, { useRef, useEffect } from 'react';
import { createOptimizedScrollAnimation, createOptimizedStaggerAnimation } from '../../../../../utils/optimizedScrollTrigger';
import SimpleServiceCard from '../../../components/common/SimpleServiceCard';
import waterPurifierImage from '../../../../../assets/images/pages/Home/NewAndNoteworthy/water-purifiers.png';
import bathroomCleaningImage from '../../../../../assets/images/pages/Home/NewAndNoteworthy/bathroom-cleaning.png';
import hairStudioImage from '../../../../../assets/images/pages/Home/NewAndNoteworthy/hair-studio.png';
import acRepairImage from '../../../../../assets/images/pages/Home/NewAndNoteworthy/ac-repair.png';

const NewAndNoteworthy = React.memo(({ services, onServiceClick }) => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef(null);
  // Default electrical services if none provided
  const defaultServices = [
    {
      id: 1,
      title: 'Native Water Purifier',
      image: waterPurifierImage,
    },
    {
      id: 2,
      title: 'Bathroom & Kitchen Cleaning',
      image: bathroomCleaningImage,
    },
    {
      id: 3,
      title: 'Hair Studio for Women',
      image: hairStudioImage,
    },
    {
      id: 4,
      title: 'AC Service and Repair',
      image: acRepairImage,
    },
  ];

  const serviceList = services || defaultServices;

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
          New and noteworthy
        </h2>
      </div>

      {/* Horizontal Scrollable Service Cards */}
      <div ref={cardsRef} className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
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
});

NewAndNoteworthy.displayName = 'NewAndNoteworthy';

export default NewAndNoteworthy;

