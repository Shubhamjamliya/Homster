import React, { useEffect, useState } from 'react';
import { themeColors } from '../../../../../theme';

const VendorSearchModal = ({ isOpen, onClose, currentStep, acceptedVendor }) => {
  const [dots, setDots] = useState('.');

  useEffect(() => {
    if (isOpen && currentStep !== 'accepted') {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '.' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all relative">

        {/* Close/Minimize Button - Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 bg-white/90 rounded-full shadow-sm text-gray-400 hover:text-gray-600 transition-colors hover:bg-white"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {(currentStep === 'searching' || currentStep === 'waiting') && (
          <div className="flex flex-col items-center justify-center pt-12 pb-10 px-6 relative h-[450px]">

            {/* Map-like Background (Subtle) */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="w-full h-full" style={{
                backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
            </div>

            {/* Central Radar Animation */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-8">
              {/* Outer Ripples */}
              <div className="absolute inset-0 rounded-full border-2 opacity-20 animate-ping"
                style={{ borderColor: themeColors.brand.teal, animationDuration: '3s' }}></div>
              <div className="absolute inset-4 rounded-full border opacity-40 animate-ping"
                style={{ borderColor: themeColors.brand.teal, animationDuration: '3s', animationDelay: '0.6s' }}></div>

              {/* Rotating Scanner Gradient */}
              <div className="absolute inset-0 rounded-full animate-spin-slow opacity-30"
                style={{
                  background: `conic-gradient(transparent 180deg, ${themeColors.brand.teal})`,
                  animationDuration: '4s'
                }}></div>

              {/* Center Core */}
              <div className="relative z-10 w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center p-1">
                <div className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${themeColors.brand.teal}15, ${themeColors.brand.teal}05)` }}>
                  {/* User Icon or Brand Icon */}
                  <div className="w-3 h-3 rounded-full shadow-lg animate-pulse"
                    style={{ backgroundColor: themeColors.brand.teal }}></div>
                  <div className="absolute w-full h-full animate-pulse opacity-30 rounded-full"
                    style={{ backgroundColor: themeColors.brand.teal }}></div>
                </div>
              </div>

              {/* Floating "Found" Dots Animation */}
              <div className="absolute top-10 right-10 w-2 h-2 rounded-full animate-bounce opacity-50" style={{ backgroundColor: themeColors.brand.orange, animationDelay: '0.2s' }}></div>
              <div className="absolute bottom-8 left-8 w-2 h-2 rounded-full animate-bounce opacity-50" style={{ backgroundColor: themeColors.brand.yellow, animationDelay: '1.5s' }}></div>
            </div>

            {/* Status Text */}
            <div className="text-center relative z-20">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Finding nearby {currentStep === 'waiting' ? 'professionals' : 'experts'}</h3>
              <p className="text-gray-500 text-sm max-w-[240px] mx-auto leading-relaxed">
                Connecting you with the best available service providers in your area{dots}
              </p>
            </div>

            {/* Bottom Pill - 'Minimize' hint removed as requested to be simpler, just status */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <div className="px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100 text-xs font-medium text-gray-400">
                Process runs in background
              </div>
            </div>

          </div>
        )}

        {currentStep === 'accepted' && acceptedVendor && (
          <div className="flex flex-col items-center pt-8 pb-8 px-6 bg-white w-full h-full min-h-[400px]">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl animate-bounce-short"
              style={{ background: `linear-gradient(135deg, ${themeColors.brand.teal}, ${themeColors.brand.secondary})` }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">Vendor Found!</h3>
            <p className="text-gray-500 text-center mb-8 px-4">
              Your request has been accepted.
            </p>

            {/* Vendor Card */}
            <div className="w-full bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-8 relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-bold text-lg text-gray-900 mb-1">{acceptedVendor.businessName}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                    <span className="text-yellow-400">★</span> {acceptedVendor.rating || '4.9'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {acceptedVendor.distance || 'Nearby'}
                  </span>
                </div>
              </div>
              {/* Background decoration */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: themeColors.brand.teal }}></div>
            </div>

            {/* Action Button */}
            <button
              onClick={onClose}
              className="w-full text-white py-4 rounded-xl font-bold text-base shadow-lg transition-transform active:scale-95"
              style={{
                background: themeColors.button,
                boxShadow: `0 10px 20px -5px ${themeColors.brand.teal}66`
              }}
            >
              Continue to Payment
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default VendorSearchModal;
