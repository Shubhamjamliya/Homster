import React from 'react';

const CategoryCard = ({ icon, title, onClick }) => {
  return (
    <div 
      className="flex flex-col items-center justify-center p-4 cursor-pointer active:scale-95 transition-transform"
      onClick={onClick}
    >
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
        {icon || (
          <svg 
            className="w-8 h-8 text-gray-600" 
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
        )}
      </div>
      <span className="text-xs text-center text-gray-700 font-medium leading-tight">
        {title}
      </span>
    </div>
  );
};

export default CategoryCard;

