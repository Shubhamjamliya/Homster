import React, { useEffect, useState } from "react";
import { FiGrid, FiPlus, FiEdit2, FiTrash2, FiSave, FiImage, FiLayers, FiPackage, FiX, FiStar, FiCreditCard } from "react-icons/fi";
import { toast } from "react-hot-toast";
import CardShell from "../components/CardShell";
import Modal from "../components/Modal";
import { ensureIds, saveCatalog, slugify, toAssetUrl } from "../utils";
import { serviceService, categoryService } from "../../../../../services/catalogService";

const ServicesPage = ({ catalog, setCatalog }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const services = catalog.services || [];
  const categories = catalog.categories || [];
  const [editingId, setEditingId] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || "");
  const selectedService = services.find((s) => s.id === selectedServiceId);
  const [uploadingServiceIcon, setUploadingServiceIcon] = useState(false);
  const [uploadingBannerImage, setUploadingBannerImage] = useState(null);
  const [uploadingOfferIcon, setUploadingOfferIcon] = useState(null);
  const [uploadingCategoryImage, setUploadingCategoryImage] = useState(null);

  // UI State
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Filter services based on selected category
  const filteredServices = selectedCategoryFilter === "all"
    ? services
    : services.filter(s => {
      // Check both categoryId (legacy) and categoryIds (array)
      if (s.categoryIds && s.categoryIds.length > 0) {
        return s.categoryIds.includes(selectedCategoryFilter);
      }
      return s.categoryId === selectedCategoryFilter;
    });

  // Fetch services and categories from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true);
        // Fetch both services and categories in parallel for efficiency
        const [servicesRes, categoriesRes] = await Promise.all([
          serviceService.getAll({ status: 'active' }),
          categoryService.getAll({ status: 'active' })
        ]);

        let mappedServices = [];
        let mappedCategories = [];

        if (servicesRes.success) {
          mappedServices = servicesRes.services.map((svc) => ({
            id: svc.id,
            title: svc.title,
            slug: svc.slug,
            categoryIds: (svc.categoryIds || []).map(id => id.toString()),
            categoryTitles: svc.categoryTitles || [],
            categoryId: svc.categoryId || (svc.categoryIds && svc.categoryIds.length > 0 ? svc.categoryIds[0] : null),
            iconUrl: svc.iconUrl || "",
            badge: svc.badge || "",
            routePath: svc.routePath || `/user/${svc.slug}`,
            page: svc.page || {},
            sections: svc.sections || [],
          }));
        }

        if (categoriesRes.success) {
          mappedCategories = categoriesRes.categories.map(cat => ({
            id: (cat.id || cat._id)?.toString() || "",
            title: cat.title,
            slug: cat.slug
          }));
        }

        setCatalog(prev => {
          const next = { ...prev, services: mappedServices, categories: mappedCategories };
          saveCatalog(next);
          return next;
        });

        if (mappedServices.length > 0 && !selectedServiceId) {
          setSelectedServiceId(mappedServices[0].id);
        }

      } catch (error) {
        console.error('Failed to fetch catalog data:', error);
        console.error('Error details:', error.response?.data || error.message);
        toast.error(`Failed to load services or categories: ${error.response?.data?.message || error.message}`);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [form, setForm] = useState({
    title: "",
    iconUrl: "",
    badge: "",
    categoryIds: [],
  });
  const [pageForm, setPageForm] = useState({
    ratingTitle: "",
    ratingValue: "",
    bookingsText: "",
    paymentOffersEnabled: true,
    paymentOffers: [],
    banners: [],
    serviceCategoriesGrid: [],
  });

  // Modal states for page content sections
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState({ imageUrl: '', text: '' });
  const [editingBannerId, setEditingBannerId] = useState(null);

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState({ title: '', discount: '', code: '', description: '', iconUrl: '' });
  const [editingOfferId, setEditingOfferId] = useState(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ title: '', imageUrl: '', badge: '' });
  const [editingCategoryId, setEditingCategoryId] = useState(null);





  useEffect(() => {
    if (!editingId) {
      setForm({
        title: "",
        iconUrl: "",
        badge: "",
        categoryIds: [],
      });
      return;
    }
    const service = services.find((s) => s.id === editingId);
    if (!service) return;
    const safe = ensureIds({ ...catalog, services: [service] }).services[0];
    setForm({
      title: safe.title || "",
      iconUrl: safe.iconUrl || "",
      badge: safe.badge || "",
      categoryIds: safe.categoryIds || (safe.categoryId ? [safe.categoryId] : []),
    });
  }, [editingId, services, categories]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select first service when filter changes if current selection is invalid
  useEffect(() => {
    if (filteredServices.length > 0) {
      const currentExists = filteredServices.find(s => s.id === selectedServiceId);
      if (!currentExists) {
        setSelectedServiceId(filteredServices[0].id);
      }
    } else {
      setSelectedServiceId("");
    }
  }, [selectedCategoryFilter, filteredServices]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch full service details when selectedServiceId changes
  useEffect(() => {
    const loadServiceDetails = async () => {
      if (!selectedServiceId) {
        setPageForm({
          ratingTitle: "",
          ratingValue: "",
          bookingsText: "",
          paymentOffersEnabled: true,
          paymentOffers: [],
          banners: [],
          serviceCategoriesGrid: [],
        });
        return;
      }

      // Find current selected service
      const currentSvc = services.find(s => s.id === selectedServiceId);

      // Helper to ensure page items have IDs
      const ensureItemIds = (items, prefix) => {
        return (Array.isArray(items) ? items : []).map(item => ({
          ...item,
          id: item.id || `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
        }));
      };

      // If it's a local service or already has sections, just update pageForm and skip fetch
      if (selectedServiceId.startsWith('usvc-') || (currentSvc && currentSvc.sections && currentSvc.sections.length > 0)) {
        if (currentSvc) {
          const servicePage = currentSvc.page || {};
          setPageForm({
            ratingTitle: servicePage.ratingTitle || currentSvc.title || "",
            ratingValue: servicePage.ratingValue || "",
            bookingsText: servicePage.bookingsText || "",
            paymentOffersEnabled: servicePage.paymentOffersEnabled !== false,
            paymentOffers: ensureItemIds(servicePage.paymentOffers, 'uoff'),
            banners: ensureItemIds(servicePage.banners, 'ubnr'),
            serviceCategoriesGrid: ensureItemIds(servicePage.serviceCategoriesGrid, 'ugrd'),
          });
        }
        return;
      }

      try {
        const response = await serviceService.getById(selectedServiceId);
        if (response.success && response.service) {
          const svc = response.service;
          const servicePage = svc.page || {};

          // Ensure IDs before setting state or saving to catalog
          const pageWithIds = {
            ...servicePage,
            paymentOffers: ensureItemIds(servicePage.paymentOffers, 'uoff'),
            banners: ensureItemIds(servicePage.banners, 'ubnr'),
            serviceCategoriesGrid: ensureItemIds(servicePage.serviceCategoriesGrid, 'ugrd'),
          };

          setCatalog(prev => {
            const updatedServices = (prev.services || []).map((s) =>
              s.id === selectedServiceId ? { ...s, page: pageWithIds, sections: svc.sections || [] } : s
            );
            const next = { ...prev, services: updatedServices };
            saveCatalog(next);
            return next;
          });

          setPageForm({
            ratingTitle: servicePage.ratingTitle || svc.title || "",
            ratingValue: servicePage.ratingValue || "",
            bookingsText: servicePage.bookingsText || "",
            paymentOffersEnabled: servicePage.paymentOffersEnabled !== false,
            paymentOffers: pageWithIds.paymentOffers,
            banners: pageWithIds.banners,
            serviceCategoriesGrid: pageWithIds.serviceCategoriesGrid,
          });
        }
      } catch (error) {
        console.error('Failed to load service details:', error);
      }
    };

    loadServiceDetails();
  }, [selectedServiceId]); // eslint-disable-line react-hooks/exhaustive-deps

  const [isModalOpen, setIsModalOpen] = useState(false);

  const reset = () => {
    setEditingId(null);
    setForm({
      title: "",
      iconUrl: "",
      badge: "",
      categoryIds: [],
    });
    setIsModalOpen(false);
  };

  const upsert = async () => {
    const title = form.title.trim();
    if (!title) {
      toast.error("Service title required");
      return;
    }
    if (form.categoryIds.length === 0) {
      toast.error("Select at least one category");
      return;
    }

    const slug = slugify(title);
    const iconUrl = form.iconUrl.trim();
    const badge = form.badge.trim();
    const categoryIds = form.categoryIds;

    try {
      setLoading(true);

      // Get existing service data if updating
      const existingService = editingId && !editingId.startsWith('usvc-') ?
        services.find(s => s.id === editingId) : null;

      const serviceData = {
        title,
        slug,
        categoryIds,
        iconUrl: iconUrl || null,
        badge: badge || null,
        basePrice: 0,
        page: existingService?.page || {
          banners: [],
          ratingTitle: title,
          ratingValue: "",
          bookingsText: "",
          paymentOffersEnabled: true,
          paymentOffers: [],
          serviceCategoriesGrid: []
        },
        sections: existingService?.sections || []
      };

      let savedService;
      if (editingId && editingId.startsWith('usvc-')) {
        // This is a local ID, create new in backend
        const response = await serviceService.create(serviceData);
        if (response.success) {
          savedService = {
            id: response.service.id,
            title: response.service.title,
            slug: response.service.slug,
            categoryIds: response.service.categoryIds || (response.service.categoryId ? [response.service.categoryId] : []),
            categoryTitles: response.service.categoryTitles || (response.service.categoryTitle ? [response.service.categoryTitle] : []),
            iconUrl: response.service.iconUrl || "",
            badge: response.service.badge || "",
            routePath: response.service.routePath || `/user/${response.service.slug}`,
            page: response.service.page || serviceData.page,
            sections: response.service.sections || []
          };
        } else {
          throw new Error(response.message || 'Failed to create service');
        }
      } else if (editingId) {
        // Update existing service in backend
        const response = await serviceService.update(editingId, serviceData);
        if (response.success) {
          savedService = {
            id: response.service.id,
            title: response.service.title,
            slug: response.service.slug,
            categoryIds: response.service.categoryIds || (response.service.categoryId ? [response.service.categoryId] : []),
            categoryTitles: response.service.categoryTitles || (response.service.categoryTitle ? [response.service.categoryTitle] : []),
            iconUrl: response.service.iconUrl || "",
            badge: response.service.badge || "",
            routePath: response.service.routePath || `/user/${response.service.slug}`,
            page: response.service.page || serviceData.page,
            sections: response.service.sections || []
          };
        } else {
          throw new Error(response.message || 'Failed to update service');
        }
      } else {
        // Create new service
        const response = await serviceService.create(serviceData);
        if (response.success) {
          savedService = {
            id: response.service.id,
            title: response.service.title,
            slug: response.service.slug,
            categoryIds: response.service.categoryIds || (response.service.categoryId ? [response.service.categoryId] : []),
            categoryTitles: response.service.categoryTitles || (response.service.categoryTitle ? [response.service.categoryTitle] : []),
            iconUrl: response.service.iconUrl || "",
            badge: response.service.badge || "",
            routePath: response.service.routePath || `/user/${response.service.slug}`,
            page: response.service.page || serviceData.page,
            sections: response.service.sections || []
          };
        } else {
          throw new Error(response.message || 'Failed to create service');
        }
      }

      // Update local state
      const next = ensureIds(catalog);
      const exists = next.services.find((s) => s.id === editingId || s.id === savedService.id);

      if (exists && editingId) {
        // Update existing
        next.services = next.services.map((s) =>
          (s.id === editingId || s.id === savedService.id) ? savedService : s
        );
      } else {
        // Add new
        next.services = [...next.services, savedService];
      }

      setCatalog(next);
      saveCatalog(next);
      window.dispatchEvent(new Event("adminUserAppCatalogUpdated"));
      toast.success(editingId ? "Service updated successfully" : "Service created successfully");
      reset();
    } catch (error) {
      console.error('Upsert service error:', error);
      toast.error(error.message || 'Failed to save service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this service?")) return;

    // If it's a local ID (starts with usvc-), just remove from local state
    if (id.startsWith('usvc-')) {
      const next = ensureIds(catalog);
      next.services = next.services.filter((s) => s.id !== id);
      setCatalog(next);
      saveCatalog(next);
      window.dispatchEvent(new Event("adminUserAppCatalogUpdated"));
      if (editingId === id) reset();
      if (selectedServiceId === id) setSelectedServiceId(services.find((s) => s.id !== id)?.id || "");
      return;
    }

    try {
      setLoading(true);
      const response = await serviceService.delete(id);

      if (response.success) {
        // Remove from local state
        const next = ensureIds(catalog);
        next.services = next.services.filter((s) => s.id !== id);
        setCatalog(next);
        saveCatalog(next);
        window.dispatchEvent(new Event("adminUserAppCatalogUpdated"));
        if (editingId === id) reset();
        if (selectedServiceId === id) setSelectedServiceId(services.find((s) => s.id !== id)?.id || "");
        toast.success("Service deleted successfully");
      } else {
        throw new Error(response.message || 'Failed to delete service');
      }
    } catch (error) {
      console.error('Delete service error:', error);
      toast.error(error.message || 'Failed to delete service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const savePageContent = async () => {
    if (!selectedService) {
      toast.error("Select a service first");
      return;
    }

    if (selectedServiceId.startsWith('usvc-')) {
      // Local service, save to local state only
      const next = ensureIds(catalog);
      next.services = next.services.map((s) =>
        s.id === selectedServiceId
          ? {
            ...s,
            page: {
              ...s.page,
              ratingTitle: pageForm.ratingTitle.trim(),
              ratingValue: pageForm.ratingValue.trim(),
              bookingsText: pageForm.bookingsText.trim(),
              paymentOffersEnabled: Boolean(pageForm.paymentOffersEnabled),
              paymentOffers: pageForm.paymentOffers,
              banners: pageForm.banners,
              serviceCategoriesGrid: pageForm.serviceCategoriesGrid,
            },
          }
          : s
      );
      setCatalog(next);
      saveCatalog(next);
      window.dispatchEvent(new Event("adminUserAppCatalogUpdated"));
      toast.success("Page content saved!");
      return;
    }

    try {
      setLoading(true);
      const pageData = {
        ratingTitle: pageForm.ratingTitle.trim(),
        ratingValue: pageForm.ratingValue.trim(),
        bookingsText: pageForm.bookingsText.trim(),
        paymentOffersEnabled: Boolean(pageForm.paymentOffersEnabled),
        paymentOffers: pageForm.paymentOffers,
        banners: pageForm.banners,
        serviceCategoriesGrid: pageForm.serviceCategoriesGrid,
      };

      const response = await serviceService.updatePage(selectedServiceId, pageData);

      if (response.success) {
        // Update local state
        const next = ensureIds(catalog);
        next.services = next.services.map((s) =>
          s.id === selectedServiceId
            ? {
              ...s,
              page: response.service.page || pageData,
            }
            : s
        );
        setCatalog(next);
        saveCatalog(next);
        window.dispatchEvent(new Event("adminUserAppCatalogUpdated"));
        toast.success("Page content saved!");
      } else {
        throw new Error(response.message || 'Failed to save page content');
      }
    } catch (error) {
      console.error('Save page content error:', error);
      toast.error(error.message || 'Failed to save page content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Banner Handlers ---
  const openAddBanner = () => {
    setEditingBannerId(null);
    setCurrentBanner({ imageUrl: '', text: '' });
    setIsBannerModalOpen(true);
  };

  const openEditBanner = (banner) => {
    setEditingBannerId(banner.id);
    setCurrentBanner({ imageUrl: banner.imageUrl || '', text: banner.text || '' });
    setIsBannerModalOpen(true);
  };

  const saveBanner = () => {
    if (editingBannerId) {
      setPageForm(p => ({
        ...p,
        banners: p.banners.map(b => b.id === editingBannerId ? { ...b, ...currentBanner } : b)
      }));
    } else {
      setPageForm(p => ({
        ...p,
        banners: [...p.banners, { id: `ubnr-${Date.now()}`, ...currentBanner }]
      }));
    }
    setIsBannerModalOpen(false);
  };

  const removeBanner = (id) => {
    setPageForm((p) => ({ ...p, banners: p.banners.filter((b) => b.id !== id) }));
  };

  // --- Service Category Handlers ---
  const openAddCategory = () => {
    setEditingCategoryId(null);
    setCurrentCategory({ title: '', imageUrl: '', badge: '' });
    setIsCategoryModalOpen(true);
  };

  const openEditCategory = (cat) => {
    setEditingCategoryId(cat.id);
    setCurrentCategory({ title: cat.title || '', imageUrl: cat.imageUrl || '', badge: cat.badge || '' });
    setIsCategoryModalOpen(true);
  };

  const saveCategory = () => {
    if (editingCategoryId) {
      setPageForm(p => ({
        ...p,
        serviceCategoriesGrid: p.serviceCategoriesGrid.map(c => c.id === editingCategoryId ? { ...c, ...currentCategory } : c)
      }));
    } else {
      setPageForm(p => ({
        ...p,
        serviceCategoriesGrid: [...p.serviceCategoriesGrid, { id: `ugrd-${Date.now()}`, ...currentCategory }]
      }));
    }
    setIsCategoryModalOpen(false);
  };

  const removeServiceCategory = (id) => {
    setPageForm((p) => ({ ...p, serviceCategoriesGrid: p.serviceCategoriesGrid.filter((g) => g.id !== id) }));
  };

  // --- Payment Offer Handlers ---
  const openAddOffer = () => {
    setEditingOfferId(null);
    setCurrentOffer({ title: '', discount: '', code: '', description: '', iconUrl: '' });
    setIsOfferModalOpen(true);
  };

  const openEditOffer = (offer) => {
    setEditingOfferId(offer.id);
    setCurrentOffer({
      title: offer.title || '',
      discount: offer.discount || '',
      code: offer.code || '',
      description: offer.description || '',
      iconUrl: offer.iconUrl || ''
    });
    setIsOfferModalOpen(true);
  };

  const saveOffer = () => {
    if (editingOfferId) {
      setPageForm(p => ({
        ...p,
        paymentOffers: p.paymentOffers.map(o => o.id === editingOfferId ? { ...o, ...currentOffer } : o)
      }));
    } else {
      setPageForm(p => ({
        ...p,
        paymentOffers: [...p.paymentOffers, { id: `uoff-${Date.now()}`, ...currentOffer }]
      }));
    }
    setIsOfferModalOpen(false);
  };

  const removePaymentOffer = (id) => {
    setPageForm((p) => ({ ...p, paymentOffers: p.paymentOffers.filter((o) => o.id !== id) }));
  };



  return (
    <div className="space-y-8">
      <CardShell icon={FiGrid} title={`Services (${services.length})`}>
        {fetching && (
          <div className="text-center py-4 text-gray-500">Loading services...</div>
        )}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">{services.length} services</div>
          <button
            onClick={() => {
              reset();
              setIsModalOpen(true);
            }}
            className="px-4 py-2 text-white rounded-lg font-semibold transition-all flex items-center gap-2 shadow-md hover:shadow-lg relative z-10"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#2874F0',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1e5fd4'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2874F0'}
          >
            <FiPlus className="w-4 h-4" style={{ display: 'block', color: '#ffffff' }} />
            <span>Add Service</span>
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <label className="block text-sm font-bold text-gray-700 mb-2">Filter by Category</label>
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium text-gray-700 shadow-sm appearance-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            <div className="text-sm text-gray-500 whitespace-nowrap px-2">
              Showing <strong>{filteredServices.length}</strong> of <strong>{services.length}</strong> services
            </div>
          </div>
        </div>

        {fetching ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500 font-medium">Loading services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">No services found for this category</p>
            {selectedCategoryFilter !== "all" && (
              <button
                onClick={() => setSelectedCategoryFilter("all")}
                className="mt-2 text-primary-600 font-semibold text-sm hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-12">#</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-20">Icon</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Categories</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Badge</th>
                  <th className="text-center py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Sections</th>
                  <th className="text-center py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredServices.map((s, idx) => {
                  const category = categories.find((c) => c.id === s.categoryId);
                  return (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm font-semibold text-gray-600">{idx + 1}</td>
                      <td className="py-4 px-4">
                        {s.iconUrl ? (
                          <img src={toAssetUrl(s.iconUrl)} alt={s.title} className="h-12 w-12 object-cover rounded-lg border border-gray-200" />
                        ) : (
                          <div className="h-12 w-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-400">No icon</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900">{s.title || "Untitled"}</div>
                        <div className="text-xs text-gray-500 mt-1">{s.routePath || "—"}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(s.categoryIds && s.categoryIds.length > 0) ? (
                            s.categoryIds.map(catId => {
                              const cat = categories.find(c => c.id === catId);
                              return cat ? (
                                <span key={catId} className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded text-[10px] font-bold border border-primary-100">
                                  {cat.title}
                                </span>
                              ) : null;
                            })
                          ) : s.categoryId ? (
                            (() => {
                              const cat = categories.find(c => c.id === s.categoryId);
                              return cat ? (
                                <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded text-[10px] font-bold border border-primary-100">
                                  {cat.title}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">Unknown Category</span>
                              );
                            })()
                          ) : (
                            <span className="text-gray-400 italic">No Categories</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {s.badge ? (
                          <span className="inline-block px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded">{s.badge}</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-block px-3 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded">
                          {(s.sections || []).length}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingId(s.id);
                              setIsModalOpen(true);
                            }}
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => remove(s.id)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardShell>

      {services.length > 0 && (
        <CardShell icon={FiLayers} title="Page Content">
          <div className="space-y-5">
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">
                Select Service to Edit Content
                {selectedCategoryFilter !== "all" && <span className="text-sm font-normal text-gray-500 ml-2">(Filtered by selected category)</span>}
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
              >
                {filteredServices.length > 0 ? (
                  filteredServices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title || "Untitled"}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No services available in this category</option>
                )}
              </select>
            </div>

            {selectedService && (
              <>
                <div className="border-t border-gray-200 pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FiImage className="w-5 h-5 text-primary-600" />
                      <div className="text-xl font-bold text-gray-900">Banners ({pageForm.banners.length})</div>
                    </div>
                    <button
                      onClick={openAddBanner}
                      className="px-4 py-2 rounded-xl text-white transition-all flex items-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'linear-gradient(to right, #2874F0, #1e5fd4)',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <FiPlus className="w-4 h-4" style={{ display: 'block', color: '#ffffff' }} />
                      <span>Add Banner</span>
                    </button>
                  </div>
                  {pageForm.banners.length === 0 ? (
                    <div className="text-base text-gray-500 text-center py-4 border border-gray-200 rounded-lg">No banners yet</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 w-12">#</th>
                            <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 w-24">Image</th>
                            <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Text</th>
                            <th className="text-center py-3 px-4 text-sm font-bold text-gray-700 w-32">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pageForm.banners.map((banner, idx) => (
                            <tr key={banner.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-4 text-sm font-semibold text-gray-600">{idx + 1}</td>
                              <td className="py-4 px-4">
                                {banner.imageUrl ? (
                                  <img src={toAssetUrl(banner.imageUrl)} alt="Banner" className="h-12 w-20 object-cover rounded border border-gray-200" />
                                ) : (
                                  <div className="h-12 w-20 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                    <span className="text-xs text-gray-400">No Img</span>
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <div className="text-sm text-gray-800">{banner.text || "—"}</div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => openEditBanner(banner)}
                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                    title="Edit"
                                  >
                                    <FiEdit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => removeBanner(banner.id)}
                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                    title="Remove"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-5">
                  <div className="flex items-center gap-2 mb-4">
                    <FiStar className="w-5 h-5 text-primary-600" />
                    <div className="text-xl font-bold text-gray-900">Rating Section</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-base font-bold text-gray-900 mb-2">Rating Title</label>
                      <input
                        value={pageForm.ratingTitle}
                        onChange={(e) => setPageForm((p) => ({ ...p, ratingTitle: e.target.value }))}
                        placeholder="e.g. Electrician"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-bold text-gray-900 mb-2">Rating Value</label>
                      <input
                        value={pageForm.ratingValue}
                        onChange={(e) => setPageForm((p) => ({ ...p, ratingValue: e.target.value }))}
                        placeholder="e.g. 4.8"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-bold text-gray-900 mb-2">Bookings Text</label>
                      <input
                        value={pageForm.bookingsText}
                        onChange={(e) => setPageForm((p) => ({ ...p, bookingsText: e.target.value }))}
                        placeholder="e.g. 50K+ Bookings"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <input
                      id="paymentOffersEnabled"
                      type="checkbox"
                      checked={pageForm.paymentOffersEnabled}
                      onChange={(e) => setPageForm((p) => ({ ...p, paymentOffersEnabled: e.target.checked }))}
                      className="h-4 w-4"
                    />
                    <label htmlFor="paymentOffersEnabled" className="text-base font-semibold text-gray-800">
                      Show Payment Offers Card
                    </label>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FiCreditCard className="w-5 h-5 text-primary-600" />
                      <div className="text-xl font-bold text-gray-900">Payment Offers ({pageForm.paymentOffers.length})</div>
                    </div>
                    <button
                      onClick={openAddOffer}
                      className="px-4 py-2 rounded-xl text-white transition-all flex items-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'linear-gradient(to right, #2874F0, #1e5fd4)',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <FiPlus className="w-4 h-4" style={{ display: 'block', color: '#ffffff' }} />
                      <span>Add Offer</span>
                    </button>
                  </div>
                  {pageForm.paymentOffers.length === 0 ? (
                    <div className="text-base text-gray-500 text-center py-4 border border-gray-200 rounded-lg">No payment offers yet</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 w-12">#</th>
                            <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 w-20">Icon</th>
                            <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Title</th>
                            <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Discount</th>
                            <th className="text-center py-3 px-4 text-sm font-bold text-gray-700 w-24">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pageForm.paymentOffers.map((offer, idx) => (
                            <tr key={offer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-4 text-sm font-semibold text-gray-600">{idx + 1}</td>
                              <td className="py-4 px-4">
                                {offer.iconUrl ? (
                                  <img src={toAssetUrl(offer.iconUrl)} alt={offer.title} className="h-10 w-10 object-cover rounded-full border border-gray-200" />
                                ) : (
                                  <div className="h-10 w-10 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center">
                                    <span className="text-[10px] text-gray-400">No icon</span>
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <div className="text-sm font-medium text-gray-900">{offer.title || "Untitled"}</div>
                                <div className="text-xs text-gray-500">{offer.description}</div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="inline-block px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-bold border border-green-100">
                                  {offer.discount || "—"}{offer.code ? ` • ${offer.code}` : ""}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => openEditOffer(offer)}
                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                    title="Edit"
                                  >
                                    <FiEdit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => removePaymentOffer(offer.id)}
                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                    title="Remove"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FiGrid className="w-5 h-5 text-primary-600" />
                      <div className="text-xl font-bold text-gray-900">Service Categories Grid ({pageForm.serviceCategoriesGrid.length})</div>
                    </div>
                    <button
                      onClick={openAddCategory}
                      className="px-4 py-2 rounded-xl text-white transition-all flex items-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'linear-gradient(to right, #2874F0, #1e5fd4)',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <FiPlus className="w-4 h-4" style={{ display: 'block', color: '#ffffff' }} />
                      <span>Add Category</span>
                    </button>
                  </div>
                  {pageForm.serviceCategoriesGrid.length === 0 ? (
                    <div className="text-base text-gray-500 text-center py-4 border border-gray-200 rounded-lg">No categories yet</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 w-12">#</th>
                            <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 w-24">Image</th>
                            <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Title</th>
                            <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Badge</th>
                            <th className="text-center py-3 px-4 text-sm font-bold text-gray-700 w-32">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pageForm.serviceCategoriesGrid.map((cat, idx) => (
                            <tr key={cat.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-4 text-sm font-semibold text-gray-600">{idx + 1}</td>
                              <td className="py-4 px-4">
                                {cat.imageUrl ? (
                                  <img src={toAssetUrl(cat.imageUrl)} alt={cat.title} className="h-10 w-10 object-cover rounded-lg border border-gray-200" />
                                ) : (
                                  <div className="h-10 w-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                    <span className="text-[10px] text-gray-400">No img</span>
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <div className="text-sm text-gray-900">{cat.title || "Untitled"}</div>
                              </td>
                              <td className="py-4 px-4">
                                {cat.badge ? (
                                  <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded">{cat.badge}</span>
                                ) : (
                                  <span className="text-gray-400 text-xs">—</span>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => openEditCategory(cat)}
                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                    title="Edit"
                                  >
                                    <FiEdit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => removeServiceCategory(cat.id)}
                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                    title="Remove"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <button
                  onClick={savePageContent}
                  disabled={loading}
                  className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSave className="w-5 h-5" />
                  {loading ? "Saving..." : "Save Page Content"}
                </button>
              </>
            )}
          </div>
        </CardShell>
      )}

      {services.length > 0 && selectedService && (
        <CardShell icon={FiPackage} title="Manage Sections">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Service:</strong> {selectedService.title}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Sections are managed in the <strong>"Sections"</strong> page. Select this service there to add/edit sections and cards.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-base font-semibold text-gray-900">
                  Current Sections: <span className="text-primary-600">{(selectedService.sections || []).length}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Total Cards: <span className="font-semibold">
                    {(selectedService.sections || []).reduce((sum, sec) => sum + (sec.cards?.length || 0), 0)}
                  </span>
                </div>
              </div>
              {(selectedService.sections || []).length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">No sections added yet</div>
              ) : (
                <div className="space-y-2">
                  {(selectedService.sections || []).map((section, idx) => (
                    <div key={section.id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">{section.title || "Untitled Section"}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {section.cards?.length || 0} cards • Anchor: {section.anchorId || "—"}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {section.type || "standard"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardShell>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={reset}
        title={editingId ? "Edit Service" : "Add Service"}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Electrician"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-base font-bold text-gray-900 mb-2">Categories</label>
              <div className="space-y-3">
                <select
                  multiple
                  value={form.categoryIds}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setForm(p => ({ ...p, categoryIds: selectedOptions }));
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all min-h-[140px] shadow-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="py-2 px-1">
                      {c.title}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <FiPackage className="text-gray-400" />
                  <span>Hold <strong>Ctrl</strong> (or <strong>Cmd</strong>) to select multiple categories</span>
                </div>
              </div>

              {/* Selected Categories Visualization */}
              {form.categoryIds.length > 0 && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Selected Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {form.categoryIds.map(catId => {
                      const cat = categories.find(c => c.id === catId);
                      return cat ? (
                        <span key={catId} className="group flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-bold border border-primary-200 shadow-sm hover:bg-primary-100 transition-colors">
                          {cat.title}
                          <button
                            onClick={() => setForm(p => ({ ...p, categoryIds: p.categoryIds.filter(id => id !== catId) }))}
                            className="w-5 h-5 flex items-center justify-center rounded-full bg-primary-200 text-primary-700 hover:bg-red-500 hover:text-white transition-all shadow-inner"
                            title="Remove"
                          >
                            <FiX className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {categories.length === 0 && (
                <div className="mt-2 p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex items-center gap-3 text-yellow-800">
                  <FiPackage className="w-5 h-5" />
                  <p className="text-sm font-medium">No active categories found. Please create one first in the Categories tab.</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Icon</label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingServiceIcon}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadingServiceIcon(true);
                      try {
                        const response = await serviceService.uploadImage(file);
                        if (response.success && response.imageUrl) {
                          setForm((p) => ({ ...p, iconUrl: response.imageUrl }));
                          toast.success("Icon uploaded successfully");
                        } else {
                          toast.error("Upload failed");
                        }
                      } catch (error) {
                        console.error('Service icon upload error:', error);
                        const msg = error.response?.data?.message || error.message || "Failed to upload image";
                        toast.error(msg);
                      } finally {
                        setUploadingServiceIcon(false);
                      }
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {uploadingServiceIcon && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-sm font-medium">Uploading...</span>
                  </div>
                )}
                {form.iconUrl && !uploadingServiceIcon && (
                  <div className="mt-2">
                    <img src={toAssetUrl(form.iconUrl)} alt="Preview" className="h-24 w-24 object-cover rounded-lg border border-gray-200 shadow-sm" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Badge (optional)</label>
              <input
                value={form.badge}
                onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))}
                placeholder="e.g. NEW, POPULAR"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={upsert}
              disabled={loading}
              className="flex-1 py-3.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave className="w-5 h-5" />
              {loading ? "Saving..." : (editingId ? "Update Service" : "Add Service")}
            </button>
            <button
              onClick={reset}
              className="px-6 py-3.5 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-all border border-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Banner Modal */}
      <Modal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        title={editingBannerId ? "Edit Banner" : "Add Banner"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Image</label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadingBannerImage(true);
                    try {
                      const response = await serviceService.uploadImage(file);
                      if (response.success) {
                        setCurrentBanner(p => ({ ...p, imageUrl: response.imageUrl }));
                        toast.success("Image uploaded!");
                      }
                    } catch (error) {
                      toast.error("Upload failed");
                    } finally {
                      setUploadingBannerImage(false);
                    }
                  }
                }}
                className="w-full px-4 py-2 border rounded-xl"
              />
              {uploadingBannerImage && <p className="text-sm text-blue-600">Uploading...</p>}
              {currentBanner.imageUrl && (
                <img src={toAssetUrl(currentBanner.imageUrl)} alt="Preview" className="h-32 w-full object-cover rounded-lg border" />
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Text (Optional)</label>
            <input
              value={currentBanner.text}
              onChange={(e) => setCurrentBanner(p => ({ ...p, text: e.target.value }))}
              placeholder="e.g. 50% Off"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={saveBanner} className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700">
              Save Banner
            </button>
          </div>
        </div>
      </Modal>

      {/* Payment Offer Modal */}
      <Modal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        title={editingOfferId ? "Edit Offer" : "Add Payment Offer"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Icon</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadingOfferIcon(true);
                    try {
                      const response = await serviceService.uploadImage(file);
                      if (response.success) {
                        setCurrentOffer(p => ({ ...p, iconUrl: response.imageUrl }));
                      }
                    } catch (error) {
                      toast.error("Upload failed");
                    } finally {
                      setUploadingOfferIcon(false);
                    }
                  }
                }}
                className="w-full text-sm"
              />
              {uploadingOfferIcon && <p className="text-xs text-blue-600 mt-1">Uploading...</p>}
            </div>
            {currentOffer.iconUrl && (
              <div className="flex justify-end">
                <img src={toAssetUrl(currentOffer.iconUrl)} alt="Preview" className="h-12 w-12 object-cover rounded-full border" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Title</label>
            <input
              value={currentOffer.title}
              onChange={(e) => setCurrentOffer(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. HDFC Bank"
              className="w-full px-4 py-2 border rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Discount</label>
              <input
                value={currentOffer.discount}
                onChange={(e) => setCurrentOffer(p => ({ ...p, discount: e.target.value }))}
                placeholder="e.g. 10% OFF"
                className="w-full px-4 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Code</label>
              <input
                value={currentOffer.code}
                onChange={(e) => setCurrentOffer(p => ({ ...p, code: e.target.value }))}
                placeholder="e.g. HDFC10"
                className="w-full px-4 py-2 border rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
            <input
              value={currentOffer.description}
              onChange={(e) => setCurrentOffer(p => ({ ...p, description: e.target.value }))}
              placeholder="e.g. Upto Rs 100 on min spend 500"
              className="w-full px-4 py-2 border rounded-xl"
            />
          </div>
          <div className="pt-2">
            <button onClick={saveOffer} className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700">
              Save Offer
            </button>
          </div>
        </div>
      </Modal>

      {/* Service Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategoryId ? "Edit Category Grid Item" : "Add Category Grid Item"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Image</label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadingCategoryImage(true);
                    try {
                      const response = await serviceService.uploadImage(file);
                      if (response.success) {
                        setCurrentCategory(p => ({ ...p, imageUrl: response.imageUrl }));
                      }
                    } catch (error) {
                      toast.error("Upload failed");
                    } finally {
                      setUploadingCategoryImage(false);
                    }
                  }
                }}
                className="w-full px-4 py-2 border rounded-xl"
              />
              {uploadingCategoryImage && <p className="text-sm text-blue-600">Uploading...</p>}
              {currentCategory.imageUrl && (
                <img src={toAssetUrl(currentCategory.imageUrl)} alt="Preview" className="h-32 w-full object-cover rounded-lg border" />
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Title</label>
              <input
                value={currentCategory.title}
                onChange={(e) => setCurrentCategory(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Cleaning"
                className="w-full px-4 py-3 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Badge</label>
              <input
                value={currentCategory.badge}
                onChange={(e) => setCurrentCategory(p => ({ ...p, badge: e.target.value }))}
                placeholder="e.g. NEW"
                className="w-full px-4 py-3 border rounded-xl"
              />
            </div>
          </div>
          <div className="pt-2">
            <button onClick={saveCategory} className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700">
              Save Category
            </button>
          </div>
        </div>
      </Modal>


    </div>
  );
};

export default ServicesPage;
