import React, { useState, useEffect, useRef, memo } from 'react';
import { gsap } from 'gsap';
import PromoCard from '../../../components/common/PromoCard';
import promo1 from '../../../../../assets/images/pages/Home/promo-carousel/1764052270908-bae94c.jpg';
import promo2 from '../../../../../assets/images/pages/Home/promo-carousel/1678450687690-81f922.jpg';
import promo3 from '../../../../../assets/images/pages/Home/promo-carousel/1745822547742-760034.jpg';
import promo4 from '../../../../../assets/images/pages/Home/promo-carousel/1711428209166-2d42c0.jpg';
import promo5 from '../../../../../assets/images/pages/Home/promo-carousel/1762785595543-540198.jpg';
import promo6 from '../../../../../assets/images/pages/Home/promo-carousel/1678454437383-aa4984.jpg';

const PromoCarousel = memo(({ promos, onPromoClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  const intervalRef = useRef(null);
  const carouselRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Default promotional cards if none provided
  const defaultPromos = [
    {
      id: 2,
      title: 'New Service',
      subtitle: 'Smart Home Installation - Get 20% off',
      buttonText: 'Explore',
      className: 'from-blue-600 to-blue-800',
      image: promo2,
      route: '/electrician',
    },
    {
      id: 3,
      title: 'Emergency',
      subtitle: '24/7 Emergency Services',
      buttonText: 'Call Now',
      className: 'from-orange-600 to-orange-800',
      image: promo3,
      route: '/ac-service',
    },
    {
      id: 4,
      title: 'Special Offer',
      subtitle: 'Get amazing deals on all services',
      buttonText: 'Book now',
      className: 'from-blue-600 to-blue-800',
      image: promo4,
      route: '/salon-for-women',
    },
    {
      id: 5,
      title: 'Premium Services',
      subtitle: 'Experience the best',
      buttonText: 'Explore',
      className: 'from-indigo-600 to-indigo-800',
      image: promo5,
      route: '/salon-for-women',
    },
    {
      id: 6,
      title: 'Limited Time',
      subtitle: 'Hurry up! Limited offers',
      buttonText: 'Book now',
      className: 'from-pink-600 to-pink-800',
      image: promo6,
      route: '/bathroom-kitchen-cleaning',
    },
    {
      id: 1,
      title: 'Shine your bathroom deserves',
      subtitle: '',
      buttonText: 'Book now',
      className: 'from-green-600 to-green-700',
      image: promo1,
      route: '/bathroom-kitchen-cleaning',
    },
  ];

  const promotionalCards = promos || defaultPromos;

  // Optimized auto-scroll functionality - use setInterval instead of continuous RAF
  useEffect(() => {
    if (isHovered || promotionalCards.length <= 1) return;

    // Use setInterval instead of continuous requestAnimationFrame loop for better performance
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % promotionalCards.length;
        return nextIndex;
      });
    }, 8000); // 8 seconds interval

    // Pause when page is hidden
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        intervalRef.current = setInterval(() => {
          setCurrentIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % promotionalCards.length;
            return nextIndex;
          });
        }, 8000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isHovered, promotionalCards.length]);

  // Optimized scroll to current index - use requestAnimationFrame
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const firstCard = container.querySelector('[data-promo-card]');
    if (!firstCard) return;

    // Use requestAnimationFrame for smooth scrolling
    const rafId = requestAnimationFrame(() => {
      const cardWidth = firstCard.offsetWidth;
      const gap = 16; // gap-4 = 16px
      const scrollPosition = currentIndex * (cardWidth + gap);

      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    });

    return () => cancelAnimationFrame(rafId);
  }, [currentIndex]);

  // Optimized sync currentIndex when user manually scrolls - use passive listener with throttling
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimeout;
    let rafId = null;
    let lastScrollTime = 0;
    const throttleDelay = 200; // Throttle to 200ms for better performance

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollTime < throttleDelay) return;
      lastScrollTime = now;

      // Cancel previous RAF
      if (rafId) cancelAnimationFrame(rafId);

      // Debounce scroll events
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        rafId = requestAnimationFrame(() => {
          const firstCard = container.querySelector('[data-promo-card]');
          if (!firstCard) return;

          const cardWidth = firstCard.offsetWidth;
          const gap = 16;
          const scrollLeft = container.scrollLeft;
          const newIndex = Math.round(scrollLeft / (cardWidth + gap));
          
          if (newIndex !== currentIndex && newIndex >= 0 && newIndex < promotionalCards.length) {
            setCurrentIndex(newIndex);
          }
        });
      }, 200); // Increased debounce delay for better performance
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [currentIndex, promotionalCards.length]);

  // Defer GSAP entrance animation until after initial render
  useEffect(() => {
    if (!carouselRef.current) return;

    // Show immediately without animation for better performance
    carouselRef.current.style.opacity = '1';
    carouselRef.current.style.transform = 'translateY(0)';

    // Optionally add animation later if needed (deferred)
    const initAnimation = () => {
      if (carouselRef.current) {
        gsap.fromTo(
          carouselRef.current,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
          }
        );
      }
    };

    // Defer animation initialization
    if (window.requestIdleCallback) {
      window.requestIdleCallback(initAnimation, { timeout: 2000 });
    } else {
      setTimeout(initAnimation, 300);
    }
  }, []);

  return (
    <div 
      ref={carouselRef}
      className="pb-6"
      style={{ opacity: 1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {promotionalCards.map((promo) => (
          <div key={promo.id} data-promo-card className="flex-shrink-0">
            <PromoCard
              title={promo.title}
              subtitle={promo.subtitle}
              buttonText={promo.buttonText}
              image={promo.image}
              className={promo.className}
              onClick={() => onPromoClick?.(promo)}
            />
          </div>
        ))}
      </div>
      {/* Carousel indicator dots */}
      <div className="flex justify-center gap-1.5 mt-3 mb-4">
        {promotionalCards.map((_, index) => (
          <div
            key={index}
            className={`rounded-full transition-all ${index === currentIndex ? 'w-6 h-1.5' : 'w-1.5 h-1.5'}`}
            style={{ 
              backgroundColor: index === currentIndex ? '#F59E0B' : 'rgba(245, 158, 11, 0.4)',
              boxShadow: index === currentIndex ? '0 2px 6px rgba(245, 158, 11, 0.5)' : '0 1px 2px rgba(0, 0, 0, 0.2)'
            }}
          />
        ))}
      </div>
    </div>
  );
});

PromoCarousel.displayName = 'PromoCarousel';

export default PromoCarousel;

