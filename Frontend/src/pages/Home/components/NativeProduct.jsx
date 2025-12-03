import React from 'react';

const NativeProduct = ({ onBuyClick }) => {
  return (
    <div className="mb-6 border-t-4 border-gray-300 pt-6">
      <div className="relative mx-4 rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-[300px]">
        {/* Background Pattern/Stars */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_white_1px,_transparent_1px)] bg-[length:20px_20px]"></div>
        </div>

        {/* Content */}
        <div className="relative p-6 flex flex-col justify-between h-full min-h-[300px]">
          {/* Top Section */}
          <div className="flex justify-between items-start">
            <div>
              <div className="mb-2">
                <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Up to ₹1,800 off
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">NATIVE</h2>
              <div className="text-2xl font-bold text-white leading-tight">
                <div>Camera. Doorbell.</div>
                <div>All-in-one.</div>
              </div>
            </div>
            
            {/* Product Image Placeholder */}
            <div className="hidden md:block w-32 h-40 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
              <svg 
                className="w-16 h-16 text-blue-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
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
    </div>
  );
};

export default NativeProduct;

