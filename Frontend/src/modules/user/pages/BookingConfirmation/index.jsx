import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../../theme';
import { 
  FiCheckCircle, 
  FiMapPin, 
  FiClock, 
  FiCalendar,
  FiPackage,
  FiDollarSign,
  FiHome,
  FiArrowRight,
  FiLoader
} from 'react-icons/fi';
import BottomNav from '../../components/layout/BottomNav';
import { bookingService } from '../../../../services/bookingService';

const BookingConfirmation = () => {
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
            className="mt-4 px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: themeColors.button }}
          >
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

  const handleViewDetails = () => {
    navigate(`/user/booking/${booking._id || booking.id}`);
  };

  const handleGoHome = () => {
    navigate('/user', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="px-4 py-6">
        {/* Success Icon */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <FiCheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">Booking Confirmed!</h1>
          <p className="text-sm text-gray-600 text-center">
            Your booking has been confirmed. We'll send you updates via SMS.
          </p>
        </div>

        {/* Booking ID Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Booking ID</p>
              <p className="text-base font-bold text-black">{booking.bookingNumber || booking._id || booking.id}</p>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
              <span className="text-sm font-semibold">Confirmed</span>
            </div>
          </div>
        </div>

        {/* Service Details Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-4">
          <h3 className="text-base font-bold text-black mb-3">Service Details</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(0, 166, 166, 0.1)' }}>
                <FiMapPin className="w-4 h-4" style={{ color: themeColors.button }} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Service Address</p>
                <p className="text-sm text-gray-700">{getAddressString(booking.address)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
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

        {/* Service Summary Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-4">
          <h3 className="text-base font-bold text-black mb-3">Service Details</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FiPackage className="w-4 h-4 text-gray-400 shrink-0" />
              <p className="text-sm text-gray-700 flex-1">{booking.serviceName || 'Service'}</p>
              <p className="text-sm font-semibold text-black">₹{(booking.finalAmount || booking.basePrice || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Payment Summary Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-4">
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
                <span className="text-base font-bold text-black">Total Paid</span>
                <span className="text-lg font-bold text-black">₹{(booking.finalAmount || booking.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          {booking.paymentId && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FiDollarSign className="w-3 h-3" />
                <span>Payment ID: {booking.paymentId}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleViewDetails}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-base font-semibold text-white transition-all"
            style={{ backgroundColor: themeColors.button }}
            onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.button}
            onMouseLeave={(e) => e.target.style.backgroundColor = themeColors.button}
          >
            View Full Details
            <FiArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={handleGoHome}
            className="w-full py-3 rounded-lg text-base font-semibold bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
          >
            Back to Home
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default BookingConfirmation;

