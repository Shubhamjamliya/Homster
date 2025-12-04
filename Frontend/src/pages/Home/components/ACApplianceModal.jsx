import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import acIcon from '../../../assets/images/icons/services/ac-icon.png';
import washingMachineIcon from '../../../assets/images/icons/services/washing-machine-icon.png';
import geyserIcon from '../../../assets/images/icons/services/geyser-icon.png';
import waterPurifierIcon from '../../../assets/images/icons/services/water-purifier-icon.png';
import refrigeratorIcon from '../../../assets/images/icons/services/refrigerator-icon.png';
import microwaveIcon from '../../../assets/images/icons/services/microwave-icon.png';
import shoppingBagIcon from '../../../assets/images/icons/services/water-purifier-icon.png'; // Using water-purifier as placeholder for shopping bag

const ACApplianceModal = ({ isOpen, onClose, location, cartCount }) => {
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  if (!isOpen && !isClosing) return null;

  const homeAppliances = [
    { id: 1, title: 'AC', icon: acIcon },
    { id: 2, title: 'Washing Machine Repair', icon: washingMachineIcon },
    { id: 3, title: 'Geyser Repair', icon: geyserIcon },
  ];

  const kitchenAppliances = [
    { id: 1, title: 'Water Purifier Repair', icon: waterPurifierIcon },
    { id: 2, title: 'Refrigerator Repair', icon: refrigeratorIcon },
    { id: 3, title: 'Microwave Repair', icon: microwaveIcon },
  ];

  const handleServiceClick = (service) => {
    console.log('Service clicked:', service);
    handleClose();
    // Navigate to AC Service page if AC is clicked
    if (service.title === 'AC') {
      navigate('/ac-service');
    } else {
      // Navigate to other service pages
    }
  };

  const handleNativeProductClick = () => {
    console.log('Native product clicked');
    handleClose();
    // Navigate to product page
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      {/* Modal Container with Close Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Close Button - Above Modal */}
        <div className="absolute -top-12 right-4 z-[60]">
          <button
            onClick={handleClose}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-800" />
          </button>
        </div>

        {/* Modal */}
        <div
          className={`bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto ${
            isClosing ? 'animate-slide-down' : 'animate-slide-up'
          }`}
          onClick={(e) => e.stopPropagation()}
        >

        {/* Content */}
        <div className="px-4 py-6">
          {/* Title */}
          <h1 className="text-xl font-semibold text-black mb-6">AC & Appliance Repair</h1>

          {/* Home Appliances Section */}
          <div className="mb-8">
            <h2 className="text-base font-semibold text-black mb-4">Home appliances</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {homeAppliances.map((appliance) => {
                return (
                  <div
                    key={appliance.id}
                    onClick={() => handleServiceClick(appliance)}
                    className="min-w-[120px] flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-2">
                      <img src={appliance.icon} alt={appliance.title} className="w-8 h-8 object-contain" />
                    </div>
                    <p className="text-xs text-black text-center font-normal">{appliance.title}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kitchen Appliances Section */}
          <div className="mb-8">
            <h2 className="text-base font-semibold text-black mb-4">Kitchen appliances</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {kitchenAppliances.map((appliance) => {
                return (
                  <div
                    key={appliance.id}
                    onClick={() => handleServiceClick(appliance)}
                    className="min-w-[120px] flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-2">
                      <img src={appliance.icon} alt={appliance.title} className="w-8 h-8 object-contain" />
                    </div>
                    <p className="text-xs text-black text-center font-normal">{appliance.title}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Buy Native Products Section */}
          <div>
            <h2 className="text-base font-semibold text-black mb-4">Buy Native products</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <div
                onClick={handleNativeProductClick}
                className="min-w-[120px] flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-2 relative">
                  <img src={shoppingBagIcon} alt="Shopping Bag" className="w-8 h-8 object-contain" />
                  {/* Sale Badge */}
                  <div className="absolute -top-1 -left-1 bg-green-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                    Sale
                  </div>
                </div>
                <p className="text-xs text-black text-center font-normal">Native Water Purifier</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default ACApplianceModal;

