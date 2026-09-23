import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiShoppingCart, 
  FiTrash2, 
  FiPlus, 
  FiMinus, 
  FiShield, 
  FiCheckCircle, 
  FiArrowRight, 
  FiFileText,
  FiZap
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../../theme';
import { useCart } from '../../../../context/CartContext';
import NotificationBell from '../../components/common/NotificationBell';

// Service Icons imports
import electricianIcon from '../../../../assets/images/icons/services/electrician.png';
import womensSalonIcon from '../../../../assets/images/icons/services/womens-salon-spa-icon.png';
import massageMenIcon from '../../../../assets/images/icons/services/massage-men-icon.png';
import cleaningIcon from '../../../../assets/images/icons/services/cleaning-icon.png';
import acApplianceRepairIcon from '../../../../assets/images/icons/services/ac-appliance-repair-icon.png';
import washingMachineIcon from '../../../../assets/images/icons/services/washing-machine-icon.png';
import waterPurifierIcon from '../../../../assets/images/icons/services/water-purifier-icon.png';
import refrigeratorIcon from '../../../../assets/images/icons/services/refrigerator-icon.png';
import microwaveIcon from '../../../../assets/images/icons/services/microwave-icon.png';
import geyserIcon from '../../../../assets/images/icons/services/geyser-icon.png';
import acIcon from '../../../../assets/images/icons/services/ac-icon.png';
import plumberIcon from '../../../../assets/images/icons/services/plumber.png';
import carpenterIcon from '../../../../assets/images/icons/services/carpenter.png';
import bathroomCleanIcon from '../../../../assets/images/icons/services/bathroom-clean.png';
import sofaIcon from '../../../../assets/images/icons/services/sofa.png';
import salonIcon from '../../../../assets/images/icons/services/salon.png';
import spaIcon from '../../../../assets/images/icons/services/spa.png';
import hairIcon from '../../../../assets/images/icons/services/hair.png';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, isLoading: loading, removeItem, removeCategoryItems, updateItem } = useCart();

  // Smart Category Icon Mapper
  const getCategoryIcon = (category) => {
    if (!category) return electricianIcon;
    const cat = category.toLowerCase().trim();

    if (cat.includes('washing')) return washingMachineIcon;
    if (cat.includes('water') || cat.includes('ro') || cat.includes('purifier')) return waterPurifierIcon;
    if (cat.includes('fridge') || cat.includes('refrigerator')) return refrigeratorIcon;
    if (cat.includes('microwave') || cat.includes('oven')) return microwaveIcon;
    if (cat.includes('geyser') || cat.includes('heater')) return geyserIcon;
    if (cat.includes('ac') || cat.includes('air conditioner')) return acIcon;
    if (cat.includes('appliance')) return acApplianceRepairIcon;
    if (cat.includes('plumb')) return plumberIcon;
    if (cat.includes('carpenter')) return carpenterIcon;
    if (cat.includes('electric')) return electricianIcon;
    if (cat.includes('bath') || cat.includes('kitchen')) return bathroomCleanIcon;
    if (cat.includes('sofa') || cat.includes('carpet')) return sofaIcon;
    if (cat.includes('clean')) return cleaningIcon;
    if (cat.includes('women')) return womensSalonIcon;
    if (cat.includes('salon')) return salonIcon;
    if (cat.includes('men') || cat.includes('massage')) return massageMenIcon;
    if (cat.includes('spa')) return spaIcon;
    if (cat.includes('hair')) return hairIcon;

    return electricianIcon;
  };

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups = {};
    cartItems.forEach(item => {
      const category = item.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });
    return groups;
  }, [cartItems]);

  const cartCount = cartItems.length;

  const handleBack = () => {
    navigate(-1);
  };

  const handleDeleteCategory = async (category) => {
    try {
      const response = await removeCategoryItems(category);
      if (response.success) {
        toast.success('Category items removed');
      } else {
        toast.error(response.message || 'Failed to remove category items');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove category items');
    }
  };

  const handleDelete = async (itemId) => {
    try {
      const response = await removeItem(itemId);
      if (response.success) {
        toast.success('Item removed from cart');
      } else {
        toast.error(response.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove item');
    }
  };

  const handleQuantityChange = async (itemId, change) => {
    try {
      const item = cartItems.find(i => (i._id || i.id) === itemId);
      if (!item) return;

      const newCount = Math.max(1, (item.serviceCount || 1) + change);
      const response = await updateItem(itemId, newCount);

      if (!response.success) {
        toast.error(response.message || 'Failed to update quantity');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update quantity');
    }
  };

  const handleAddServices = (category) => {
    const itemsInCategory = groupedItems[category];
    const categoryId = itemsInCategory?.[0]?.categoryId;

    navigate('/user', {
      state: {
        openCategoryId: categoryId,
        openCategoryName: category
      }
    });
  };

  const handleCategoryCheckout = (category) => {
    navigate('/user/checkout', { state: { category: category } });
  };

  // Calculate totals for all items
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalOriginalPrice = cartItems.reduce((sum, item) => {
    const unitOriginalPrice = item.originalPrice || (item.unitPrice || (item.price / (item.serviceCount || 1)));
    return sum + (unitOriginalPrice * (item.serviceCount || 1));
  }, 0);
  const totalSavings = Math.max(0, totalOriginalPrice - totalPrice);

  return (
    <div className="min-h-screen pb-32 relative bg-white">
      {/* Refined Brand Mesh Gradient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(at 0% 0%, ${themeColors?.brand?.teal || '#347989'}15 0%, transparent 70%),
              radial-gradient(at 100% 0%, ${themeColors?.brand?.yellow || '#D68F35'}12 0%, transparent 70%),
              radial-gradient(at 100% 100%, ${themeColors?.brand?.orange || '#BB5F36'}10 0%, transparent 75%),
              radial-gradient(at 0% 100%, ${themeColors?.brand?.teal || '#347989'}08 0%, transparent 70%),
              #FFFFFF
            `
          }}
        />
        {/* Subtle dot overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(${themeColors?.brand?.teal || '#347989'} 1px, transparent 1px)`,
            backgroundSize: '28px 28px'
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Sticky Modern Glassmorphism Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-black/[0.04] px-4 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-xs border border-black/[0.05] active:scale-95 transition-all text-slate-800 hover:text-black"
              aria-label="Go Back"
            >
              <FiArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Your Cart</h1>
              {cartCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#347989]/10 text-[#347989] border border-[#347989]/20 shadow-2xs">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
          </div>
          <NotificationBell />
        </header>

        {/* Main Content */}
        <main className="px-4 py-5 space-y-5 max-w-lg mx-auto">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-slate-200 rounded-2xl"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-32 bg-slate-200 rounded-lg"></div>
                      <div className="h-3 w-24 bg-slate-100 rounded-lg"></div>
                    </div>
                  </div>
                  <div className="h-10 bg-slate-100 rounded-xl"></div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-10 bg-slate-200 rounded-xl"></div>
                    <div className="flex-1 h-10 bg-slate-300 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty Cart State */
            <div className="py-20 px-6 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#347989]/10 to-[#D68F35]/10 border border-[#347989]/20 flex items-center justify-center mb-5 text-[#347989] shadow-inner">
                <FiShoppingCart className="w-10 h-10 stroke-[2]" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Your cart is empty</h2>
              <p className="text-sm text-slate-500 mt-1.5 max-w-xs font-medium">
                Explore our certified home services and book trusted professionals in seconds.
              </p>
              <button
                onClick={() => navigate('/user')}
                className="mt-6 px-6 py-3 bg-[#347989] hover:bg-[#2d6977] text-white rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#347989]/25 active:scale-95 transition-all"
              >
                <span>Explore Services</span>
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {/* Grouped Category Cards */}
              <div className="space-y-4">
                {Object.entries(groupedItems).map(([category, items]) => {
                  const categoryTotal = items.reduce((sum, item) => sum + (item.price || 0), 0);
                  const categoryIcon = getCategoryIcon(category);
                  const serviceCount = items.reduce((sum, item) => sum + (item.serviceCount || 1), 0);

                  return (
                    <div
                      key={category}
                      className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md"
                    >
                      {/* Category Header */}
                      <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          {/* Icon Container */}
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#347989]/10 to-[#347989]/5 border border-[#347989]/20 flex items-center justify-center p-2.5 shrink-0 shadow-2xs">
                            <img
                              src={categoryIcon}
                              alt={category}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-extrabold text-slate-900 truncate">
                              {category}
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 mt-0.5">
                              {serviceCount} {serviceCount === 1 ? 'service' : 'services'} • <span className="text-slate-900 font-bold">₹{categoryTotal.toLocaleString('en-IN')}</span>
                            </p>
                          </div>
                        </div>

                        {/* Delete Category Button */}
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0 active:scale-90"
                          title="Remove all items in category"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Items in Category */}
                      <div className="py-3 divide-y divide-slate-100">
                        {items.map((item) => (
                          <div 
                            key={item._id || item.id} 
                            className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 leading-snug truncate">
                                {item.title}
                              </h4>
                              {item.description && (
                                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                                  {item.description}
                                </p>
                              )}
                              <p className="text-xs font-bold text-slate-900 mt-1">
                                ₹{(item.price || 0).toLocaleString('en-IN')}
                              </p>
                            </div>

                            {/* Stepper & Delete */}
                            <div className="flex items-center gap-2 shrink-0">
                              {/* Pill Stepper */}
                              <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-xl p-0.5 shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if ((item.serviceCount || 1) <= 1) {
                                      handleDelete(item._id || item.id);
                                    } else {
                                      handleQuantityChange(item._id || item.id, -1);
                                    }
                                  }}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-600 hover:bg-white active:scale-95 transition-all"
                                  title={(item.serviceCount || 1) <= 1 ? "Remove item" : "Decrease quantity"}
                                >
                                  {(item.serviceCount || 1) <= 1 ? (
                                    <FiTrash2 className="w-3.5 h-3.5 text-red-500" />
                                  ) : (
                                    <FiMinus className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <span className="w-7 text-center text-xs font-bold text-slate-800 select-none">
                                  {item.serviceCount || 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleQuantityChange(item._id || item.id, 1)}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-700 hover:text-[#347989] hover:bg-white active:scale-95 transition-all"
                                  title="Increase quantity"
                                >
                                  <FiPlus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-3 flex gap-2.5">
                        <button
                          onClick={() => handleAddServices(category)}
                          className="flex-1 px-4 py-2.5 bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs"
                        >
                          Add Services
                        </button>
                        <button
                          onClick={() => handleCategoryCheckout(category)}
                          className="flex-1 px-4 py-2.5 rounded-2xl text-xs font-bold text-white transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                          style={{
                            backgroundColor: themeColors.button || '#347989',
                            boxShadow: `0 4px 12px ${themeColors.brand?.teal || '#347989'}40`
                          }}
                        >
                          <span>Book</span>
                          <FiArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Trust & Guarantee Banner */}
              <div className="bg-gradient-to-r from-[#347989]/5 via-white to-[#D68F35]/5 rounded-3xl p-4 border border-[#347989]/15 shadow-2xs">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#347989]/10 text-[#347989] flex items-center justify-center shrink-0">
                    <FiShield className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Homster Service Promise</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Safe, reliable, and verified at your doorstep</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Verified Experts</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Transparent Pricing</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Safe Contactless Pay</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Free Cancellation</span>
                  </div>
                </div>
              </div>

              {/* Bill Summary Card */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <FiFileText className="w-4 h-4 text-slate-500" />
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Bill Summary
                  </h4>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Total Services ({cartItems.length})</span>
                    <span className="font-semibold text-slate-900">₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Taxes & Service Fee</span>
                    <span className="font-semibold text-emerald-600">Included</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Platform Convenience Fee</span>
                    <span className="font-bold text-emerald-600 uppercase text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      FREE
                    </span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex items-center justify-between text-emerald-700 bg-emerald-50/70 p-2 rounded-xl border border-emerald-200/60">
                      <span className="font-bold">Total Savings</span>
                      <span className="font-extrabold">-₹{totalSavings.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm">
                    <span className="font-extrabold text-slate-900">Total Payable</span>
                    <span className="font-black text-slate-900 text-base">
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Cart;
