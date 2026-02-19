import React from 'react';
import { FiMapPin, FiNavigation, FiX } from 'react-icons/fi';
import { themeColors } from '../../theme';

const GPSPermissionModal = ({ isOpen, onRequestLocation, onManualSearch, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div
        className="bg-white w-full max-w-xs rounded-[32px] p-6 text-center shadow-2xl relative overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 bg-white/80 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all shadow-sm border border-gray-100/50"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}

        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-50 to-transparent pointer-events-none" />

        {/* Pulsing Location Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-500 rounded-full opacity-10 animate-ping"
            style={{ backgroundColor: `${themeColors.button}1A` }} />
          <div className="absolute inset-2 bg-blue-100 rounded-full opacity-30 animate-pulse"
            style={{ backgroundColor: `${themeColors.button}33` }} />
          <div className="relative z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-100">
            <FiNavigation
              className="w-6 h-6 text-blue-600 transform -rotate-45"
              style={{ color: themeColors.button }}
            />
          </div>
          {/* Status Badge */}
          <div className="absolute top-0 right-0 transform translate-x-1 -translate-y-1">
            <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
              <span className="text-white text-[10px] font-bold">!</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-2 mb-8">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            Enable Location
          </h3>
          <p className="text-sm text-gray-500 font-medium px-2 leading-relaxed">
            Please turn on your device GPS to find the best services available near you.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3 relative z-10">
          <button
            onClick={onRequestLocation}
            className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 group"
            style={{
              backgroundColor: themeColors.button,
              boxShadow: `0 10px 20px -5px ${themeColors.button}4D`
            }}
          >
            <FiMapPin className="w-5 h-5 group-hover:animate-bounce" />
            Turn on GPS
          </button>

          {onManualSearch && (
            <button
              onClick={onManualSearch}
              className="w-full py-3 rounded-xl text-gray-400 font-semibold text-xs hover:text-gray-600 transition-colors uppercase tracking-wider"
            >
              Enter Location Manually
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GPSPermissionModal;
