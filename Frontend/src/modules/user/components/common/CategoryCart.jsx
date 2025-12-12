import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiX, FiShoppingCart, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { themeColors } from '../../../../theme';
import BottomNav from '../layout/BottomNav';

const CategoryCart = ({
  isOpen,
  onClose,
  category,
  categoryTitle
}) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  // Load cart items from localStorage
  useEffect(() => {
    const updateCart = () => {
      const items = JSON.parse(localStorage.getItem('cartItems') || '[]');
      // Filter by category
      const categoryItems = items.filter(item => item.category === category);
      setCartItems(categoryItems);
    };

    updateCart();
    window.addEventListener('cartUpdated', updateCart);
    window.addEventListener('storage', updateCart);

    return () => {
      window.removeEventListener('cartUpdated', updateCart);
      window.removeEventListener('storage', updateCart);
    };
  }, [category]);

  const handleClose = () => {
    onClose();
  };

  const handleDelete = (itemId) => {
    const allItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const updatedItems = allItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems.filter(item => item.category === category));
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleQuantityChange = (itemId, change) => {
    const allItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const updatedItems = allItems.map(item => {
      if (item.id === itemId) {
        const newCount = Math.max(1, (item.serviceCount || 1) + change);
        const unitPrice = item.unitPrice || (item.price / (item.serviceCount || 1));
        const newPrice = unitPrice * newCount;
        return {
          ...item,
          serviceCount: newCount,
          price: newPrice,
          unitPrice: unitPrice
        };
      }
      return item;
    });
    setCartItems(updatedItems.filter(item => item.category === category));
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleCheckout = () => {
    navigate('/user/checkout', { state: { category: category } });
  };

  const handleCartClick = () => {
    // Already on category cart page
  };

  if (!isOpen) return null;

  // Calculate totals
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalOriginalPrice = cartItems.reduce((sum, item) => {
    const unitOriginalPrice = item.originalPrice || (item.unitPrice || (item.price / (item.serviceCount || 1)));
    return sum + (unitOriginalPrice * (item.serviceCount || 1));
  }, 0);

  const cartCount = cartItems.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiArrowLeft className="w-5 h-5 text-black" />
              </button>
              <h1 className="text-xl font-bold text-black">{categoryTitle || 'Cart'}</h1>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>
        <div className="border-b border-gray-200"></div>
      </header>

      {/* Cart Items */}
      <main className="px-4 py-4" style={{ paddingBottom: cartItems.length > 0 ? '240px' : '100px' }}>
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FiShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">Your cart is empty</p>
            <p className="text-gray-400 text-sm mt-2">Add services to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
                  padding: '16px'
                }}
              >
                <div className="flex gap-4 mb-4">
                  {/* Service Icon - Modern Card */}
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden leading-none self-start"
                    style={{
                      backgroundColor: 'rgba(0, 166, 166, 0.08)',
                      border: '2px solid rgba(0, 166, 166, 0.1)',
                      lineHeight: 0,
                      alignSelf: 'flex-start'
                    }}
                  >
                    {item.icon ? (
                      <img
                        src={item.icon}
                        alt={item.title}
                        className="w-14 h-14 object-contain"
                        style={{
                          display: 'block',
                          margin: 0,
                          padding: 0,
                          verticalAlign: 'top',
                          lineHeight: 0
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`flex items-center justify-center ${item.icon ? 'hidden' : 'flex'}`}
                      style={{
                        width: '56px',
                        height: '56px',
                        display: item.icon ? 'none' : 'flex'
                      }}
                    >
                      <FiShoppingCart className="w-8 h-8" style={{ color: themeColors.button }} />
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="flex-1 min-w-0">
                    {/* Title and Delete Button */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base font-bold text-black leading-tight flex-1">{item.title}</h3>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                      >
                        <FiTrash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quantity Control and Price - Outside flex container */}
                <div className="flex items-center justify-between mb-4">
                  {/* Quantity Control */}
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-gray-600 font-medium">Quantity:</span>
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        <FiMinus className="w-4 h-4 text-gray-700" />
                      </button>
                      <span className="text-sm font-bold text-black min-w-[24px] text-center">
                        {item.serviceCount || 1}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        <FiPlus className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <span className="text-lg font-bold text-black">
                      ₹{(item.price || 0).toLocaleString('en-IN')}
                    </span>
                    {(() => {
                      const unitPrice = item.unitPrice || (item.price / (item.serviceCount || 1));
                      const unitOriginalPrice = item.originalPrice || unitPrice;
                      const currentTotal = item.price;
                      const originalTotal = unitOriginalPrice * (item.serviceCount || 1);

                      if (originalTotal > currentTotal) {
                        return (
                          <div className="text-xs text-gray-400 line-through">
                            ₹{originalTotal.toLocaleString('en-IN')}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Summary - Fixed at bottom if items exist */}
        {cartItems.length > 0 && (
          <div
            className="fixed left-0 right-0 z-[9997] px-4 py-4 border-t border-gray-200"
            style={{
              backgroundColor: '#ffffff',
              boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',
              bottom: '70px',
              position: 'fixed',
              willChange: 'transform',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <div className="mb-3 pb-3 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-base font-bold text-black">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
              {totalOriginalPrice > totalPrice && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 line-through">Original Price</span>
                  <span className="text-sm text-gray-400 line-through">
                    ₹{totalOriginalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3.5 rounded-xl text-base font-bold text-white transition-all active:scale-98 shadow-lg"
              style={{
                backgroundColor: themeColors.button,
                boxShadow: '0 4px 12px rgba(0, 166, 166, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = themeColors.button;
                e.target.style.boxShadow = '0 6px 16px rgba(0, 166, 166, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = themeColors.button;
                e.target.style.boxShadow = '0 4px 12px rgba(0, 166, 166, 0.4)';
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </main>

      <BottomNav
        cartCount={cartCount}
        onCartClick={handleCartClick}
      />
    </div>
  );
};

export default CategoryCart;
