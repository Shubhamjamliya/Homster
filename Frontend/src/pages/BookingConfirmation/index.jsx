import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiCheckCircle, 
  FiMapPin, 
  FiClock, 
  FiCalendar,
  FiPackage,
  FiDollarSign,
  FiHome,
  FiArrowRight
} from 'react-icons/fi';
import BottomNav from '../../components/layout/BottomNav';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);

  useEffect(() => {
    // If booking not in state, try to load from localStorage using ID from URL
    if (!booking) {
      const bookingId = window.location.pathname.split('/').pop();
      const saved = localStorage.getItem('bookings');
      if (saved) {
        try {
          const bookings = JSON.parse(saved);
          const foundBooking = bookings.find(b => b.id === bookingId);
          if (foundBooking) {
            setBooking(foundBooking);
          }
        } catch (e) {
          console.error('Error loading booking:', e);
        }
      }
    }
  }, []);

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Booking not found</p>
          <button
            onClick={() => navigate('/my-bookings')}
            className="mt-4 px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: '#00a6a6' }}
          >
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

  const handleViewDetails = () => {
    navigate(`/booking/${booking.id}`, { state: { booking } });
  };

  const handleGoHome = () => {
    navigate('/', { replace: true });
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
              <p className="text-base font-bold text-black">{booking.id}</p>
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
                <FiMapPin className="w-4 h-4" style={{ color: '#00a6a6' }} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Service Address</p>
                <p className="text-sm text-gray-700">{booking.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(0, 166, 166, 0.1)' }}>
                <FiCalendar className="w-4 h-4" style={{ color: '#00a6a6' }} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                <p className="text-sm text-gray-700">{booking.date} • {booking.time}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Summary Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-black">Services</h3>
            <span className="text-sm text-gray-600">{booking.items.length} {booking.items.length === 1 ? 'service' : 'services'}</span>
          </div>
          <div className="space-y-2">
            {booking.items.slice(0, 3).map((item, index) => (
              <div key={item.id || index} className="flex items-center gap-2">
                <FiPackage className="w-4 h-4 text-gray-400 shrink-0" />
                <p className="text-sm text-gray-700 flex-1">{item.title} × {item.serviceCount || 1}</p>
                <p className="text-sm font-semibold text-black">₹{(item.price || 0).toLocaleString('en-IN')}</p>
              </div>
            ))}
            {booking.items.length > 3 && (
              <p className="text-xs text-gray-500 mt-2">+ {booking.items.length - 3} more services</p>
            )}
          </div>
        </div>

        {/* Payment Summary Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-4">
          <h3 className="text-base font-bold text-black mb-3">Payment Summary</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-sm font-semibold text-black">₹{booking.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {booking.tip > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tip</span>
                <span className="text-sm font-semibold text-black">₹{booking.tip.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Visited Fee</span>
              <span className="text-sm font-semibold text-black">₹{booking.visitedFee.toLocaleString('en-IN')}</span>
            </div>
            {booking.discount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Discount</span>
                <span className="text-sm font-semibold text-green-600">-₹{booking.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-black">Total Paid</span>
                <span className="text-lg font-bold text-black">₹{booking.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FiDollarSign className="w-3 h-3" />
              <span>Payment ID: {booking.paymentId}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleViewDetails}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-base font-semibold text-white transition-all"
            style={{ backgroundColor: '#00a6a6' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#008a8a'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#00a6a6'}
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

