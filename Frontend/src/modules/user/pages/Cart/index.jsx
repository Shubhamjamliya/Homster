import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiLoader } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../../theme';
import BottomNav from '../../components/layout/BottomNav';
import { cartService } from '../../../../services/cartService';
import electricianIcon from '../../../../assets/images/icons/services/electrician.png';
import womensSalonIcon from '../../../../assets/images/icons/services/womens-salon-spa-icon.png';
import massageMenIcon from '../../../../assets/images/icons/services/massage-men-icon.png';
import cleaningIcon from '../../../../assets/images/icons/services/cleaning-icon.png';
import acApplianceRepairIcon from '../../../../assets/images/icons/services/ac-appliance-repair-icon.png';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart items from backend
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        const response = await cartService.getCart();
        if (response.success) {
          setCartItems(response.data || []);
        } else {
          toast.error(response.message || 'Failed to load cart');
          setCartItems([]);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        toast.error('Failed to load cart');
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // Category icon mapping
  const getCategoryIcon = (category) => {
    const iconMap = {
      'Electrician': electricianIcon,
      'Electricity': electricianIcon,
      "Women's Salon & Spa": womensSalonIcon,
      'Salon for Women': womensSalonIcon,
      'Salon Prime': womensSalonIcon,
      'Massage for Men': massageMenIcon,
      'Cleaning': cleaningIcon,
      'Bathroom & Kitchen Cleaning': cleaningIcon,
      'Sofa & Carpet Cleaning': cleaningIcon,
      'AC Service and Repair': acApplianceRepairIcon,
      'AC & Appliance Repair': acApplianceRepairIcon,
    };
    return iconMap[category] || electricianIcon; // Default icon
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
      const response = await cartService.removeCategoryItems(category);
      if (response.success) {
        setCartItems(response.data || []);
        toast.success('Category items removed');
      } else {
        toast.error(response.message || 'Failed to remove category items');
      }
    } catch (error) {
      console.error('Error removing category items:', error);
      toast.error('Failed to remove category items');
    }
  };

  const handleDelete = async (itemId) => {
    try {
      const response = await cartService.removeItem(itemId);
      if (response.success) {
        setCartItems(response.data || []);
        toast.success('Item removed from cart');
      } else {
        toast.error(response.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const handleQuantityChange = async (itemId, change) => {
    try {
      const item = cartItems.find(i => (i._id || i.id) === itemId);
      if (!item) return;

      const newCount = Math.max(1, (item.serviceCount || 1) + change);
      const response = await cartService.updateItem(itemId, newCount);
      
      if (response.success) {
        setCartItems(response.data || []);
      } else {
        toast.error(response.message || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const handleAddServices = (category) => {
    // Navigate to dynamic service page using category slug
    const slugMap = {
      'Electrician': 'electrician-services',
      'Electricity': 'electrician-services',
      "Women's Salon & Spa": 'salon-for-women',
      'Salon for Women': 'salon-for-women',
      'Salon Prime': 'salon-for-women',
      'Massage for Men': 'massage-for-men',
      'Bathroom & Kitchen Cleaning': 'bathroom-kitchen-cleaning',
      'Sofa & Carpet Cleaning': 'sofa-carpet-cleaning',
      'AC Service and Repair': 'ac-service',
      'AC & Appliance Repair': 'ac-service',
    };
    const slug = slugMap[category] || category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    navigate(`/user/${slug}`);
  };

  const handleCategoryCheckout = (category) => {
    navigate('/user/checkout', { state: { category: category } });
  };

  const handleCartClick = () => {
    // Already on cart page
  };

  // Calculate totals for all items
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalOriginalPrice = cartItems.reduce((sum, item) => {
    const unitOriginalPrice = item.originalPrice || (item.unitPrice || (item.price / (item.serviceCount || 1)));
    return sum + (unitOriginalPrice * (item.serviceCount || 1));
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 text-black" />
            </button>
            <div className="flex items-center gap-2">
              <FiShoppingCart className="w-5 h-5" style={{ color: themeColors.button }} />
              <h1 className="text-xl font-bold text-black">Your cart</h1>
              {cartCount > 0 && (
                <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Cart Items - Grouped by Category */}
      <main className="px-4 py-4" style={{ paddingBottom: cartItems.length > 0 ? '70px' : '100px' }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FiLoader className="w-16 h-16 text-gray-300 mb-4 animate-spin" />
            <p className="text-gray-500 text-lg font-medium">Loading cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FiShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">Your cart is empty</p>
            <p className="text-gray-400 text-sm mt-2">Add services to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedItems).map(([category, items]) => {
              const categoryTotal = items.reduce((sum, item) => sum + (item.price || 0), 0);
              const categoryIcon = getCategoryIcon(category);
              const serviceCount = items.reduce((sum, item) => sum + (item.serviceCount || 1), 0);

              return (
                <div
                  key={category}
                  className="bg-white rounded-2xl shadow-md border border-gray-100"
                  style={{
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
                    padding: '16px'
                  }}
                >
                  {/* Category Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Category Icon */}
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                        style={{
                          backgroundColor: 'rgba(0, 166, 166, 0.08)',
                          border: '2px solid rgba(0, 166, 166, 0.1)'
                        }}
                      >
                        <img
                          src={categoryIcon}
                          alt={category}
                          className="w-12 h-12 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                        <div
                          className="hidden items-center justify-center"
                          style={{
                            width: '48px',
                            height: '48px',
                            display: 'none'
                          }}
                        >
                          <FiShoppingCart className="w-8 h-8" style={{ color: themeColors.button }} />
                        </div>
                      </div>

                      {/* Category Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-black mb-1">{category}</h3>
                        <p className="text-sm text-gray-600">
                          {serviceCount} {serviceCount === 1 ? 'service' : 'services'} • ₹{categoryTotal.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* Delete Category Button */}
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors shrink-0"
                    >
                      <FiTrash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>

                  {/* Services List */}
                  <div className="mb-4 space-y-2">
                    {items.map((item) => (
                      <div key={item._id || item.id} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 font-medium">
                            {item.title} X {item.serviceCount || 1}
                          </p>
                          {item.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-semibold text-black">
                            ₹{(item.price || 0).toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => handleDelete(item._id || item.id)}
                            className="p-1 hover:bg-red-50 rounded transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddServices(category)}
                      className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all active:scale-95"
                    >
                      Add Services
                    </button>
                    <button
                      onClick={() => handleCategoryCheckout(category)}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 shadow-md"
                      style={{ 
                        backgroundColor: themeColors.button,
                        boxShadow: '0 2px 6px rgba(0, 166, 166, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = themeColors.button;
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 166, 166, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = themeColors.button;
                        e.target.style.boxShadow = '0 2px 6px rgba(0, 166, 166, 0.3)';
                      }}
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Cart;
