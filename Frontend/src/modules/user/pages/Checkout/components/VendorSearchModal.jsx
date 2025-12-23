import React from 'react';
import { themeColors } from '../../../../../theme';

const VendorSearchModal = ({ isOpen, onClose, currentStep, acceptedVendor }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {currentStep === 'searching' && (
          <div className="text-center py-12 px-6">
            <div className="relative mb-8">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-500 mx-auto"></div>
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-400 animate-spin mx-auto"
                style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
              ></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Finding Nearby Vendors</h3>
            <p className="text-gray-600 mb-6 text-base">Sending alerts to vendors within 10km...</p>
            <div className="flex justify-center items-center gap-3 mb-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
              📍 Alert sent to nearby vendors<br />
              🔍 Searching within 10km radius
            </div>
          </div>
        )}

        {currentStep === 'waiting' && (
          <div className="text-center py-12 px-6">
            <div className="relative mb-8">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-500 mx-auto"></div>
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-400 animate-spin mx-auto"
                style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
              ></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Waiting for Response</h3>
            <p className="text-gray-600 mb-6 text-base">Vendors are reviewing your request...</p>
            <div className="flex justify-center items-center gap-3 mb-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
              ⏳ Please wait while vendors respond<br />
              🔔 You'll be notified when a vendor accepts
            </div>
          </div>
        )}

        {currentStep === 'accepted' && acceptedVendor && (
          <div className="text-center py-10 px-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <span className="text-5xl">🎉</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Vendor Found!</h3>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 mb-6 border-2 border-green-200">
              <h4 className="font-bold text-green-900 text-xl mb-3">{acceptedVendor.businessName}</h4>
              <div className="flex items-center justify-center gap-6 text-sm text-green-700 mb-4">
                <span className="flex items-center gap-1">
                  ⭐ {acceptedVendor.rating}
                </span>
                <span className="flex items-center gap-1">
                  📍 {acceptedVendor.distance}
                </span>
                <span className="flex items-center gap-1">
                  🕐 {acceptedVendor.estimatedTime}
                </span>
              </div>
              <div className="text-3xl font-bold text-green-900">
                ₹{acceptedVendor.price}
              </div>
            </div>

            <p className="text-gray-600 text-base mb-6">
              {acceptedVendor.businessName} has accepted your booking!
            </p>

            <button
              onClick={onClose}
              className="w-full text-white py-4 rounded-xl text-base font-semibold transition-all hover:opacity-90 shadow-lg"
              style={{ backgroundColor: themeColors.button }}
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
