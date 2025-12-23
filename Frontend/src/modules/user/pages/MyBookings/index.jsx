import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiMapPin, FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../../theme';
import BottomNav from '../../components/layout/BottomNav';
import { bookingService } from '../../../../services/bookingService';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, confirmed, in-progress, completed, cancelled

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const params = {};
        if (filter !== 'all') {
          params.status = filter;
        }
        const response = await bookingService.getUserBookings(params);
        if (response.success) {
          setBookings(response.data || []);
        } else {
          toast.error(response.message || 'Failed to load bookings');
          setBookings([]);
        }
      } catch (error) {
        console.error('Error loading bookings:', error);
        toast.error('Failed to load bookings. Please try again.');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [filter]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <FiCheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <FiLoader className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <FiCheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <FiXCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FiClock className="w-4 h-4 text-gray-500" />;
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

  const handleBookingClick = (booking) => {
    navigate(`/user/booking/${booking._id || booking.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const getAddressString = (address) => {
    if (typeof address === 'string') return address;
    if (address && typeof address === 'object') {
      return `${address.addressLine1 || ''}${address.addressLine2 ? `, ${address.addressLine2}` : ''}, ${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}`;
    }
    return 'N/A';
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
            <h1 className="text-xl font-bold text-black">My Bookings</h1>
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[57px] z-20">
        <div className="flex overflow-x-auto px-4 py-2 gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'in-progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-brand text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={filter === tab.id ? { backgroundColor: themeColors.button } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <main className="px-4 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FiLoader className="w-16 h-16 text-gray-300 mb-4 animate-spin" />
            <p className="text-gray-500 text-lg font-medium">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FiClock className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No bookings found</p>
            <p className="text-gray-400 text-sm mt-2">
              {filter === 'all' 
                ? 'You haven\'t made any bookings yet' 
                : `No ${filter} bookings`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id || booking.id}
                onClick={() => handleBookingClick(booking)}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 cursor-pointer active:scale-[0.98] transition-transform"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                {/* Booking Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-black">
                        {booking.serviceName || booking.serviceCategory || 'Service'}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Booking ID: {booking.bookingNumber || (booking._id || booking.id).substring(0, 12)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(booking.status)}
                  </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2">
                    <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {getAddressString(booking.address)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-gray-400 shrink-0" />
                    <p className="text-sm text-gray-700">
                      {formatDate(booking.scheduledDate)} • {booking.scheduledTime || booking.timeSlot?.start || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Total Amount</span>
                  <span className="text-lg font-bold text-black">
                    ₹{(booking.finalAmount || booking.totalAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default MyBookings;

