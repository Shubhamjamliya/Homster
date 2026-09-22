import React from 'react';
import { HiLocationMarker } from 'react-icons/hi';
import { FiChevronDown } from 'react-icons/fi';
import { themeColors } from '../../../../theme';

const LocationSelector = ({ location, onLocationClick }) => {
  // Parse address parts intelligently whether comma or hyphen delimited
  const parseLocation = (loc) => {
    if (!loc || loc === '...' || loc === 'Select Location') {
      return { primary: 'Select Location', secondary: 'Tap to choose address' };
    }

    const parts = loc
      .split(/[,-]/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length === 0) {
      return { primary: 'Select Location', secondary: 'Tap to choose address' };
    }

    const primary = parts[0];
    const secondary = parts.slice(1, 3).join(', ') || parts[0];

    return { primary, secondary };
  };

  const { primary, secondary } = parseLocation(location);

  return (
    <div
      className="flex flex-col items-end cursor-pointer group select-none max-w-[200px]"
      onClick={onLocationClick}
      role="button"
      tabIndex={0}
      aria-label="Select location"
    >
      {/* Top Row: Pin + Primary Area + Dropdown chevron */}
      <div className="flex items-center gap-1 min-w-0 max-w-full">
        {/* Brand gradient definition */}
        <svg width="0" height="0" className="absolute">
          <linearGradient id="homestr-loc-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={themeColors.brand.teal} />
            <stop offset="50%" stopColor={themeColors.brand.yellow} />
            <stop offset="100%" stopColor={themeColors.brand.orange} />
          </linearGradient>
        </svg>

        <HiLocationMarker
          className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ fill: 'url(#homestr-loc-gradient)' }}
        />

        <span className="text-[13px] sm:text-sm font-bold text-slate-900 truncate tracking-tight group-hover:text-primary-600 transition-colors">
          {primary}
        </span>

        <FiChevronDown
          className="w-3.5 h-3.5 shrink-0 text-amber-500 transition-transform duration-200 group-hover:translate-y-0.5"
        />
      </div>

      {/* Bottom Subtitle: City / State */}
      <span className="text-[11px] text-slate-400 font-medium truncate max-w-[170px] text-right -mt-0.5 leading-tight">
        {secondary}
      </span>
    </div>
  );
};

export default LocationSelector;
