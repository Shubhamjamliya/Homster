import React from 'react';

const CategoryCard = ({ icon, title, onClick, hasSaleBadge = false }) => {
  return (
    <div
      className="flex flex-col items-center justify-center p-4 cursor-pointer active:scale-95 transition-transform relative"
      onClick={onClick}
    >
      <div className="w-full h-16 rounded-lg flex items-center justify-center mb-2 relative" style={{ backgroundColor: '#f5f5f5' }}>
        {icon || (
          <svg
            className="w-10 h-10 text-gray-600"
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
        {hasSaleBadge && (
          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
            Sale
          </div>
        )}
      </div>
      <span className="text-xs text-center text-gray-700 font-medium leading-tight">
        {title}
      </span>
    </div>
  );
};

export default CategoryCard;

