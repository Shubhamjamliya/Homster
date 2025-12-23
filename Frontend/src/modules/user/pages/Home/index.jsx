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
// Lazy load more heavy components
const BannerWithRefer = lazy(() => import('./components/BannerWithRefer'));
import ACApplianceModal from './components/ACApplianceModal';
import CategoryModal from './components/CategoryModal';

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
  const [address] = useState('New Palasia- Indore- Madhya Pradesh...');
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
          console.error('Error loading cart count:', error);
          setCartCount(0);
        }
      }
    };

    loadCartCount();
    // Refresh cart count every 10 seconds
    const interval = setInterval(loadCartCount, 10000);
    return () => clearInterval(interval);
  }, []);
  const [isACModalOpen, setIsACModalOpen] = useState(false);
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

        if (categoriesRes.success) {
          // Map API response to component format
          const mappedCategories = categoriesRes.categories.map(cat => ({
            id: cat.id,
            title: cat.title,
            slug: cat.slug,
            icon: toAssetUrl(cat.icon),
            hasSaleBadge: cat.hasSaleBadge,
            badge: cat.badge
          }));
          setCategories(mappedCategories);
        }

        if (homeContentRes.success) {
          setHomeContent(homeContentRes.homeContent);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load content. Please refresh the page.');
      } finally {
        setLoading(false);
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
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
    }
  };

  const handleReferClick = () => {
    navigate('/user/rewards');
  };


  const handleLocationClick = () => {
    // Open location selector modal
  };

  const handleCartClick = () => {
    // Navigate to cart page
  };


  return (
    <div
      className="min-h-screen pb-20"
      style={{
        willChange: 'auto',
        opacity: 1,
        visibility: 'visible',
        background: 'linear-gradient(to bottom, rgba(0, 166, 166, 0.03) 0%, rgba(41, 173, 129, 0.02) 10%, #ffffff 20%)',
        backgroundColor: '#ffffff',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1
      }}
    >
      <Header
        location={address}
        onLocationClick={handleLocationClick}
      />

      <main className="pt-0">
        {/* Complete Gradient Section: Header continuation, Search, Categories, and Carousel */}
        <div
          className="relative overflow-hidden"
          style={{
            background: themeColors.gradient
          }}
        >
          {/* Gradient overlay for depth */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.3), transparent 70%)'
            }}
          />

          <div className="relative z-10">
            <SearchBar
              onSearch={handleSearch}
            />

            <ServiceCategories
              categories={categories}
              onCategoryClick={handleCategoryClick}
              onSeeAllClick={() => { }}
            />

            <Suspense fallback={<div className="h-48" />}>
              <PromoCarousel
                promos={(homeContent?.promos || []).sort((a, b) => (a.order || 0) - (b.order || 0)).map(promo => ({
                  id: promo.id || promo._id,
                  title: promo.title || '',
                  subtitle: promo.subtitle || promo.description || '',
                  buttonText: promo.buttonText || 'Book now',
                  className: promo.gradientClass || 'from-blue-600 to-blue-800',
                  image: toAssetUrl(promo.imageUrl),
                  targetCategoryId: promo.targetCategoryId,
                  scrollToSection: promo.scrollToSection,
                  route: '/'
                }))}
                onPromoClick={handlePromoClick}
              />
            </Suspense>
          </div>
        </div>

        <Suspense fallback={<div className="h-32" />}>
          <CuratedServices
            services={(homeContent?.curated || []).sort((a, b) => (a.order || 0) - (b.order || 0)).map(item => ({
              id: item.id || item._id,
              title: item.title,
              gif: toAssetUrl(item.gifUrl)
            }))}
            onServiceClick={handleServiceClick}
          />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
          <NewAndNoteworthy
            services={(homeContent?.noteworthy || []).sort((a, b) => (a.order || 0) - (b.order || 0)).map(item => ({
              id: item.id || item._id,
              title: item.title,
              image: toAssetUrl(item.imageUrl)
            }))}
            onServiceClick={handleServiceClick}
          />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
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
              targetCategoryId: item.targetCategoryId
            }))}
            onServiceClick={handleServiceClick}
            onAddClick={handleAddClick}
          />
        </Suspense>

        {/* Dynamic Banner 1 from Backend - Moved after Most Booked Services */}
        <Suspense fallback={<div className="h-32" />}>
          <Banner
            imageUrl={homeContent?.banners?.[0] ? toAssetUrl(homeContent.banners[0].imageUrl) : null}
            onClick={() => {
              const b = homeContent?.banners?.[0];
              if (b?.targetCategoryId) {
                const cat = categories.find(c => c.id === b.targetCategoryId);
                if (cat) handleCategoryClick(cat);
              }
            }}
          />
        </Suspense>

        {/* Dynamic Category Sections from Backend */}
        {(homeContent?.categorySections || []).sort((a, b) => (a.order || 0) - (b.order || 0)).map((section, sIdx) => (
          <Suspense key={section._id || sIdx} fallback={<div className="h-32" />}>
            <ServiceSectionWithRating
              title={section.title}
              subtitle={section.subtitle}
              services={section.cards?.map((card, cIdx) => {
                const processedImage = toAssetUrl(card.imageUrl);
                console.log(`Service ${card.title}: original=${card.imageUrl}, processed=${processedImage}`);
                return {
                  id: card._id || cIdx,
                  title: card.title,
                  rating: card.rating || "4.8",
                  reviews: card.reviews || "10k+",
                  price: card.price || "Contact for price",
                  image: processedImage,
                  targetCategoryId: card.targetCategoryId
                };
              }) || []}
              onSeeAllClick={section.seeAllTargetCategoryId ? () => {
                const cat = categories.find(c => c.id === section.seeAllTargetCategoryId);
                if (cat) handleCategoryClick(cat);
              } : null}
              onServiceClick={(service) => {
                if (service.targetCategoryId) {
                  const cat = categories.find(c => c.id === service.targetCategoryId);
                  if (cat) handleCategoryClick(cat);
                } else {
                  handleServiceClick(service);
                }
              }}
              onAddClick={handleAddClick}
            />
          </Suspense>
        ))}





        {/* Dynamic Banner 2 from Backend */}
        <Suspense fallback={<div className="h-32" />}>
          <BannerWithRefer
            imageUrl={homeContent?.banners?.[1] ? toAssetUrl(homeContent.banners[1].imageUrl) : null}
            onBannerClick={() => {
              const b = homeContent?.banners?.[1];
              if (b?.targetCategoryId) {
                const cat = categories.find(c => c.id === b.targetCategoryId);
                if (cat) handleCategoryClick(cat);
              }
            }}
            onReferClick={handleReferClick}
          />
        </Suspense>
      </main>

      <BottomNav />

      {/* AC & Appliance Repair Modal */}
      <ACApplianceModal
        isOpen={isACModalOpen}
        onClose={() => setIsACModalOpen(false)}
        location={address}
        cartCount={cartCount}
      />


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
    </div>
  );
};

export default Home;

