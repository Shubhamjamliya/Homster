import React, { useRef, memo, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { themeColors } from '../../../../theme';

const CategoryCard = memo(({ icon, title, onClick, hasSaleBadge = false, index = 0 }) => {
  const cardRef = useRef(null);

  // Clean and sanitize titles (fix common data typos like "prufier" -> "Purifier")
  const sanitizedTitle = useMemo(() => {
    if (!title) return '';
    return title.replace(/prufier/gi, 'Purifier');
  }, [title]);

  // Entrance animation
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: 12, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.35,
          delay: Math.min(index * 0.04, 0.4),
          ease: 'power2.out',
        }
      );
    }
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="flex flex-col items-center justify-start cursor-pointer relative category-card-container group transition-transform duration-200 ease-out active:scale-95 w-full py-1"
      onClick={onClick}
      style={{
        opacity: 0, // Start hidden for GSAP
      }}
    >
      {/* Modern Squircle Tile for Appliance Icon */}
      <div
        className="w-[58px] h-[58px] sm:w-[64px] sm:h-[64px] rounded-2xl flex items-center justify-center mb-1.5 relative border border-slate-100/90 flex-shrink-0 transition-all duration-300 group-hover:shadow-md group-hover:shadow-slate-200/50 group-hover:-translate-y-0.5 bg-slate-50/80 group-hover:bg-white"
        style={{
          boxShadow: '0 2px 8px -2px rgba(0,0,0,0.04)',
        }}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#347989]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {icon || (
          <svg
            className="w-7 h-7 text-slate-400 transition-colors duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}

        {hasSaleBadge && (
          <div
            className="absolute -top-1 -right-1 text-white text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-full shadow-sm z-10 border border-white uppercase tracking-wider"
            style={{
              background: themeColors.gradient,
              boxShadow: `0 2px 8px ${themeColors.brand.teal}4D`,
            }}
          >
            SALE
          </div>
        )}
      </div>

      {/* Label with clean, non-splitting typography */}
      <span
        className="text-[11px] sm:text-[11.5px] text-center text-slate-700 font-semibold leading-[1.22] tracking-tight mt-0.5 transition-colors duration-200 w-full line-clamp-2 hyphens-none px-0.5 group-hover:text-[#347989]"
      >
        {sanitizedTitle}
      </span>
    </div>
  );
});

CategoryCard.displayName = 'CategoryCard';

export default CategoryCard;
