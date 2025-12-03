import React from 'react';

const NativeProductWithRefer = ({ onBuyClick, onReferClick }) => {
  return (
    <div className="mb-6 border-t-4 border-gray-300 pt-6">
      {/* Native RO Water Purifier Section */}
      <div className="relative mx-4 rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 min-h-[280px] mb-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_white_1px,_transparent_1px)] bg-[length:20px_20px]"></div>
        </div>

        {/* Content */}
        <div className="relative p-6 flex flex-col justify-between h-full min-h-[280px]">
          {/* Top Section */}
          <div className="flex justify-between items-start">
            <div>
              <div className="mb-2">
                <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Up to ₹2,000 off
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">NATIVE</h2>
              <div className="text-xl font-bold text-white">
                RO water purifier
              </div>
            </div>
            
            {/* Product Image Placeholder */}
            <div className="hidden md:block w-28 h-32 bg-gradient-to-br from-gray-700 to-gray-600 rounded-lg flex items-center justify-center">
              <svg 
                className="w-12 h-12 text-gray-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" 
                />
              </svg>
            </div>
          </div>

          {/* Bottom Section - Buy Now Button */}
          <div className="mt-6">
            <button
              onClick={onBuyClick}
              className="bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
            >
              Buy now
            </button>
          </div>
        </div>
      </div>

      {/* Refer & Earn Section */}
      <div className="mx-4 rounded-xl overflow-hidden bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
        <div className="p-4 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-black mb-1">
              Refer and get free services
            </h3>
            <p className="text-sm text-gray-600">
              Invite and get ₹100*
            </p>
          </div>
          
          {/* Gift Boxes Illustration */}
          <div className="flex items-center gap-1 ml-4">
            <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center transform rotate-12">
              <span className="text-2xl">🎁</span>
            </div>
            <div className="w-10 h-10 bg-pink-200 rounded-lg flex items-center justify-center transform -rotate-6 -ml-2">
              <span className="text-xl">🎁</span>
            </div>
            <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center transform rotate-12 -ml-2">
              <span className="text-lg">🎁</span>
            </div>
          </div>
        </div>
        <button
          onClick={onReferClick}
          className="w-full bg-purple-600 text-white font-semibold py-3 hover:bg-purple-700 active:scale-98 transition-all"
        >
          Refer Now
        </button>
      </div>
    </div>
  );
};

export default NativeProductWithRefer;

