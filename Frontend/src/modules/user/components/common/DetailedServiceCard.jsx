import React, { memo, useRef, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { AiFillStar } from 'react-icons/ai';
import { themeColors } from '../../../../theme';
import { optimizeCloudinaryUrl } from '../../../../utils/cloudinaryOptimize';

const DetailedServiceCard = memo(({ image, title, rating, reviews, price, originalPrice, discount, onClick, onAddClick }) => {
  const cardRef = useRef(null);

  const formattedTitle = useMemo(() => {
    if (!title) return '';
    const cleaned = title.replace(/servcies/gi, 'services').replace(/prufier/gi, 'Purifier');
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }, [title]);

  // Format price (remove non-digits, then format)
  const formatPrice = (p) => {
    if (!p) return null;
    const clean = p.toString().replace(/[^0-9]/g, '');
    return new Intl.NumberFormat('en-IN').format(clean);
  };

  const displayPrice = formatPrice(price);
  const displayOriginalPrice = formatPrice(originalPrice);

  return (
    <div
      ref={cardRef}
      className="min-w-[185px] w-[185px] sm:min-w-[200px] flex flex-col bg-white rounded-2xl overflow-hidden cursor-pointer group border border-slate-100 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.05)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      onClick={onClick}
    >
      <div className="relative">
        {discount && (
          <div
            className="absolute top-2.5 left-2.5 text-white text-[9.5px] font-extrabold px-2 py-0.5 rounded-full shadow-sm z-10 uppercase tracking-wider"
            style={{ backgroundColor: themeColors.brand.teal }}
          >
            {discount.toString().toUpperCase().includes('OFF') ? discount : `${discount}% OFF`}
          </div>
        )}
        {image ? (
          <img
            src={optimizeCloudinaryUrl(image, { width: 400, quality: 'auto' })}
            alt={formattedTitle}
            className="w-full h-34 sm:h-36 object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-34 sm:h-36 flex items-center justify-center bg-slate-50 border-b border-slate-100">
            <span style={{ color: themeColors.brand.teal }} className="font-medium text-xs">Homster</span>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-[13px] font-semibold text-slate-900 leading-snug mb-1 line-clamp-2 min-h-[38px] group-hover:text-primary-700 transition-colors">
          {formattedTitle}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          <AiFillStar className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-slate-800 font-bold">{rating || '4.8'}</span>
          {reviews && (
            <span className="text-[10.5px] text-slate-400 font-medium">({reviews})</span>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-1.5">
            {displayOriginalPrice && (
              <span className="text-[11px] text-slate-400 line-through">₹{displayOriginalPrice}</span>
            )}
            <span className="text-[15px] font-bold text-slate-900">₹{displayPrice || price}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddClick ? onAddClick() : onClick?.();
            }}
            className="ml-auto text-xs font-bold px-3.5 py-1 rounded-xl border transition-all duration-200 active:scale-95"
            style={{
              backgroundColor: `${themeColors.brand.teal}0D`,
              color: themeColors.brand.teal,
              borderColor: `${themeColors.brand.teal}26`
            }}
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
});

DetailedServiceCard.displayName = 'DetailedServiceCard';

export default DetailedServiceCard;
