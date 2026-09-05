import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiCalendar, FiDownload, FiEye, FiX, FiMapPin, FiCreditCard, FiUser, FiBriefcase,
  FiClock, FiCheckCircle, FiBox, FiTruck, FiXCircle, FiRefreshCw, FiShoppingBag
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { adminBookingService } from '../../../../services/adminBookingService';
import { getDashboardStats } from '../../../../services/adminDashboardService';

const BookingStatsCard = ({ title, count, icon: Icon, colorClass, bgClass }) => (
  <div className={`p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between ${bgClass}`}>
    <div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${colorClass.replace('text-', 'bg-').replace('600', '100')}`}>
        <Icon className={`w-4 h-4 ${colorClass}`} />
      </div>
      <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{title}</h3>
      <p className="text-xl font-bold text-gray-800 mt-0.5">{count}</p>
    </div>
    <div className={`w-12 h-12 rounded-full opacity-10 -mr-3 -mb-3 ${colorClass.replace('text-', 'bg-')}`}></div>
  </div>
);

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    total: 0
  });

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Load Data
  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Bookings
      const params = {
        page,
        limit: 10,
        search: debouncedSearch,
        startDate,
        endDate
      };
      if (statusFilter !== 'All Status') {
        params.status = statusFilter.toUpperCase().replace(' ', '_');
      }

      const res = await adminBookingService.getAllBookings(params);
      if (res.success) {
        setBookings(res.data);
        setTotalPages(res.pagination.pages);
      }

      // 2. Fetch Stats (only if not already fetched or if total is 0)
      if (stats.total === 0) {
        const statsRes = await getDashboardStats();
        if (statsRes.success) {
          const s = statsRes.data.stats;
          setStats({
            pending: s.pendingBookings || 0,
            confirmed: 0,
            inProgress: 0,
            completed: s.completedBookings || 0,
            cancelled: s.cancelledBookings || 0,
            total: s.totalBookings || 0
          });
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, debouncedSearch, statusFilter, startDate, endDate]);

  const handleExport = () => {
    const headers = ['Order ID', 'Customer', 'Service', 'Total', 'Status', 'Date'];
    const rows = bookings.map(b => [
      b.bookingNumber,
      b.userId?.name || 'Unknown',
      b.serviceId?.title || 'Service',
      b.finalAmount,
      b.status,
      new Date(b.createdAt).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bookings.csv");
    document.body.appendChild(link);
    link.click();
  };

  const openBookingDetails = async (booking) => {
    setSelectedBooking(booking);
    setDetailsLoading(true);
    try {
      const response = await adminBookingService.getBookingById(booking._id);
      if (response.success) {
        setSelectedBooking(response.data);
      } else {
        toast.error(response.message || 'Failed to load booking details');
      }
    } catch (error) {
      console.error('Error loading booking details:', error);
      toast.error(error.message || 'Failed to load booking details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatDateTime = (date) => date ? new Date(date).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : 'Not available';

  const formatAmount = (amount) => `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;

  const getBookedCategory = (booking) => (
    booking?.serviceCategory
    || booking?.category
    || booking?.bookedItems?.find(item => item.category || item.serviceCategory)?.category
    || booking?.bookedItems?.find(item => item.category || item.serviceCategory)?.serviceCategory
    || booking?.serviceId?.category
    || 'Category not available'
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <BookingStatsCard title="Awaiting" count={stats.pending} icon={FiClock} bgClass="bg-yellow-50" colorClass="text-yellow-600" />
        <BookingStatsCard title="Confirmed" count={stats.pending} icon={FiCheckCircle} bgClass="bg-blue-50" colorClass="text-blue-600" />
        <BookingStatsCard title="In Progress" count={stats.inProgress} icon={FiBox} bgClass="bg-purple-50" colorClass="text-purple-600" />
        <BookingStatsCard title="Completed" count={stats.completed} icon={FiTruck} bgClass="bg-green-50" colorClass="text-green-600" />
        <BookingStatsCard title="Delivered" count={stats.completed} icon={FiCheckCircle} bgClass="bg-emerald-50" colorClass="text-emerald-600" />
        <BookingStatsCard title="Cancelled" count={stats.cancelled} icon={FiXCircle} bgClass="bg-red-50" colorClass="text-red-600" />
        <BookingStatsCard title="Returned" count={0} icon={FiRefreshCw} bgClass="bg-orange-50" colorClass="text-orange-600" />
        <BookingStatsCard title="Total Orders" count={stats.total} icon={FiShoppingBag} bgClass="bg-gray-50" colorClass="text-gray-600" />
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-3 justify-between items-center">
        <div className="relative w-full lg:w-80">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:border-green-500 cursor-pointer"
          >
            <option>All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">
            <FiCalendar className="text-gray-400 w-3.5 h-3.5" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-[11px] text-gray-600 focus:outline-none w-20"
            />
            <span className="text-gray-400 text-[10px]">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-[11px] text-gray-600 focus:outline-none w-20"
            />
          </div>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm shadow-green-200"
          >
            <FiDownload className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total (₹)</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Order Date</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-xs text-gray-500">Loading bookings...</td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-xs text-gray-500">No bookings found</td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-900 text-xs">#{booking.bookingNumber || booking._id.slice(-6).toUpperCase()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-gray-900 text-xs">{booking.userId?.name || 'Guest'}</p>
                        <p className="text-[10px] text-gray-400">{booking.userId?.phone || booking.customerPhone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-blue-600 text-[11px] font-bold">
                        {booking.bookedItems?.length || 1} items
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-900 text-xs">₹{booking.finalAmount?.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider
                            ${booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            booking.status === 'in_progress' ? 'bg-purple-100 text-purple-700' :
                              'bg-yellow-100 text-yellow-700'}`}>
                        {booking.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-gray-600 capitalize font-medium">{booking.paymentMethod?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] text-gray-600 font-medium">
                        {new Date(booking.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openBookingDetails(booking)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View booking details"
                        aria-label={`View booking ${booking.bookingNumber || booking._id}`}
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && bookings.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/30">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Showing {bookings.length} of {stats.total} entries</p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 disabled:opacity-50 hover:bg-white transition-all"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 disabled:opacity-50 hover:bg-white transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
            onMouseDown={() => !detailsLoading && setSelectedBooking(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              onMouseDown={(event) => event.stopPropagation()}
              className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between border-b border-gray-100 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Booking Details</p>
                  <h2 className="mt-1 text-xl font-bold text-gray-900">#{selectedBooking.bookingNumber || selectedBooking._id?.slice(-6).toUpperCase()}</h2>
                  <p className="mt-1 text-xs text-gray-500">Created {formatDateTime(selectedBooking.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                    {selectedBooking.status?.replaceAll('_', ' ') || 'Pending'}
                  </span>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    disabled={detailsLoading}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed"
                    aria-label="Close booking details"
                  >
                    <FiX />
                  </button>
                </div>
              </div>

              <div className="max-h-[calc(90vh-100px)] overflow-y-auto p-5">
                {detailsLoading ? (
                  <div className="flex min-h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600" />
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-500"><FiUser /> Customer</div>
                        <p className="text-sm font-semibold text-gray-900">{selectedBooking.userId?.name || 'Guest customer'}</p>
                        <p className="mt-1 text-xs text-gray-600">{selectedBooking.userId?.phone || selectedBooking.customerPhone || 'No phone'}</p>
                        <p className="text-xs text-gray-600">{selectedBooking.userId?.email || 'No email'}</p>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-500"><FiBriefcase /> Vendor and Worker</div>
                        <p className="text-sm font-semibold text-gray-900">{selectedBooking.vendorId?.businessName || selectedBooking.vendorId?.name || 'Not assigned'}</p>
                        <p className="mt-1 text-xs text-gray-600">Vendor: {selectedBooking.vendorId?.phone || 'Not assigned'}</p>
                        <p className="text-xs text-gray-600">Worker: {selectedBooking.workerId?.name || 'Not assigned'}</p>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-500"><FiCalendar /> Schedule</div>
                        <p className="text-sm font-semibold text-gray-900">{formatDateTime(selectedBooking.scheduledDate)}</p>
                        <p className="mt-1 text-xs text-gray-600">{selectedBooking.scheduledTime || selectedBooking.timeSlot?.start || 'Time not set'}</p>
                        <p className="text-xs capitalize text-gray-600">{selectedBooking.bookingType || 'scheduled'} booking</p>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 md:col-span-3">
                        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-500"><FiShoppingBag /> Category Booked</div>
                        <p className="text-sm font-semibold text-gray-900">{getBookedCategory(selectedBooking)}</p>
                      </div>
                    </div>

                    <section className="rounded-xl border border-gray-100">
                      <div className="border-b border-gray-100 px-4 py-3">
                        <h3 className="text-sm font-bold text-gray-900">Booked Services and Items</h3>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {(selectedBooking.bookedItems?.length ? selectedBooking.bookedItems : [{ serviceName: selectedBooking.serviceName, card: { title: selectedBooking.serviceId?.title, price: selectedBooking.basePrice }, quantity: 1 }]).map((item, index) => (
                          <div key={`${item.serviceName || item.card?.title || 'item'}-${index}`} className="flex items-center justify-between gap-4 px-4 py-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-gray-900">{item.card?.title || item.serviceName || selectedBooking.serviceName || 'Service'}</p>
                              <p className="mt-0.5 text-xs text-gray-500">{[item.brandName, item.card?.subtitle, item.card?.duration].filter(Boolean).join(' | ') || selectedBooking.serviceCategory}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-semibold text-gray-900">{formatAmount(item.card?.price ?? selectedBooking.basePrice)}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <section className="rounded-xl border border-gray-100 p-4">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900"><FiMapPin className="text-blue-600" /> Service Address</h3>
                        <p className="text-sm text-gray-700">{[selectedBooking.address?.addressLine1, selectedBooking.address?.addressLine2, selectedBooking.address?.landmark].filter(Boolean).join(', ') || 'Address not available'}</p>
                        <p className="mt-1 text-sm text-gray-700">{[selectedBooking.address?.city, selectedBooking.address?.state, selectedBooking.address?.pincode].filter(Boolean).join(', ')}</p>
                      </section>
                      <section className="rounded-xl border border-gray-100 p-4">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900"><FiCreditCard className="text-blue-600" /> Payment</h3>
                        <p className="text-sm text-gray-700">Method: <span className="font-semibold capitalize">{selectedBooking.paymentMethod?.replaceAll('_', ' ') || 'Not selected'}</span></p>
                        <p className="mt-1 text-sm text-gray-700">Status: <span className="font-semibold capitalize">{selectedBooking.paymentStatus?.replaceAll('_', ' ') || 'Pending'}</span></p>
                        {selectedBooking.razorpayPaymentId && <p className="mt-1 break-all text-xs text-gray-500">Payment ID: {selectedBooking.razorpayPaymentId}</p>}
                      </section>
                    </div>

                    <section className="rounded-xl border border-gray-100 p-4">
                      <h3 className="mb-3 text-sm font-bold text-gray-900">Amount Breakdown</h3>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
                        <p className="text-gray-500">Base <span className="float-right font-semibold text-gray-800">{formatAmount(selectedBooking.basePrice)}</span></p>
                        <p className="text-gray-500">Discount <span className="float-right font-semibold text-gray-800">{formatAmount(selectedBooking.discount)}</span></p>
                        <p className="text-gray-500">Tax <span className="float-right font-semibold text-gray-800">{formatAmount(selectedBooking.tax)}</span></p>
                        <p className="text-gray-500">Visit fee <span className="float-right font-semibold text-gray-800">{formatAmount(selectedBooking.visitingCharges)}</span></p>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                        <span className="text-sm font-bold text-gray-900">Final Amount</span>
                        <span className="text-lg font-bold text-blue-700">{formatAmount(selectedBooking.finalAmount)}</span>
                      </div>
                    </section>

                    {(selectedBooking.cancellationReason || selectedBooking.vendorNotes || selectedBooking.workerNotes) && (
                      <section className="rounded-xl border border-gray-100 p-4">
                        <h3 className="mb-2 text-sm font-bold text-gray-900">Notes</h3>
                        {selectedBooking.cancellationReason && <p className="text-sm text-red-600">Cancellation: {selectedBooking.cancellationReason}</p>}
                        {selectedBooking.vendorNotes && <p className="mt-1 text-sm text-gray-700">Vendor: {selectedBooking.vendorNotes}</p>}
                        {selectedBooking.workerNotes && <p className="mt-1 text-sm text-gray-700">Worker: {selectedBooking.workerNotes}</p>}
                      </section>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Bookings;
