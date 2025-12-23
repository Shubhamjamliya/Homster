import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiMapPin, FiClock, FiDollarSign, FiUser, FiPhone, FiNavigation, FiArrowRight, FiEdit, FiCheckCircle } from 'react-icons/fi';
import { vendorTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import { getBookingById, updateBookingStatus } from '../../services/bookingService';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const bgStyle = themeColors.backgroundGradient;

    if (html) html.style.background = bgStyle;
    if (body) body.style.background = bgStyle;
    if (root) root.style.background = bgStyle;

    return () => {
      if (html) html.style.background = '';
      if (body) body.style.background = '';
      if (root) root.style.background = '';
    };
  }, []);

  useEffect(() => {
    // Load booking from localStorage (mock data)
    // Load booking from API
    const loadBooking = async () => {
      try {
        setLoading(true);
        const response = await getBookingById(id);
        const apiData = response.data || response;

        // Map API response to Component State structure
        const mappedBooking = {
          ...apiData,
          id: apiData._id || apiData.id,
          user: apiData.userId || apiData.user || { name: apiData.customerName || 'Customer', phone: apiData.customerPhone || 'Hidden' },
          customerName: apiData.userId?.name || apiData.customerName || 'Customer',
          customerPhone: apiData.userId?.phone || apiData.customerPhone || 'Hidden',
          serviceType: apiData.serviceId?.title || apiData.serviceName || apiData.serviceType || 'Service',
          location: {
            address: apiData.address?.addressLine1 || apiData.location?.address || 'Address not available',
            lat: apiData.address?.lat || apiData.location?.lat || 0,
            lng: apiData.address?.lng || apiData.location?.lng || 0,
            distance: apiData.distance ? `${apiData.distance.toFixed(1)} km` : 'N/A'
          },
          price: apiData.finalAmount || apiData.price || 0,
          timeSlot: {
            date: apiData.scheduledDate ? new Date(apiData.scheduledDate).toLocaleDateString() : 'Today',
            time: apiData.scheduledTime || apiData.timeSlot?.start ? `${apiData.timeSlot.start} - ${apiData.timeSlot.end}` : 'Flexible'
          },
          status: apiData.status,
          description: apiData.description || apiData.notes || 'No description provided'
        };

        setBooking(mappedBooking);
      } catch (error) {
        console.error('Error loading booking:', error);
        // Fallback or Error UI could be handled here
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
    window.addEventListener('vendorJobsUpdated', loadBooking);

    return () => {
      window.removeEventListener('vendorJobsUpdated', loadBooking);
    };
  }, [id]);

  // Available status options for vendor
  const getAvailableStatuses = (currentStatus, booking) => {
    // Check payment status
    const workerPaymentDone = booking?.workerPaymentStatus === 'PAID';
    const finalSettlementDone = booking?.finalSettlementStatus === 'DONE';

    const statusFlow = {
      'ACCEPTED': ['ASSIGNED', 'VISITED'],
      'ASSIGNED': ['VISITED'],
      'VISITED': ['WORK_DONE'],
      'WORK_DONE': workerPaymentDone
        ? (finalSettlementDone ? ['COMPLETED'] : ['FINAL_SETTLEMENT', 'COMPLETED'])
        : [],
      'FINAL_SETTLEMENT': ['COMPLETED'],
      'COMPLETED': [],
    };
    return statusFlow[currentStatus] || [];
  };

  const canPayWorker = (booking) => {
    return booking?.status === 'WORK_DONE' && booking?.workerPaymentStatus !== 'PAID';
  };

  const canDoFinalSettlement = (booking) => {
    return booking?.status === 'WORK_DONE' &&
      booking?.workerPaymentStatus === 'PAID' &&
      booking?.finalSettlementStatus !== 'DONE';
  };

  const handleStatusChange = async (newStatus) => {
    if (!booking) return;

    const availableStatuses = getAvailableStatuses(booking.status, booking);
    if (!availableStatuses.includes(newStatus)) {
      alert(`Cannot change status from ${booking.status} to ${newStatus}. Please follow the proper flow.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to change status to ${newStatus.replace('_', ' ')}?`)) {
      return;
    }

    setLoading(true);
    try {
      await updateBookingStatus(id, newStatus);
      window.dispatchEvent(new Event('vendorJobsUpdated'));
      alert(`Status updated to ${newStatus.replace('_', ' ')} successfully!`);
      // Reload to get fresh data
      window.location.reload();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayWorker = async () => {
    if (!booking) return;

    if (!window.confirm(`Pay ₹${booking.price} to worker ${booking.assignedTo?.name || 'Worker'}?`)) {
      return;
    }

    setLoading(true);
    try {
      await updateBookingStatus(id, booking.status, {
        workerPaymentStatus: 'PAID',
        workerPaidBy: 'VENDOR'
      });
      window.dispatchEvent(new Event('vendorJobsUpdated'));
      alert('Worker payment completed successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSettlement = async () => {
    if (!booking) return;

    if (!window.confirm('Mark final settlement as done? This will allow you to complete the booking.')) {
      return;
    }

    setLoading(true);
    try {
      await updateBookingStatus(id, booking.status, {
        finalSettlementStatus: 'DONE'
      });
      window.dispatchEvent(new Event('vendorJobsUpdated'));
      alert('Final settlement marked as done!');
      window.location.reload();
    } catch (error) {
      console.error('Error updating settlement:', error);
      alert('Failed to update settlement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: themeColors.backgroundGradient }}>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const handleCallUser = () => {
    const phone = booking.user?.phone || booking.customerPhone;
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      alert('Phone number not available');
    }
  };

  const handleViewTimeline = () => {
    navigate(`/vendor/booking/${booking.id}/timeline`);
  };

  const handleAssignWorker = () => {
    navigate(`/vendor/booking/${booking.id}/assign-worker`);
  };

  const handleStartJourney = () => {
    let destination = '';
    if (booking.location.lat && booking.location.lng && booking.location.lat !== 0) {
      destination = `${booking.location.lat},${booking.location.lng}`;
    } else {
      destination = encodeURIComponent(booking.location.address);
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Booking Details" />

      <main className="px-4 py-6">
        {/* Service Type Card */}
        <div
          className="bg-white rounded-xl p-4 mb-4 shadow-md"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Service Type</p>
              <p className="text-xl font-bold" style={{ color: themeColors.button }}>
                {booking.serviceType}
              </p>
            </div>
            <div
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                background: `${themeColors.button}15`,
                color: themeColors.button,
              }}
            >
              {booking.status}
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div
          className="bg-white rounded-xl p-4 mb-4 shadow-md"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${themeColors.icon}15` }}
              >
                <FiUser className="w-6 h-6" style={{ color: themeColors.icon }} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{booking.user?.name || booking.customerName || 'Customer'}</p>
                <p className="text-sm text-gray-600">{booking.user?.phone || booking.customerPhone || 'Phone hidden'}</p>
              </div>
            </div>
            <button
              onClick={handleCallUser}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              style={{ backgroundColor: `${themeColors.button}15` }}
            >
              <FiPhone className="w-5 h-5" style={{ color: themeColors.button }} />
            </button>
          </div>
        </div>

        {/* Address Card with Map */}
        <div
          className="bg-white rounded-xl p-4 mb-4 shadow-md"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex items-start gap-3 mb-3">
            <FiMapPin className="w-5 h-5 mt-0.5" style={{ color: themeColors.icon }} />
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Address</p>
              <p className="font-semibold text-gray-800">{booking.location.address}</p>
              <p className="text-sm text-gray-500 mt-1">{booking.location.distance} away</p>
            </div>
          </div>

          {/* Map Embed */}
          <div className="w-full h-48 rounded-lg overflow-hidden mb-3 bg-gray-200 relative group cursor-pointer" onClick={() => navigate(`/vendor/booking/${booking.id}/map`)}>
            {(() => {
              const hasCoordinates = booking.location.lat && booking.location.lng && booking.location.lat !== 0 && booking.location.lng !== 0;
              const mapQuery = hasCoordinates
                ? `${booking.location.lat},${booking.location.lng}`
                : encodeURIComponent(booking.location.address);

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
                  ></iframe>
                  {/* Overlay to intercept clicks */}
                  <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors flex items-center justify-center">
                    <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      View Full Map
                    </span>
                  </div>
                </>
              );
            })()}
          </div>

          <button
            onClick={() => navigate(`/vendor/booking/${booking.id}/map`)}
            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{
              background: themeColors.button,
              boxShadow: `0 4px 12px ${themeColors.button}40`,
            }}
          >
            <FiNavigation className="w-5 h-5" />
            Start Journey
          </button>
        </div>

        {/* Service Description */}
        {booking.description && (
          <div
            className="bg-white rounded-xl p-4 mb-4 shadow-md"
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <p className="text-sm text-gray-600 mb-2">Service Description</p>
            <p className="text-gray-800">{booking.description}</p>
          </div>
        )}

        {/* Time Slot */}
        <div
          className="bg-white rounded-xl p-4 mb-4 shadow-md"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex items-center gap-3">
            <FiClock className="w-5 h-5" style={{ color: themeColors.icon }} />
            <div>
              <p className="text-sm text-gray-600">Preferred Time</p>
              <p className="font-semibold text-gray-800">{booking.timeSlot.date}</p>
              <p className="text-sm text-gray-600">{booking.timeSlot.time}</p>
            </div>
          </div>
        </div>

        {/* Price */}
        <div
          className="bg-white rounded-xl p-4 mb-4 shadow-md"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiDollarSign className="w-5 h-5" style={{ color: themeColors.icon }} />
              <div>
                <p className="text-sm text-gray-600">Estimated Price</p>
                <p className="text-2xl font-bold" style={{ color: themeColors.button }}>
                  ₹{booking.price}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Worker Assignment Status */}
        {booking.assignedTo && booking.assignedTo !== 'SELF' && (
          <div
            className="bg-white rounded-xl p-4 mb-4 shadow-md"
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <p className="text-sm font-semibold text-gray-700 mb-2">Worker Assignment</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{booking.assignedTo.name}</p>
                {booking.workerResponse ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${booking.workerResponse === 'ACCEPTED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {booking.workerResponse === 'ACCEPTED' ? '✓ Accepted' : '✗ Rejected'}
                    </span>
                    {booking.workerResponseAt && (
                      <span className="text-xs text-gray-500">
                        {new Date(booking.workerResponseAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-yellow-600 mt-1">⏳ Waiting for worker response...</p>
                )}
              </div>
              {booking.workerResponse === 'REJECTED' && (
                <button
                  onClick={handleAssignWorker}
                  className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-all active:scale-95"
                  style={{
                    background: themeColors.button,
                    boxShadow: `0 2px 8px ${themeColors.button}40`,
                  }}
                >
                  Reassign
                </button>
              )}
            </div>
          </div>
        )}

        {/* Worker Payment Button */}
        {canPayWorker(booking) && (
          <div
            className="bg-white rounded-xl p-4 mb-4 shadow-md border-2"
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              borderColor: '#10B981',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <FiDollarSign className="w-5 h-5" style={{ color: '#10B981' }} />
              <p className="text-sm font-semibold text-gray-700">Worker Payment</p>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Pay ₹{booking.price} to {booking.assignedTo?.name || 'Worker'}
            </p>
            <button
              onClick={handlePayWorker}
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: '#10B981',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
              }}
            >
              <FiDollarSign className="w-5 h-5" />
              Pay Worker
            </button>
          </div>
        )}

        {/* Final Settlement Button */}
        {canDoFinalSettlement(booking) && (
          <div
            className="bg-white rounded-xl p-4 mb-4 shadow-md border-2"
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              borderColor: '#8B5CF6',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <FiCheckCircle className="w-5 h-5" style={{ color: '#8B5CF6' }} />
              <p className="text-sm font-semibold text-gray-700">Final Settlement</p>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Complete final settlement to mark booking as completed
            </p>
            <button
              onClick={handleFinalSettlement}
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: '#8B5CF6',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
              }}
            >
              <FiCheckCircle className="w-5 h-5" />
              Mark Final Settlement Done
            </button>
          </div>
        )}

        {/* Status Change Section */}
        {getAvailableStatuses(booking.status, booking).length > 0 && (
          <div
            className="bg-white rounded-xl p-4 mb-4 shadow-md"
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <FiEdit className="w-5 h-5" style={{ color: themeColors.button }} />
              <p className="text-sm font-semibold text-gray-700">Change Status</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {getAvailableStatuses(booking.status, booking).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.button} 0%, ${themeColors.icon} 100%)`,
                    color: '#FFFFFF',
                    boxShadow: `0 2px 8px ${themeColors.button}40`,
                  }}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Current Status: <span className="font-semibold">{booking.status}</span>
            </p>
            {booking.workerPaymentStatus === 'PAID' && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Worker Payment: Paid
              </p>
            )}
            {booking.finalSettlementStatus === 'DONE' && (
              <p className="text-xs text-purple-600 mt-1">
                ✓ Final Settlement: Done
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleViewTimeline}
            className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{
              background: themeColors.button,
              boxShadow: `0 4px 12px ${themeColors.button}40`,
            }}
          >
            View Timeline
            <FiArrowRight className="w-5 h-5" />
          </button>

          {(booking.status === 'ACCEPTED' || (booking.assignedTo && booking.workerResponse === 'REJECTED')) && (
            <button
              onClick={handleAssignWorker}
              className="w-full py-4 rounded-xl font-semibold border-2 transition-all active:scale-95"
              style={{
                borderColor: themeColors.button,
                color: themeColors.button,
                background: 'white',
              }}
            >
              {booking.workerResponse === 'REJECTED' ? 'Reassign Worker' : 'Assign Worker'}
            </button>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default BookingDetails;

