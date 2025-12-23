import React, { useMemo, useState, useEffect } from "react";
import { FiGrid, FiPlus, FiTrash2, FiSave, FiEdit2 } from "react-icons/fi";
import { toast } from "react-hot-toast";
import CardShell from "../components/CardShell";
import Modal from "../components/Modal";
import { ensureIds, saveCatalog, slugify, toAssetUrl } from "../utils";

import { homeContentService, serviceService } from "../../../../../services/catalogService";

const HomePage = ({ catalog, setCatalog }) => {
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerForm, setBannerForm] = useState({ imageUrl: "", text: "", targetCategoryId: "", scrollToSection: "" });
  const [editingBannerId, setEditingBannerId] = useState(null);

  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoForm, setPromoForm] = useState({ title: "", subtitle: "", buttonText: "Explore", gradientClass: "from-blue-600 to-blue-800", imageUrl: "", targetCategoryId: "", scrollToSection: "" });
  const [editingPromoId, setEditingPromoId] = useState(null);

  const [isCuratedModalOpen, setIsCuratedModalOpen] = useState(false);
  const [curatedForm, setCuratedForm] = useState({ title: "", gifUrl: "", youtubeUrl: "", targetCategoryId: "" });
  const [editingCuratedId, setEditingCuratedId] = useState(null);

  const [isNoteworthyModalOpen, setIsNoteworthyModalOpen] = useState(false);
  const [noteworthyForm, setNoteworthyForm] = useState({ title: "", imageUrl: "", targetCategoryId: "" });
  const [editingNoteworthyId, setEditingNoteworthyId] = useState(null);

  const [isBookedModalOpen, setIsBookedModalOpen] = useState(false);
  const [bookedForm, setBookedForm] = useState({ title: "", rating: "", reviews: "", price: "", originalPrice: "", discount: "", imageUrl: "", targetCategoryId: "" });
  const [editingBookedId, setEditingBookedId] = useState(null);

  const [isCategorySectionModalOpen, setIsCategorySectionModalOpen] = useState(false);
  const [categorySectionForm, setCategorySectionForm] = useState({ title: "", seeAllTargetCategoryId: "", cards: [] });
  const [editingCategorySectionId, setEditingCategorySectionId] = useState(null);

  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardForm, setCardForm] = useState({
    title: "",
    imageUrl: "",
    rating: "",
    reviews: "",
    price: "",
    originalPrice: "",
    discount: "",
    targetCategoryId: ""
  });
  const [editingCardId, setEditingCardId] = useState(null);

  const categories = useMemo(() => {
    const list = ensureIds(catalog).categories || [];
    return [...list].sort((a, b) => {
      const ao = Number.isFinite(a.homeOrder) ? a.homeOrder : 0;
      const bo = Number.isFinite(b.homeOrder) ? b.homeOrder : 0;
      if (ao !== bo) return ao - bo;
      return (a.title || "").localeCompare(b.title || "");
    });
  }, [catalog]);

  const home = ensureIds(catalog).home;

  // Fetch home content from API on mount
  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        const response = await homeContentService.get();
        if (response.success && response.homeContent) {
          const hc = response.homeContent;

          // Helper function to add IDs to items if they don't have them and convert ObjectIds to strings
          const addIds = (items) => {
            return items.map((item, idx) => ({
              ...item,
              id: item.id || (item._id ? item._id.toString() : `item-${Date.now()}-${idx}`),
              targetCategoryId: item.targetCategoryId ? (typeof item.targetCategoryId === 'object' ? item.targetCategoryId.toString() : item.targetCategoryId) : item.targetCategoryId,
              seeAllTargetCategoryId: item.seeAllTargetCategoryId ? (typeof item.seeAllTargetCategoryId === 'object' ? item.seeAllTargetCategoryId.toString() : item.seeAllTargetCategoryId) : item.seeAllTargetCategoryId,
              // For category sections cards
              cards: item.cards ? item.cards.map(card => ({
                ...card,
                targetCategoryId: card.targetCategoryId ? (typeof card.targetCategoryId === 'object' ? card.targetCategoryId.toString() : card.targetCategoryId) : card.targetCategoryId
              })) : item.cards
            }));
          };

          // Map API response to component's expected format
          const next = ensureIds(catalog);
          next.home = {
            banners: addIds(hc.banners || []),
            promoCarousel: addIds(hc.promos || []), // API returns 'promos', component expects 'promoCarousel'
            curatedServices: addIds(hc.curated || []), // API returns 'curated', component expects 'curatedServices'
            newAndNoteworthy: addIds(hc.noteworthy || []), // API returns 'noteworthy', component expects 'newAndNoteworthy'
            mostBooked: addIds(hc.booked || []), // API returns 'booked', component expects 'mostBooked'
            categorySections: addIds(hc.categorySections || [])
          };
          setCatalog(next);
          saveCatalog(next);
        }
      } catch (error) {
        console.error("Error fetching home content:", error);
        toast.error("Failed to load home content");
      }
    };
    fetchHomeContent();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getCategoryTitle = (id) => {
    const found = categories.find((c) => c.id === id);
    return found?.title || "";
  };



  const CategoryRedirectSelect = ({ value, onChange, label = "Redirect to service page", help }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-600 mb-1">{label}</label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">None</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title || "Untitled"}
          </option>
        ))}
      </select>
      {help ? <div className="text-[11px] text-gray-500 mt-1">{help}</div> : null}
    </div>
  );

  const updateCategory = (id, patch) => {
    const next = ensureIds(catalog);
    next.categories = next.categories.map((c) => (c.id === id ? { ...c, ...patch } : c));
    setCatalog(next);
    saveCatalog(next);
  };

  const moveCategory = (id, dir) => {
    const next = ensureIds(catalog);
    const list = [...next.categories].sort((a, b) => (a.homeOrder || 0) - (b.homeOrder || 0));
    const idx = list.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const a = list[idx];
    const b = list[targetIdx];
    const aOrder = a.homeOrder || 0;
    const bOrder = b.homeOrder || 0;
    next.categories = next.categories.map((c) => {
      if (c.id === a.id) return { ...c, homeOrder: bOrder };
      if (c.id === b.id) return { ...c, homeOrder: aOrder };
      return c;
    });
    setCatalog(next);
    saveCatalog(next);
  };

  const syncHomeToBackend = async (homeData) => {
    try {
      const payload = {
        banners: homeData.banners,
        promos: homeData.promoCarousel,
        curated: homeData.curatedServices,
        noteworthy: homeData.newAndNoteworthy,
        booked: homeData.mostBooked,
        categorySections: homeData.categorySections,
      };
      await homeContentService.update(payload);
    } catch (error) {
      console.error('Failed to sync home content:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to save changes to server';
      toast.error(msg);
    }
  };

  const setHomeBanners = (banners) => {
    const next = ensureIds(catalog);
    next.home = { ...(next.home || { banners: [] }), banners };
    setCatalog(next);
    saveCatalog(next);
    syncHomeToBackend(next.home);
  };

  const patchHome = (patch) => {
    const next = ensureIds(catalog);
    next.home = { ...(next.home || {}), ...patch };
    setCatalog(next);
    saveCatalog(next);
    syncHomeToBackend(next.home);
  };

  // Banner handlers
  const resetBannerForm = () => {
    setEditingBannerId(null);
    setBannerForm({ imageUrl: "", text: "", targetCategoryId: "", scrollToSection: "" });
    setIsBannerModalOpen(false);
  };

  const saveBanner = () => {
    const banners = home?.banners || [];
    if (editingBannerId) {
      setHomeBanners(banners.map((b) => (b.id === editingBannerId ? { ...b, ...bannerForm } : b)));
    } else {
      setHomeBanners([...banners, { id: `hbnr-${Date.now()}`, ...bannerForm }]);
    }
    resetBannerForm();
  };

  // Promo handlers
  const resetPromoForm = () => {
    setEditingPromoId(null);
    setPromoForm({ title: "", subtitle: "", buttonText: "Explore", gradientClass: "from-blue-600 to-blue-800", imageUrl: "", targetCategoryId: "", scrollToSection: "" });
    setIsPromoModalOpen(false);
  };

  const savePromo = () => {
    const promos = home?.promoCarousel || [];
    if (editingPromoId) {
      patchHome({ promoCarousel: promos.map((p) => (p.id === editingPromoId ? { ...p, ...promoForm } : p)) });
    } else {
      patchHome({ promoCarousel: [...promos, { id: `hprm-${Date.now()}`, ...promoForm }] });
    }
    resetPromoForm();
  };

  // Curated handlers
  const resetCuratedForm = () => {
    setEditingCuratedId(null);
    setCuratedForm({ title: "", gifUrl: "", youtubeUrl: "", targetCategoryId: "" });
    setIsCuratedModalOpen(false);
  };

  const saveCurated = () => {
    const curated = home?.curatedServices || [];
    if (editingCuratedId) {
      patchHome({ curatedServices: curated.map((c) => (c.id === editingCuratedId ? { ...c, ...curatedForm } : c)) });
    } else {
      patchHome({ curatedServices: [...curated, { id: `hcur-${Date.now()}`, ...curatedForm }] });
    }
    resetCuratedForm();
  };

  // Noteworthy handlers
  const resetNoteworthyForm = () => {
    setEditingNoteworthyId(null);
    setNoteworthyForm({ title: "", imageUrl: "", targetCategoryId: "" });
    setIsNoteworthyModalOpen(false);
  };

  const saveNoteworthy = () => {
    const noteworthy = home?.newAndNoteworthy || [];
    if (editingNoteworthyId) {
      patchHome({ newAndNoteworthy: noteworthy.map((n) => (n.id === editingNoteworthyId ? { ...n, ...noteworthyForm } : n)) });
    } else {
      patchHome({ newAndNoteworthy: [...noteworthy, { id: `hnnw-${Date.now()}`, ...noteworthyForm }] });
    }
    resetNoteworthyForm();
  };

  // Most Booked handlers
  const resetBookedForm = () => {
    setEditingBookedId(null);
    setBookedForm({ title: "", rating: "", reviews: "", price: "", originalPrice: "", discount: "", imageUrl: "", targetCategoryId: "" });
    setIsBookedModalOpen(false);
  };

  const saveBooked = () => {
    const booked = home?.mostBooked || [];
    if (editingBookedId) {
      patchHome({ mostBooked: booked.map((b) => (b.id === editingBookedId ? { ...b, ...bookedForm } : b)) });
    } else {
      patchHome({ mostBooked: [...booked, { id: `hmb-${Date.now()}`, ...bookedForm }] });
    }
    resetBookedForm();
  };

  // Category Section handlers
  const resetCategorySectionForm = () => {
    setEditingCategorySectionId(null);
    setCategorySectionForm({ title: "", seeAllTargetCategoryId: "", cards: [] });
    setIsCategorySectionModalOpen(false);
  };

  const saveCategorySection = () => {
    const title = categorySectionForm.title.trim();
    if (!title) return alert("Section title required");

    const sections = home?.categorySections || [];
    if (editingCategorySectionId) {
      patchHome({
        categorySections: sections.map((s) =>
          s.id === editingCategorySectionId ? { ...s, ...categorySectionForm } : s
        ),
      });
    } else {
      patchHome({
        categorySections: [
          ...sections,
          { id: `hsec-${Date.now()}`, ...categorySectionForm },
        ],
      });
    }
    resetCategorySectionForm();
  };

  // Card handlers for category sections
  const resetCardForm = () => {
    setEditingCardId(null);
    setCardForm({
      title: "",
      imageUrl: "",
      rating: "",
      reviews: "",
      price: "",
      originalPrice: "",
      discount: "",
      targetCategoryId: ""
    });
    setIsCardModalOpen(false);
  };

  const saveCard = () => {
    const title = cardForm.title.trim();
    if (!title) {
      toast.error("Card title is required");
      return;
    }

    const cards = categorySectionForm.cards || [];
    if (editingCardId) {
      setCategorySectionForm((prev) => ({
        ...prev,
        cards: cards.map((c) => (c.id === editingCardId ? { ...c, ...cardForm } : c)),
      }));
    } else {
      setCategorySectionForm((prev) => ({
        ...prev,
        cards: [...cards, { id: `hcard-${Date.now()}`, ...cardForm }],
      }));
    }
    resetCardForm();
  };

  const removeCardFromSection = (cardId) => {
    setCategorySectionForm((prev) => ({
      ...prev,
      cards: prev.cards.filter((c) => c.id !== cardId),
    }));
  };

  return (
    <div className="space-y-8">
      <CardShell icon={FiGrid} title="Home Page">
        <div className="space-y-6">
          <div>
            <div className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-3">
              <div className="w-1.5 h-8 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full"></div>
              <span>Home Banners</span>
            </div>
            <div className="flex items-center justify-end mb-4">
              <button
                type="button"
                onClick={() => {
                  setBannerForm({ imageUrl: "", text: "", targetCategoryId: "", scrollToSection: "" });
                  setIsBannerModalOpen(true);
                }}
                className="px-5 py-3 rounded-xl text-white transition-all flex items-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg relative z-10"
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

            {(home?.banners || []).length === 0 ? (
              <div className="text-base text-gray-500">No home banners added</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 w-12">#</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 w-24">Image</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Text</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Redirect</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Scroll To</th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-gray-700 w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(home.banners || []).map((b, idx) => (
                      <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-sm font-semibold text-gray-600">{idx + 1}</td>
                        <td className="py-4 px-4">
                          {b.imageUrl ? (
                            <img src={b.imageUrl} alt="Banner" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                          ) : (
                            <div className="h-16 w-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-400">No img</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-900">{b.text || "—"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">{b.targetCategoryId ? getCategoryTitle(b.targetCategoryId) : "—"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">{b.scrollToSection || "—"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBannerId(b.id);
                                setBannerForm({ ...b });
                                setIsBannerModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setHomeBanners((home.banners || []).filter((x) => x.id !== b.id))}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="Delete"
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
        </div>
      </CardShell>

      <CardShell icon={FiGrid} title="Home Content">
        <div className="space-y-8">
          {/* Promo Carousel (PromoCarousel) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-gray-200">
              <div>
                <div className="text-xl font-bold text-gray-900">Home Promo Carousel</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetPromoForm();
                  setIsPromoModalOpen(true);
                }}
                className="px-5 py-3 rounded-xl text-white transition-all flex items-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
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
                <span>Add</span>
              </button>
            </div>

            {(home.promoCarousel || []).length === 0 ? (
              <div className="text-base text-gray-500">No promo cards</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 w-12">#</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 w-24">Image</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Title</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Subtitle</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Button Text</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Redirect</th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-gray-700 w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(home.promoCarousel || []).map((p, idx) => (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-sm font-semibold text-gray-600">{idx + 1}</td>
                        <td className="py-4 px-4">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt="Promo" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                          ) : (
                            <div className="h-16 w-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-400">No img</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm font-semibold text-gray-900">{p.title || "—"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">{p.subtitle || "—"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">{p.buttonText || "—"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">{p.targetCategoryId ? getCategoryTitle(p.targetCategoryId) : "—"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPromoId(p.id);
                                setPromoForm({ ...p });
                                setIsPromoModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => patchHome({ promoCarousel: (home.promoCarousel || []).filter((x) => x.id !== p.id) })}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="Delete"
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

          {/* Curated Services */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-gray-200">
              <div>
                <div className="text-xl font-bold text-gray-900">Thoughtful Curations</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetCuratedForm();
                  setIsCuratedModalOpen(true);
                }}
                className="px-5 py-3 rounded-xl text-white transition-all flex items-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
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
                <span>Add</span>
              </button>
            </div>
            {(home.curatedServices || []).length === 0 ? (
              <div className="text-base text-gray-500">No items</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 w-12">#</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 w-24">Media</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Title</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">YouTube URL</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Redirect</th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-gray-700 w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(home.curatedServices || []).map((s, idx) => (
                      <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-sm font-semibold text-gray-600">{idx + 1}</td>
                        <td className="py-4 px-4">
                          {s.gifUrl ? (
                            s.gifUrl.match(/\.(gif|webp)$/i) ? (
                              <img src={s.gifUrl} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                            ) : (
                              <video src={s.gifUrl} className="h-16 w-16 object-cover rounded-lg border border-gray-200" controls />
                            )
                          ) : (
                            <div className="h-16 w-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-400">No media</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm font-semibold text-gray-900">{s.title || "—"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">{s.youtubeUrl || "—"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">{s.targetCategoryId ? getCategoryTitle(s.targetCategoryId) : "—"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCuratedId(s.id);
                                setCuratedForm({ ...s });
                                setIsCuratedModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => patchHome({ curatedServices: (home.curatedServices || []).filter((x) => x.id !== s.id) })}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="Delete"
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

          {/* New & Noteworthy */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-gray-200">
              <div>
                <div className="text-xl font-bold text-gray-900">New & Noteworthy</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetNoteworthyForm();
                  setIsNoteworthyModalOpen(true);
                }}
                className="px-5 py-3 rounded-xl text-white transition-all flex items-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
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
                <span>Add</span>
              </button>
            </div>
            {(home.newAndNoteworthy || []).length === 0 ? (
              <div className="text-base text-gray-500">No items</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 w-12">#</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 w-24">Image</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Title</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Redirect</th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-gray-700 w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(home.newAndNoteworthy || []).map((s, idx) => (
                      <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-sm font-semibold text-gray-600">{idx + 1}</td>
                        <td className="py-4 px-4">
                          {s.imageUrl ? (
                            <img src={s.imageUrl} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                          ) : (
                            <div className="h-16 w-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-400">No img</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm font-semibold text-gray-900">{s.title || "—"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">{s.targetCategoryId ? getCategoryTitle(s.targetCategoryId) : "—"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingNoteworthyId(s.id);
                                setNoteworthyForm({ ...s });
                                setIsNoteworthyModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => patchHome({ newAndNoteworthy: (home.newAndNoteworthy || []).filter((x) => x.id !== s.id) })}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="Delete"
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

          {/* Most Booked */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-gray-200">
              <div>
                <div className="text-xl font-bold text-gray-900">Most Booked Services</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetBookedForm();
                  setIsBookedModalOpen(true);
                }}
                className="px-5 py-3 rounded-xl text-white transition-all flex items-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
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
                <span>Add</span>
              </button>
            </div>
            {(home.mostBooked || []).length === 0 ? (
              <div className="text-base text-gray-500">No items</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 w-12">#</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 w-24">Image</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Title</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Rating</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Reviews</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Price</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Original</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Discount</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Redirect</th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-gray-700 w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(home.mostBooked || []).map((s, idx) => (
                      <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-sm font-semibold text-gray-600">{idx + 1}</td>
                        <td className="py-4 px-4">
                          {s.imageUrl ? (
                            <img src={s.imageUrl} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                          ) : (
                            <div className="h-16 w-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-400">No img</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm font-semibold text-gray-900">{s.title || "—"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">{s.rating || "—"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">{s.reviews || "—"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm font-semibold text-gray-900">{s.price ? `₹${s.price}` : "—"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-500 line-through">{s.originalPrice ? `₹${s.originalPrice}` : "—"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">{s.discount || "—"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">{s.targetCategoryId ? getCategoryTitle(s.targetCategoryId) : "—"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBookedId(s.id);
                                setBookedForm({ ...s });
                                setIsBookedModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => patchHome({ mostBooked: (home.mostBooked || []).filter((x) => x.id !== s.id) })}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="Delete"
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

          {/* Category Sections (Cleaning essentials style) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-gray-200">
              <div>
                <div className="text-base font-bold text-gray-800">Category Sections (home)</div>
                <div className="text-xs text-gray-600">Each section renders like â€œCleaning essentialsâ€: title + See all + horizontal cards</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetCategorySectionForm();
                  setIsCategorySectionModalOpen(true);
                }}
                className="px-5 py-3 rounded-xl text-white transition-all flex items-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
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
                <span>Add Section</span>
              </button>
            </div>

            {(home.categorySections || []).length === 0 ? (
              <div className="text-base text-gray-500">No sections</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 w-12">#</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Section Title</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">See All Redirect</th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-gray-700 w-24">Cards</th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-gray-700 w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(home.categorySections || []).map((sec, idx) => (
                      <tr key={sec.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-sm font-semibold text-gray-600">{idx + 1}</td>
                        <td className="py-4 px-4">
                          <div className="text-sm font-semibold text-gray-900">{sec.title || "—"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">{sec.seeAllTargetCategoryId ? getCategoryTitle(sec.seeAllTargetCategoryId) : "—"}</div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-block px-3 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded">
                            {(sec.cards || []).length}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const section = home.categorySections.find((s) => s.id === sec.id);
                                if (section) {
                                  setEditingCategorySectionId(sec.id);
                                  // Find the category ID from cards if available
                                  const categoryIdFromCards = section.cards?.[0]?.targetCategoryId || section.seeAllTargetCategoryId || "";
                                  setCategorySectionForm({
                                    title: section.title || "",
                                    seeAllTargetCategoryId: section.seeAllTargetCategoryId || "",
                                    selectedCategoryId: categoryIdFromCards,
                                    cards: section.cards || [],
                                  });
                                  setIsCategorySectionModalOpen(true);
                                }
                              }}
                              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                patchHome({
                                  categorySections: (home.categorySections || []).filter((x) => x.id !== sec.id),
                                })
                              }
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="Delete"
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
        </div>
      </CardShell>

      <CardShell icon={FiGrid} title="Home Categories">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">{categories.length} categories</div>
        </div>
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No categories yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 w-12">#</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 w-20">Icon</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Slug</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Badge</th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-gray-700 w-32">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-gray-700 w-40">Order</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c, idx) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-sm font-semibold text-gray-600">{idx + 1}</td>
                    <td className="py-4 px-4">
                      {c.homeIconUrl ? (
                        <img src={c.homeIconUrl} alt={c.title} className="h-12 w-12 object-cover rounded-lg border border-gray-200" />
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-400">No icon</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900">{c.title || "Untitled"}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-600">{c.slug || "—"}</div>
                    </td>
                    <td className="py-4 px-4">
                      {c.homeBadge ? (
                        <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded">{c.homeBadge}</span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded ${c.showOnHome !== false ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"}`}>
                        {c.showOnHome !== false ? "VISIBLE" : "HIDDEN"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => moveCategory(c.id, "up")}
                          className="px-2 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-xs font-semibold"
                          title="Move up"
                          disabled={idx === 0}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveCategory(c.id, "down")}
                          className="px-2 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-xs font-semibold"
                          title="Move down"
                          disabled={idx === categories.length - 1}
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardShell>
      <Modal
        isOpen={isBannerModalOpen}
        onClose={resetBannerForm}
        title={editingBannerId ? "Edit Banner" : "Add Banner"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const response = await serviceService.uploadImage(file);
                    if (response.success) {
                      setBannerForm((p) => ({ ...p, imageUrl: response.imageUrl }));
                    }
                  } catch (error) {
                    console.error('Banner upload error:', error);
                    const msg = error.response?.data?.message || error.message || "Failed to upload image";
                    toast.error(msg);
                  }
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {bannerForm.imageUrl && (
              <img src={bannerForm.imageUrl} alt="Preview" className="h-24 w-24 object-cover rounded-lg border border-gray-200 mt-3" />
            )}
          </div>
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">Text (optional)</label>
            <input
              value={bannerForm.text}
              onChange={(e) => setBannerForm((p) => ({ ...p, text: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
              placeholder="Winter offers"
            />
          </div>
          <CategoryRedirectSelect
            value={bannerForm.targetCategoryId}
            onChange={(targetCategoryId) => setBannerForm((p) => ({ ...p, targetCategoryId }))}
            label="Redirect to service page (optional)"
          />
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">Scroll To Section (optional)</label>
            <input
              value={bannerForm.scrollToSection}
              onChange={(e) => setBannerForm((p) => ({ ...p, scrollToSection: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
              placeholder="Waxing & threading"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={saveBanner}
              className="flex-1 py-3.5 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              style={{ backgroundColor: '#2874F0' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1e5fd4'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2874F0'}
            >
              <FiSave className="w-5 h-5" />
              {editingBannerId ? "Update Banner" : "Add Banner"}
            </button>
            <button
              onClick={resetBannerForm}
              className="px-6 py-3.5 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-all border border-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isPromoModalOpen}
        onClose={resetPromoForm}
        title={editingPromoId ? "Edit Promo" : "Add Promo"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const response = await serviceService.uploadImage(file);
                    if (response.success) {
                      setPromoForm((p) => ({ ...p, imageUrl: response.imageUrl }));
                    }
                  } catch (error) {
                    console.error('Promo upload error:', error);
                    const msg = error.response?.data?.message || error.message || "Failed to upload image";
                    toast.error(msg);
                  }
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {promoForm.imageUrl && (
              <img src={promoForm.imageUrl} alt="Preview" className="h-24 w-24 object-cover rounded-lg border border-gray-200 mt-3" />
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Title</label>
              <input
                value={promoForm.title}
                onChange={(e) => setPromoForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                placeholder="Title"
              />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Subtitle</label>
              <input
                value={promoForm.subtitle}
                onChange={(e) => setPromoForm((p) => ({ ...p, subtitle: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                placeholder="Subtitle"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Button Text</label>
              <input
                value={promoForm.buttonText}
                onChange={(e) => setPromoForm((p) => ({ ...p, buttonText: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                placeholder="Explore"
              />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Gradient Class</label>
              <input
                value={promoForm.gradientClass}
                onChange={(e) => setPromoForm((p) => ({ ...p, gradientClass: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                placeholder="from-blue-600 to-blue-800"
              />
            </div>
          </div>
          <CategoryRedirectSelect
            value={promoForm.targetCategoryId}
            onChange={(targetCategoryId) => setPromoForm((p) => ({ ...p, targetCategoryId }))}
            label="Redirect to service page (optional)"
          />
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">Scroll To Section (optional)</label>
            <input
              value={promoForm.scrollToSection}
              onChange={(e) => setPromoForm((p) => ({ ...p, scrollToSection: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
              placeholder="Waxing & threading"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={savePromo}
              className="flex-1 py-3.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              style={{ backgroundColor: '#2874F0' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1e5fd4'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2874F0'}
            >
              <FiSave className="w-5 h-5" />
              {editingPromoId ? "Update Promo" : "Add Promo"}
            </button>
            <button
              onClick={resetPromoForm}
              className="px-6 py-3.5 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-all border border-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isCuratedModalOpen}
        onClose={resetCuratedForm}
        title={editingCuratedId ? "Edit Curated Service" : "Add Curated Service"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">Title</label>
            <input
              value={curatedForm.title}
              onChange={(e) => setCuratedForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
              placeholder="Bathroom Deep Cleaning"
            />
          </div>
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">GIF/Video</label>
            <input
              type="file"
              accept="image/gif,video/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const response = await serviceService.uploadImage(file);
                    if (response.success) {
                      setCuratedForm((p) => ({ ...p, gifUrl: response.imageUrl }));
                    }
                  } catch (error) {
                    console.error('Curated upload error:', error);
                    toast.error("Failed to upload image/video");
                  }
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {curatedForm.gifUrl && (
              <div className="mt-3">
                {curatedForm.gifUrl.match(/\.(gif|webp)$/i) ? (
                  <img src={curatedForm.gifUrl} alt="Preview" className="h-32 w-32 object-cover rounded-lg border border-gray-200" />
                ) : (
                  <video src={curatedForm.gifUrl} className="h-32 w-32 object-cover rounded-lg border border-gray-200" controls />
                )}
              </div>
            )}
          </div>
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">YouTube URL</label>
            <input
              value={curatedForm.youtubeUrl}
              onChange={(e) => setCuratedForm((p) => ({ ...p, youtubeUrl: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
              placeholder="https://youtube.com/..."
            />
          </div>
          <CategoryRedirectSelect
            value={curatedForm.targetCategoryId}
            onChange={(targetCategoryId) => setCuratedForm((p) => ({ ...p, targetCategoryId }))}
            label="Redirect to service page (optional)"
          />
          <div className="flex gap-3 pt-4">
            <button
              onClick={saveCurated}
              className="flex-1 py-3.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              style={{ backgroundColor: '#2874F0' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1e5fd4'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2874F0'}
            >
              <FiSave className="w-5 h-5" />
              {editingCuratedId ? "Update Curated Service" : "Add Curated Service"}
            </button>
            <button
              onClick={resetCuratedForm}
              className="px-6 py-3.5 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-all border border-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isNoteworthyModalOpen}
        onClose={resetNoteworthyForm}
        title={editingNoteworthyId ? "Edit New & Noteworthy" : "Add New & Noteworthy"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">Title</label>
            <input
              value={noteworthyForm.title}
              onChange={(e) => setNoteworthyForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
              placeholder="Bathroom & Kitchen Cleaning"
            />
          </div>
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const response = await serviceService.uploadImage(file);
                    if (response.success) {
                      setNoteworthyForm((p) => ({ ...p, imageUrl: response.imageUrl }));
                    }
                  } catch (error) {
                    console.error('Noteworthy upload error:', error);
                    const msg = error.response?.data?.message || error.message || "Failed to upload image";
                    toast.error(msg);
                  }
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {noteworthyForm.imageUrl && (
              <img src={noteworthyForm.imageUrl} alt="Preview" className="h-32 w-32 object-cover rounded-lg border border-gray-200 mt-3" />
            )}
          </div>
          <CategoryRedirectSelect
            value={noteworthyForm.targetCategoryId}
            onChange={(targetCategoryId) => setNoteworthyForm((p) => ({ ...p, targetCategoryId }))}
            label="Redirect to service page (optional)"
          />
          <div className="flex gap-3 pt-4">
            <button
              onClick={saveNoteworthy}
              className="flex-1 py-3.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              style={{ backgroundColor: '#2874F0' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1e5fd4'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2874F0'}
            >
              <FiSave className="w-5 h-5" />
              {editingNoteworthyId ? "Update" : "Add"}
            </button>
            <button
              onClick={resetNoteworthyForm}
              className="px-6 py-3.5 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-all border border-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isBookedModalOpen}
        onClose={resetBookedForm}
        title={editingBookedId ? "Edit Most Booked" : "Add Most Booked"}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">Title</label>
            <input
              value={bookedForm.title}
              onChange={(e) => setBookedForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
              placeholder="Intense cleaning (2 bathrooms)"
            />
          </div>
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const response = await serviceService.uploadImage(file);
                    if (response.success) {
                      setBookedForm((p) => ({ ...p, imageUrl: response.imageUrl }));
                    }
                  } catch (error) {
                    console.error('Booked upload error:', error);
                    const msg = error.response?.data?.message || error.message || "Failed to upload image";
                    toast.error(msg);
                  }
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {bookedForm.imageUrl && (
              <img src={bookedForm.imageUrl} alt="Preview" className="h-32 w-32 object-cover rounded-lg border border-gray-200 mt-3" />
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Rating</label>
              <input
                value={bookedForm.rating}
                onChange={(e) => setBookedForm((p) => ({ ...p, rating: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                placeholder="4.79"
              />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Reviews</label>
              <input
                value={bookedForm.reviews}
                onChange={(e) => setBookedForm((p) => ({ ...p, reviews: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                placeholder="3.7M"
              />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Price</label>
              <input
                value={bookedForm.price}
                onChange={(e) => setBookedForm((p) => ({ ...p, price: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                placeholder="950"
              />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Original Price</label>
              <input
                value={bookedForm.originalPrice}
                onChange={(e) => setBookedForm((p) => ({ ...p, originalPrice: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                placeholder="1,038"
              />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Discount</label>
              <input
                value={bookedForm.discount}
                onChange={(e) => setBookedForm((p) => ({ ...p, discount: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                placeholder="8%"
              />
            </div>
          </div>
          <CategoryRedirectSelect
            value={bookedForm.targetCategoryId}
            onChange={(targetCategoryId) => setBookedForm((p) => ({ ...p, targetCategoryId }))}
            label="Redirect to service page (optional)"
          />
          <div className="flex gap-3 pt-4">
            <button
              onClick={saveBooked}
              className="flex-1 py-3.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              style={{ backgroundColor: '#2874F0' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1e5fd4'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2874F0'}
            >
              <FiSave className="w-5 h-5" />
              {editingBookedId ? "Update" : "Add"}
            </button>
            <button
              onClick={resetBookedForm}
              className="px-6 py-3.5 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-all border border-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Category Section Modal */}
      <Modal
        isOpen={isCategorySectionModalOpen}
        onClose={resetCategorySectionForm}
        title={editingCategorySectionId ? "Edit Category Section" : "Add Category Section"}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">Section Title</label>
            <input
              value={categorySectionForm.title}
              onChange={(e) => setCategorySectionForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
              placeholder="e.g. Cleaning Essentials"
            />
          </div>
          <CategoryRedirectSelect
            value={categorySectionForm.seeAllTargetCategoryId}
            onChange={(seeAllTargetCategoryId) => setCategorySectionForm((p) => ({ ...p, seeAllTargetCategoryId }))}
            label="See All Redirect (Category)"
            help="When user clicks 'See All', redirect to this category"
          />

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-base font-bold text-gray-900">Cards ({categorySectionForm.cards.length})</label>
              <button
                type="button"
                onClick={() => {
                  resetCardForm();
                  setIsCardModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-white transition-all flex items-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
                style={{
                  background: 'linear-gradient(to right, #2874F0, #1e5fd4)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <FiPlus className="w-4 h-4" />
                <span>Add Card</span>
              </button>
            </div>
            {categorySectionForm.cards.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4 border border-gray-200 rounded-lg">
                No cards added. Select a category above to add.
              </div>
            ) : (
              <div className="space-y-2 border border-gray-200 rounded-lg p-3 max-h-96 overflow-y-auto">
                {categorySectionForm.cards.map((card) => {
                  const category = categories.find((c) => c.id === card.targetCategoryId);
                  return (
                    <div key={card.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        {card.imageUrl ? (
                          <img src={card.imageUrl} alt={card.title} className="h-12 w-12 object-cover rounded-lg border border-gray-200" />
                        ) : (
                          <div className="h-12 w-12 bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-400">No img</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900">{card.title || "Untitled"}</div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {card.rating && (
                              <span className="text-xs text-gray-600">⭐ {card.rating}</span>
                            )}
                            {card.reviews && (
                              <span className="text-xs text-gray-500">{card.reviews}</span>
                            )}
                            {card.price && (
                              <span className="text-xs font-semibold text-gray-900">₹{card.price}</span>
                            )}
                            {card.originalPrice && (
                              <span className="text-xs text-gray-400 line-through">₹{card.originalPrice}</span>
                            )}
                            {card.discount && (
                              <span className="text-xs font-semibold text-green-600">{card.discount} off</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCardId(card.id);
                            setCardForm({
                              title: card.title || "",
                              imageUrl: card.imageUrl || "",
                              rating: card.rating || "",
                              reviews: card.reviews || "",
                              price: card.price || "",
                              originalPrice: card.originalPrice || "",
                              discount: card.discount || "",
                              targetCategoryId: card.targetCategoryId || "",
                            });
                            setIsCardModalOpen(true);
                          }}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeCardFromSection(card.id)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Remove"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={saveCategorySection}
              className="flex-1 py-3.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              style={{ backgroundColor: '#2874F0' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1e5fd4'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2874F0'}
            >
              <FiSave className="w-5 h-5" />
              {editingCategorySectionId ? "Update Section" : "Add Section"}
            </button>
            <button
              onClick={resetCategorySectionForm}
              className="px-6 py-3.5 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-all border border-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Card Modal for Category Sections */}
      <Modal
        isOpen={isCardModalOpen}
        onClose={resetCardForm}
        title={editingCardId ? "Edit Card" : "Add Card"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">Card Title *</label>
            <input
              value={cardForm.title}
              onChange={(e) => setCardForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
              placeholder="e.g. Salon for Women"
            />
          </div>

          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const response = await serviceService.uploadImage(file);
                    if (response.success) {
                      setCardForm((p) => ({ ...p, imageUrl: response.imageUrl }));
                    }
                  } catch (error) {
                    console.error('Card upload error:', error);
                    toast.error("Failed to upload image");
                  }
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {cardForm.imageUrl && (
              <div className="mt-2">
                <img src={cardForm.imageUrl} alt="Preview" className="h-24 w-24 object-cover rounded-lg border border-gray-200" />
              </div>
            )}
            <input
              type="text"
              value={cardForm.imageUrl}
              onChange={(e) => setCardForm((p) => ({ ...p, imageUrl: e.target.value }))}
              className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Or paste image URL"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Rating (optional)</label>
              <input
                type="text"
                value={cardForm.rating}
                onChange={(e) => setCardForm((p) => ({ ...p, rating: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                placeholder="e.g. 4.79"
              />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Reviews (optional)</label>
              <input
                type="text"
                value={cardForm.reviews}
                onChange={(e) => setCardForm((p) => ({ ...p, reviews: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                placeholder="e.g. 3.7M"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Price *</label>
              <input
                type="text"
                value={cardForm.price}
                onChange={(e) => setCardForm((p) => ({ ...p, price: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                placeholder="e.g. 950"
              />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Original Price (optional)</label>
              <input
                type="text"
                value={cardForm.originalPrice}
                onChange={(e) => setCardForm((p) => ({ ...p, originalPrice: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                placeholder="e.g. 1,038"
              />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Discount (optional)</label>
              <input
                type="text"
                value={cardForm.discount}
                onChange={(e) => setCardForm((p) => ({ ...p, discount: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                placeholder="e.g. 8%"
              />
            </div>
          </div>

          <CategoryRedirectSelect
            value={cardForm.targetCategoryId}
            onChange={(targetCategoryId) => setCardForm((p) => ({ ...p, targetCategoryId }))}
            label="Target Category (optional)"
            help="When user clicks this card, redirect to this category"
          />

          <div className="flex gap-3 pt-4">
            <button
              onClick={saveCard}
              className="flex-1 py-3.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              style={{ backgroundColor: '#2874F0' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1e5fd4'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2874F0'}
            >
              <FiSave className="w-5 h-5" />
              {editingCardId ? "Update Card" : "Add Card"}
            </button>
            <button
              onClick={resetCardForm}
              className="px-6 py-3.5 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-all border border-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HomePage;
