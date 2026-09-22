import React, { memo, useMemo } from 'react';
import { AiFillStar } from 'react-icons/ai';
import { themeColors } from '../../../../theme';

const ServiceWithRatingCard = memo(({ image, title, rating, reviews, price, originalPrice, discount, onClick, onAddClick }) => {
  const formattedTitle = useMemo(() => {
    if (!title) return '';
    const cleaned = title.replace(/servcies/gi, 'services').replace(/prufier/gi, 'Purifier');
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }, [title]);

  return (
    <div
      className="min-w-[130px] w-[130px] sm:min-w-[145px] sm:w-[145px] bg-white rounded-2xl overflow-hidden cursor-pointer border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col"
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
            src={image}
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

        {rating && (
          <div className="flex items-center gap-0.5 mb-1">
            <AiFillStar className="w-3 h-3 text-amber-400" />
            <span className="text-[11px] text-slate-800 font-bold">{rating}</span>
            {reviews && (
              <span className="text-[9px] text-slate-400 font-medium truncate max-w-[55px]">({reviews})</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-0.5">
          <div className="flex items-center gap-1">
            {originalPrice && (
              <span className="text-[10px] text-slate-400 line-through">₹{originalPrice}</span>
            )}
            <span className="text-[12px] font-bold text-slate-900">
              {price && !isNaN(price.toString().replace(/[,]/g, '')) ? `₹${price}` : (price || 'Contact')}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddClick?.();
            }}
            className="px-2 py-0.5 rounded-md text-[10px] font-bold transition-all active:scale-95 border leading-none"
            style={{
              backgroundColor: `${themeColors.brand.teal}0D`,
              color: themeColors.brand.teal,
              borderColor: `${themeColors.brand.teal}26`
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
});

ServiceWithRatingCard.displayName = 'ServiceWithRatingCard';

export default ServiceWithRatingCard;
