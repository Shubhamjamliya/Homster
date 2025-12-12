import React, { useRef, useEffect } from 'react';
import { createOptimizedScrollAnimation, createOptimizedStaggerAnimation } from '../../../../../utils/optimizedScrollTrigger';
import ServiceCard from '../../../components/common/ServiceCard';

const CuratedServices = React.memo(({ services, onServiceClick }) => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef(null);
  // Default electrical services if none provided
  const defaultServices = [
    {
      id: 1,
      title: 'Bathroom Deep Cleaning',
      gif: null,
      youtubeUrl: null, // Videos removed temporarily
    },

    {
      id: 2,
      title: 'SPA for WOMEN',
      gif: null,
      youtubeUrl: null, // Videos removed temporarily
    },
    {
      id: 3,
      title: 'Massage for Men',
      gif: null,
      youtubeUrl: null, // Videos removed temporarily
    },
    {
      id: 4,
      title: 'Roll-on waxing',
      gif: null,
      youtubeUrl: null, // Videos removed temporarily
    },
    {
      id: 5,
      title: 'FACIALS & CLEANUPS',
      gif: null,
      youtubeUrl: null, // Videos removed temporarily
    },
    {
      id: 6,
      title: 'Professional Sofa Cleaning',
      gif: null,
      youtubeUrl: null, // Videos removed temporarily
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

      // Animate title with optimized scroll trigger
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

      // Stagger animate cards with optimized scroll trigger
      const cardsCleanup = createOptimizedStaggerAnimation(
        cards,
        {
          from: { x: 50, opacity: 0, scale: 0.9 },
          to: { x: 0, opacity: 1, scale: 1 },
          duration: 0.5,
          stagger: 0.1,
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
      {/* Title Section */}
      <div ref={titleRef} className="px-4 mb-5" style={{ opacity: 1 }}>
        <h2 
          className="text-xl font-bold mb-1 text-black"
        >
          Thoughtful curations
        </h2>
        <p className="text-sm font-medium text-black">
          of our finest experiences
        </p>
      </div>

      {/* Horizontal Scrollable Service Cards */}
      <div ref={cardsRef} className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {serviceList.map((service) => (
          <ServiceCard
            key={service.id}
            title={service.title}
            gif={service.gif}
            youtubeUrl={service.youtubeUrl}
            onClick={() => onServiceClick?.(service)}
          />
        ))}
      </div>
    </div>
  );
});

CuratedServices.displayName = 'CuratedServices';

export default CuratedServices;

