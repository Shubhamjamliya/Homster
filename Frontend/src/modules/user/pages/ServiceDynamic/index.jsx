import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { cartService } from '../../../../services/cartService';
import { FiArrowLeft, FiSearch, FiShare2, FiStar, FiChevronRight, FiLayers } from 'react-icons/fi';
import { publicCatalogService } from '../../../../services/catalogService';
import { themeColors } from '../../../../theme';
import StickyHeader from '../../components/common/StickyHeader';
import StickySubHeading from '../../components/common/StickySubHeading';
import BannerSection from '../../components/common/BannerSection';
import RatingSection from '../../components/common/RatingSection';
import PaymentOffers from '../../components/common/PaymentOffers';
import ServiceCategoriesGrid from '../../components/common/ServiceCategoriesGrid';
import MenuModal from '../../components/common/MenuModal';
import CategoryCart from '../../components/common/CategoryCart';

const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const ServiceDynamic = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [currentSection, setCurrentSection] = useState('');
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [showCategoryCartModal, setShowCategoryCartModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const bannerRef = useRef(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await publicCatalogService.getServiceBySlug(slug);
        if (response.success) {
          setService(response.service);
        } else {
          toast.error(response.message || 'Service not found');
          navigate('/user');
        }
      } catch (error) {
        console.error('Error fetching service:', error);
        toast.error('Failed to load service details');
        navigate('/user');
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchService();
  }, [slug, navigate]);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const response = await cartService.getCart();
        if (response.success) {
          const items = response.data || [];
          setCartItems(items);
          setCartCount(items.length);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };
    loadCart();
    // Refresh cart every 5 seconds
    const interval = setInterval(loadCart, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (bannerRef.current) {
        const rect = bannerRef.current.getBoundingClientRect();
        const bannerScrolledPast = rect.bottom <= 0;
        setShowStickyHeader(bannerScrolledPast);

        if (bannerScrolledPast && service?.sections) {
          const headerOffset = 100;
          let activeSection = '';
          for (let i = service.sections.length - 1; i >= 0; i--) {
            const sectionId = `section-${i}`;
            const element = document.getElementById(sectionId);
            if (element) {
              const sectionRect = element.getBoundingClientRect();
              if (sectionRect.top <= headerOffset) {
                activeSection = service.sections[i].title;
                break;
              }
            }
          }
          setCurrentSection(activeSection);
        } else {
          setCurrentSection('');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [service]);

  const handleBack = () => navigate('/user');

  const handleAddClick = async (item, sectionTitle) => {
    try {
      // Get service and vendor IDs from the service data
      const cartItemData = {
        serviceId: service.id, // Service ID from the formatted response
        categoryId: service.category?.id || null, // Category ID from the formatted response
        title: item.title,
        description: item.subtitle || item.description || sectionTitle || service.title,
        icon: toAssetUrl(item.imageUrl || service.icon),
        category: service.title,
        price: parseInt(item.price?.toString().replace(/,/g, '') || 0),
        originalPrice: item.originalPrice ? parseInt(item.originalPrice.toString().replace(/,/g, '')) : null,
        unitPrice: parseInt(item.price?.toString().replace(/,/g, '') || 0),
        serviceCount: 1,
        rating: item.rating || "4.8",
        reviews: item.reviews || "10k+",
        vendorId: service.vendorId || null,
      };

      const response = await cartService.addToCart(cartItemData);
      if (response.success) {
        toast.success(`${item.title} added to cart!`);
        // Update local cart items state for UI
        const updatedCart = await cartService.getCart();
        if (updatedCart.success) {
          setCartItems(updatedCart.data || []);
        }
      } else {
        toast.error(response.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-gray-100 border-t-primary-600 rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium">Loading service details...</p>
    </div>
  );

  if (!service) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-medium">Service not found</p>
          <p className="text-sm text-gray-400 mt-2">Slug: "{slug}"</p>
          <p className="text-xs text-gray-300 mt-4">Make sure this service exists in the database</p>
        </div>
      </div>
    );
  }

  // Show CategoryCart as full page when opened
  if (showCategoryCartModal) {
    return (
      <CategoryCart
        isOpen={true}
        onClose={() => setShowCategoryCartModal(false)}
        category={service?.title}
        categoryTitle={`${service?.title} Cart`}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 relative">
      <StickyHeader
        title={service.title}
        onBack={handleBack}
        isVisible={showStickyHeader}
      />
      <StickySubHeading
        title={currentSection}
        isVisible={showStickyHeader && !!currentSection}
      />

      {/* Spacer to prevent layout shift when sticky header appears */}
      <div
        className={`transition-all duration-300 ease-in-out ${showStickyHeader ? 'h-[57px]' : 'h-0'}`}
        aria-hidden="true"
      ></div>

      {/* Spacer for sticky sub-heading to prevent layout shift */}
      <div
        className={`transition-all duration-300 ease-in-out ${showStickyHeader && currentSection ? 'h-10' : 'h-0'}`}
        aria-hidden="true"
      ></div>

      <main>
        <BannerSection
          bannerRef={bannerRef}
          banners={service.page?.banners?.length > 0 ? service.page.banners.map(b => ({
            id: b.id || Math.random(),
            image: toAssetUrl(b.imageUrl),
            text: b.text || service.title
          })) : [
            { id: 1, image: toAssetUrl(service.icon), text: service.title }
          ]}
          onBack={handleBack}
        />

        <RatingSection
          title={service.page?.ratingTitle || service.title}
          rating={service.page?.ratingValue || "4.82"}
          bookings={service.page?.bookingsText || "1M+ bookings"}
        />

        {service.page?.paymentOffersEnabled !== false && service.page?.paymentOffers?.length > 0 && (
          <PaymentOffers offers={service.page.paymentOffers} />
        )}

        {service.page?.serviceCategoriesGrid?.length > 0 && (
          <ServiceCategoriesGrid
            categories={service.page.serviceCategoriesGrid.map((c, i) => ({
              id: c.id || i,
              title: c.title,
              image: toAssetUrl(c.imageUrl)
            }))}
            onCategoryClick={(cat) => {
              const idx = service.sections.findIndex(s => s.title === cat.title);
              if (idx !== -1) {
                const el = document.getElementById(`section-${idx}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          />
        )}

        <div className="px-4 mt-6 pb-24">
          {service.sections?.map((section, sIdx) => (
            <div key={sIdx} id={`section-${sIdx}`} className="mb-8">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">{String(section.title)}</h2>
                {section.subtitle && <p className="text-sm text-gray-500 mt-1">{String(section.subtitle)}</p>}
              </div>

              <div className="space-y-4">
                {section.cards?.map((card, cIdx) => (
                  <div
                    key={cIdx}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200 relative"
                  >
                    {/* Badge in top-right corner */}
                    {card.badge && typeof card.badge === 'string' && card.badge.trim() && (
                      <span className="absolute top-3 right-3 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide z-10">
                        {card.badge}
                      </span>
                    )}

                    <div className="flex gap-4">
                      {/* Left Content */}
                      <div className="flex-1 min-w-0 pr-8">
                        {/* Title */}
                        <h3 className="text-base font-semibold text-gray-900 leading-tight mb-2">
                          {String(card.title || 'Untitled')}
                        </h3>

                        {/* Rating */}
                        {(card.rating || card.reviews) && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="flex items-center gap-0.5">
                              <FiStar className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-semibold text-gray-900">
                                {String(card.rating || "4.85")}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              ({String(card.reviews || "250K")} reviews)
                            </span>
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg font-bold text-gray-900">₹{String(card.price || '0')}</span>
                          {card.originalPrice && (
                            <>
                              <span className="text-sm text-gray-400 line-through">₹{String(card.originalPrice)}</span>
                              {card.discount && typeof card.discount === 'string' && card.discount.trim() && (
                                <span className="text-xs font-semibold text-green-600">{card.discount}</span>
                              )}
                            </>
                          )}
                          {card.duration && typeof card.duration === 'string' && card.duration.trim() && (
                            <span className="text-sm text-gray-500">• {card.duration}</span>
                          )}
                        </div>

                        {/* Features List */}
                        {card.features && Array.isArray(card.features) && card.features.length > 0 && (
                          <ul className="space-y-1 mb-3">
                            {card.features
                              .filter(f => f && typeof f === 'string' && f.trim())
                              .slice(0, 2)
                              .map((feature, fIdx) => (
                                <li key={fIdx} className="text-sm text-gray-600 flex items-start gap-1.5">
                                  <span className="text-gray-400 mt-0.5">•</span>
                                  <span className="line-clamp-1">{feature}</span>
                                </li>
                              ))}
                          </ul>
                        )}

                        {/* View Details Link */}
                        <button
                          onClick={() => {
                            setSelectedCard({ ...card, sectionTitle: section.title });
                            setShowDetailModal(true);
                          }}
                          className="text-primary-600 text-sm font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          View details
                          <FiChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Right Image + Add Button */}
                      <div className="relative shrink-0">
                        <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                          <img
                            src={toAssetUrl(card.imageUrl)}
                            alt={String(card.title)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/128x128?text=No+Image';
                            }}
                          />
                        </div>
                        <button
                          onClick={() => handleAddClick(card, section.title)}
                          className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-primary-600 font-bold px-6 py-1.5 rounded-lg shadow-md border border-primary-200 hover:bg-primary-50 active:scale-95 transition-all text-sm"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Summary */}
      {(() => {
        const categoryItems = cartItems.filter(item => item.category === service.title);
        if (categoryItems.length === 0) return null;
        const totalPrice = categoryItems.reduce((sum, item) => sum + (item.price || 0), 0);
        return (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center justify-between z-[9996] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">₹{totalPrice.toLocaleString('en-IN')}</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{categoryItems.length} Items in cart</span>
            </div>
            <button
              onClick={() => setShowCategoryCartModal(true)}
              className="px-8 py-3 text-white font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all text-sm uppercase tracking-wide"
              style={{ background: themeColors.button }}
            >
              View Cart
            </button>
          </div>
        );
      })()}

      <MenuModal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        onCategoryClick={(cat) => {
          const idx = service.sections.findIndex(s =>
            s.title.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') ===
            cat.title.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
          );
          if (idx !== -1) {
            document.getElementById(`section-${idx}`)?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        categories={service.page?.serviceCategoriesGrid?.map((c, i) => ({
          id: c.id || i,
          title: c.title,
          image: toAssetUrl(c.imageUrl)
        })) || []}
      />


      {/* Service Detail Modal */}
      {showDetailModal && selectedCard && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowDetailModal(false)}
          />

          {/* Modal Container */}
          <div className="fixed bottom-0 left-0 right-0 z-50">
            {/* Close Button - Above Modal */}
            <div className="absolute -top-12 right-4 z-[60]">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-colors hover:bg-gray-50"
              >
                <FiArrowLeft className="h-6 w-6 text-gray-800" />
              </button>
            </div>

            {/* Modal */}
            <div
              className="animate-slide-up rounded-t-3xl bg-white"
              style={{
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 shrink-0 border-b border-gray-200 bg-white px-4 py-3">
                <h1 className="text-xl font-bold text-black">{String(service?.title || 'Service')}</h1>
              </div>

              {/* Content - Scrollable */}
              <div
                className="flex-1 overflow-y-auto"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain'
                }}
              >
                <div className="px-4 py-4">
                  {/* Service Detail Card */}
                  <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
                    <h2 className="mb-2 text-xl font-bold text-black">{String(selectedCard.title)}</h2>
                    {(selectedCard.rating || selectedCard.reviews) && (
                      <div className="mb-2 flex items-center gap-1">
                        <FiStar className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-700">
                          {String(selectedCard.rating || '4.85')} ({String(selectedCard.reviews || '250K')} reviews)
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-black">₹{String(selectedCard.price || '0')}</span>
                        {selectedCard.duration && typeof selectedCard.duration === 'string' && selectedCard.duration.trim() && (
                          <>
                            <span className="text-sm text-gray-600">•</span>
                            <span className="text-sm text-gray-600">{selectedCard.duration}</span>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          handleAddClick(selectedCard, selectedCard.sectionTitle);
                          setShowDetailModal(false);
                        }}
                        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedCard.description && typeof selectedCard.description === 'string' && selectedCard.description.trim() && (
                    <div className="mb-4">
                      <h3 className="mb-2 text-lg font-bold text-black">About this service</h3>
                      <p className="text-sm leading-relaxed text-gray-700">{selectedCard.description}</p>
                    </div>
                  )}

                  {/* Features */}
                  {selectedCard.features && Array.isArray(selectedCard.features) && selectedCard.features.length > 0 && (
                    <div className="mb-4">
                      <h3 className="mb-3 text-lg font-bold text-black">What's included</h3>
                      <div className="space-y-2">
                        {selectedCard.features
                          .filter(f => f && typeof f === 'string' && f.trim())
                          .map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="mt-0.5 text-green-600">✓</span>
                              <span className="text-sm text-gray-700">{feature}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Image */}
                  {selectedCard.imageUrl && (
                    <div className="mb-4">
                      <img
                        src={toAssetUrl(selectedCard.imageUrl)}
                        alt={String(selectedCard.title)}
                        className="h-48 w-full rounded-lg object-cover"
                      />
                    </div>
                  )}

                  {/* Options */}
                  {selectedCard.options && typeof selectedCard.options === 'string' && selectedCard.options.trim() && (
                    <div className="mb-4">
                      <h3 className="mb-2 text-lg font-bold text-black">Options available</h3>
                      <p className="text-sm text-gray-700">{selectedCard.options}</p>
                    </div>
                  )}

                  {/* Warranty & Cover */}
                  <div className="mb-4 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600">
                        <span className="text-sm font-bold text-white">✓</span>
                      </div>
                      <h3 className="text-lg font-bold text-black">Appzeto cover promise</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 rounded-lg bg-white/60 p-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
                          <FiStar className="h-5 w-5 text-primary-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-800">Up to 30 days of warranty</p>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg bg-white/60 p-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
                          <FiStar className="h-5 w-5 text-primary-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-800">Up to ₹10,000 damage cover</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Compact Cart Summary - Fixed at bottom when cart has items from this category */}
      {(() => {
        const categoryItems = cartItems.filter(item => item.category === service?.title);
        const categoryCount = categoryItems.length;
        const totalPrice = categoryItems.reduce((sum, item) => sum + (item.price || 0), 0);
        const totalOriginalPrice = categoryItems.reduce((sum, item) => sum + (item.originalPrice || item.price || 0), 0);

        if (categoryCount === 0) return null;

        return (
          <div
            className="shadow-lg border-t border-gray-200 px-4 py-3 flex items-center justify-between"
            style={{
              backgroundColor: '#f8f8f8',
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 9996,
              willChange: 'transform',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-black">₹{totalPrice.toLocaleString('en-IN')}</span>
                {totalOriginalPrice > totalPrice && (
                  <span className="text-sm text-gray-400 line-through">₹{totalOriginalPrice.toLocaleString('en-IN')}</span>
                )}
                <span className="text-sm text-gray-600">({categoryCount} {categoryCount === 1 ? 'item' : 'items'})</span>
              </div>
            </div>
            <button
              onClick={() => setShowCategoryCartModal(true)}
              className="text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap"
              style={{ background: themeColors.button }}
            >
              View Cart
            </button>
          </div>
        );
      })()}

      {/* Floating Menu Button - Small at bottom */}
      {(() => {
        const categoryItems = cartItems.filter(item => item.category === service?.title);
        const categoryCount = categoryItems.length;

        return (
          <button
            onClick={() => setIsMenuModalOpen(true)}
            className="bg-black text-white px-4 py-2 rounded-full flex items-center gap-1.5 shadow-lg hover:bg-gray-800 transition-colors"
            style={{
              position: 'fixed',
              bottom: categoryCount > 0 ? '80px' : '16px',
              left: '50%',
              transform: 'translateX(-50%) translateZ(0)',
              zIndex: 9995,
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-sm font-medium">Menu</span>
          </button>
        );
      })()}

      {/* Menu Modal */}
      <MenuModal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        onCategoryClick={(cat) => {
          const idx = service.sections.findIndex(s =>
            s.title.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') ===
            cat.title.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
          );
          if (idx !== -1) {
            document.getElementById(`section-${idx}`)?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        categories={service.page?.serviceCategoriesGrid?.map((c, i) => ({
          id: c.id || i,
          title: c.title,
          image: toAssetUrl(c.imageUrl)
        })) || []}
      />
    </div>
  );
};

export default ServiceDynamic;
