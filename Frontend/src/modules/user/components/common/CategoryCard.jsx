import React, { useState, useRef, memo, useEffect } from 'react';
import { gsap } from 'gsap';
import { createRipple } from '../../../../utils/gsapAnimations';

const CategoryCard = memo(({ icon, title, onClick, hasSaleBadge = false, index = 0 }) => {
  const cardRef = useRef(null);
  const iconWrapperRef = useRef(null);

  // GSAP entrance animation - deferred to avoid blocking initial render
  useEffect(() => {
    if (!cardRef.current) return;

    // Defer animation until after initial render
    const startAnimation = () => {
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          {
            y: 20,
            opacity: 0,
            scale: 0.8,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            delay: index * 0.1,
            ease: 'back.out(1.7)',
          }
        );
      }
    };

    // Use requestIdleCallback or setTimeout to defer
    if (window.requestIdleCallback) {
      window.requestIdleCallback(startAnimation, { timeout: 1000 });
    } else {
      setTimeout(startAnimation, 200 + index * 50);
    }
  }, [index]);

  // Hover animation
  useEffect(() => {
    if (iconWrapperRef.current) {
      const iconWrapper = iconWrapperRef.current;

      const handleMouseEnter = () => {
        gsap.to(iconWrapper, {
          scale: 1.15,
          rotation: 5,
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      const handleMouseLeave = () => {
        gsap.to(iconWrapper, {
          scale: 1,
          rotation: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      iconWrapper.addEventListener('mouseenter', handleMouseEnter);
      iconWrapper.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        iconWrapper.removeEventListener('mouseenter', handleMouseEnter);
        iconWrapper.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  const handleClick = (e) => {
    // Immediate click response - don't wait for animations
    if (onClick) {
      onClick();
    }

    // GSAP ripple effect - run asynchronously
    if (cardRef.current) {
      const { clientX, clientY } = e;
      requestAnimationFrame(() => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        createRipple(cardRef.current, x, y);
      });
    }

    // Click animation - run asynchronously
    if (iconWrapperRef.current) {
      requestAnimationFrame(() => {
        if (!iconWrapperRef.current) return;
        gsap.to(iconWrapperRef.current, {
          scale: 0.9,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out',
        });
      });
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-1.5 cursor-pointer relative category-card-container"
      onClick={handleClick}
      style={{
        minWidth: 'fit-content',
        width: '70px',
      }}
      ref={cardRef}
    >
      <div
        ref={iconWrapperRef}
        className="w-14 h-14 rounded-full flex items-center justify-center mb-1.5 relative backdrop-blur-md border flex-shrink-0"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderColor: '#F59E0B',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        {icon || (
          <svg
            className="w-7 h-7 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        {hasSaleBadge && (
          <div
            className="absolute -top-0.5 -right-0.5 text-black text-[8px] font-bold px-1 py-0.5 rounded-full shadow-sm"
            style={{
              backgroundColor: '#fbfb00',
              border: '1px solid rgba(251, 251, 0, 0.5)',
              boxShadow: '0 1px 3px rgba(251, 251, 0, 0.4)'
            }}
          >
            Sale
          </div>
        )}
      </div>
      <span className="text-[10px] text-center text-gray-800 font-medium leading-tight break-words" style={{ wordWrap: 'break-word', maxWidth: '70px' }}>
        {title}
      </span>
    </div>
  );
});

CategoryCard.displayName = 'CategoryCard';

export default CategoryCard;

