import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { themeColors } from '../../../../theme';
import {
  FiArrowLeft,
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiCalendar,
  FiDollarSign,
  FiPackage,
  FiEdit2,
  FiPhone,
  FiMail,
  FiKey,
  FiStar,
  FiAward,
  FiX,
  FiUser,
  FiChevronRight,
  FiSearch,
  FiHome
} from 'react-icons/fi';
import { bookingService } from '../../../../services/bookingService';
import { paymentService } from '../../../../services/paymentService';
import { cartService } from '../../../../services/cartService';
import RatingModal from '../../components/booking/RatingModal';
import PaymentVerificationModal from '../../components/booking/PaymentVerificationModal';
import { ConfirmDialog } from '../../../../components/common';
import ReviewCard from '../../components/booking/ReviewCard';

const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};


const BookingDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });

  // Function to load booking
  const loadBooking = async () => {
    try {
      // Don't set loading true on refresh to avoid flicker
      const response = await bookingService.getById(id);
      if (response.success) {
        setBooking(response.data);
      } else {
        toast.error(response.message || 'Booking not found');
        navigate('/user/my-bookings');
      }
    } catch (error) {
      console.error('Failed to load booking details', error);
      // toast.error('Failed to load booking details'); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadBooking();
    }
  }, [id, navigate]);

  // Auto-show rating modal ONLY when booking is fully completed (after payment)
  useEffect(() => {
    if (booking) {
      const isCompleted = ['completed', 'work_done'].includes(booking.status?.toLowerCase());
      const hasPendingPayment = booking.customerConfirmationOTP && !booking.cashCollected;
      const isRated = !!booking.rating;
      const isDismissed = localStorage.getItem(`rating_dismissed_${id}`);

      if (isCompleted && !isRated && !isDismissed && !hasPendingPayment) {
        setShowRatingModal(true);
      }
    }
  }, [booking, id]);

  // Handle Payment Modal Visibility
  useEffect(() => {
    if (booking && booking.customerConfirmationOTP && !booking.cashCollected) {
      setShowPaymentModal(true);
    } else {
      setShowPaymentModal(false);
    }
  }, [booking]);

  // Socket Listener for Real-time Updates
  useEffect(() => {
    const socketUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData?._id || userData?.id) {
      const userId = userData._id || userData.id;
      socket.emit('join', `user_${userId}`);

      // Listen for generic notifications
      socket.on('notification', (data) => {
        if (data && (data.relatedId === id || data.data?.bookingId === id)) {
          loadBooking();
          toast(data.message || 'Booking updated', { icon: '🔔' });
        }
      });

      // Listen for specific booking updates if any
      socket.on('booking_updated', (data) => {
        if (data.bookingId === id) loadBooking();
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
      case 'journey_started':
        return <FiLoader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <FiCheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <FiXCircle className="w-5 h-5 text-red-500" />;
      case 'awaiting_payment':
      case 'work_done':
        return <FiClock className="w-5 h-5 text-orange-500" />;
      default:
        return <FiClock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'in_progress':
      case 'journey_started':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'awaiting_payment':
      case 'work_done':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'journey_started': return 'Agent En Route';
      case 'visited': return 'Agent Arrived';
      case 'in_progress': return 'In Progress';
      case 'work_done': return 'Work Done'; // Payment Pending
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'awaiting_payment': return 'Request Accepted';
      default: return status?.replace('_', ' ') || 'Pending';
    }
  };

  // ... (keep handle methods same) ...

  const handleCancelBooking = async () => {
    // Check if journey has started to determine if a fee applies
    const journeyStarted = ['journey_started', 'visited', 'in_progress'].includes(booking.status?.toLowerCase());
    const cancellationFee = booking.visitingCharges || 49;

    const modalTitle = journeyStarted ? 'Cancellation Fee Applies' : 'Cancel Booking';
    const modalMessage = journeyStarted
      ? `The service agent has already started their journey. Cancelling now will incur a fee of ₹${cancellationFee}, which will be deducted from your wallet or refund amount. Do you want to proceed?`
      : 'Are you sure you want to cancel this booking? You will receive a full refund if applicable. This action cannot be undone.';

    setConfirmDialog({
      isOpen: true,
      title: modalTitle,
      message: modalMessage,
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await bookingService.cancel(booking._id || booking.id, 'Cancelled by user');
          if (response.success) {
            toast.success('Booking cancelled successfully');
            loadBooking();
          } else {
            toast.error(response.message || 'Failed to cancel booking');
          }
        } catch (error) {
          toast.error('Failed to cancel booking. Please try again.');
        }
      }
    });
  };

  const handleOnlinePayment = async () => {
    try {
      toast.loading('Creating payment order...');
      const orderResponse = await paymentService.createOrder(booking._id || booking.id);
      toast.dismiss();

      if (!orderResponse.success) {
        toast.error(orderResponse.message || 'Failed to create payment order');
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderResponse.data.amount * 100,
        currency: orderResponse.data.currency || 'INR',
        order_id: orderResponse.data.orderId,
        name: 'Appzeto',
        description: `Payment for ${booking.serviceName}`,
        handler: async function (response) {
          toast.loading('Verifying payment...');
          const verifyResponse = await paymentService.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          toast.dismiss();

          if (verifyResponse.success) {
            toast.success('Payment successful!');
            loadBooking();
          } else {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: 'User',
          contact: ''
        },
        theme: {
          color: themeColors.button
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to process payment');
    }
  };

  const handlePayAtHome = async () => {
    try {
      toast.loading('Confirming request...');
      const response = await paymentService.confirmPayAtHome(booking._id || booking.id);
      toast.dismiss();

      if (response.success) {
        toast.success('Booking confirmed!');
        loadBooking();
      } else {
        toast.error(response.message || 'Failed to confirm booking');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to process request');
    }
  };


  const handleRateSubmit = async (ratingData) => {
    try {
      const response = await bookingService.addReview(booking._id || booking.id, ratingData);
      if (response.success) {
        toast.success('Thank you for your feedback!');
        setShowRatingModal(false);
        loadBooking();
      } else {
        toast.error(response.message || 'Failed to submit review');
      }
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };


  const getAddressString = (address) => {
    if (typeof address === 'string') return address;
    if (address && typeof address === 'object') {
      return `${address.addressLine1 || ''}${address.addressLine2 ? `, ${address.addressLine2}` : ''}, ${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}`;
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Booking not found</p>
          <button
            onClick={() => navigate('/user/my-bookings')}
            className="mt-4 px-4 py-2 bg-brand text-white rounded-lg"
            style={{ backgroundColor: themeColors.button }}
          >
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-32">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors active:scale-95"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-800" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">Booking Details</h1>
              <p className="text-xs text-gray-500 font-medium tracking-wide">
                ID: <span className="font-mono">{booking.bookingNumber || booking._id?.slice(-8).toUpperCase()}</span>
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 ${getStatusColor(booking.status)}`}>
              {getStatusIcon(booking.status)}
              <span className="text-xs font-bold uppercase tracking-wide">{getStatusLabel(booking.status)}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">

        {/* Visual Progress Stepper */}
        {['cancelled', 'rejected'].includes(booking.status?.toLowerCase()) ? (
          <div className="bg-red-50 rounded-2xl p-4 border border-red-100 flex items-center gap-3 text-red-700">
            <FiXCircle className="w-5 h-5 shrink-0" />
            <p className="font-medium text-sm">This booking has been {booking.status.toLowerCase()}.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
            <div className="flex justify-between relative z-10">
              {/* Step 1: Booked */}
              <div className="flex flex-col items-center gap-2 w-1/4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${['pending', 'confirmed', 'assigned', 'journey_started', 'visited', 'in_progress', 'work_done', 'completed'].includes(booking.status?.toLowerCase())
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-200' : 'bg-gray-100 text-gray-400'
                  }`}>
                  <FiCheckCircle className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide text-center">Booked</p>
              </div>

              {/* Step 2: Assigned */}
              <div className="flex flex-col items-center gap-2 w-1/4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${['assigned', 'journey_started', 'visited', 'in_progress', 'work_done', 'completed'].includes(booking.status?.toLowerCase())
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-200' : 'bg-gray-100 text-gray-400'
                  }`}>
                  2
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide text-center">Assigned</p>
              </div>

              {/* Step 3: In Progress */}
              <div className="flex flex-col items-center gap-2 w-1/4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${['journey_started', 'visited', 'in_progress', 'work_done', 'completed'].includes(booking.status?.toLowerCase())
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-200' : 'bg-gray-100 text-gray-400'
                  }`}>
                  3
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide text-center">Started</p>
              </div>

              {/* Step 4: Done */}
              <div className="flex flex-col items-center gap-2 w-1/4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${['work_done', 'completed'].includes(booking.status?.toLowerCase())
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-200' : 'bg-gray-100 text-gray-400'
                  }`}>
                  4
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide text-center">Done</p>
              </div>
            </div>
            {/* Connect lines */}
            <div className="absolute top-[4.5rem] left-[15%] right-[15%] h-0.5 bg-gray-100 -z-0">
              <div className="h-full bg-teal-500 transition-all duration-1000" style={{
                width:
                  ['work_done', 'completed'].includes(booking.status?.toLowerCase()) ? '100%' :
                    ['journey_started', 'visited', 'in_progress'].includes(booking.status?.toLowerCase()) ? '66%' :
                      ['assigned'].includes(booking.status?.toLowerCase()) ? '33%' : '0%'
              }}></div>
            </div>
          </div>
        )}

        {/* Service Partner Card */}
        {(booking.workerId || booking.assignedTo || booking.vendorId) && ['confirmed', 'assigned', 'journey_started', 'visited', 'in_progress', 'work_done'].includes(booking.status?.toLowerCase()) && (
          <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="flex justify-between items-start mb-4">
              {['journey_started', 'visited', 'in_progress'].includes(booking.status?.toLowerCase()) ? (
                <div className="flex items-center gap-2">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <p className="text-xs font-bold text-green-600 tracking-wider">LIVE TRACKING ACTIVE</p>
                </div>
              ) : (
                <p className="text-xs font-bold text-gray-400 tracking-wider uppercase">Your Professional</p>
              )}

              <button
                onClick={() => navigate(`/user/booking/${booking._id || booking.id}/track`)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Map View <FiChevronRight />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-gray-100 to-gray-50 shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden relative bg-white">
                  {(booking.workerId?.profileImage || booking.workerId?.profilePhoto || booking.assignedTo?.profileImage || booking.assignedTo?.profilePhoto || booking.vendorId?.profileImage || booking.vendorId?.profilePhoto) ? (
                    <>
                      <img
                        src={toAssetUrl(booking.workerId?.profileImage || booking.workerId?.profilePhoto || booking.assignedTo?.profileImage || booking.assignedTo?.profilePhoto || booking.vendorId?.profileImage || booking.vendorId?.profilePhoto)}
                        alt="Professional"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.querySelector('.fallback-icon').style.display = 'block'; }}
                      />
                      <FiUser className="w-8 h-8 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fallback-icon hidden" />
                    </>
                  ) : (
                    <FiUser className="w-8 h-8 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg truncate">
                  {booking.workerId?.name || booking.assignedTo?.name || booking.vendorId?.name || 'Service Partner'}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-100">
                    <FiStar className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs font-bold text-yellow-700">4.8</span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">• Verified</span>
                </div>
              </div>

              {/* Quick Call Action */}
              {(booking.workerId?.phone || booking.assignedTo?.phone || booking.vendorId?.phone) && (
                <a
                  href={`tel:${booking.workerId?.phone || booking.assignedTo?.phone || booking.vendorId?.phone}`}
                  className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center hover:bg-green-100 transition-colors active:scale-95 border border-green-100"
                >
                  <FiPhone className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Location & Time Section */}
        <section className="space-y-4">
          {/* Map Preview - Improved overlay for better usability */}
          {booking.address && (
            <>
              <div className="group relative rounded-3xl overflow-hidden shadow-sm border border-gray-200 bg-gray-100 h-48">
                {(() => {
                  let mapQuery = '';
                  if (typeof booking.address === 'object' && booking.address.lat && booking.address.lng) {
                    mapQuery = `${booking.address.lat},${booking.address.lng}`;
                  } else {
                    const addrStr = typeof booking.address === 'string'
                      ? booking.address
                      : `${booking.address?.addressLine1 || ''}, ${booking.address?.city || ''}`;
                    mapQuery = encodeURIComponent(addrStr);
                  }
                  return (
                    <iframe
                      className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
                      frameBorder="0"
                      style={{ border: 0, pointerEvents: 'none' }}
                      src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`}
                      allowFullScreen
                      tabIndex="-1"
                      title="Location"
                    />
                  )
                })()}

                {/* Floating Info */}
                <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm border border-white/50 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                    <span className="text-xs font-bold text-gray-700">Destination</span>
                  </div>
                </div>

                {/* Track Button Overlay - Always visible but distinct */}
                <div className="absolute inset-0 flex items-center justify-center bg-transparent pointer-events-none">
                  <div className="pointer-events-auto bg-white text-gray-900 px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all border border-gray-100" onClick={() => navigate(`/user/booking/${booking._id || booking.id}/track`)}>
                    <FiMapPin className="w-4 h-4 text-red-500" /> View on Map
                  </div>
                </div>
              </div>

              {/* Dedicated Track Button */}
              {['confirmed', 'assigned', 'journey_started', 'visited', 'in_progress'].includes(booking.status?.toLowerCase()) && (
                <button
                  onClick={() => navigate(`/user/booking/${booking._id || booking.id}/track`)}
                  className="w-full py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl font-bold shadow-lg shadow-gray-200 active:scale-95 transition-all flex items-center justify-center gap-3 hover:shadow-xl"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <FiMapPin className="w-4 h-4 text-white" />
                  </div>
                  Track Service Agent
                </button>
              )}
            </>
          )}

          <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
                <FiMapPin className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-1">Service Address</p>
                <p className="text-sm font-medium text-gray-900 leading-relaxed">{getAddressString(booking.address)}</p>
              </div>
            </div>
            <div className="w-full h-px bg-gray-50 mb-4"></div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                <FiCalendar className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-1">Schedule</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(booking.scheduledDate)}
                </p>
                <p className="text-sm text-gray-500">{booking.scheduledTime || booking.timeSlot?.start || 'N/A'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Details */}
        <section className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Order Summary</h3>
            <span className="text-xs font-semibold px-2 py-1 bg-white border border-gray-200 rounded text-gray-500">
              {booking.serviceCategory || 'Service'}
            </span>
          </div>

          <div className="p-5">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <FiPackage className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{booking.serviceName || 'Service'}</h4>
                {booking.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{booking.description}</p>}
              </div>
            </div>

            {/* Items List */}
            {booking.bookedItems && booking.bookedItems.length > 0 ? (
              <div className="mt-5 space-y-3">
                {booking.bookedItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start pt-3 border-t border-dashed border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">x{item.quantity}</span>
                        <span className="text-sm font-medium text-gray-800">{item.card?.title || item.title}</span>
                      </div>
                      {(item.card?.subtitle) && <p className="text-xs text-gray-400 ml-6">{item.card.subtitle}</p>}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">₹{(item.card?.price || 0).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            ) : booking.userNotes ? (
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs font-bold text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-800">{booking.userNotes.replace('Items: ', '')}</p>
              </div>
            ) : null}
          </div>
        </section>

        {/* Payment Summary */}
        <section className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
          <div className="p-5 space-y-3">
            {booking.paymentMethod === 'plan_benefit' ? (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-green-200">
                  <FiCheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-green-800">Covered by Membership</p>
                  <p className="text-xs text-green-600">You saved ₹{(booking.basePrice || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Base Price</span>
                  <span className="font-medium text-gray-900">₹{(booking.basePrice || 0).toLocaleString('en-IN')}</span>
                </div>
                {booking.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="font-medium text-green-600">-₹{booking.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {booking.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">GST (18%)</span>
                    <span className="font-medium text-gray-900">₹{booking.tax.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {(booking.visitationFee > 0 || booking.visitingCharges > 0) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Convenience Fee</span>
                    <span className="font-medium text-gray-900">₹{(booking.visitationFee || booking.visitingCharges).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-3 mt-2 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-lg">Total Amount</span>
                  <span className="font-black text-gray-900 text-xl">₹{(booking.finalAmount || booking.totalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              </>
            )}
          </div>

          {/* Payment Status Footer */}
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Payment Status</span>
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize ${booking.paymentStatus === 'success' ? 'bg-green-100 text-green-700' :
              booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
              }`}>
              {booking.paymentStatus === 'success' ? 'Paid' : booking.paymentStatus || 'Pending'}
            </span>
          </div>
        </section>

        {/* Action Card for Awaiting Payment */}
        {booking.status === 'awaiting_payment' && (
          <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-6 space-y-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiDollarSign className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-black">Payment Required</h3>
              <p className="text-sm text-gray-500">The vendor has accepted your request. Please choose a payment method to confirm your booking.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleOnlinePayment}
                className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
                style={{ background: themeColors.button }}
              >
                <FiDollarSign className="w-5 h-5" />
                Pay Online (Razorpay/UPI)
              </button>

              <button
                onClick={handlePayAtHome}
                className="w-full py-4 rounded-xl font-bold text-gray-700 bg-gray-100 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <FiHome className="w-5 h-5" />
                Pay at Home (After Service)
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          {/* Support */}
          <button className="col-span-1 flex flex-col items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors active:scale-95">
            <FiPhone className="w-6 h-6 text-gray-700" />
            <span className="text-sm font-bold text-gray-700">Call Support</span>
          </button>
          <button className="col-span-1 flex flex-col items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors active:scale-95">
            <FiMail className="w-6 h-6 text-gray-700" />
            <span className="text-sm font-bold text-gray-700">Email Help</span>
          </button>

          {/* Cancel */}
          {!['cancelled', 'completed', 'work_done'].includes(booking.status?.toLowerCase()) && (
            <button
              onClick={handleCancelBooking}
              className="col-span-2 py-4 rounded-2xl text-red-600 font-bold text-sm bg-red-50 border border-red-100 hover:bg-red-100 transition-colors active:scale-95"
            >
              Cancel Booking
            </button>
          )}
        </div>

        {/* Rate & Review (Conditional) */}
        {/* Rate & Review (Conditional) */}
        <ReviewCard
          booking={booking}
          onWriteReview={() => setShowRatingModal(true)}
        />

      </main>

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          localStorage.setItem(`rating_dismissed_${id}`, 'true');
        }}
        onSubmit={handleRateSubmit}
        bookingName={booking.serviceName || booking.serviceCategory || 'Service'}
        workerName={booking.workerId?.name || (booking.assignedTo?.name === 'You (Self)' ? 'Service Provider' : (booking.assignedTo?.name || 'Worker'))}
      />

      {/* Payment Verification Modal */}
      <PaymentVerificationModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        booking={booking}
        onPayOnline={handleOnlinePayment}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </div>
  );
};

export default BookingDetails;

