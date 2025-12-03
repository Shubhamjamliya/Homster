import React from 'react';

const PromoCard = ({ title, subtitle, buttonText, image, onClick, className = '' }) => {
  return (
    <div 
      className={`relative rounded-lg overflow-hidden min-w-[280px] h-40 bg-gradient-to-r ${className} cursor-pointer active:scale-98 transition-transform`}
      onClick={onClick}
    >
      {image && (
        <img 
          src={image} 
          alt={title} 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
      )}
      <div className="relative p-4 h-full flex flex-col justify-between">
        <div>
          <p className="text-xs font-semibold text-white/90 mb-1">{title}</p>
          <h3 className="text-base font-bold text-white leading-tight">
            {subtitle}
          </h3>
        </div>
        <button className="bg-white text-purple-600 text-xs font-semibold px-4 py-2 rounded-md w-fit mt-2">
          {buttonText || 'Book now'}
        </button>
      </div>
    </div>
  );
};

export default PromoCard;

