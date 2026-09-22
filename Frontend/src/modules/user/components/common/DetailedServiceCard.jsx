import React, { memo, useRef, useMemo } from 'react';
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
      className="min-w-[145px] w-[145px] sm:min-w-[160px] sm:w-[160px] flex flex-col bg-white rounded-2xl overflow-hidden cursor-pointer group border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      onClick={onClick}
    >
      <div className="relative">
        {discount && (
          <div
            className="absolute top-2 left-2 text-white text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-full shadow-sm z-10 uppercase tracking-wider"
            style={{ backgroundColor: themeColors.brand.teal }}
          >
            {discount.toString().toUpperCase().includes('OFF') ? discount : `${discount}% OFF`}
          </div>
        )}
        {image ? (
          <img
            src={optimizeCloudinaryUrl(image, { width: 320, quality: 'auto' })}
            alt={formattedTitle}
            className="w-full h-26 sm:h-28 object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-26 sm:h-28 flex items-center justify-center bg-slate-50 border-b border-slate-100">
            <span style={{ color: themeColors.brand.teal }} className="font-medium text-[11px]">Homster</span>
          </div>
        )}
      </div>
      <div className="p-2.5 flex flex-col flex-1">
        <h3 className="text-[12px] sm:text-[12.5px] font-semibold text-slate-900 leading-snug mb-1 line-clamp-2 min-h-[32px] group-hover:text-primary-700 transition-colors">
          {formattedTitle}
        </h3>

        <div className="flex items-center gap-1 mb-1.5">
          <AiFillStar className="w-3 h-3 text-amber-400" />
          <span className="text-[11px] text-slate-800 font-bold">{rating || '4.8'}</span>
          {reviews && (
            <span className="text-[9.5px] text-slate-400 font-medium truncate max-w-[65px]">({reviews})</span>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-1">
            {displayOriginalPrice && (
              <span className="text-[10px] text-slate-400 line-through">₹{displayOriginalPrice}</span>
            )}
            <span className="text-[13.5px] font-bold text-slate-900">₹{displayPrice || price}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddClick ? onAddClick() : onClick?.();
            }}
            className="ml-auto text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all duration-200 active:scale-95 leading-none"
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
