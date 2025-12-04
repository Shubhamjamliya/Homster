import React from 'react';

const PromoCard = ({ title, subtitle, buttonText, image, onClick, className = '' }) => {
  return (
    <div 
      className={`relative rounded-lg overflow-hidden min-w-[280px] h-40 cursor-pointer active:scale-98 transition-transform bg-gray-200`}
      onClick={onClick}
    >
      {/* Only Image */}
      {image ? (
        <img 
          src={image} 
          alt={title || 'Promo'} 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          <span className="text-gray-400 text-sm">Image</span>
        </div>
      )}
    </div>
  );
};

export default PromoCard;

