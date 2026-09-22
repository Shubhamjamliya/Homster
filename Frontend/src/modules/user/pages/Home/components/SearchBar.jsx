import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '../../../components/common/NotificationBell';
import { themeColors } from '../../../../../theme';

const SearchBar = ({ onInputClick }) => {
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);

  const serviceNames = [
    'AC service & repair',
    'Washing machine care',
    'R.O. water purifier service',
    'Microwave & oven repair',
    'Geyser installation & repair',
    'Kitchen chimney cleaning',
    'Home cooling & fridge care'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentServiceIndex((prev) => (prev + 1) % serviceNames.length);
    }, 3200);

    return () => clearInterval(interval);
  }, [serviceNames.length]);

  return (
    <div className="flex items-center gap-2.5 w-full">
      <div className="flex-1 relative cursor-pointer" onClick={onInputClick}>
        <div className="relative w-full group">
          {/* Subtle Ambient Glow on Hover */}
          <div
            className="absolute inset-0 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: `linear-gradient(90deg, ${themeColors.brand.teal}15, ${themeColors.brand.orange}15)` }}
          />

          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
            <FiSearch
              className="w-5 h-5 text-slate-400 group-hover:text-primary-600 transition-colors duration-200"
              style={{ stroke: themeColors.brand.teal }}
            />
          </div>

          {/* Search Input Box */}
          <div
            className="w-full pl-11 pr-4 rounded-2xl bg-white border border-slate-200/90 group-hover:border-slate-300 transition-all duration-200 text-slate-800 flex items-center h-12 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]"
          >
            {/* Smooth Vertical Slide Placeholder */}
            <div className="flex items-center text-[13.5px] sm:text-sm overflow-hidden h-7 leading-7 w-full">
              <span className="text-slate-400 font-normal shrink-0">Search for&nbsp;</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentServiceIndex}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -14, opacity: 0 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="font-semibold truncate"
                  style={{
                    background: themeColors.gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {serviceNames[currentServiceIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Bell matching height */}
      <div className="shrink-0">
        <NotificationBell />
      </div>
    </div>
  );
};

export default SearchBar;
