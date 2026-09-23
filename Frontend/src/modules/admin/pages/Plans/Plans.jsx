import React, { useState, useEffect } from 'react';
import { getPlans, createPlan, updatePlan, deletePlan } from '../../services/planService';
import { categoryService, brandService, serviceService } from '../../../../services/catalogService';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiCheck, 
  FiX, 
  FiPackage, 
  FiTool, 
  FiShield, 
  FiAward, 
  FiZap, 
  FiSearch, 
  FiClock, 
  FiGift, 
  FiCheckCircle,
  FiTag,
  FiFilter
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ 
    name: 'Silver', 
    price: '', 
    tagline: '', 
    description: '', 
    validityMonths: 1, 
    freeCategories: [], 
    freeBrands: [], 
    freeServices: [], 
    bonusServices: [] 
  });

  const PLAN_TYPES = ['Silver', 'Gold', 'Diamond', 'Platinum'];

  const getCardStyle = (name) => {
    const lower = (name || '').toLowerCase();

    if (lower.includes('platinum')) {
      return {
        tier: 'Platinum',
        icon: FiShield,
        isDark: true,
        container: 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white border-slate-700/80 shadow-md hover:shadow-2xl hover:border-slate-500 ring-1 ring-slate-800',
        headerGlow: 'from-slate-800 to-slate-900',
        tierBadge: 'bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 font-semibold',
        iconWrap: 'bg-gradient-to-br from-slate-800 to-slate-700 text-cyan-300 border border-slate-600/80 shadow-sm',
        text: 'text-white',
        subtext: 'text-slate-400',
        price: 'text-white',
        durationBadge: 'bg-white/10 text-slate-300 border border-white/10',
        check: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
        benefitCountBadge: 'bg-white/10 text-slate-300 border border-white/10',
        inheritedBox: 'bg-white/5 border border-white/10 text-slate-200',
        inheritedTag: 'bg-cyan-500/20 text-cyan-300',
        footer: 'bg-slate-950/70 border-slate-800/80',
        editBtn: 'bg-white/10 text-white hover:bg-blue-600 hover:text-white border border-white/10 hover:border-blue-600',
        deleteBtn: 'bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/20 hover:border-red-600'
      };
    }
    if (lower.includes('diamond')) {
      return {
        tier: 'Diamond',
        icon: FiZap,
        isDark: false,
        container: 'bg-gradient-to-b from-indigo-50/40 via-white to-white border-indigo-200/90 shadow-sm hover:shadow-xl hover:border-indigo-400 ring-1 ring-indigo-100/60',
        headerGlow: 'from-indigo-100/70 via-purple-50/40 to-indigo-50/20',
        tierBadge: 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold',
        iconWrap: 'bg-gradient-to-br from-indigo-100 to-purple-150 text-indigo-600 border border-indigo-200 shadow-sm',
        text: 'text-slate-900',
        subtext: 'text-indigo-800/70',
        price: 'text-indigo-950',
        durationBadge: 'bg-indigo-50 text-indigo-700 border border-indigo-150 font-medium',
        check: 'bg-indigo-50 text-indigo-600 border border-indigo-200/70',
        benefitCountBadge: 'bg-indigo-50 text-indigo-700 border border-indigo-150',
        inheritedBox: 'bg-indigo-50/50 border border-indigo-150 text-slate-800',
        inheritedTag: 'bg-indigo-100 text-indigo-700',
        footer: 'bg-indigo-50/40 border-indigo-100/80',
        editBtn: 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600',
        deleteBtn: 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 hover:border-red-600'
      };
    }
    if (lower.includes('gold')) {
      return {
        tier: 'Gold',
        icon: FiAward,
        isDark: false,
        container: 'bg-gradient-to-b from-amber-50/40 via-white to-white border-amber-200/90 shadow-sm hover:shadow-xl hover:border-amber-400 ring-1 ring-amber-100/60',
        headerGlow: 'from-amber-100/70 via-yellow-50/40 to-amber-50/20',
        tierBadge: 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold',
        iconWrap: 'bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-700 border border-amber-200 shadow-sm',
        text: 'text-slate-900',
        subtext: 'text-amber-800/70',
        price: 'text-amber-950',
        durationBadge: 'bg-amber-50 text-amber-800 border border-amber-150 font-medium',
        check: 'bg-amber-100/80 text-amber-700 border border-amber-300/60',
        benefitCountBadge: 'bg-amber-50 text-amber-800 border border-amber-150',
        inheritedBox: 'bg-amber-50/50 border border-amber-200/80 text-slate-800',
        inheritedTag: 'bg-amber-100 text-amber-800',
        footer: 'bg-amber-50/40 border-amber-100/80',
        editBtn: 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600',
        deleteBtn: 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 hover:border-red-600'
      };
    }
    // Silver / Default
    return {
      tier: 'Silver',
      icon: FiShield,
      isDark: false,
      container: 'bg-gradient-to-b from-slate-50/80 via-white to-white border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-400 ring-1 ring-slate-100',
      headerGlow: 'from-slate-100/80 via-slate-50/50 to-white',
      tierBadge: 'bg-slate-100 text-slate-700 border border-slate-200 font-semibold',
      iconWrap: 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 border border-slate-300/60 shadow-sm',
      text: 'text-slate-900',
      subtext: 'text-slate-500',
      price: 'text-slate-900',
      durationBadge: 'bg-slate-100 text-slate-600 border border-slate-200 font-medium',
      check: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
      benefitCountBadge: 'bg-slate-100 text-slate-600 border border-slate-200',
      inheritedBox: 'bg-slate-50/80 border border-slate-200/80 text-slate-800',
      inheritedTag: 'bg-slate-200/80 text-slate-700',
      footer: 'bg-slate-50/60 border-slate-100',
      editBtn: 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600',
      deleteBtn: 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 hover:border-red-600'
    };
  };

  // Catalog State
  const [categories, setCategories] = useState([]);
  const [brandsList, setBrandsList] = useState([]); // All brands
  const [servicesList, setServicesList] = useState([]); // All services
  const [_filteredBrands, setFilteredBrands] = useState([]); // Brands for selected category
  const [filteredServices, setFilteredServices] = useState([]); // Services for selected brand
  const [selectedCategory, setSelectedCategory] = useState('');
  const [_selectedBrand, setSelectedBrand] = useState('');
  const [selectedService, setSelectedService] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [plansRes, catsRes, brandsRes, servsRes] = await Promise.all([
        getPlans(),
        categoryService.getAll(),
        brandService.getAll(),
        serviceService.getAll({ status: 'active' })
      ]);

      if (plansRes.success) setPlans(plansRes.data);

      const categoriesData = catsRes.categories || catsRes.data || (Array.isArray(catsRes) ? catsRes : []);
      const finalCats = Array.isArray(categoriesData) ? categoriesData : [];
      setCategories(finalCats);

      const brandsData = brandsRes.brands || brandsRes.data || (Array.isArray(brandsRes) ? brandsRes : []);
      const finalBrands = Array.isArray(brandsData) ? brandsData : [];
      setBrandsList(finalBrands);

      const servicesData = servsRes.services || servsRes.data || (Array.isArray(servsRes) ? servsRes : []);
      const finalServices = Array.isArray(servicesData) ? servicesData : [];
      setServicesList(finalServices);

    } catch (error) {
      console.error('DEBUG: fetchInitialData error', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await getPlans();
      if (res.success) setPlans(res.data);
    } catch (error) {
      console.error('Refresh plans failed', error);
    }
  };

  // Filter brands when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setFilteredBrands([]);
      return;
    }
    const filtered = brandsList.filter(b => {
      if (!b) return false;
      const bCatId = b.categoryId?._id || b.categoryId;
      const directMatch = String(bCatId) === String(selectedCategory);
      const idsMatch = Array.isArray(b.categoryIds) && b.categoryIds.some(cat => {
        if (!cat) return false;
        const catId = cat.id || cat._id || cat;
        return String(catId) === String(selectedCategory);
      });
      return directMatch || idsMatch;
    });
    setFilteredBrands(filtered);
    setSelectedBrand('');
    setSelectedService('');
  }, [selectedCategory, brandsList]);

  // Filter services when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setFilteredServices([]);
      return;
    }
    const filtered = servicesList.filter(s => {
      if (!s) return false;
      const catId = s.categoryId?._id || s.categoryId || s.id;
      return String(catId) === String(selectedCategory);
    });
    setFilteredServices(filtered);
    setSelectedService('');
  }, [selectedCategory, servicesList]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        freeCategories: formData.freeCategories.map(c => String(c?._id || c)),
        freeServices: formData.freeServices.map(s => String(s?._id || s)),
        bonusServices: formData.bonusServices.map(bs => ({
          categoryId: String(bs.categoryId?._id || bs.categoryId),
          serviceId: String(bs.serviceId?._id || bs.serviceId)
        })),
        duration: String(formData.validityMonths || 1)
      };

      if (currentPlan) {
        await updatePlan(currentPlan._id, payload);
        toast.success('Plan updated successfully');
      } else {
        await createPlan(payload);
        toast.success('Plan created successfully');
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error saving plan');
    }
  };

  const handleEdit = (plan) => {
    setCurrentPlan(plan);
    setFormData({
      name: plan.name,
      tagline: plan.tagline || '',
      description: plan.description || '',
      price: plan.price,
      validityMonths: plan.validityMonths || plan.validityDays || 1,
      freeCategories: (plan.freeCategories || []).map(c => c._id || c),
      freeServices: (plan.freeServices || []).map(s => s._id || s),
      bonusServices: (plan.bonusServices || []).map(bs => ({
        categoryId: bs.categoryId?._id || bs.categoryId,
        serviceId: bs.serviceId?._id || bs.serviceId
      }))
    });
    setIsModalOpen(true);
    
    if (plan.freeCategories?.length > 0) {
      const firstCatId = plan.freeCategories[0]?._id || plan.freeCategories[0];
      setSelectedCategory(String(firstCatId));
    } else if (plan.freeBrands?.length > 0) {
      const firstBrandObj = plan.freeBrands[0];
      const bCatId = firstBrandObj?.categoryId?._id || firstBrandObj?.categoryId;
      if (bCatId) setSelectedCategory(String(bCatId));
      setSelectedBrand(String(firstBrandObj?._id || firstBrandObj));
    } else if (plan.freeServices?.length > 0) {
      const firstSvcObj = plan.freeServices[0];
      const sCatId = firstSvcObj?.categoryId?._id || firstSvcObj?.categoryId;
      const sBrandId = firstSvcObj?.brandId?._id || firstSvcObj?.brandId;
      if (sCatId) setSelectedCategory(String(sCatId));
      if (sBrandId) setSelectedBrand(String(sBrandId));
    } else {
      setSelectedCategory('');
      setSelectedBrand('');
    }
    setSelectedService('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      await deletePlan(id);
      toast.success('Plan deleted successfully');
      fetchPlans();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete plan');
    }
  };

  const openCreateModal = () => {
    setCurrentPlan(null);
    setFormData({ 
      name: 'Silver', 
      tagline: '',
      description: '',
      price: '', 
      validityMonths: 1,
      freeCategories: [], 
      freeServices: [], 
      bonusServices: [],
      isActive: true,
      duration: 'Monthly'
    });
    setIsModalOpen(true);
    setSelectedCategory('');
    setSelectedService('');
  };

  // Filter plans locally by search query
  const filteredPlans = plans.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = (p.name || '').toLowerCase().includes(q);
    const taglineMatch = (p.tagline || '').toLowerCase().includes(q);
    const priceMatch = String(p.price || '').includes(q);
    return nameMatch || taglineMatch || priceMatch;
  });

  const activePlansCount = plans.filter(p => p.isActive).length;

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <FiSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plans by tier or price..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200">
              Total: {plans.length}
            </span>
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200/80 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active: {activePlansCount}
            </span>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 active:scale-95 shrink-0"
        >
          <FiPlus className="w-4 h-4 stroke-[2.5]" /> 
          <span>Add New Plan</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-sm font-medium text-slate-500">Loading subscription tiers...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {filteredPlans.map(plan => {
            const style = getCardStyle(plan.name);
            const TierIcon = style.icon;
            const totalBenefitsCount = 
              (plan.freeCategories?.length || 0) + 
              (plan.freeServices?.length || 0) + 
              (plan.bonusServices?.length || 0);

            return (
              <div 
                key={plan._id} 
                className={`rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col h-full hover:-translate-y-1 hover:shadow-xl ${style.container}`}
              >
                {/* Card Header */}
                <div className={`p-5 pb-4 border-b ${style.isDark ? 'border-slate-800/80 bg-slate-900/60' : 'border-slate-100 bg-gradient-to-r ' + style.headerGlow}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.iconWrap}`}>
                        <TierIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className={`text-lg font-bold tracking-tight truncate ${style.text}`}>{plan.name}</h3>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider shrink-0 ${style.tierBadge}`}>
                            Tier
                          </span>
                        </div>
                        {plan.tagline && (
                          <p className={`text-xs font-medium mt-0.5 line-clamp-1 ${style.subtext}`}>{plan.tagline}</p>
                        )}
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full shrink-0 ${
                      plan.isActive 
                        ? (style.isDark ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200') 
                        : (style.isDark ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-gray-100 text-gray-600 border border-gray-200')
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${plan.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Price & Duration */}
                  <div className="mt-4 flex items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-extrabold tracking-tight ${style.price}`}>
                        ₹{Number(plan.price || 0).toLocaleString('en-IN')}
                      </span>
                      <span className={`text-xs font-medium opacity-60 ${style.subtext}`}>
                        / {plan.duration || plan.validityMonths || '1'} Mo
                      </span>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${style.durationBadge}`}>
                      {plan.duration || plan.validityMonths || '1'} Months
                    </span>
                  </div>
                </div>

                {/* Card Body / Features */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`text-[10px] font-bold uppercase tracking-wider ${style.subtext}`}>
                        Included Services
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.benefitCountBadge}`}>
                        {totalBenefitsCount} {totalBenefitsCount === 1 ? 'Benefit' : 'Benefits'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {/* Free Categories */}
                      {plan.freeCategories && plan.freeCategories.length > 0 && (
                        <div className="flex flex-col gap-1.5 text-xs">
                          {plan.freeCategories.map((catRef, idx) => {
                            const catId = String(catRef?._id || catRef);
                            const cat = categories.find(c => String(c.id || c._id) === catId);
                            const displayTitle = cat ? cat.title : (catRef?.title || 'Unlimited Coverage');
                            return (
                              <div key={`c-v-${idx}`} className="flex items-center gap-2.5 py-0.5">
                                <span className={`p-1 rounded-full shrink-0 ${style.check}`}>
                                  <FiCheck className="w-3 h-3 stroke-[2.5]" />
                                </span>
                                <span className={`font-medium truncate ${style.text}`} title={displayTitle}>
                                  {displayTitle === 'Unlimited Coverage' ? 'Unlimited Full Coverage' : `Unlimited ${displayTitle}`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Free Services */}
                      {plan.freeServices && plan.freeServices.length > 0 && (
                        <div className="flex flex-col gap-1.5 text-xs">
                          {(() => {
                            const groups = new Map();
                            plan.freeServices.forEach(svcRef => {
                              const svcId = String(svcRef?._id || svcRef);
                              const svc = servicesList.find(s => String(s.id || s._id) === svcId) || svcRef;
                              if (!svc || !svc.title) return;
                              
                              const cid = String(svc.categoryId?._id || svc.categoryId || 'unknown');
                              const tkey = svc.title.trim().toLowerCase();
                              const key = `${cid}_${tkey}`;
                              if (!groups.has(key)) {
                                groups.set(key, { svc, catTitle: svc.categoryId?.title || '' });
                              }
                            });

                            return Array.from(groups.values()).map((group, idx) => (
                              <div key={`s-v-${idx}`} className="flex items-center gap-2.5 py-0.5">
                                <span className={`p-1 rounded-full shrink-0 ${style.check}`}>
                                  <FiCheck className="w-3 h-3 stroke-[2.5]" />
                                </span>
                                <span className={`font-medium truncate ${style.text}`} title={`Free ${group.catTitle ? `${group.catTitle} ` : ''}${group.svc.title}`}>
                                  Free {group.catTitle ? `${group.catTitle} ` : ''}{group.svc.title}
                                </span>
                              </div>
                            ));
                          })()}
                        </div>
                      )}

                      {/* Bonus Services Inherited from Previous Plans */}
                      {plan.bonusServices && plan.bonusServices.length > 0 && (
                        <div className={`mt-3 p-3 rounded-xl border ${style.inheritedBox}`}>
                          <div className="flex items-center gap-1.5 mb-2">
                            <FiGift className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <h5 className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                              Inherited Tier Perks
                            </h5>
                          </div>
                          <div className="space-y-1.5">
                            {(() => {
                              const groups = new Map();
                              plan.bonusServices.forEach(bs => {
                                const svc = bs.serviceId;
                                if (!svc || !svc.title) return;
                                const cid = String(bs.categoryId?._id || bs.categoryId || svc.categoryId?._id || svc.categoryId || 'unknown');
                                const tkey = svc.title.trim().toLowerCase();
                                const key = `${cid}_${tkey}`;
                                if (!groups.has(key)) {
                                  groups.set(key, { svc, catTitle: bs.categoryId?.title || svc.categoryId?.title || '' });
                                }
                              });

                              return Array.from(groups.values()).map((group, idx) => (
                                <div key={`bs-v-${idx}`} className="flex items-center justify-between gap-2 text-xs py-0.5">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                    <span className="truncate font-medium">{group.svc.title}</span>
                                  </div>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${style.inheritedTag} uppercase tracking-wider shrink-0`}>
                                    Free
                                  </span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Empty state for no benefits */}
                      {(!plan.freeCategories?.length && !plan.freeServices?.length && !plan.bonusServices?.length) && (
                        <div className={`py-6 px-3 flex flex-col items-center justify-center text-center rounded-xl border border-dashed my-2 ${style.isDark ? 'border-slate-800 bg-white/[0.02]' : 'border-slate-200 bg-slate-50/50'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 ${style.isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>
                            <FiPackage className="w-4 h-4" />
                          </div>
                          <span className={`text-xs font-semibold ${style.text}`}>No benefits configured</span>
                          <span className={`text-[10px] mt-0.5 ${style.subtext}`}>Add covered services to this tier</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className={`px-4 py-3 flex items-center justify-between border-t ${style.footer} mt-auto`}>
                  <div className={`flex items-center gap-1.5 text-[11px] font-medium ${style.isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <FiClock className="w-3.5 h-3.5 opacity-70" />
                    <span>{plan.duration || plan.validityMonths || '1'} Mo Validity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 shadow-sm active:scale-95 ${style.editBtn}`}
                      title="Edit Plan"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(plan._id)}
                      className={`p-2 text-xs font-semibold rounded-lg transition-all duration-200 shadow-sm active:scale-95 ${style.deleteBtn}`}
                      title="Delete Plan"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredPlans.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300 p-8 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <FiPackage className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No subscription plans found</h3>
              <p className="text-sm text-slate-500 mt-1">
                {searchQuery ? 'Try clearing your search query or create a new plan.' : 'Get started by creating your first subscription tier.'}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={openCreateModal}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20"
                >
                  Create Plan
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-3 sm:p-4 z-50 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 my-8 flex flex-col max-h-[90vh] border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-slate-50 via-white to-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                  <FiPackage className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{currentPlan ? 'Edit Configuration' : 'Create New Plan'}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Define plan details, pricing, and covered benefits</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="bg-white p-2 rounded-xl text-gray-400 hover:text-gray-700 shadow-sm border border-gray-200 transition-all hover:bg-gray-50"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar space-y-6">
              {/* Plan Type Pills */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Select Tier</label>
                <div className="grid grid-cols-4 gap-2 p-1.5 bg-slate-100 rounded-xl">
                  {PLAN_TYPES.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, name: type }))}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        formData.name === type 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price and Validity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Monthly Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-400 font-bold">₹</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-gray-900"
                      required
                      placeholder="999"
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Validity (Months)</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="validityMonths"
                      value={formData.validityMonths}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-gray-900"
                      required
                      placeholder="1"
                      min="1"
                    />
                    <span className="absolute right-4 top-2.5 text-xs text-gray-400 font-medium">Months</span>
                  </div>
                </div>
              </div>

              {/* Tagline and Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Tagline</label>
                  <input
                    type="text"
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-gray-800"
                    placeholder="e.g. Best for small families"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-gray-800 min-h-[80px]"
                    placeholder="Describe the plan benefits in detail..."
                  />
                </div>
              </div>

              {/* Plan Benefits Configuration */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">
                      <FiCheck className="w-4 h-4 stroke-[2.5]" />
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">Plan Benefits</h3>
                      <p className="text-xs text-gray-500">Configure free services included in this tier</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-white space-y-4">
                  <div className="flex flex-col md:flex-row gap-3 items-end">
                    <div className="flex-1 w-full space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium"
                      >
                        <option value="">Select Category...</option>
                        {categories.map(cat => (
                          <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1 w-full space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Service</label>
                      <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        disabled={!selectedCategory}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">{selectedCategory ? 'Select Service Type...' : 'Select Category first'}</option>
                        {(() => {
                          const uniqueNames = Array.from(new Set(filteredServices.map(s => (s.title || '').replace(/\s+/g, ' ').trim().toLowerCase()))).filter(Boolean).sort().map(tKey => {
                            const match = filteredServices.find(s => (s.title || '').replace(/\s+/g, ' ').trim().toLowerCase() === tKey);
                            return match ? match.title.replace(/\s+/g, ' ').trim() : tKey;
                          });
                          return uniqueNames.map(title => (
                            <option key={title} value={title}>All {title} Services (All Brands)</option>
                          ));
                        })()}
                      </select>
                    </div>

                    <button
                      type="button"
                      disabled={!selectedCategory}
                      onClick={() => {
                        let addedAny = false;
                        if (selectedService) {
                          const targetTitleRaw = selectedService.trim().toLowerCase();
                          const matches = filteredServices.filter(s => (s.title || '').trim().toLowerCase() === targetTitleRaw);
                          const matchIds = matches.map(s => String(s._id || s.id));
                          const currentIds = formData.freeServices.map(id => String(id?._id || id));
                          const newServices = [...new Set([...currentIds, ...matchIds])];
                          
                          if (newServices.length > currentIds.length) {
                            setFormData(p => ({ ...p, freeServices: newServices }));
                            addedAny = true;
                          }
                        } else if (selectedCategory) {
                          if (!formData.freeCategories.some(c => String(c._id || c) === String(selectedCategory))) {
                            setFormData(p => ({ ...p, freeCategories: [...p.freeCategories, selectedCategory] }));
                            addedAny = true;
                          }
                        }
                        
                        if (addedAny) {
                          toast.success('Benefit added to list');
                          setSelectedService('');
                        } else {
                          toast.error('Benefit already in list or nothing selected');
                        }
                      }}
                      className="h-[38px] px-5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 active:scale-95 transition-all w-full md:w-auto shrink-0"
                    >
                      Add Benefit
                    </button>
                  </div>

                  <div className="h-px bg-slate-100 w-full"></div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Active Tier Benefits</p>

                    <div className="flex flex-wrap gap-2">
                      {formData.freeCategories.map((catId, idx) => {
                        const targetId = String(catId?._id || catId);
                        const cat = categories.find(c => String(c.id || c._id) === targetId);
                        const displayTitle = cat ? cat.title : (catId?.title || 'Category');
                        return (
                          <div key={`c-tag-${idx}`} className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-semibold shadow-sm">
                            <FiPackage className="w-3.5 h-3.5 shrink-0" />
                            <span>{displayTitle}</span>
                            <span className="bg-indigo-200 text-indigo-800 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">All Free</span>
                            <button
                              type="button"
                              onClick={() => setFormData(p => ({ ...p, freeCategories: p.freeCategories.filter(id => String(id?._id || id) !== targetId) }))}
                              className="p-1 hover:bg-indigo-100 rounded-md transition-colors text-indigo-400 hover:text-red-500"
                            >
                              <FiX className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}

                      {/* Grouped Services */}
                      {(() => {
                        const groups = new Map();
                        formData.freeServices.forEach(svcId => {
                          const targetId = String(svcId?._id || svcId);
                          const svc = servicesList.find(s => String(s.id || s._id) === targetId);
                          if (!svc) return;
                          
                          const catId = String(svc.categoryId?._id || svc.categoryId);
                          const title = (svc.title || '').trim().toLowerCase();
                          const key = `${catId}_${title}`;
                          
                          if (!groups.has(key)) {
                            groups.set(key, { catId, title, ids: [] });
                          }
                          groups.get(key).ids.push(targetId);
                        });

                        return Array.from(groups.values()).map((group, idx) => {
                          const cat = categories.find(c => String(c.id || c._id) === group.catId);
                          const catName = cat ? cat.title : 'Category';
                          const displayTitle = group.title.charAt(0).toUpperCase() + group.title.slice(1);

                          return (
                            <div key={`svc-tag-${idx}`} className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg text-xs font-semibold shadow-sm">
                              <FiTool className="w-3.5 h-3.5 shrink-0" />
                              <span className="text-[9px] bg-rose-200/60 px-1 py-0.5 rounded uppercase font-black">{catName}</span>
                              <span className="font-bold">{displayTitle}</span>
                              <span className="text-[9px] opacity-60">All Brands</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(p => ({ 
                                    ...p, 
                                    freeServices: p.freeServices.filter(id => !group.ids.includes(String(id?._id || id)))
                                  }));
                                }}
                                className="p-1 hover:bg-rose-100 rounded-md transition-colors text-rose-400 hover:text-red-500"
                              >
                                <FiX className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        });
                      })()}

                      {formData.freeCategories.length === 0 && formData.freeServices.length === 0 && (
                        <p className="text-gray-400 text-xs italic py-1">No benefits added yet. Select a category above to configure.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Free Benefits from Previous Plan */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg">
                      <FiGift className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">Inherited Benefits from Previous Plan</h3>
                      <p className="text-xs text-gray-500">Attach services inherited from lower tiers</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-white space-y-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col md:flex-row gap-3 items-end">
                      <div className="flex-1 w-full space-y-1">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-medium"
                        >
                          <option value="">Select Category...</option>
                          {categories.map(cat => (
                            <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.title}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex-1 w-full space-y-1">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Service</label>
                        <select
                          value={selectedService}
                          onChange={(e) => setSelectedService(e.target.value)}
                          disabled={!selectedCategory}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">{selectedCategory ? 'Select Service Type...' : 'Select Category first'}</option>
                          {(() => {
                            const uniqueNames = Array.from(new Set(filteredServices.map(s => (s.title || '').replace(/\s+/g, ' ').trim().toLowerCase()))).filter(Boolean).sort().map(tKey => {
                              const match = filteredServices.find(s => (s.title || '').replace(/\s+/g, ' ').trim().toLowerCase() === tKey);
                              return match ? match.title.replace(/\s+/g, ' ').trim() : tKey;
                            });
                            return uniqueNames.map(title => (
                              <option key={title} value={title}>All {title} Services (All Brands)</option>
                            ));
                          })()}
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!selectedService}
                      onClick={() => {
                        const selectionTitleRaw = (selectedService || '').trim().toLowerCase();
                        if (!selectionTitleRaw) return;

                        const matches = filteredServices.filter(s => (s.title || '').trim().toLowerCase() === selectionTitleRaw);
                        
                        let addedAny = false;
                        const newBonusEntries = [...formData.bonusServices];
                        
                        matches.forEach(svcObj => {
                          const svcId = String(svcObj._id || svcObj.id);
                          if (!newBonusEntries.some(bs => String(bs.serviceId?._id || bs.serviceId) === svcId)) {
                            newBonusEntries.push({
                              categoryId: selectedCategory,
                              serviceId: svcObj
                            });
                            addedAny = true;
                          }
                        });

                        if (addedAny) {
                          setFormData(p => ({ ...p, bonusServices: newBonusEntries }));
                          setSelectedService('');
                          toast.success('Bonus benefits added to tier');
                        } else {
                          toast.error('Service group already in benefit list');
                        }
                      }}
                      className="h-[38px] px-6 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20 active:scale-95 transition-all w-full"
                    >
                      Add Service Group to Previous Plan Benefits
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Active Inherited Benefits</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(() => {
                        const bonusGroups = new Map();
                        formData.bonusServices.forEach(bs => {
                          const sid = String(bs.serviceId?._id || bs.serviceId);
                          const sObj = servicesList.find(s => String(s.id || s._id) === sid);
                          if (!sObj) return;

                          const cid = String(bs.categoryId?._id || bs.categoryId);
                          const title = (sObj.title || '').trim().toLowerCase();
                          const key = `${cid}_${title}`;

                          if (!bonusGroups.has(key)) {
                            bonusGroups.set(key, { bs, title, sid, cid, ids: [] });
                          }
                          bonusGroups.get(key).ids.push(sid);
                        });

                        return Array.from(bonusGroups.values()).map((group, idx) => {
                          const bs = group.bs;
                          const sampleSvc = servicesList.find(s => String(s.id || s._id) === group.sid);
                          const displayTitle = sampleSvc ? sampleSvc.title.trim() : group.title;
                          const catName = bs.categoryId?.title || (categories.find(c => String(c._id || c.id) === group.cid)?.title) || 'Category';

                          return (
                            <div key={`bs-tag-${idx}`} className="flex flex-col gap-1 p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-medium shadow-sm relative">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded uppercase font-black tracking-wider">
                                  {catName}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData(p => ({ 
                                      ...p, 
                                      bonusServices: p.bonusServices.filter(b => {
                                        const sid = b.serviceId?._id || b.serviceId;
                                        return !group.ids.includes(String(sid));
                                      }) 
                                    }));
                                  }}
                                  className="p-1 hover:bg-emerald-100 rounded-md transition-colors text-emerald-500 hover:text-red-500"
                                >
                                  <FiX className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="flex flex-col mt-0.5">
                                <span className="font-bold text-gray-900 leading-tight">
                                  {displayTitle} <span className="text-[10px] font-normal opacity-60 ml-0.5">(All Brands)</span>
                                </span>
                                <div className="flex items-center mt-1 text-[9px] text-emerald-600 uppercase font-bold tracking-wider">
                                  Tier Inheritance Included
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                      {formData.bonusServices.length === 0 && (
                        <p className="text-gray-400 text-xs italic col-span-full py-1">No bonus services added yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 sm:px-8 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-sm text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/25 active:scale-95 text-xs"
              >
                {currentPlan ? 'Save Changes' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
