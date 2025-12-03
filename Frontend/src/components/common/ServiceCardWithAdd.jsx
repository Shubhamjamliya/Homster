import React from 'react';
import { AiFillStar } from 'react-icons/ai';

const ServiceCardWithAdd = ({ image, title, rating, reviews, price, onAddClick, onClick }) => {
  return (
    <div 
      className="min-w-[200px] bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer active:scale-98 transition-transform"
      onClick={onClick}
    >
      {image ? (
        <img 
          src={image} 
          alt={title} 
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
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
      <div className="p-3">
        <h3 className="text-xs font-medium text-black leading-tight mb-2">{title}</h3>
        {rating && (
          <div className="flex items-center gap-1 mb-2">
            <AiFillStar className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-black font-medium">{rating}</span>
            {reviews && (
              <span className="text-xs text-gray-500">({reviews})</span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-black">₹{price}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddClick?.();
            }}
            className="bg-white border border-purple-600 text-purple-600 text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-purple-50 active:scale-95 transition-all"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCardWithAdd;

