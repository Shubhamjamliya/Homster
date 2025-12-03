import React from 'react';
import { HiLocationMarker } from 'react-icons/hi';
import LocationSelector from '../common/LocationSelector';
import CartIcon from '../common/CartIcon';

const Header = ({ location, cartCount, onLocationClick, onCartClick }) => {
  return (
    <header className="bg-white shadow-sm min-h-[72px] flex items-center">
      <div className="px-4 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 flex-1 min-w-0 ml-2">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1 mb-1">
                <HiLocationMarker className="w-4 h-4 text-black" />
                <span className="text-xs text-black font-medium">2/6</span>
              </div>
              <LocationSelector 
                location={location} 
                onLocationClick={onLocationClick}
              />
            </div>
          </div>
          <div className="mr-2">
            <CartIcon 
              itemCount={cartCount} 
              onClick={onCartClick}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

