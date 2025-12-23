import React, { memo } from 'react';
import { AiFillStar } from 'react-icons/ai';
import { themeColors } from '../../../../theme';

const ServiceWithRatingCard = memo(({ image, title, rating, reviews, price, originalPrice, discount, onClick, onAddClick }) => {
  console.log(`ServiceWithRatingCard ${title}: image=${image}`);
  return (
    <div
      className="min-w-[200px] bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95"
      style={{
        boxShadow: '0 8px 16px -2px rgba(0, 166, 166, 0.15), 0 4px 8px -1px rgba(0, 166, 166, 0.1)',
        border: '1px solid rgba(0, 166, 166, 0.15)'
      }}
      onClick={onClick}
    >
      <div className="relative">
        {discount && (
          <div
            className="absolute top-2 left-2 text-black text-xs font-bold px-2.5 py-1 rounded-full shadow-lg z-10"
            style={{
              backgroundColor: '#fbfb00',
              border: '1.5px solid rgba(251, 251, 0, 0.5)',
              boxShadow: '0 2px 8px rgba(251, 251, 0, 0.4)'
            }}
          >
            {discount} OFF
          </div>
        )}
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-32 object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
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
          </div>
        )}
      </div>
      <div className="p-2">
        <h3 className="text-xs font-medium text-black leading-tight mb-1.5">{title}</h3>
        {rating && (
          <div className="flex items-center gap-1 mb-1.5">
            <AiFillStar className="w-3 h-3 text-yellow-400" />
            <span className="text-[10px] text-black font-medium">{rating}</span>
            {reviews && (
              <span className="text-[10px] text-gray-500">({reviews})</span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              {originalPrice && (
                <span className="text-[10px] text-gray-400 line-through">₹{originalPrice}</span>
              )}
              <span className="text-sm font-bold text-black">₹{price}</span>
            </div>
            {discount && (
              <span
                className="text-[9px] font-semibold text-brand-dark"
                style={{ color: '#008a8a' }}
              >
                {discount} Off
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddClick?.();
            }}
            className="px-4 py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-90"
            style={{
              color: '#00a6a6',
              borderColor: 'rgba(0, 166, 166, 0.3)',
              backgroundColor: 'rgba(0, 166, 166, 0.05)'
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

