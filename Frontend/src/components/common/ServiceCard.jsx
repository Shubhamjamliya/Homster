import React from 'react';

const ServiceCard = ({ image, title, onClick, gif }) => {
  return (
    <div 
      className="relative min-w-[160px] h-80 rounded-xl overflow-hidden cursor-pointer active:scale-98 transition-transform"
      onClick={onClick}
    >
      {gif ? (
        <img 
          src={gif} 
          alt={title} 
          className="w-full h-full object-cover"
        />
      ) : image ? (
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <svg 
            className="w-16 h-16 text-gray-400" 
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
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <h3 className="text-white font-semibold text-base">{title}</h3>
      </div>
    </div>
  );
};

export default ServiceCard;

