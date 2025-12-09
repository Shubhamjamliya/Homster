import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiTrash2, FiMinus, FiPlus, FiPhone, FiHome, FiClock, FiEdit2 } from 'react-icons/fi';
import { MdStar } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import BottomNav from '../../components/layout/BottomNav';
import AddressSelectionModal from './components/AddressSelectionModal';
import TimeSlotModal from './components/TimeSlotModal';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const category = location.state?.category || null; // Get category from navigation state

  const [cartItems, setCartItems] = useState([]);
  const [selectedTip, setSelectedTip] = useState(75);
  const [customTip, setCustomTip] = useState('');
  const [isPlusAdded, setIsPlusAdded] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [address, setAddress] = useState('11 Bungalow Colony, Near City Center, Your City - 123456');
  const [houseNumber, setHouseNumber] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Check if Razorpay is loaded
  useEffect(() => {
    const checkRazorpay = () => {
      if (window.Razorpay) {
        setRazorpayLoaded(true);
      } else {
        // Retry after a short delay
        setTimeout(checkRazorpay, 100);
      }
    };
    checkRazorpay();
  }, []);

  // Load cart items from localStorage and filter by category if provided
  useEffect(() => {
    const updateCart = () => {
      const saved = localStorage.getItem('cartItems');
      if (saved) {
        try {
          let items = JSON.parse(saved);
          // Ensure all items have unitPrice calculated
          items = items.map(item => {
            if (!item.unitPrice) {
              item.unitPrice = item.price / (item.serviceCount || 1);
            }
            return item;
          });
          // Filter by category if category is provided
          if (category) {
            items = items.filter(item => item.category === category);
          }
          setCartItems(items);
        } catch (e) {
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    };

    updateCart();
    window.addEventListener('cartUpdated', updateCart);
    window.addEventListener('storage', updateCart);

    return () => {
      window.removeEventListener('cartUpdated', updateCart);
      window.removeEventListener('storage', updateCart);
    };
  }, [category]);

  const cartCount = cartItems.length;

  const handleBack = () => {
    navigate(-1);
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
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleTipSelect = (amount) => {
    setSelectedTip(amount);
    setCustomTip('');
  };

  const handleCustomTip = (value) => {
    setCustomTip(value);
    setSelectedTip('custom');
  };

  const handleAddPlus = () => {
    setIsPlusAdded(!isPlusAdded);
  };

  const handleProceed = () => {
    setShowAddressModal(true);
  };

  const handlePayment = () => {
    // Get Razorpay key from environment variables
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!razorpayKey) {
      toast.error('Razorpay key not configured. Please add VITE_RAZORPAY_KEY_ID in .env file.');
      return;
    }

    if (!window.Razorpay) {
      toast.error('Razorpay SDK not loaded. Please refresh the page.');
      return;
    }

    const options = {
      key: razorpayKey,
      amount: Math.round(amountToPay * 100), // Amount in paise
      currency: 'INR',
      name: 'Appzeto',
      description: `Payment for ${cartItems.length} service(s)`,
      image: '/vite.svg', // Your logo URL
      handler: function (response) {
        // Handle successful payment
        console.log('Payment successful:', response);
        
        // Calculate values for booking
        const itemTotal = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
        const totalOriginalPrice = cartItems.reduce((sum, item) => {
          const unitOriginalPrice = item.originalPrice || (item.unitPrice || (item.price / (item.serviceCount || 1)));
          return sum + (unitOriginalPrice * (item.serviceCount || 1));
        }, 0);
        const savings = totalOriginalPrice - itemTotal;
        const tipAmount = selectedTip === 'custom' ? parseFloat(customTip) || 0 : selectedTip;
        const plusPrice = isPlusAdded ? 249 : 0;
        const visitedFee = 50;
        const taxesAndFee = 59;
        
        // Create booking object
        const booking = {
          id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
          items: JSON.parse(JSON.stringify(cartItems)), // Deep copy of items that were paid for
          category: category || 'All',
          address: `${houseNumber}, ${address}`,
          date: selectedDate ? selectedDate.toLocaleDateString() : '',
          time: selectedTime || '',
          totalAmount: amountToPay,
          subtotal: itemTotal,
          tip: tipAmount,
          visitedFee: visitedFee,
          taxesAndFee: taxesAndFee,
          plusPrice: plusPrice,
          discount: savings > 0 ? savings : 0,
          status: 'confirmed', // confirmed, in-progress, completed, cancelled
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save booking to localStorage
        try {
          const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
          existingBookings.unshift(booking); // Add to beginning
          localStorage.setItem('bookings', JSON.stringify(existingBookings));
          console.log('Booking saved successfully:', booking.id);
        } catch (error) {
          console.error('Error saving booking:', error);
        }

        // Remove only the paid items from cart (not entire cart)
        try {
          const allCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
          const paidItemIds = cartItems.map(item => item.id);
          const remainingItems = allCartItems.filter(item => !paidItemIds.includes(item.id));
          localStorage.setItem('cartItems', JSON.stringify(remainingItems));
          window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
          console.error('Error updating cart:', error);
        }

        // Navigate to booking confirmation page immediately
        navigate(`/booking-confirmation/${booking.id}`, { 
          state: { booking },
          replace: true // Replace history so user can't go back
        });
      },
      prefill: {
        name: 'User Name',
        email: 'user@example.com',
        contact: '+91-6261387233',
      },
      notes: {
        address: `${houseNumber}, ${address}`,
        date: selectedDate ? selectedDate.toLocaleDateString() : '',
        time: selectedTime || '',
        category: category || 'All',
      },
      theme: {
        color: '#00a6a6',
      },
      modal: {
        ondismiss: function () {
          console.log('Payment modal closed');
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', function (response) {
      console.error('Payment failed:', response.error);
      toast.error(`Payment failed: ${response.error.description || 'Unknown error'}`);
    });
    razorpay.open();
  };

  const handleAddressSave = (savedHouseNumber) => {
    setHouseNumber(savedHouseNumber);
    setShowAddressModal(false);
    setShowTimeSlotModal(true);
  };

  const handleTimeSlotSave = (date, time) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setShowTimeSlotModal(false);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  // Calculate totals
  const itemTotal = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalOriginalPrice = cartItems.reduce((sum, item) => {
    const unitOriginalPrice = item.originalPrice || (item.unitPrice || (item.price / (item.serviceCount || 1)));
    return sum + (unitOriginalPrice * (item.serviceCount || 1));
  }, 0);
  const savings = totalOriginalPrice - itemTotal;
  const taxesAndFee = 59;
  const visitedFee = 50;
  const tipAmount = selectedTip === 'custom' ? parseFloat(customTip) || 0 : selectedTip;
  const plusPrice = isPlusAdded ? 249 : 0;
  const totalAmount = itemTotal + taxesAndFee + visitedFee + tipAmount + plusPrice;
  const amountToPay = totalAmount;

  // Date and time slot helper functions
  const getDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getTimeSlots = () => {
    return [
      { value: '09:00', display: '9:00 AM' },
      { value: '10:00', display: '10:00 AM' },
      { value: '11:00', display: '11:00 AM' },
      { value: '12:00', display: '12:00 PM' },
      { value: '13:00', display: '1:00 PM' },
      { value: '14:00', display: '2:00 PM' },
      { value: '15:00', display: '3:00 PM' },
      { value: '16:00', display: '4:00 PM' },
      { value: '17:00', display: '5:00 PM' },
      { value: '18:00', display: '6:00 PM' },
      { value: '19:00', display: '7:00 PM' },
      { value: '20:00', display: '8:00 PM' },
    ];
  };

  const formatDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
    };
  };

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const isDateSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isTimeSelected = (time) => {
    return selectedTime === time;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white pb-32">
        <header className="bg-white">
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiArrowLeft className="w-6 h-6 text-black" />
              </button>
              <h1 className="text-xl font-bold text-black">Your cart</h1>
            </div>
          </div>
          <div className="border-b border-gray-200"></div>
        </header>
        <main className="px-4 py-4">
          <div className="flex flex-col items-center justify-center py-20">
            <FiShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">Your cart is empty</p>
            <p className="text-gray-400 text-sm mt-2">Add services to get started</p>
          </div>
        </main>
        <BottomNav cartCount={0} onCartClick={handleCartClick} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <header className="bg-white">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiArrowLeft className="w-6 h-6 text-black" />
            </button>
            <h1 className="text-xl font-bold text-black">
              {category ? `${category} Checkout` : 'Your cart'}
            </h1>
          </div>
        </div>
        <div className="border-b border-gray-200"></div>
      </header>

      <main className="px-4 py-4">
        {/* Savings Banner */}
        {savings > 0 && (
          <div className="bg-gray-100 rounded-lg p-3 mb-4 flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <p className="text-sm font-medium text-black">
              Saving ₹{savings.toLocaleString('en-IN')} on this order
            </p>
          </div>
        )}

        {/* Cart Items */}
        <div className="space-y-4 mb-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-black mb-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600">{item.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 border rounded-lg" style={{ borderColor: '#00a6a6' }}>
                  <button
                    onClick={() => handleQuantityChange(item.id, -1)}
                    className="p-2 transition-colors"
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 166, 166, 0.1)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <FiMinus className="w-4 h-4" style={{ color: '#00a6a6' }} />
                  </button>
                  <span className="px-3 py-1 text-sm font-medium text-black">{item.serviceCount || 1}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, 1)}
                    className="p-2 transition-colors"
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 166, 166, 0.1)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <FiPlus className="w-4 h-4" style={{ color: '#00a6a6' }} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-black">₹{(item.price || 0).toLocaleString('en-IN')}</span>
                {(() => {
                  const unitPrice = item.unitPrice || (item.price / (item.serviceCount || 1));
                  const unitOriginalPrice = item.originalPrice || unitPrice;
                  const currentTotal = item.price;
                  const originalTotal = unitOriginalPrice * (item.serviceCount || 1);
                  if (originalTotal > currentTotal) {
                    return (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{originalTotal.toLocaleString('en-IN')}
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          ))}
        </div>

        {/* Plus Membership Plan */}
        <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: 'rgba(0, 166, 166, 0.1)' }}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#00a6a6' }}>
                <MdStar className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-black mb-1">plus</h3>
                <p className="text-sm text-gray-700 mb-1">6 months plan</p>
                <p className="text-xs text-gray-600 mb-2">
                  Get 10% off on all bookings, upto ₹100.
                </p>
                <button className="text-xs font-medium hover:underline" style={{ color: '#00a6a6' }}>
                  View all benefits
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <button
                onClick={handleAddPlus}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={isPlusAdded ? {
                  backgroundColor: '#00a6a6',
                  color: 'white'
                } : {
                  backgroundColor: 'white',
                  border: '1px solid #00a6a6',
                  color: '#00a6a6'
                }}
                onMouseEnter={(e) => {
                  if (!isPlusAdded) {
                    e.target.style.backgroundColor = 'rgba(0, 166, 166, 0.1)';
                  } else {
                    e.target.style.backgroundColor = '#008a8a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isPlusAdded) {
                    e.target.style.backgroundColor = 'white';
                  } else {
                    e.target.style.backgroundColor = '#00a6a6';
                  }
                }}
              >
                {isPlusAdded ? 'Added' : 'Add'}
              </button>
              <div className="mt-1 flex flex-col items-end">
                <span className="text-sm font-bold text-black">₹249</span>
                <span className="text-xs text-gray-400 line-through">₹699</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Customer */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiPhone className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-black">Verified Customer</p>
                <p className="text-xs text-gray-600">+91-6261387233</p>
              </div>
            </div>
            <button className="text-sm font-medium hover:underline" style={{ color: '#00a6a6' }}>
              Change
            </button>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="text-base font-bold text-black mb-4">Payment summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Item total</span>
              <div className="flex items-center gap-2">
                {totalOriginalPrice > itemTotal && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{totalOriginalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-sm font-medium text-black">₹{itemTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            {isPlusAdded && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Plus membership</span>
                <span className="text-sm font-medium text-black">₹249</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Taxes and Fee</span>
              <span className="text-sm font-medium text-black">₹{taxesAndFee}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Visited Fee</span>
              <span className="text-sm font-medium text-black">₹{visitedFee}</span>
            </div>
            {tipAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Tip</span>
                <span className="text-sm font-medium text-black">₹{tipAmount}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-base font-bold text-black">Total amount</span>
                <span className="text-base font-bold text-black">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-black">Amount to pay</span>
                <span className="text-base font-bold text-black">₹{amountToPay.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="text-base font-bold text-black mb-2">Cancellation policy</h3>
          <p className="text-sm text-gray-700 mb-2">
            Free cancellations if done more than 12 hrs before the service or if a professional isn't assigned. A fee will be charged otherwise.
          </p>
          <button className="text-sm font-medium hover:underline" style={{ color: '#00a6a6' }}>
            Read full policy
          </button>
        </div>

        {/* Add a Tip */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="text-base font-bold text-black mb-3">Add a tip to thank the Professional</h3>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[50, 75, 100, 'custom'].map((amount) => (
              <div key={amount} className="relative">
                {amount === 'custom' ? (
                  <input
                    type="number"
                    placeholder="Custom"
                    value={customTip}
                    onChange={(e) => handleCustomTip(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-center"
                    style={selectedTip === 'custom' ? {
                      borderColor: '#00a6a6',
                      backgroundColor: 'rgba(0, 166, 166, 0.1)'
                    } : {
                      borderColor: '#d1d5db',
                      backgroundColor: 'white'
                    }}
                  />
                ) : (
                  <button
                    onClick={() => handleTipSelect(amount)}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-medium transition-colors"
                    style={selectedTip === amount ? {
                      borderColor: '#00a6a6',
                      backgroundColor: 'rgba(0, 166, 166, 0.1)',
                      color: '#00a6a6'
                    } : {
                      borderColor: '#d1d5db',
                      backgroundColor: 'white',
                      color: 'black'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedTip !== amount) {
                        e.target.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTip !== amount) {
                        e.target.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    ₹{amount}
                    {amount === 75 && (
                      <span className="block text-[10px] text-green-600 font-semibold mt-1">POPULAR</span>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 text-center">
            100% of the tip goes to the professional.
          </p>
        </div>

        {/* Frequently Added Together */}
        <div className="mb-4">
          <h3 className="text-base font-bold text-black mb-3">Frequently added together</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="min-w-[140px] h-32 bg-gray-200 rounded-lg shrink-0"
              >
                {/* Placeholder for service images */}
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Service {item}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Action Button */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 z-40">
        {/* Selected Address and Slot Display */}
        {(selectedDate && selectedTime && houseNumber) && (
          <div className="px-4 pt-3 pb-2 border-b border-gray-100">
            <div className="space-y-2.5">
              {/* Address */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(0, 166, 166, 0.1)' }}>
                  <FiHome className="w-4 h-4" style={{ color: '#00a6a6' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 mb-0.5">Address</p>
                  <p className="text-sm font-medium text-black">
                    {houseNumber ? `${houseNumber}, ` : ''}{address}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors shrink-0 mt-0.5"
                >
                  <FiEdit2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              {/* Time Slot */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(0, 166, 166, 0.1)' }}>
                  <FiClock className="w-4 h-4" style={{ color: '#00a6a6' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 mb-0.5">Time Slot</p>
                  <p className="text-sm font-medium text-black">
                    {selectedDate && (() => {
                      const { day, date: dateNum } = formatDate(selectedDate);
                      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      const month = monthNames[selectedDate.getMonth()];
                      return `${day}, ${dateNum} ${month}`;
                    })()}
                    {selectedTime && (() => {
                      const timeSlot = getTimeSlots().find(slot => slot.value === selectedTime);
                      return timeSlot ? ` • ${timeSlot.display}` : '';
                    })()}
                  </p>
                </div>
                <button
                  onClick={() => setShowTimeSlotModal(true)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors shrink-0 mt-0.5"
                >
                  <FiEdit2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-4">
          <button
            onClick={selectedDate && selectedTime && houseNumber ? handlePayment : handleProceed}
            className="w-full text-white py-3 rounded-lg text-base font-semibold transition-colors"
            style={{ backgroundColor: '#00a6a6' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#008a8a'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#00a6a6'}
          >
            {selectedDate && selectedTime && houseNumber ? 'Proceed to pay' : 'Add address and slot'}
          </button>
        </div>
      </div>

      <BottomNav
        cartCount={cartCount}
        onCartClick={handleCartClick}
      />

      {/* Address Selection Modal */}
      <AddressSelectionModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        address={address}
        houseNumber={houseNumber}
        onHouseNumberChange={setHouseNumber}
        onSave={handleAddressSave}
      />

      {/* Time Slot Modal */}
      <TimeSlotModal
        isOpen={showTimeSlotModal}
        onClose={() => setShowTimeSlotModal(false)}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onDateSelect={setSelectedDate}
        onTimeSelect={setSelectedTime}
        onSave={handleTimeSlotSave}
        getDates={getDates}
        getTimeSlots={getTimeSlots}
        formatDate={formatDate}
        isDateSelected={isDateSelected}
        isTimeSelected={isTimeSelected}
      />
    </div>
  );
};

export default Checkout;
