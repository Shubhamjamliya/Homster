import React from 'react';
import { HiLocationMarker } from 'react-icons/hi';
import LocationSelector from '../common/LocationSelector';
import CartIcon from '../common/CartIcon';

const Header = ({ location, cartCount, onLocationClick, onCartClick }) => {
  return (
    <header className="bg-white">
      <div className="w-full">
        {/* Top Row: Logo (Left) and Cart (Right) */}
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Left: Logo */}
          <div>
            <img 
              src="/Appzeto-logo.png" 
              alt="Appzeto" 
              className="h-8 w-auto object-contain"
            />
          </div>

          {/* Right: Cart */}
          <div>
            <CartIcon 
              itemCount={cartCount} 
              onClick={onCartClick}
            />
          </div>
        </div>

        {/* Bottom Row: Location Only */}
        <div className="px-4 pb-3">
          <div className="flex items-center">
            <div className="flex flex-col items-start cursor-pointer" onClick={onLocationClick}>
              <div className="flex items-center gap-1 mb-0.5">
                <HiLocationMarker className="w-4 h-4 text-black" />
                <span className="text-sm text-black font-bold">New Palasia</span>
              </div>
              <LocationSelector 
                location={location} 
                onLocationClick={onLocationClick}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

