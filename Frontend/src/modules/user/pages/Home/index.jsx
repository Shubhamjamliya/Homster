import React, { useState, useEffect, useLayoutEffect, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import SearchBar from './components/SearchBar';
import ServiceCategories from './components/ServiceCategories';
import { publicCatalogService } from '../../../../services/catalogService';
import { cartService } from '../../../../services/cartService';
import { toast } from 'react-hot-toast';

// Lazy load heavy components for better initial load performance
const PromoCarousel = lazy(() => import('./components/PromoCarousel'));
const NewAndNoteworthy = lazy(() => import('./components/NewAndNoteworthy'));
const MostBookedServices = lazy(() => import('./components/MostBookedServices'));
const CuratedServices = lazy(() => import('./components/CuratedServices'));
const ServiceSectionWithRating = lazy(() => import('./components/ServiceSectionWithRating'));
const Banner = lazy(() => import('./components/Banner'));
const ReferEarnSection = lazy(() => import('./components/ReferEarnSection'));
import CategoryModal from './components/CategoryModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AddressSelectionModal from '../Checkout/components/AddressSelectionModal';

const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [address, setAddress] = useState('Select Location');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [houseNumber, setHouseNumber] = useState('');

  const handleAddressSave = (savedHouseNumber, locationObj) => {
    if (locationObj) {
      setAddress(locationObj.address);
    }
    setHouseNumber(savedHouseNumber);
    setIsAddressModalOpen(false);
  };

  // Auto-detect location on mount
  useEffect(() => {
    const autoDetectLocation = async () => {
      if (navigator.geolocation && address === 'Select Location') {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
              );
              const data = await response.json();

              if (data.status === 'OK' && data.results.length > 0) {
                const result = data.results[0];
                const getComponent = (type) =>
                  result.address_components.find(c => c.types.includes(type))?.long_name || '';

                const area = getComponent('sublocality_level_1') || getComponent('neighborhood') || getComponent('locality');
                const city = getComponent('locality') || getComponent('administrative_area_level_2');
                const state = getComponent('administrative_area_level_1');

                const formattedAddress = `${area}- ${city}- ${state}`;
                setAddress(formattedAddress);
              }
            } catch (error) {
              // Silent fail
            }
          },
          (error) => {
            // Silent fail
          }
        );
      }
    };

    autoDetectLocation();
  }, []);
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [homeContent, setHomeContent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Combined useLayoutEffect - Set background on mount only (optimized)
  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const bgStyle = themeColors.backgroundGradient;

    // Set background on all elements (only once on mount)
    const elements = [html, body, root].filter(Boolean);
    elements.forEach(el => {
      if (el && !el.dataset.bgSet) {
        el.style.backgroundColor = '#ffffff';
        el.style.background = bgStyle;
        el.dataset.bgSet = 'true';
      }
    });

    // Force immediate visibility (only if needed)
    if (body && body.style.opacity !== '1') {
      body.style.opacity = '1';
      body.style.visibility = 'visible';
    }
  }, []); // Empty deps - only run once on mount

  // Handle scroll separately (only when needed)
  useEffect(() => {
    if (location.state?.scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location.state?.scrollToTop, location.pathname]);

  // Load cart count from backend
  useEffect(() => {
    const loadCartCount = async () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setCartCount(0);
          return;
        }

        const response = await cartService.getCart();
        if (response.success) {
          setCartCount((response.data || []).length);
        }
      } catch (error) {
        // Silently fail if user not authenticated
        if (error.response?.status === 401 || error.response?.status === 403) {
          setCartCount(0);
        } else {
          setCartCount(0);
        }
      }
    };

    loadCartCount();
    // Refresh cart count every 10 seconds
    const interval = setInterval(loadCartCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Fetch categories and home content on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, homeContentRes] = await Promise.all([
          publicCatalogService.getCategories(),
          publicCatalogService.getHomeContent()
        ]);

        let hasData = false;

        if (categoriesRes.success) {
          const mappedCategories = categoriesRes.categories.map(cat => ({
            id: cat.id,
            title: cat.title,
            slug: cat.slug,
            icon: toAssetUrl(cat.icon),
            hasSaleBadge: cat.hasSaleBadge,
            badge: cat.badge
          }));
          setCategories(mappedCategories);
          if (mappedCategories.length > 0) hasData = true;
        }

        if (homeContentRes.success) {
          setHomeContent(homeContentRes.homeContent);
          if (homeContentRes.homeContent) hasData = true;
        }

        // If no data loaded at all, keep loading true to prevent partial render or use error state
        if (!hasData) {
          // Option: Keep loading or better, retry or show specific empty state
          // For now, per request "if no data loads ....keep loader ruuning", we just don't set loading false?
          // But that might hang forever. Better to set a flag or keep checking.
          // Let's keep it strictly loading as requested if NO data.
          // BUT usually categories should exist.
          // If API fails it goes to catch.
          // If API returns success but empty, that's different.

          // If we have absolutely nothing, maybe retry? 
          // For now, let's respect the "keep loader running" if we strictly have empty content to avoid blank screen.
          if (categoriesRes.categories?.length === 0 && !homeContentRes.homeContent) {
            // keep loading
            return;
          }
        }

        setLoading(false);

      } catch (error) {
        console.error('Home content load error:', error);
        // If error, maybe keep loading or show error? 
        // Request says "if no data loads ....keep loader ruuning"
        // So we won't set loading(false) on error? 
        // That seems to be what is asked.
        // toast.error('Failed to load content. Please refresh the page.');
        // setLoading(false); // Do not stop loading on error to hide broken UI
      }
    };

    fetchData();
  }, []);

  const handleSearch = (query) => {
    // Navigate to search results page
  };

  const handleCategoryClick = (category) => {
    // Open modal for all categories - dynamically fetching its services
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handlePromoClick = (promo) => {
    // Priority 0: Navigate by service slug
    if (promo.slug) {
      navigate(`/user/${promo.slug}`);
      return;
    }

    // Priority 1: Navigate by targetCategoryId if provided
    if (promo.targetCategoryId) {
      const cat = categories.find(c => c.id === promo.targetCategoryId);
      if (cat) {
        handleCategoryClick(cat);
        return;
      }
    }

    // Priority 2: Navigate by route/section (existing logic)
    if (promo.route) {
      if (promo.scrollToSection) {
        navigate(promo.route, {
          state: { scrollToSection: promo.scrollToSection }
        });
      } else {
        navigate(promo.route);
      }
    }
  };

  const handleServiceClick = (service) => {
    if (!service) return;

    // Priority 1: Navigate by service slug (Dynamic Page)
    if (service.slug) {
      navigate(`/user/${service.slug}`);
      return;
    }

    // Priority 2: Navigate by targetCategoryId if provided from backend
    if (service.targetCategoryId) {
      const cat = categories.find(c => c.id === service.targetCategoryId);
      if (cat) {
        handleCategoryClick(cat);
        return;
      }
    }

    if (!service.title) return;
    const title = service.title.toLowerCase();

    // Priority 3: Dynamic slug-based navigation
    const slug = service.slug || service.title.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

    navigate(`/user/${slug}`);
  };


  const handleBuyClick = () => {
    // Navigate to product page or checkout
  };


  const handleAddClick = async (service) => {
    try {
      // For services from Home page, navigate to category instead of adding to cart
      // This is because Home page services don't have complete serviceId/categoryId data
      if (service.targetCategoryId) {
        const cat = categories.find(c => c.id === service.targetCategoryId);
        if (cat) {
          handleCategoryClick(cat);
          return;
        }
      }

      // If we have serviceId and categoryId, try to add to cart
      if (service.serviceId && service.categoryId) {
        const cartItemData = {
          serviceId: service.serviceId,
          categoryId: service.categoryId,
          title: service.title,
          description: service.subtitle || service.description || '',
          icon: service.image || '',
          category: service.category || 'Service',
          price: parseInt(service.price?.toString().replace(/,/g, '') || 0),
          originalPrice: service.originalPrice ? parseInt(service.originalPrice.toString().replace(/,/g, '')) : null,
          unitPrice: parseInt(service.price?.toString().replace(/,/g, '') || 0),
          serviceCount: 1,
          rating: service.rating || "4.8",
          reviews: service.reviews || "10k+",
          vendorId: service.vendorId || null
        };

        const response = await cartService.addToCart(cartItemData);
        if (response.success) {
          toast.success(`${service.title} added to cart!`);
          // Update cart count
          const updatedCart = await cartService.getCart();
          if (updatedCart.success) {
            setCartCount((updatedCart.data || []).length);
          }
        } else {
          toast.error(response.message || 'Failed to add to cart');
        }
      } else {
        // Fallback: navigate to service page or category
        if (service.slug) {
          navigate(`/user/${service.slug}`);
        } else if (service.targetCategoryId) {
          const cat = categories.find(c => c.id === service.targetCategoryId);
          if (cat) handleCategoryClick(cat);
        } else {
          toast.error('Unable to add this service to cart. Please browse the service page.');
        }
      }
    } catch (error) {
      toast.error('Failed to add to cart. Please try again.');
    }
  };

  const handleReferClick = () => {
    navigate('/user/rewards');
  };


  const handleLocationClick = () => {
    setIsAddressModalOpen(true);
  };

  const handleCartClick = () => {
    // Navigate to cart page
  };


  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div
      className="min-h-screen pb-20"
      style={{
        willChange: 'auto',
        opacity: 1,
        visibility: 'visible',
        background: themeColors.backgroundGradient,
        backgroundColor: '#EBF8FF', // Light blue fallback
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1
      }}
    >
      <div
        className="backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 rounded-b-[20px] shadow-sm transition-all duration-300"
        style={{ backgroundColor: `${themeColors.headerBg}F2` }} // F2 is ~95% opacity
      >
        <Header
          location={address}
          onLocationClick={handleLocationClick}
        />
        <div className="px-4 pb-4 pt-1 max-w-lg mx-auto w-full">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      <main className="pt-6 space-y-8 pb-24 max-w-screen-xl mx-auto w-full">
        {/* Hero Section - Promo Carousel */}
        <section className="relative z-0">
          <Suspense fallback={<div className="h-52 w-full bg-gray-100 animate-pulse rounded-2xl mx-4" />}>
            <PromoCarousel
              promos={(homeContent?.promos || []).sort((a, b) => (a.order || 0) - (b.order || 0)).map(promo => ({
                id: promo.id || promo._id,
                title: promo.title || '',
                subtitle: promo.subtitle || promo.description || '',
                buttonText: promo.buttonText || 'Book now',
                className: promo.gradientClass || 'from-[#00A6A6] to-[#008a8a]',
                image: toAssetUrl(promo.imageUrl),
                targetCategoryId: promo.targetCategoryId,
                slug: promo.slug,
                scrollToSection: promo.scrollToSection,
                route: '/'
              }))}
              onPromoClick={handlePromoClick}
            />
          </Suspense>
        </section>

        {/* Categories Section */}
        <section className="relative overflow-hidden">
          {/* Decorative background for categories */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-transparent pointer-events-none -z-10" />
          <ServiceCategories
            categories={categories}
            onCategoryClick={handleCategoryClick}
            onSeeAllClick={() => { }}
          />
        </section>

        {/* Curated Services */}
        <Suspense fallback={<div className="h-40 bg-gray-50 animate-pulse rounded-xl mx-4" />}>
          <CuratedServices
            services={(homeContent?.curated || []).sort((a, b) => (a.order || 0) - (b.order || 0)).map(item => ({
              id: item.id || item._id,
              title: item.title,
              gif: toAssetUrl(item.gifUrl),
              slug: item.slug,
              targetCategoryId: item.targetCategoryId
            }))}
            onServiceClick={handleServiceClick}
          />
        </Suspense>

        {/* New & Noteworthy */}
        <Suspense fallback={<div className="h-40 bg-gray-50 animate-pulse rounded-xl mx-4" />}>
          <NewAndNoteworthy
            services={(homeContent?.noteworthy || []).sort((a, b) => (a.order || 0) - (b.order || 0)).map(item => ({
              id: item.id || item._id,
              title: item.title,
              image: toAssetUrl(item.imageUrl),
              slug: item.slug,
              targetCategoryId: item.targetCategoryId
            }))}
            onServiceClick={handleServiceClick}
          />
        </Suspense>

        {/* Most Booked */}
        <Suspense fallback={<div className="h-40 bg-gray-50 animate-pulse rounded-xl mx-4" />}>
          <MostBookedServices
            services={(homeContent?.booked || []).sort((a, b) => (a.order || 0) - (b.order || 0)).map(item => ({
              id: item.id || item._id,
              title: item.title,
              rating: item.rating,
              reviews: item.reviews,
              price: item.price,
              originalPrice: item.originalPrice,
              discount: item.discount,
              image: toAssetUrl(item.imageUrl),
              targetCategoryId: item.targetCategoryId,
              slug: item.slug
            }))}
            onServiceClick={handleServiceClick}
            onAddClick={handleAddClick}
          />
        </Suspense>

        {/* Dynamic Banner 1 */}
        <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse rounded-xl mx-4" />}>
          <Banner
            imageUrl={homeContent?.banners?.[0] ? toAssetUrl(homeContent.banners[0].imageUrl) : null}
            onClick={() => {
              const b = homeContent?.banners?.[0];
              if (b?.slug) {
                navigate(`/user/${b.slug}`);
                return;
              }
              if (b?.targetCategoryId) {
                const cat = categories.find(c => c.id === b.targetCategoryId);
                if (cat) handleCategoryClick(cat);
              }
            }}
          />
        </Suspense>

        {/* Dynamic Sections */}
        {(homeContent?.categorySections || []).sort((a, b) => (a.order || 0) - (b.order || 0)).map((section, sIdx) => (
          <Suspense key={section._id || sIdx} fallback={<div className="h-40 bg-gray-50 animate-pulse rounded-xl mx-4" />}>
            <ServiceSectionWithRating
              title={section.title}
              subtitle={section.subtitle}
              services={section.cards?.map((card, cIdx) => {
                const processedImage = toAssetUrl(card.imageUrl);
                return {
                  id: card._id || cIdx,
                  title: card.title,
                  rating: card.rating || "4.8",
                  reviews: card.reviews || "10k+",
                  price: card.price,
                  originalPrice: card.originalPrice,
                  discount: card.discount,
                  image: processedImage,
                  targetCategoryId: card.targetCategoryId,
                  slug: card.slug
                };
              }) || []}
              onSeeAllClick={() => {
                if (section.seeAllSlug) {
                  navigate(`/user/${section.seeAllSlug}`);
                  return;
                }
                if (section.seeAllTargetCategoryId) {
                  const cat = categories.find(c => c.id === section.seeAllTargetCategoryId);
                  if (cat) handleCategoryClick(cat);
                }
              }}
              onServiceClick={(service) => handleServiceClick(service)}
              onAddClick={handleAddClick}
            />
          </Suspense>
        ))}

        {/* Dynamic Banner 2 */}
        <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse rounded-xl mx-4" />}>
          <Banner
            imageUrl={homeContent?.banners?.[1] ? toAssetUrl(homeContent.banners[1].imageUrl) : null}
            onClick={() => {
              const b = homeContent?.banners?.[1];
              if (b?.slug) {
                navigate(`/user/${b.slug}`);
                return;
              }
              if (b?.targetCategoryId) {
                const cat = categories.find(c => c.id === b.targetCategoryId);
                if (cat) handleCategoryClick(cat);
              }
            }}
          />
        </Suspense>

        {/* Refer & Earn Section - Separate but consistent */}
        <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse rounded-xl mx-4" />}>
          <ReferEarnSection onReferClick={handleReferClick} />
        </Suspense>
      </main>

      <BottomNav />




      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        location={address}
        cartCount={cartCount}
      />

      {/* Address Selection Modal */}
      <AddressSelectionModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        houseNumber={houseNumber}
        onHouseNumberChange={setHouseNumber}
        onSave={handleAddressSave}
      />
    </div>
  );
};

export default Home;

