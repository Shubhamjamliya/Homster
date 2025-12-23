import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiCalendar, FiClock, FiMapPin, FiUser, FiMoreVertical, FiEye, FiXCircle, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { adminBookingService } from '../../../../services/adminBookingService';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: debouncedSearch
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await adminBookingService.getAllBookings(params);
      if (response.success) {
        setBookings(response.data);
        setTotalPages(response.pagination.pages);
        setTotalBookings(response.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, debouncedSearch, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const reason = window.prompt("Enter cancellation reason:");
    if (!reason) return;

    try {
      const response = await adminBookingService.cancelBooking(bookingId, reason);
      if (response.success) {
        toast.success('Booking cancelled successfully');
        fetchBookings();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage all service bookings ({totalBookings} total)
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all capitalize whitespace-nowrap ${statusFilter === status
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-500 shadow-sm border border-gray-100">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-primary-600 rounded-full mb-4"></div>
            <p>Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center flex flex-col items-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiCalendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No bookings found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-primary-100 transition-colors"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Service Info */}
                <div className="flex gap-4 min-w-[300px]">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                    {booking.serviceId?.iconUrl ? (
                      <img
                        src={booking.serviceId.iconUrl.replace('/api/upload', 'http://localhost:5000/upload')}
                        alt={booking.serviceId.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🔧</div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{booking.serviceId?.title || 'Unknown Service'}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                        {booking.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">#{booking.bookingNumber}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-3.5 h-3.5" />
                        {new Date(booking.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <FiClock className="w-3.5 h-3.5" />
                        {booking.scheduledTime}
                      </div>
                    </div>
                  </div>
                </div>

                {/* User & Vendor Info */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Customer</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {booking.userId?.name?.charAt(0) || <FiUser />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{booking.userId?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{booking.userId?.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Vendor</p>
                    {booking.vendorId ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xs">
                          {booking.vendorId.businessName?.charAt(0) || <FiUser />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{booking.vendorId.businessName || booking.vendorId.name}</p>
                          <p className="text-xs text-gray-500">{booking.vendorId.phone}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Not assigned</span>
                    )}
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 min-w-[150px]">
                  <div className="text-left lg:text-right">
                    <p className="text-lg font-bold text-gray-900">₹{booking.finalAmount}</p>
                    <p className={`text-xs capitalize ${booking.paymentStatus === 'success' ? 'text-green-600' : 'text-orange-600'}`}>
                      {booking.paymentStatus} via {booking.paymentMethod}
                    </p>
                  </div>

                  <div className="flex gap-2 lg:mt-4">
                    {/* View Details Button - Could open modal or navigate */}
                    <button className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="View Details">
                      <FiEye className="w-5 h-5" />
                    </button>

                    {['pending', 'confirmed'].includes(booking.status) && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel Booking"
                      >
                        <FiXCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}

        {/* Pagination - Matching Users page style */}
        {!loading && bookings.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 px-2">
            <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;

