import React from 'react';

const SimpleServiceCard = ({ image, title, onClick }) => {
  return (
    <div 
      className="min-w-[160px] bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer active:scale-98 transition-transform"
      onClick={onClick}
    >
      {image ? (
        <img 
          src={image} 
          alt={title} 
          className="w-full h-28 object-cover"
        />
      ) : (
        <div className="w-full h-28 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
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
      <div className="p-2">
        <h3 className="text-xs font-medium text-black leading-tight">{title}</h3>
      </div>
    </div>
  );
};

export default SimpleServiceCard;

