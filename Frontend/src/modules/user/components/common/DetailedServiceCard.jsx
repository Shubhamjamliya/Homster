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
      className="min-w-[130px] w-[130px] sm:min-w-[145px] sm:w-[145px] flex flex-col bg-white rounded-2xl overflow-hidden cursor-pointer group border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
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
            className="w-full h-[88px] sm:h-[100px] object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-[88px] sm:h-[100px] flex items-center justify-center bg-slate-50 border-b border-slate-100">
            <span style={{ color: themeColors.brand.teal }} className="font-medium text-[11px]">Homster</span>
          </div>
        )}
      </div>
      <div className="p-2 flex flex-col flex-1">
        <h3 className="text-[11px] sm:text-[11.5px] font-semibold text-slate-900 leading-tight mb-1 line-clamp-2 min-h-[28px] group-hover:text-primary-700 transition-colors">
          {formattedTitle}
        </h3>

        <div className="flex items-center gap-0.5 mb-1">
          <AiFillStar className="w-3 h-3 text-amber-400" />
          <span className="text-[11px] text-slate-800 font-bold">{rating || '4.8'}</span>
          {reviews && (
            <span className="text-[9px] text-slate-400 font-medium truncate max-w-[55px]">({reviews})</span>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-0.5">
          <div className="flex items-center gap-1">
            {displayOriginalPrice && (
              <span className="text-[10px] text-slate-400 line-through">₹{displayOriginalPrice}</span>
            )}
            <span className="text-[12px] font-bold text-slate-900">₹{displayPrice || price}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddClick ? onAddClick() : onClick?.();
            }}
            className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all duration-200 active:scale-95 leading-none"
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
