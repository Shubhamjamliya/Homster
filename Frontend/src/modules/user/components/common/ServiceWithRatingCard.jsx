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
      className="min-w-[175px] w-[175px] sm:min-w-[190px] bg-white rounded-2xl overflow-hidden cursor-pointer border border-slate-100 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.05)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col"
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
            src={image}
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

        {rating && (
          <div className="flex items-center gap-1 mb-2">
            <AiFillStar className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-slate-800 font-bold">{rating}</span>
            {reviews && (
              <span className="text-[10.5px] text-slate-400 font-medium">({reviews})</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-1.5">
            {originalPrice && (
              <span className="text-[11px] text-slate-400 line-through">₹{originalPrice}</span>
            )}
            <span className="text-[15px] font-bold text-slate-900">
              {price && !isNaN(price.toString().replace(/[,]/g, '')) ? `₹${price}` : (price || 'Contact')}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddClick?.();
            }}
            className="px-4 py-1.5 h-8 rounded-xl text-xs font-bold transition-all active:scale-95 border"
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
