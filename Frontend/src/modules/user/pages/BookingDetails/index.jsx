import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
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
  FiMail
} from 'react-icons/fi';
import BottomNav from '../../components/layout/BottomNav';
import { bookingService } from '../../../../services/bookingService';

const BookingDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        setLoading(true);
        const response = await bookingService.getById(id);
        if (response.success) {
          setBooking(response.data);
        } else {
          toast.error(response.message || 'Booking not found');
          navigate('/user/my-bookings');
        }
      } catch (error) {
        console.error('Error loading booking:', error);
        toast.error('Failed to load booking details');
        navigate('/user/my-bookings');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadBooking();
    }
  }, [id, navigate]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <FiLoader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <FiCheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <FiXCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FiClock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await bookingService.cancel(booking._id || booking.id, 'Cancelled by user');
      if (response.success) {
        toast.success('Booking cancelled successfully');
        setBooking({ ...booking, status: 'cancelled' });
      } else {
        toast.error(response.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking. Please try again.');
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 text-black" />
            </button>
            <h1 className="text-xl font-bold text-black">Booking Details</h1>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-black mb-1">
                {booking.serviceName || booking.serviceCategory || 'Service'}
              </h2>
              <p className="text-xs text-gray-500">Booking ID: {booking.bookingNumber || booking._id || booking.id}</p>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-sm font-semibold border flex items-center gap-2 ${getStatusColor(booking.status)}`}>
              {getStatusIcon(booking.status)}
              {getStatusLabel(booking.status)}
            </div>
          </div>
        </div>

        {/* Address & Track Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
          <h3 className="text-base font-bold text-black mb-3">Service Location & Tracking</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(0, 166, 166, 0.1)' }}>
                <FiMapPin className="w-4 h-4" style={{ color: themeColors.button }} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Address</p>
                <p className="text-sm text-gray-700">{getAddressString(booking.address)}</p>
              </div>
            </div>

            {/* Map Preview Logic - Same as Worker App */}
            {booking.address && (
              <div
                className="w-full h-40 rounded-lg overflow-hidden bg-gray-200 border border-gray-100 relative group cursor-pointer"
                onClick={() => navigate(`/user/booking/${booking._id || booking.id}/track`)}
              >
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
                    <>
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0, pointerEvents: 'none' }}
                        src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`}
                        allowFullScreen
                        tabIndex="-1"
                        title="Location Map"
                      ></iframe>
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors flex items-center justify-center">
                        <span className="bg-white/90 px-3 py-1.5 rounded-full text-xs font-bold text-gray-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                          <FiMapPin className="w-3 h-3" /> Track Order
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Track Button */}
            <button
              onClick={() => navigate(`/user/booking/${booking._id || booking.id}/track`)}
              className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md"
              style={{ background: themeColors.button }}
            >
              <FiMapPin className="w-4 h-4" />
              Track Service Agent
            </button>

            <div className="flex items-start gap-3 pt-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(0, 166, 166, 0.1)' }}>
                <FiCalendar className="w-4 h-4" style={{ color: themeColors.button }} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                <p className="text-sm text-gray-700">
                  {formatDate(booking.scheduledDate)} • {booking.scheduledTime || booking.timeSlot?.start || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Details Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
          <h3 className="text-base font-bold text-black mb-3">Service Details</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(0, 166, 166, 0.1)' }}>
                <FiPackage className="w-4 h-4" style={{ color: themeColors.button }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-black mb-1">{booking.serviceName || 'Service'}</p>
                {booking.description && (
                  <p className="text-xs text-gray-600 mb-1">{booking.description}</p>
                )}
                <p className="text-sm font-bold text-black mt-1">₹{(booking.finalAmount || booking.basePrice || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
          <h3 className="text-base font-bold text-black mb-3">Payment Summary</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Base Price</span>
              <span className="text-sm font-semibold text-black">₹{(booking.basePrice || 0).toLocaleString('en-IN')}</span>
            </div>
            {booking.discount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Discount</span>
                <span className="text-sm font-semibold text-green-600">-₹{booking.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            {booking.tax > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tax</span>
                <span className="text-sm font-semibold text-black">₹{booking.tax.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-black">Total</span>
                <span className="text-lg font-bold text-black">₹{(booking.finalAmount || booking.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
          <h3 className="text-base font-bold text-black mb-3">Payment Information</h3>
          <div className="space-y-2">
            {booking.paymentId && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment ID</span>
                <span className="text-sm font-semibold text-black">{booking.paymentId}</span>
              </div>
            )}
            {booking.razorpayOrderId && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Order ID</span>
                <span className="text-sm font-semibold text-black">{booking.razorpayOrderId}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment Status</span>
              <span className={`text-sm font-semibold ${booking.paymentStatus === 'success' ? 'text-green-600' :
                  booking.paymentStatus === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                }`}>
                {booking.paymentStatus === 'success' ? 'Paid' :
                  booking.paymentStatus === 'pending' ? 'Pending' :
                    booking.paymentStatus || 'Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment Method</span>
              <span className="text-sm font-semibold text-black capitalize">{booking.paymentMethod || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Booking Date</span>
              <span className="text-sm font-semibold text-black">{formatDate(booking.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Cancel Button - Only show if booking is not cancelled or completed */}
        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
            <button
              onClick={handleCancelBooking}
              className="w-full py-3.5 rounded-lg text-base font-semibold text-white transition-colors"
              style={{
                backgroundColor: '#ef4444',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
            >
              Cancel Booking
            </button>
          </div>
        )}

        {/* Support Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
          <h3 className="text-base font-bold text-black mb-3">Need Help?</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <FiPhone className="w-5 h-5 text-gray-700" />
              <span className="text-sm font-semibold text-gray-700">Call Support</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <FiMail className="w-5 h-5 text-gray-700" />
              <span className="text-sm font-semibold text-gray-700">Email Support</span>
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default BookingDetails;

