import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { FiArrowLeft, FiShoppingCart, FiTrash2, FiMinus, FiPlus, FiPhone, FiHome, FiClock, FiEdit2 } from 'react-icons/fi';
import { MdStar } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../../theme';
import BottomNav from '../../components/layout/BottomNav';
import AddressSelectionModal from './components/AddressSelectionModal';
import TimeSlotModal from './components/TimeSlotModal';
import VendorSearchModal from './components/VendorSearchModal';
import { bookingService } from '../../../../services/bookingService';
import { paymentService } from '../../../../services/paymentService';
import { cartService } from '../../../../services/cartService';

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
  const [address, setAddress] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [addressDetails, setAddressDetails] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [userPhone, setUserPhone] = useState('');

  // New state for vendor search flow
  const [currentStep, setCurrentStep] = useState('details'); // 'details' | 'searching' | 'waiting' | 'accepted' | 'payment'
  const [acceptedVendor, setAcceptedVendor] = useState(null);
  const [bookingRequest, setBookingRequest] = useState(null);
  const [searchingVendors, setSearchingVendors] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'pay_at_home'

  const [loading, setLoading] = useState(true);

  // Check if Razorpay is loaded (defer to avoid blocking initial render)
  useEffect(() => {
    // Defer Razorpay check until after page load
    const checkRazorpay = () => {
      if (window.Razorpay) {
        setRazorpayLoaded(true);
      } else {
        // Retry after a short delay (non-blocking)
        setTimeout(checkRazorpay, 100);
      }
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if (window.requestIdleCallback) {
      window.requestIdleCallback(checkRazorpay, { timeout: 200 });
    } else {
      setTimeout(checkRazorpay, 100);
    }
  }, []);

  // Load user data and cart
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      if (userData.phone) {
        setUserPhone(userData.phone);
      }
    }
  }, []);

  // Load cart items from backend and filter by category if provided
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        const response = await cartService.getCart();
        if (response.success) {
          let items = response.data || [];
          // Filter by category if category is provided
          if (category) {
            items = items.filter(item => item.category === category);
          }
          setCartItems(items);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [category]);

  const cartCount = cartItems.length;

  const handleBack = () => {
    navigate(-1);
  };

  const handleQuantityChange = async (itemId, change) => {
    try {
      const item = cartItems.find(i => (i._id || i.id) === itemId);
      if (!item) return;

      const newCount = Math.max(1, (item.serviceCount || 1) + change);
      const response = await cartService.updateItem(itemId, newCount);

      if (response.success) {
        // Reload cart and filter by category
        const cartResponse = await cartService.getCart();
        if (cartResponse.success) {
          let items = cartResponse.data || [];
          if (category) {
            items = items.filter(item => item.category === category);
          }
          setCartItems(items);
        }
      } else {
        toast.error(response.message || 'Failed to update quantity');
      }
    } catch (error) {
      toast.error('Failed to update quantity');
    }
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


  // Listen for real-time vendor acceptance
  useEffect(() => {
    if (currentStep !== 'waiting' || !bookingRequest) return;

    const socketUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    const socket = io(socketUrl, {
      auth: { token: localStorage.getItem('accessToken') },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
    });

    socket.on('connect_error', (err) => {
    });

    socket.on('booking_accepted', (data) => {
      if (data.bookingId === bookingRequest._id) {

        // Construct vendor object from event data
        // Note: Real backend should send full details, falling back to defaults for display
        const vendorData = {
          id: data.vendor.id,
          name: data.vendor.name || 'Vendor',
          businessName: data.vendor.businessName || 'Service Provider',
          rating: 4.8, // Default if not sent
          distance: 'Nearby', // Default if not sent
          estimatedTime: '15-20 mins',
          price: bookingRequest.amount
        };

        setAcceptedVendor(vendorData);
        setCurrentStep('accepted');
        toast.success(`${vendorData.businessName} accepted your booking!`);

        // Close modal after 2 seconds to show "Proceed to Pay" button
        setTimeout(() => {
          setShowVendorModal(false);
          setCurrentStep('payment');
        }, 2000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentStep, bookingRequest]);

  // Search for nearby vendors
  const handleSearchVendors = async () => {
    try {
      // Validate required fields
      if (!selectedDate || !selectedTime || !houseNumber) {
        toast.error('Please select address and time slot');
        return;
      }

      if (cartItems.length === 0) {
        toast.error('Cart is empty');
        return;
      }

      // Open modal and start searching
      setShowVendorModal(true);
      setCurrentStep('searching');
      setSearchingVendors(true);

      // Get first service
      const firstItem = cartItems[0];
      if (!firstItem.serviceId) {
        toast.error('Service information missing. Please try again.');
        setCurrentStep('details');
        setSearchingVendors(false);
        setShowVendorModal(false);
        return;
      }

      // Prepare address object
      // Helper to extract address components
      const getComponent = (type) => addressDetails?.components?.find(c => c.types.includes(type))?.long_name || '';

      const addressObj = {
        type: 'home',
        addressLine1: address,
        addressLine2: houseNumber,
        city: getComponent('locality') || getComponent('administrative_area_level_2') || 'City',
        state: getComponent('administrative_area_level_1') || 'State',
        pincode: getComponent('postal_code') || '123456',
        landmark: '',
        lat: addressDetails?.lat || null,
        lng: addressDetails?.lng || null
      };

      // Prepare time slot
      const timeSlotObj = {
        start: selectedTime,
        end: getTimeSlots().find(slot => slot.value === selectedTime)?.end || selectedTime
      };

      // Create booking request
      toast.loading('Searching for nearby vendors...');

      // Ensure serviceId is a string (handle populated cart data)
      const serviceId = typeof firstItem.serviceId === 'object'
        ? firstItem.serviceId._id || firstItem.serviceId.id
        : firstItem.serviceId;

      const bookingResponse = await bookingService.create({
        serviceId: serviceId,
        address: addressObj,
        scheduledDate: selectedDate.toISOString(),
        scheduledTime: getTimeSlots().find(slot => slot.value === selectedTime)?.display || selectedTime,
        timeSlot: timeSlotObj,
        userNotes: `Tip: ₹${selectedTip === 'custom' ? parseFloat(customTip) || 0 : selectedTip}. Items: ${cartItems.map(i => i.title).join(', ')}`,
        paymentMethod: 'razorpay',
        amount: totalAmount  // Send total amount from cart
      });

      if (!bookingResponse.success) {
        toast.dismiss();
        toast.error(bookingResponse.message || 'Failed to search for vendors');
        setCurrentStep('details');
        setSearchingVendors(false);
        setShowVendorModal(false);
        return;
      }

      const booking = bookingResponse.data;
      setBookingRequest(booking);
      toast.dismiss();

      // Move to waiting state - alerts sent to nearby vendors
      setCurrentStep('waiting');
      setSearchingVendors(false);
      toast.success('Finding nearby vendors... Alerts sent to vendors within 10km!');

      // Wait for real-time vendor acceptance via Socket.IO
      // The socket listener above will handle the 'booking_accepted' event

    } catch (error) {
      toast.dismiss();
      toast.error('Failed to search for vendors. Please try again.');
      setCurrentStep('details');
      setSearchingVendors(false);
      setShowVendorModal(false);
    }
  };

  // Proceed to payment after vendor acceptance
  const handleOnlinePayment = async () => {
    try {
      if (!acceptedVendor || !bookingRequest) {
        toast.error('No vendor selected or booking not created');
        return;
      }

      // Create Razorpay order
      toast.loading('Creating payment order...');
      const orderResponse = await paymentService.createOrder(bookingRequest._id);

      if (!orderResponse.success) {
        toast.dismiss();
        toast.error(orderResponse.message || 'Failed to create payment order');
        return;
      }

      toast.dismiss();

      // Get Razorpay key
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        toast.error('Razorpay key not configured');
        return;
      }

      if (!window.Razorpay) {
        toast.error('Razorpay SDK not loaded');
        return;
      }

      const options = {
        key: razorpayKey,
        amount: orderResponse.data.amount * 100,
        currency: orderResponse.data.currency || 'INR',
        order_id: orderResponse.data.orderId,
        name: 'Appzeto',
        description: `Payment for ${bookingRequest.serviceName || 'service'}`,
        handler: async function (response) {
          try {
            toast.loading('Verifying payment...');
            const verifyResponse = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            toast.dismiss();

            if (verifyResponse.success) {
              toast.success('Payment successful!');

              // Clear cart (or just category items)
              try {
                if (category) {
                  await cartService.removeCategoryItems(category);
                } else {
                  await cartService.clearCart();
                }
                setCartItems([]);
              } catch (error) {
              }

              // Navigate to booking confirmation
              navigate(`/user/booking-confirmation/${bookingRequest._id}`, {
                replace: true
              });
            } else {
              toast.error(verifyResponse.message || 'Payment verification failed');
            }
          } catch (error) {
            toast.dismiss();
            toast.error('Failed to verify payment');
          }
        },
        prefill: {
          name: JSON.parse(localStorage.getItem('userData'))?.name || 'User',
          email: JSON.parse(localStorage.getItem('userData'))?.email || '',
          contact: userPhone
        },
        theme: {
          color: themeColors.button
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        toast.dismiss();
        toast.error(`Payment failed: ${response.error.description || 'Unknown error'}`);
      });
      razorpay.open();

    } catch (error) {
      toast.dismiss();
      toast.error('Failed to process payment');
    }
  };

  const handlePayAtHome = async () => {
    try {
      if (!bookingRequest) return;
      toast.loading('Confirming booking...');
      const response = await paymentService.confirmPayAtHome(bookingRequest._id);
      toast.dismiss();

      if (response.success) {
        toast.success('Booking confirmed!');
        // Clear cart (or just category items)
        try {
          if (category) {
            await cartService.removeCategoryItems(category);
          } else {
            await cartService.clearCart();
          }
          setCartItems([]);
        } catch (error) {
        }
        // Navigate to booking confirmation
        navigate(`/user/booking-confirmation/${bookingRequest._id}`, {
          replace: true
        });
      } else {
        toast.error(response.message || 'Failed to confirm booking');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to process request');
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === 'online') {
      await handleOnlinePayment();
    } else {
      await handlePayAtHome();
    }
  };

  const handleAddressSave = (savedHouseNumber, locationObj) => {
    setHouseNumber(savedHouseNumber);
    if (locationObj) {
      setAddress(locationObj.address);
      setAddressDetails(locationObj);
    }
    setShowAddressModal(false);
    setShowTimeSlotModal(true);
  };

  const handleTimeSlotSave = (date, time) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setShowTimeSlotModal(false);
  };

  const handleCartClick = () => {
    navigate('/user/cart');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-32 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" style={{ borderColor: themeColors.button }}></div>
          <p className="text-gray-500">Loading checkout details...</p>
        </div>
      </div>
    );
  }

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
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-80">
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
                <div className="flex items-center gap-2 border rounded-lg" style={{ borderColor: themeColors.button }}>
                  <button
                    onClick={() => handleQuantityChange(item.id, -1)}
                    className="p-2 transition-colors"
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 166, 166, 0.1)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <FiMinus className="w-4 h-4" style={{ color: themeColors.button }} />
                  </button>
                  <span className="px-3 py-1 text-sm font-medium text-black">{item.serviceCount || 1}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, 1)}
                    className="p-2 transition-colors"
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 166, 166, 0.1)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <FiPlus className="w-4 h-4" style={{ color: themeColors.button }} />
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
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: themeColors.button }}>
                <MdStar className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-black mb-1">plus</h3>
                <p className="text-sm text-gray-700 mb-1">6 months plan</p>
                <p className="text-xs text-gray-600 mb-2">
                  Get 10% off on all bookings, upto ₹100.
                </p>
                <button className="text-xs font-medium hover:underline" style={{ color: themeColors.button }}>
                  View all benefits
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <button
                onClick={handleAddPlus}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={isPlusAdded ? {
                  backgroundColor: themeColors.button,
                  color: 'white'
                } : {
                  backgroundColor: 'white',
                  border: `1px solid ${themeColors.button}`,
                  color: themeColors.button
                }}
                onMouseEnter={(e) => {
                  if (!isPlusAdded) {
                    e.target.style.backgroundColor = 'rgba(0, 166, 166, 0.1)';
                  } else {
                    e.target.style.backgroundColor = themeColors.button;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isPlusAdded) {
                    e.target.style.backgroundColor = 'white';
                  } else {
                    e.target.style.backgroundColor = themeColors.button;
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
                <p className="text-sm font-medium text-black">{JSON.parse(localStorage.getItem('userData'))?.name || 'Verified Customer'}</p>
                <p className="text-xs text-gray-600">{userPhone || 'Loading...'}</p>
              </div>
            </div>
            <button className="text-sm font-medium hover:underline" style={{ color: themeColors.button }}>
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
          <button className="text-sm font-medium hover:underline" style={{ color: themeColors.button }}>
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
                      borderColor: themeColors.button,
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
                      borderColor: themeColors.button,
                      backgroundColor: 'rgba(0, 166, 166, 0.1)',
                      color: themeColors.button
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

        {/* Payment Method Selection - Only show when vendor accepted */}
        {currentStep === 'payment' && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <h3 className="text-base font-bold text-black mb-4">Select Payment Method</h3>
            <div className="space-y-3">
              <label className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === 'online' ? 'border-teal-600 bg-teal-50' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'online' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <FiShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Online Payment</p>
                    <p className="text-xs text-gray-500">Razorpay, UPI, Cards</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  className="w-5 h-5 accent-teal-600"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                />
              </label>

              <label className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === 'pay_at_home' ? 'border-teal-600 bg-teal-50' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'pay_at_home' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <FiHome className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Pay at Home</p>
                    <p className="text-xs text-gray-500">Cash/UPI after service</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  className="w-5 h-5 accent-teal-600"
                  checked={paymentMethod === 'pay_at_home'}
                  onChange={() => setPaymentMethod('pay_at_home')}
                />
              </label>
            </div>
          </div>
        )}
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
                  <FiHome className="w-4 h-4" style={{ color: themeColors.button }} />
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
                  <FiClock className="w-4 h-4" style={{ color: themeColors.button }} />
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
            onClick={selectedDate && selectedTime && houseNumber ?
              (currentStep === 'payment' ? handlePayment : handleSearchVendors) :
              handleProceed}
            disabled={searchingVendors}
            className="w-full text-white py-3 rounded-lg text-base font-semibold transition-colors disabled:opacity-50"
            style={{ backgroundColor: themeColors.button }}
            onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.button}
            onMouseLeave={(e) => e.target.style.backgroundColor = themeColors.button}
          >
            {searchingVendors ? 'Searching for vendors...' :
              currentStep === 'payment' ? (paymentMethod === 'online' ? 'Proceed to Pay' : 'Confirm Booking') :
                selectedDate && selectedTime && houseNumber ?
                  'Find nearby vendors' :
                  'Add address and slot'}
          </button>
        </div>


      </div>

      <BottomNav />

      {/* Vendor Search Modal */}
      <VendorSearchModal
        isOpen={showVendorModal}
        onClose={() => {
          setShowVendorModal(false);
          if (currentStep === 'accepted') {
            setCurrentStep('payment');
          }
        }}
        currentStep={currentStep}
        acceptedVendor={acceptedVendor}
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
