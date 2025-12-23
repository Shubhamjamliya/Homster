import { useState, useEffect } from "react";
import { FiGrid, FiPlus, FiEdit2, FiTrash2, FiSave, FiLayers, FiPackage } from "react-icons/fi";
import { toast } from "react-hot-toast";
import CardShell from "../components/CardShell";
import Modal from "../components/Modal";
import { ensureIds, saveCatalog, slugify, toAssetUrl } from "../utils";
import { serviceService } from "../../../../../services/catalogService";

const SectionsPage = ({ catalog, setCatalog }) => {
  const services = catalog.services || [];
  const categories = catalog.categories || [];

  // Filter logic
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const filteredServices = selectedCategoryFilter === "all"
    ? services
    : services.filter(s => {
      if (s.categoryIds && s.categoryIds.length > 0) {
        return s.categoryIds.includes(selectedCategoryFilter);
      }
      return s.categoryId === selectedCategoryFilter;
    });

  const [serviceId, setServiceId] = useState(filteredServices[0]?.id || "");
  const service = services.find((s) => s.id === serviceId) || null;
  // Use Service Categories (Grid Items) as the "Sections"
  const gridItems = service?.page?.serviceCategoriesGrid || [];

  // Existing state...
  const [sectionId, setSectionId] = useState("");
  // We'll map sectionId to the 'title' of the grid item or something unique
  // Actually, we need to map to the matching real section if it exists, or just track the "active grid item"
  const [activeGridItem, setActiveGridItem] = useState(null);

  // Computed: The real section object matching the active grid item
  const activeSection = service?.sections?.find(s => s.title === activeGridItem?.title) || null;

  // Update sectionId to match activeSection if it exists, or clear it
  useEffect(() => {
    if (activeSection) {
      setSectionId(activeSection.id);
    } else {
      setSectionId(""); // No real section yet
    }
  }, [activeSection]);

  const [editingSectionId, setEditingSectionId] = useState(null);
  const [sectionForm, setSectionForm] = useState({
    title: "", anchorId: "", navImageUrl: "", navBadge: "", type: "standard",
  });

  const [editingCardId, setEditingCardId] = useState(null);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [uploadingSectionImage, setUploadingSectionImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const emptyCardForm = () => ({
    title: "", subtitle: "", price: "", originalPrice: "", discount: "",
    rating: "", reviews: "", duration: "", options: "", badge: "",
    description: "", featuresText: "", imageUrl: "", imageTextSubtitle: "", imageTextTitleLines: "" // Fixed typo
  });
  const [cardForm, setCardForm] = useState(emptyCardForm());

  // ... (reset functions) ...
  const resetSectionForm = () => {
    setEditingSectionId(null);
    setSectionForm({ title: "", anchorId: "", navImageUrl: "", navBadge: "", type: "standard" });
    setIsSectionModalOpen(false);
  };

  const resetCardForm = () => {
    setEditingCardId(null);
    setCardForm(emptyCardForm());
    setIsCardModalOpen(false);
  };

  useEffect(() => {
    // Auto-select first service when filter changes
    if (filteredServices.length > 0) {
      if (!filteredServices.find(s => s.id === serviceId)) {
        setServiceId(filteredServices[0].id);
      }
    } else {
      setServiceId("");
    }
  }, [selectedCategoryFilter, filteredServices]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // When service changes, reset selection
    setActiveGridItem(null);
    setSectionId("");
  }, [serviceId]);

  // Updated saveCard to create section if needed
  const saveCard = async () => {
    if (!service) return alert("Select a service first");
    if (!activeGridItem) return alert("Select a section (grid item) first");

    const title = cardForm.title.trim();
    if (!title) return alert("Service card title required");

    // Form data extraction...
    const subtitle = cardForm.subtitle.trim();
    const description = cardForm.description.trim();
    const imageUrl = cardForm.imageUrl.trim();
    const price = String(cardForm.price ?? "").trim();
    const originalPrice = String(cardForm.originalPrice ?? "").trim();
    const discount = cardForm.discount.trim();
    const rating = String(cardForm.rating ?? "").trim();
    const reviews = String(cardForm.reviews ?? "").trim();
    const duration = cardForm.duration.trim();
    const options = cardForm.options.trim();
    const badge = cardForm.badge.trim();
    const features = (cardForm.featuresText || "").split("\n").map((l) => l.trim()).filter(Boolean);
    const imageTextTitleLines = (cardForm.imageTextTitleLines || "").split("\n").map((l) => l.trim()).filter(Boolean);
    const imageTextSubtitle = cardForm.imageTextSubtitle.trim();
    const imageText = imageTextTitleLines.length || imageTextSubtitle ? { titleLines: imageTextTitleLines, subtitle: imageTextSubtitle } : null;

    try {
      const currentSections = service.sections || [];
      let targetSection = currentSections.find(s => s.title === activeGridItem.title);
      let isNewSection = !targetSection;

      // If section doesn't exist, create it based on Grid Item
      if (isNewSection) {
        targetSection = {
          id: `usec-${Date.now()}`,
          title: activeGridItem.title,
          anchorId: slugify(activeGridItem.title),
          navImageUrl: activeGridItem.imageUrl || "", // inherit from grid item
          navBadge: activeGridItem.badge || "",
          type: 'standard',
          cards: []
        };
      }

      const cards = Array.isArray(targetSection.cards) ? [...targetSection.cards] : [];
      let updatedCards;

      const newCard = {
        id: editingCardId || `ucard-${Date.now()}`,
        title, subtitle, price, originalPrice, discount, rating, reviews,
        duration, options, badge, description, imageUrl, features, imageText
      };

      if (editingCardId) {
        updatedCards = cards.map(c => c.id === editingCardId ? newCard : c);
      } else {
        updatedCards = [...cards, newCard];
      }

      const updatedSection = { ...targetSection, cards: updatedCards };

      let updatedSectionsList;
      if (isNewSection) {
        updatedSectionsList = [...currentSections, updatedSection];
      } else {
        updatedSectionsList = currentSections.map(s => s.id === updatedSection.id ? updatedSection : s);
      }

      await serviceService.update(serviceId, { sections: updatedSectionsList });

      // Update Catalog
      const next = ensureIds(catalog);
      next.services = next.services.map((s) => s.id === serviceId ? { ...s, sections: updatedSectionsList } : s);
      setCatalog(next);
      saveCatalog(next);
      window.dispatchEvent(new Event("adminUserAppCatalogUpdated"));
      resetCardForm();
      toast.success(editingCardId ? "Card updated" : "Card added");
    } catch (error) {
      console.error('Save card error:', error);
      toast.error('Failed to save card');
    }
  };

  const removeCard = async (id) => {
    if (!service || !activeSection) return;
    if (!window.confirm("Delete this card?")) return;

    try {
      const currentSections = service.sections || [];
      const updatedCards = activeSection.cards.filter(c => c.id !== id);
      const updatedSection = { ...activeSection, cards: updatedCards };
      const updatedSectionsList = currentSections.map(s => s.id === activeSection.id ? updatedSection : s);

      await serviceService.update(serviceId, { sections: updatedSectionsList });

      const next = ensureIds(catalog);
      next.services = next.services.map((s) => s.id === serviceId ? { ...s, sections: updatedSectionsList } : s);
      setCatalog(next);
      saveCatalog(next);
      window.dispatchEvent(new Event("adminUserAppCatalogUpdated"));
      if (editingCardId === id) resetCardForm();
      toast.success("Card deleted");
    } catch (error) {
      toast.error("Failed to delete card");
    }
  };

  // Re-implemented Render
  return (
    <div className="space-y-8">
      <CardShell icon={FiLayers} title="Service Sections Management">
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
            </div>
            <div className="text-sm text-gray-500 whitespace-nowrap px-2">
              <strong>{filteredServices.length}</strong> services found
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-3">Select Service</label>
            <select
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value);
                resetSectionForm();
                resetCardForm();
                setActiveGridItem(null);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
            >
              {filteredServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title || "Untitled"}
                </option>
              ))}
              {filteredServices.length === 0 && <option disabled>No services available</option>}
            </select>
          </div>
        </div>
      </CardShell>

      {service && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT: Grid Items List (Sections) */}
          <div className="lg:col-span-1">
            <CardShell icon={FiGrid} title={`Sections (${gridItems.length})`}>
              <div className="text-sm text-gray-500 mb-4 px-1">
                These sections correspond to the Service Categories (Grid Items) defined for this service.
              </div>

              {gridItems.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-dashed border border-gray-200">
                  <p className="text-gray-500 font-medium">No Grid Items Defined</p>
                  <p className="text-xs text-gray-400 mt-1">Go to "Services" page to add items to the Grid.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {gridItems.map((item, idx) => {
                    // Check if this grid item has a corresponding real section with cards
                    const matchingSection = service.sections?.find(s => s.title === item.title);
                    const cardCount = matchingSection?.cards?.length || 0;
                    const isActive = activeGridItem?.title === item.title;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setActiveGridItem(item);
                          setCardForm(emptyCardForm());
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${isActive ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <img src={toAssetUrl(item.imageUrl)} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">IMG</div>
                          )}
                          <div>
                            <div className={`font-bold text-sm ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>{item.title}</div>
                            <div className="text-xs text-gray-500">{cardCount} service cards</div>
                          </div>
                        </div>
                        <div className="text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardShell>
          </div>

          {/* RIGHT: Cards Management */}
          <div className="lg:col-span-2">
            {activeGridItem ? (
              <CardShell icon={FiPackage} title={`Content: ${activeGridItem.title}`}>
                <div className="flex justify-between items-center mb-6">
                  <div className="text-sm text-gray-600">
                    Managing cards for section <strong>"{activeGridItem.title}"</strong>.
                    {!activeSection && <span className="text-amber-600 ml-2 text-xs">(Section will be created on first save)</span>}
                  </div>
                  <button
                    onClick={() => {
                      resetCardForm();
                      setIsCardModalOpen(true);
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold shadow-md hover:bg-primary-700 transition-all flex items-center gap-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Card
                  </button>
                </div>

                {(!activeSection || !activeSection.cards || activeSection.cards.length === 0) ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No service cards in this section yet.</p>
                    <button onClick={() => setIsCardModalOpen(true)} className="mt-2 text-primary-600 hover:underline text-sm font-semibold">
                      Create the first card
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeSection.cards.map((card) => (
                      <div key={card.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                        <div className="flex gap-4">
                          {card.imageUrl ? (
                            <img src={toAssetUrl(card.imageUrl)} className="w-20 h-20 rounded-lg object-cover bg-gray-50" />
                          ) : (
                            <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Img</div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">{card.title}</h4>
                            <p className="text-primary-600 font-bold text-sm">₹{card.price} <span className="text-gray-400 font-normal line-through text-xs ml-1">₹{card.originalPrice}</span></p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {card.rating && <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-[10px] font-bold rounded border border-yellow-100">⭐ {card.rating}</span>}
                              {card.duration && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded border border-gray-200">{card.duration}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-lg backdrop-blur-sm shadow-sm">
                          <button onClick={() => { setEditingCardId(card.id); setCardForm({ ...card, featuresText: (card.features || []).join('\n'), imageTextTitleLines: (card.imageText?.titleLines || []).join('\n'), imageTextSubtitle: card.imageText?.subtitle || "" }); setIsCardModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => removeCard(card.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </CardShell>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <FiGrid className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Select a Section</h3>
                <p className="text-gray-500 max-w-sm">
                  Choose a section from the list on the left to manage its service cards.
                </p>
              </div>
            )}
          </div>
        </div>
      )}



      <Modal
        isOpen={isCardModalOpen}
        onClose={resetCardForm}
        title={editingCardId ? "Edit Service Card" : "Add Service Card"}
        size="xl"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Title *</label>
              <input
                value={cardForm.title}
                onChange={(e) => setCardForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Fan Repair"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Subtitle (optional)</label>
              <input
                value={cardForm.subtitle}
                onChange={(e) => setCardForm((p) => ({ ...p, subtitle: e.target.value }))}
                placeholder="e.g. Roll-on waxing starting at"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Price *</label>
              <input
                value={cardForm.price}
                onChange={(e) => setCardForm((p) => ({ ...p, price: e.target.value }))}
                placeholder="e.g. 199"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Original Price (optional)</label>
              <input
                value={cardForm.originalPrice}
                onChange={(e) => setCardForm((p) => ({ ...p, originalPrice: e.target.value }))}
                placeholder="e.g. 299"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Discount (optional)</label>
              <input
                value={cardForm.discount}
                onChange={(e) => setCardForm((p) => ({ ...p, discount: e.target.value }))}
                placeholder="e.g. 20% OFF"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Duration</label>
              <input
                value={cardForm.duration}
                onChange={(e) => setCardForm((p) => ({ ...p, duration: e.target.value }))}
                placeholder="e.g. 60 mins"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Rating</label>
              <input
                value={cardForm.rating}
                onChange={(e) => setCardForm((p) => ({ ...p, rating: e.target.value }))}
                placeholder="e.g. 4.85"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Reviews</label>
              <input
                value={cardForm.reviews}
                onChange={(e) => setCardForm((p) => ({ ...p, reviews: e.target.value }))}
                placeholder="e.g. 250K"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Badge</label>
              <input
                value={cardForm.badge}
                onChange={(e) => setCardForm((p) => ({ ...p, badge: e.target.value }))}
                placeholder="BESTSELLER / Price Drop"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Options</label>
              <input
                value={cardForm.options}
                onChange={(e) => setCardForm((p) => ({ ...p, options: e.target.value }))}
                placeholder="e.g. 2 options"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">Description</label>
            <textarea
              value={cardForm.description}
              onChange={(e) => setCardForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Short description"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">Features (one per line)</label>
            <textarea
              value={cardForm.featuresText}
              onChange={(e) => setCardForm((p) => ({ ...p, featuresText: e.target.value }))}
              placeholder={"Example:\n- Complete wiring diagnosis\n- Certified technicians"}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Image Text Lines (one per line, optional)</label>
              <textarea
                value={cardForm.imageTextTitleLines}
                onChange={(e) => setCardForm((p) => ({ ...p, imageTextTitleLines: e.target.value }))}
                placeholder={"Boost\nyour skin's\nmoisture"}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Image Text Subtitle (optional)</label>
              <textarea
                value={cardForm.imageTextSubtitle}
                onChange={(e) => setCardForm((p) => ({ ...p, imageTextSubtitle: e.target.value }))}
                placeholder="Papaya extracts exfoliate & renew"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">Image</label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                disabled={uploadingImage}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadingImage(true);
                    try {
                      console.log('Uploading card image:', file.name);
                      const response = await serviceService.uploadImage(file);
                      console.log('Upload response:', response);
                      if (response.success && response.imageUrl) {
                        console.log('Setting imageUrl:', response.imageUrl);
                        setCardForm((p) => ({ ...p, imageUrl: response.imageUrl }));
                        toast.success("Image uploaded successfully");
                      } else {
                        toast.error("Upload failed - no image URL returned");
                      }
                    } catch (error) {
                      console.error('Card image upload error:', error);
                      const errorMsg = error.response?.data?.message || error.message || "Failed to upload image";
                      toast.error(errorMsg);
                    } finally {
                      setUploadingImage(false);
                    }
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {uploadingImage && (
                <div className="mt-2 flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-sm font-medium">Uploading image...</span>
                </div>
              )}
              {cardForm.imageUrl && !uploadingImage && (
                <div className="mt-2">
                  <img src={toAssetUrl(cardForm.imageUrl)} alt="Preview" className="h-32 w-32 object-cover rounded-lg border border-gray-200" />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={saveCard}
              disabled={uploadingImage}
              className="flex-1 py-3.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave className="w-5 h-5" />
              {uploadingImage ? "Uploading image..." : (editingCardId ? "Update Service Card" : "Add Service Card")}
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

export default SectionsPage;
