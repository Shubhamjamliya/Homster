import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiSearch,
  FiX,
  FiTool,
  FiPackage,
  FiTag,
  FiInfo,
  FiCheckCircle,
  FiPercent,
  FiHash,
  FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { vendorTheme as themeColors } from '../../../../theme';
import vendorBillService from '../../../../services/vendorBillService';
import { publicCatalogService } from '../../../../services/catalogService';

const PricingPage = () => {
  const navigate = useNavigate();

  // Active Catalog Tab: 'services' | 'parts'
  const [activeTab, setActiveTab] = useState('services');

  // Loading & Data States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [servicesCatalog, setServicesCatalog] = useState([]);
  const [partsCatalog, setPartsCatalog] = useState([]);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');

  // Category Filter States
  const [serviceCategories, setServiceCategories] = useState(['All']);
  const [partCategories, setPartCategories] = useState(['All']);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState('All');
  const [selectedPartCategory, setSelectedPartCategory] = useState('All');

  // Theme Background Effect
  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const bgStyle = themeColors.backgroundGradient || '#f9fafb';

    if (html) html.style.background = bgStyle;
    if (body) body.style.background = bgStyle;
    if (root) root.style.background = bgStyle;

    return () => {
      if (html) html.style.background = '';
      if (body) body.style.background = '';
      if (root) root.style.background = '';
    };
  }, []);

  // Fetch Catalogs
  const fetchCatalogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const [servicesRes, partsRes, catRes] = await Promise.all([
        vendorBillService.getServiceCatalog().catch(() => ({ success: false, services: [] })),
        vendorBillService.getPartsCatalog().catch(() => ({ success: false, parts: [] })),
        publicCatalogService.getCategories().catch(() => ({ success: false, categories: [] }))
      ]);

      const services = servicesRes.services || [];
      const parts = partsRes.parts || [];

      setServicesCatalog(services);
      setPartsCatalog(parts);

      // Extract unique categories
      if (catRes && catRes.success && Array.isArray(catRes.categories)) {
        const apiCats = catRes.categories.map((c) => c.title).filter(Boolean);
        const allCats = ['All', ...apiCats];

        const hasUncategorizedServices = services.some((s) => !s.categoryId?.title);
        const hasUncategorizedParts = parts.some((p) => !p.categoryId?.title);
        if (hasUncategorizedServices || hasUncategorizedParts) {
          allCats.push('Uncategorized');
        }

        const uniqueCats = [...new Set(allCats)];
        setServiceCategories(uniqueCats);
        setPartCategories(uniqueCats);
      } else {
        const sCats = ['All', ...new Set(services.map((s) => s.categoryId?.title || 'Uncategorized'))];
        setServiceCategories(sCats.filter(Boolean));

        const pCats = ['All', ...new Set(parts.map((p) => p.categoryId?.title || 'Uncategorized'))];
        setPartCategories(pCats.filter(Boolean));
      }
    } catch (err) {
      console.error('Error fetching pricing catalog:', err);
      setError('Failed to load pricing catalog. Please try again.');
      toast.error('Failed to load prices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogs();
  }, []);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return servicesCatalog.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const categoryTitle = item.categoryId?.title || 'Uncategorized';
      const matchesCategory =
        selectedServiceCategory === 'All' || categoryTitle === selectedServiceCategory;

      return matchesSearch && matchesCategory;
    });
  }, [servicesCatalog, searchQuery, selectedServiceCategory]);

  // Filtered Parts
  const filteredParts = useMemo(() => {
    return partsCatalog.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.hsnCode && item.hsnCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const categoryTitle = item.categoryId?.title || 'Uncategorized';
      const matchesCategory =
        selectedPartCategory === 'All' || categoryTitle === selectedPartCategory;

      return matchesSearch && matchesCategory;
    });
  }, [partsCatalog, searchQuery, selectedPartCategory]);

  const brandTeal = themeColors?.button || '#347989';

  return (
    <div className="min-h-screen pb-24 bg-gray-50 flex flex-col">
      {/* Sticky Top Header */}
      <div className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
        {/* Navigation Bar */}
        <div className="px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-gray-50 hover:bg-gray-100 active:scale-95 rounded-2xl flex items-center justify-center transition-all border border-gray-200/60"
              aria-label="Back"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-lg font-black text-gray-900 leading-tight">Pricing & Rate Card</h1>
              <p className="text-[11px] font-medium text-gray-500">
                Official billing prices for services and spare parts
              </p>
            </div>
          </div>

          <button
            onClick={fetchCatalogs}
            className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
            title="Refresh Prices"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tab Switcher (Services vs Spare Parts) - Matching Billing Time */}
        <div className="px-4 pt-1 pb-3">
          <div className="bg-gray-100 p-1 rounded-2xl flex items-center border border-gray-200/60 shadow-inner">
            <button
              onClick={() => {
                setActiveTab('services');
                setSearchQuery('');
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'services'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <FiTool className={activeTab === 'services' ? 'text-teal-700' : 'text-gray-400'} />
              <span>Services</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black tracking-tight ${
                  activeTab === 'services'
                    ? 'bg-teal-50 text-teal-700'
                    : 'bg-gray-200/70 text-gray-600'
                }`}
                style={activeTab === 'services' ? { backgroundColor: `${brandTeal}15`, color: brandTeal } : {}}
              >
                {servicesCatalog.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('parts');
                setSearchQuery('');
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'parts'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <FiPackage className={activeTab === 'parts' ? 'text-orange-600' : 'text-gray-400'} />
              <span>Spare Parts</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black tracking-tight ${
                  activeTab === 'parts'
                    ? 'bg-orange-50 text-orange-700'
                    : 'bg-gray-200/70 text-gray-600'
                }`}
              >
                {partsCatalog.length}
              </span>
            </button>
          </div>
        </div>

        {/* Search Bar - Exactly matching Billing Time UX */}
        <div className="px-4 pb-2.5">
          <div className="relative">
            <input
              type="text"
              placeholder={activeTab === 'services' ? 'Search for a service...' : 'Search for parts...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-gray-100 pl-10 pr-9 py-2.5 rounded-xl text-sm font-medium outline-none transition-all text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-2 ${
                activeTab === 'services'
                  ? 'focus:ring-teal-500/20 focus:border-teal-500'
                  : 'focus:ring-orange-500/20 focus:border-orange-500'
              } border border-transparent`}
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <FiSearch className="w-4 h-4" />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills (Horizontal Scrollable) */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide border-t border-gray-100/80">
          {(activeTab === 'services' ? serviceCategories : partCategories).map((cat) => {
            const isSelected =
              activeTab === 'services'
                ? selectedServiceCategory === cat
                : selectedPartCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => {
                  if (activeTab === 'services') setSelectedServiceCategory(cat);
                  else setSelectedPartCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                  isSelected
                    ? activeTab === 'services'
                      ? 'text-white shadow-xs'
                      : 'bg-orange-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80'
                }`}
                style={
                  isSelected && activeTab === 'services'
                    ? { backgroundColor: brandTeal }
                    : {}
                }
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-3 flex-1">
        {/* Rate Card Guidance Banner */}
        <div className="bg-blue-50/80 border border-blue-100/90 rounded-2xl p-3 flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
            <FiInfo className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs text-blue-900 leading-snug">
            <span className="font-extrabold block mb-0.5">Standard Homster Billing Rates</span>
            These fixed catalog rates are automatically pulled during job completion and final invoice generation.
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs animate-pulse flex justify-between items-center"
              >
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-1/3 bg-gray-100 rounded" />
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-xs space-y-4 my-8">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <FiX className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Failed to Load Catalog</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">{error}</p>
            </div>
            <button
              onClick={fetchCatalogs}
              className="px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
              style={{ backgroundColor: brandTeal }}
            >
              Try Again
            </button>
          </div>
        ) : activeTab === 'services' ? (
          /* Services Catalog List */
          filteredServices.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-xs space-y-3 my-6">
              <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
                <FiTool className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-800">No Services Found</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                {searchQuery
                  ? `No service matches "${searchQuery}". Try a different keyword.`
                  : 'No services are currently listed in this category.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            filteredServices.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-2xl border border-gray-150 bg-white shadow-xs hover:shadow-md transition-all flex justify-between items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-base text-gray-900 mb-1 leading-tight break-words">
                    {item.name}
                  </h4>

                  {item.description && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.categoryId?.title && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold">
                        {item.categoryId.title}
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 font-semibold flex items-center gap-1">
                      <FiCheckCircle className="w-3 h-3 text-teal-600" /> Fixed Labor
                    </span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex flex-col items-end shrink-0">
                  <div
                    className="px-3 py-1.5 rounded-xl font-black text-base shadow-xs text-white"
                    style={{
                      background: `linear-gradient(135deg, ${brandTeal}, #235863)`
                    }}
                  >
                    ₹{item.price}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                    Standard Rate
                  </span>
                </div>
              </div>
            ))
          )
        ) : (
          /* Spare Parts Catalog List */
          filteredParts.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-xs space-y-3 my-6">
              <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
                <FiPackage className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-800">No Parts Found</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                {searchQuery
                  ? `No spare part matches "${searchQuery}". Try a different keyword or HSN code.`
                  : 'No spare parts are currently listed in this category.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            filteredParts.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-2xl border border-gray-150 bg-white shadow-xs hover:shadow-md transition-all flex justify-between items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-base text-gray-900 mb-1 leading-tight break-words">
                    {item.name}
                  </h4>

                  {item.description && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.categoryId?.title && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold">
                        {item.categoryId.title}
                      </span>
                    )}

                    {item.hsnCode && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold flex items-center gap-0.5">
                        <FiHash className="w-2.5 h-2.5" /> HSN: {item.hsnCode}
                      </span>
                    )}

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 font-semibold flex items-center gap-0.5">
                      <FiPercent className="w-2.5 h-2.5 text-orange-600" />
                      {item.gstPercentage ? `${item.gstPercentage}% GST` : '18% GST'}
                    </span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex flex-col items-end shrink-0">
                  <div className="px-3 py-1.5 rounded-xl font-black text-base shadow-xs text-white bg-gradient-to-r from-orange-500 to-amber-600">
                    ₹{item.price}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                    Base Price
                  </span>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* Footer Meta Count */}
      {!loading && !error && (
        <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
          <span>
            Showing{' '}
            <strong className="text-gray-900">
              {activeTab === 'services' ? filteredServices.length : filteredParts.length}
            </strong>{' '}
            {activeTab === 'services' ? 'services' : 'parts'}
          </span>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-teal-700 font-bold hover:underline"
          >
            Back to Top ↑
          </button>
        </div>
      )}
    </div>
  );
};

export default PricingPage;
