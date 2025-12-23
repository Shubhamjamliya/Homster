import React, { memo, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { AiFillStar } from 'react-icons/ai';
import { themeColors } from '../../../../theme';

const DetailedServiceCard = memo(({ image, title, rating, reviews, price, originalPrice, discount, onClick, onAddClick }) => {
  const cardRef = useRef(null);

  // Format price (remove non-digits, then format)
  const formatPrice = (p) => {
    if (!p) return null;
    const clean = p.toString().replace(/[^0-9]/g, '');
    return new Intl.NumberFormat('en-IN').format(clean);
  };

  const displayPrice = formatPrice(price);
  const displayOriginalPrice = formatPrice(originalPrice);

  // ... (GSAP useEffect same as before)
  useEffect(() => {
    if (cardRef.current) {
      const card = cardRef.current;

      const handleMouseEnter = () => {
        gsap.to(card, {
          y: -8,
          scale: 1.02,
          boxShadow: '0 12px 24px rgba(0, 166, 166, 0.15), 0 6px 12px rgba(0, 166, 166, 0.1)',
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      const handleMouseLeave = () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          boxShadow: '0 8px 16px -2px rgba(0, 166, 166, 0.15), 0 4px 8px -1px rgba(0, 166, 166, 0.1)',
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      const handleClick = () => {
        gsap.to(card, {
          scale: 0.95,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out',
        });
      };

      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mouseleave', handleMouseLeave);
      card.addEventListener('click', handleClick);

      return () => {
        card.removeEventListener('mouseenter', handleMouseEnter);
        card.removeEventListener('mouseleave', handleMouseLeave);
        card.removeEventListener('click', handleClick);
      };
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className="min-w-[200px] flex flex-col bg-white rounded-2xl overflow-hidden cursor-pointer"
      style={{
        boxShadow: '0 8px 16px -2px rgba(0, 166, 166, 0.15), 0 4px 8px -1px rgba(0, 166, 166, 0.1)',
        border: '1px solid rgba(0, 166, 166, 0.15)'
      }}
      onClick={onClick}
    >
      <div className="relative">
        {discount && (
          <div
            className="absolute top-2 left-2 text-black text-[10px] font-extrabold px-3 py-1 rounded-r-lg rounded-tl-lg z-10"
            style={{
              backgroundColor: '#fbfb00',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {discount.toString().toUpperCase().includes('OFF') ? discount : `${discount}% OFF`}
          </div>
        )}
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-36 object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-36 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-[13px] font-bold text-gray-900 leading-tight mb-1.5">{title}</h3>

        <div className="flex items-center gap-1 mb-2">
          <AiFillStar className="w-3.5 h-3.5 text-yellow-500" />
          <span className="text-[12px] text-gray-800 font-bold">{rating}</span>
          {reviews && (
            <span className="text-[11px] text-gray-400 font-medium">({reviews})</span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-auto">
          {displayOriginalPrice && (
            <span className="text-[12px] text-gray-400 line-through">₹{displayOriginalPrice}</span>
          )}
          <span className="text-[15px] font-black text-black">₹{displayPrice}</span>

          <div className="bg-[#f0fdf4] border border-[#dcfce7] px-2 py-0.5 rounded ml-auto flex items-center shadow-sm">
            <span className="text-[10px] font-bold" style={{ color: '#15803d' }}>Save</span>
          </div>
        </div>
      </div>
    </div>
  );
});

DetailedServiceCard.displayName = 'DetailedServiceCard';

export default DetailedServiceCard;

