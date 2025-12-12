import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import salonIcon from '../../../../../assets/images/icons/services/salon.png';
import spaIcon from '../../../../../assets/images/icons/services/spa.png';
import hairIcon from '../../../../../assets/images/icons/services/hair.png';
import bathroomCleanIcon from '../../../../../assets/images/icons/services/bathroom-clean.png';
import sofaIcon from '../../../../../assets/images/icons/services/sofa.png';
import electricianIcon from '../../../../../assets/images/icons/services/electrician.png';
import plumberIcon from '../../../../../assets/images/icons/services/plumber.png';
import carpenterIcon from '../../../../../assets/images/icons/services/carpenter.png';

const CategoryModal = React.memo(({ isOpen, onClose, category, location, cartCount }) => {
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    // Close immediately, animation will handle visual
    onClose();
    // Reset state after animation completes
    setTimeout(() => setIsClosing(false), 200);
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen && !isClosing) return null;
  if (!mounted) return null;

  // Default sub-services for each category
  const getSubServices = () => {
    switch (category?.title) {
      case "Women's Salon & Spa":
        return [
          { id: 1, title: 'Salon for Women', icon: salonIcon },
          { id: 2, title: 'Spa for Women', icon: spaIcon },
          { id: 3, title: 'Hair Studio for Women', icon: hairIcon },
        ];
      case 'Massage for Men':
        return [
          { id: 1, title: 'Swedish Massage' },
          { id: 2, title: 'Deep Tissue Massage' },
          { id: 3, title: 'Sports Massage' },
          { id: 4, title: 'Head & Shoulder Massage' },
        ];
      case 'Cleaning':
        return [
          { id: 1, title: 'Bathroom & Kitchen Cleaning', icon: bathroomCleanIcon },
          { id: 2, title: 'Sofa & Carpet Cleaning', icon: sofaIcon },
        ];
      case 'Electrician, Plumber & Carpenter':
        return [
          { id: 1, title: 'Electrical Repair', icon: electricianIcon },
          { id: 2, title: 'Plumbing Services', icon: plumberIcon },
          { id: 3, title: 'Carpentry Work', icon: carpenterIcon },
          { id: 4, title: 'Installation Services', icon: electricianIcon },
        ];
      case 'Native Water Purifier':
        return [
          { id: 1, title: 'Water Purifier Installation' },
          { id: 2, title: 'Water Purifier Service' },
          { id: 3, title: 'Filter Replacement' },
        ];
      default:
        return [];
    }
  };

  const subServices = getSubServices();

  const handleServiceClick = (service) => {
    // Navigate immediately - don't wait for modal close
    if (service.title === 'Salon for Women') {
      navigate('/user/salon-for-women');
    } else if (service.title === 'Spa for Women') {
      // Navigate to spa page if exists
    } else if (service.title === 'Hair Studio for Women') {
      // Navigate to hair studio page if exists
    } else if (service.title === 'Bathroom & Kitchen Cleaning') {
      navigate('/user/bathroom-kitchen-cleaning');
    } else if (service.title === 'Sofa & Carpet Cleaning') {
      navigate('/user/sofa-carpet-cleaning');
    } else if (service.title === 'Electrical Repair') {
      navigate('/user/electrician');
    } else {
      // Navigate to other service pages
    }
    
    // Close modal after navigation (non-blocking)
    setIsClosing(true);
    onClose();
    setTimeout(() => setIsClosing(false), 100);
  };

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-[9998] transition-opacity ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
        style={{
          position: 'fixed',
          willChange: 'opacity',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      />

      {/* Modal Container with Close Button */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-[9999]"
        style={{
          position: 'fixed',
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
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
            <h1 className="text-xl font-semibold text-black mb-6">{category?.title || 'Service Category'}</h1>

            {/* Special layout for Women's Salon & Spa */}
            {category?.title === "Women's Salon & Spa" ? (
              <div className="flex gap-4 justify-center">
                {subServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceClick(service)}
                    className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform flex-1"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: '#f5f5f5' }}>
                      {service.icon && (
                        <img 
                          src={service.icon} 
                          alt={service.title} 
                          className="w-14 h-14 object-contain"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                    </div>
                    <p className="text-xs text-black text-center font-normal leading-tight">{service.title}</p>
                  </div>
                ))}
              </div>
            ) : category?.title === 'Cleaning' ? (
              /* Special layout for Cleaning - 2 items side by side */
              <div className="flex gap-4 justify-center">
                {subServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceClick(service)}
                    className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform flex-1"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: '#f5f5f5' }}>
                      {service.icon && (
                        <img 
                          src={service.icon} 
                          alt={service.title} 
                          className="w-14 h-14 object-contain"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                    </div>
                    <p className="text-xs text-black text-center font-normal leading-tight">{service.title}</p>
                  </div>
                ))}
              </div>
            ) : category?.title === 'Electrician, Plumber & Carpenter' ? (
              /* Special layout for Electrician, Plumber & Carpenter - 4 items with icons */
              <div className="flex gap-4 justify-center flex-wrap">
                {subServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceClick(service)}
                    className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform flex-1 min-w-[80px]"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: '#f5f5f5' }}>
                      {service.icon && (
                        <img 
                          src={service.icon} 
                          alt={service.title} 
                          className="w-10 h-10 object-contain"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                    </div>
                    <p className="text-xs text-black text-center font-normal leading-tight">{service.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              /* Default Grid Layout for other categories */
              <div className="grid grid-cols-3 gap-4">
                {subServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceClick(service)}
                    className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-2">
                      <svg
                        className="w-8 h-8 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-xs text-black text-center font-normal">{service.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
});

CategoryModal.displayName = 'CategoryModal';

export default CategoryModal;

