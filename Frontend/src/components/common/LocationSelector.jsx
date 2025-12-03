import React from 'react';
import { FiChevronDown } from 'react-icons/fi';

const LocationSelector = ({ location, onLocationClick }) => {
  return (
    <div 
      className="flex items-center gap-1.5 cursor-pointer"
      onClick={onLocationClick}
    >
      <span className="text-sm text-gray-500 truncate max-w-[200px] leading-tight">
        {location || 'Select Location'}
      </span>
      <FiChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" />
    </div>
  );
};

export default LocationSelector;

