import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

const BookingDetails = () => {
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

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Booking not found</p>
          <button
            onClick={() => navigate('/my-bookings')}
            className="mt-4 px-4 py-2 bg-brand text-white rounded-lg"
            style={{ backgroundColor: '#00a6a6' }}
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
                {booking.category === 'All' ? 'Multiple Services' : booking.category}
              </h2>
              <p className="text-xs text-gray-500">Booking ID: {booking.id}</p>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-sm font-semibold border flex items-center gap-2 ${getStatusColor(booking.status)}`}>
              {getStatusIcon(booking.status)}
              {getStatusLabel(booking.status)}
            </div>
          </div>
        </div>

        {/* Address & Time Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
          <h3 className="text-base font-bold text-black mb-3">Service Details</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(0, 166, 166, 0.1)' }}>
                <FiMapPin className="w-4 h-4" style={{ color: '#00a6a6' }} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Address</p>
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

        {/* Services Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-black">Services</h3>
            <span className="text-sm text-gray-600">{booking.items.length} {booking.items.length === 1 ? 'service' : 'services'}</span>
          </div>
          <div className="space-y-3">
            {booking.items.map((item, index) => (
              <div key={item.id || index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(0, 166, 166, 0.1)' }}>
                  <FiPackage className="w-4 h-4" style={{ color: '#00a6a6' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-black mb-1">{item.title}</p>
                  <p className="text-xs text-gray-600">Quantity: {item.serviceCount || 1}</p>
                  <p className="text-sm font-bold text-black mt-1">₹{(item.price || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
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
                <span className="text-base font-bold text-black">Total</span>
                <span className="text-lg font-bold text-black">₹{booking.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
          <h3 className="text-base font-bold text-black mb-3">Payment Information</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment ID</span>
              <span className="text-sm font-semibold text-black">{booking.paymentId}</span>
            </div>
            {booking.orderId && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Order ID</span>
                <span className="text-sm font-semibold text-black">{booking.orderId}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment Status</span>
              <span className="text-sm font-semibold text-green-600">Paid</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Booking Date</span>
              <span className="text-sm font-semibold text-black">{formatDate(booking.createdAt)}</span>
            </div>
          </div>
        </div>

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

