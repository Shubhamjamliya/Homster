import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { FiX, FiLayers } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import { themeColors } from '../../../../../theme';
import { publicCatalogService } from '../../../../../services/catalogService';

const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const CategoryModal = React.memo(({ isOpen, onClose, category, location, cartCount }) => {
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false);
    } else if (category?.id) {
      // Fetch services for this category
      const fetchServices = async () => {
        try {
          setLoading(true);
          const response = await publicCatalogService.getServices({ categoryId: category.id });
          if (response.success) {
            setServices(response.services);
          }
        } catch (error) {
        } finally {
          setLoading(false);
        }
      };
      fetchServices();
    }
  }, [isOpen, category?.id]);

  const handleClose = () => {
    setIsClosing(true);
    onClose();
    setTimeout(() => setIsClosing(false), 200);
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen && !isClosing) return null;
  if (!mounted) return null;

  const handleServiceClick = (service) => {
    // Navigate to dynamic service page
    if (service.slug) {
      navigate(`/user/${service.slug}`);
    }

    // Close modal after navigation
    setIsClosing(true);
    onClose();
    setTimeout(() => setIsClosing(false), 100);
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            onClick={onClose}
            style={{
              position: 'fixed',
              willChange: 'opacity',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          />

          {/* Modal Container with Close Button */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[9999]"
            style={{
              position: 'fixed',
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {/* Close Button - Above Modal */}
            <div className="absolute -top-12 right-4 z-[60]">
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                title="Close"
              >
                <FiX className="w-6 h-6 text-gray-800" />
              </button>
            </div>

            {/* Modal */}
            <div
              className="bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Content */}
              <div className="px-4 py-6">
                {/* Title */}
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-xl font-bold text-gray-900">{category?.title || 'Service Category'}</h1>
                  {loading && <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: themeColors.button }}></div>}
                </div>

                {loading ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 animate-pulse">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-200 rounded-2xl mb-2"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : services.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => handleServiceClick(service)}
                        className="flex flex-col items-center cursor-pointer group active:scale-95 transition-all"
                      >
                        <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-2 group-hover:bg-gray-100 transition-colors shadow-sm overflow-hidden border border-gray-100">
                          {service.icon ? (
                            <img
                              src={toAssetUrl(service.icon)}
                              alt={service.title}
                              className="w-14 h-14 object-contain group-hover:scale-110 transition-transform"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <FiLayers className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] font-bold text-gray-800 text-center leading-tight line-clamp-2 px-1">
                          {service.title}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <FiLayers className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">No services found</h3>
                    <p className="text-sm text-gray-500">We're working on bringing services to this category soon.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
});

CategoryModal.displayName = 'CategoryModal';

export default CategoryModal;

