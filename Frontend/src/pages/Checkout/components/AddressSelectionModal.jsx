import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiX } from 'react-icons/fi';

const AddressSelectionModal = ({ isOpen, onClose, address, houseNumber, onHouseNumberChange, onSave }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      setIsClosing(false);
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Modal */}
        <div
          className={`bg-white rounded-t-3xl ${
            isClosing ? 'animate-slide-down' : 'animate-slide-up'
          }`}
          style={{
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiArrowLeft className="w-5 h-5 text-black" />
                </button>
                <h1 className="text-xl font-bold text-black">Select Address</h1>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5 text-black" />
              </button>
            </div>
          </div>

          {/* Map Section */}
          <div className="relative h-64 bg-gray-200">
            {/* Map Placeholder */}
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: '#00a6a6' }}>
                  <div className="w-8 h-8 bg-white rounded-full"></div>
                </div>
                <p className="text-sm text-gray-600 font-medium">Map View</p>
              </div>
            </div>
            
            {/* Pin Instruction */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm">
              Place the pin accurately on map
            </div>

            {/* Locate Me Button */}
            <button className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
              <div className="w-6 h-6 border-2 border-gray-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              </div>
            </button>
          </div>

          {/* Address Section - Scrollable */}
          <div 
            className="px-4 py-4 overflow-y-auto flex-1"
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain'
            }}
          >
            {/* Confirmed Address */}
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-black mb-1">11 Bungalow Colony</h3>
                  <p className="text-sm text-gray-600">{address}</p>
                </div>
                <button
                  className="px-4 py-1.5 rounded-lg text-sm font-medium text-white"
                  style={{ backgroundColor: '#00a6a6' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#008a8a'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#00a6a6'}
                >
                  Change
                </button>
              </div>
            </div>

            {/* House/Flat Number Input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="House/Flat Number*"
                value={houseNumber}
                onChange={(e) => onHouseNumberChange(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg text-sm focus:outline-none transition-colors"
                style={{ borderColor: '#e5e7eb' }}
                onFocus={(e) => e.target.style.borderColor = '#00a6a6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Save Button */}
            <button
              onClick={() => onSave(houseNumber)}
              disabled={!houseNumber.trim()}
              className="w-full py-3.5 rounded-lg text-base font-semibold transition-colors"
              style={houseNumber.trim() ? {
                backgroundColor: '#00a6a6',
                color: 'white'
              } : {
                backgroundColor: '#e5e7eb',
                color: '#9ca3af',
                cursor: 'not-allowed'
              }}
              onMouseEnter={(e) => {
                if (houseNumber.trim()) {
                  e.target.style.backgroundColor = '#008a8a';
                }
              }}
              onMouseLeave={(e) => {
                if (houseNumber.trim()) {
                  e.target.style.backgroundColor = '#00a6a6';
                }
              }}
            >
              Save and proceed to slots
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddressSelectionModal;

