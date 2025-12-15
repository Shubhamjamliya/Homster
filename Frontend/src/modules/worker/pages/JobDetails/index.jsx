import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiMapPin, FiPhone, FiClock, FiUser, FiCheck, FiX, FiArrowRight, FiNavigation, FiTool, FiCheckCircle, FiDollarSign } from 'react-icons/fi';
import { workerTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
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
    const loadJob = () => {
      try {
        const assignedJobs = JSON.parse(localStorage.getItem('workerAssignedJobs') || '[]');
        const found = assignedJobs.find(j => j.id === id);
        setJob(found);
      } catch (error) {
        console.error('Error loading job:', error);
      }
    };

    loadJob();
    window.addEventListener('workerJobsUpdated', loadJob);
    window.addEventListener('storage', loadJob);

    return () => {
      window.removeEventListener('workerJobsUpdated', loadJob);
      window.removeEventListener('storage', loadJob);
    };
  }, [id]);

  const handleAccept = async () => {
    if (!job || job.workerStatus !== 'PENDING') return;

    setLoading(true);
    try {
      const assignedJobs = JSON.parse(localStorage.getItem('workerAssignedJobs') || '[]');
      const updated = assignedJobs.map(j =>
        j.id === id
          ? {
            ...j,
            workerStatus: 'ACCEPTED',
            acceptedAt: new Date().toISOString(),
          }
          : j
      );
      localStorage.setItem('workerAssignedJobs', JSON.stringify(updated));

      // Update vendor booking to show worker accepted
      const vendorBookings = JSON.parse(localStorage.getItem('vendorAcceptedBookings') || '[]');
      const updatedVendorBookings = vendorBookings.map(b =>
        b.id === id
          ? {
            ...b,
            workerResponse: 'ACCEPTED',
            workerResponseAt: new Date().toISOString(),
          }
          : b
      );
      localStorage.setItem('vendorAcceptedBookings', JSON.stringify(updatedVendorBookings));

      // Update worker stats
      const workerStats = JSON.parse(localStorage.getItem('workerStats') || '{}');
      const newStats = {
        ...workerStats,
        pendingJobs: Math.max(0, (workerStats.pendingJobs || 0) - 1),
        acceptedJobs: (workerStats.acceptedJobs || 0) + 1,
      };
      localStorage.setItem('workerStats', JSON.stringify(newStats));

      window.dispatchEvent(new Event('workerJobsUpdated'));
      window.dispatchEvent(new Event('vendorJobsUpdated'));

      setJob(updated.find(j => j.id === id));
      alert('Job accepted successfully!');
    } catch (error) {
      console.error('Error accepting job:', error);
      alert('Failed to accept job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!job || job.workerStatus !== 'PENDING') return;

    if (!window.confirm('Are you sure you want to reject this job?')) {
      return;
    }

    setLoading(true);
    try {
      const assignedJobs = JSON.parse(localStorage.getItem('workerAssignedJobs') || '[]');
      const updated = assignedJobs.map(j =>
        j.id === id
          ? {
            ...j,
            workerStatus: 'REJECTED',
            rejectedAt: new Date().toISOString(),
          }
          : j
      );
      localStorage.setItem('workerAssignedJobs', JSON.stringify(updated));

      // Update vendor booking to show worker rejected
      const vendorBookings = JSON.parse(localStorage.getItem('vendorAcceptedBookings') || '[]');
      const updatedVendorBookings = vendorBookings.map(b =>
        b.id === id
          ? {
            ...b,
            workerResponse: 'REJECTED',
            workerResponseAt: new Date().toISOString(),
            assignedTo: null, // Clear assignment so vendor can reassign
            status: 'ACCEPTED', // Revert to accepted status
          }
          : b
      );
      localStorage.setItem('vendorAcceptedBookings', JSON.stringify(updatedVendorBookings));

      // Check if auto-assignment is enabled
      const adminSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
      const autoAssignEnabled = adminSettings.workerAutoAssignment !== false; // Default to true

      if (autoAssignEnabled) {
        // Auto-assign to next available worker
        const savedWorkers = JSON.parse(localStorage.getItem('vendorWorkers') || '[]');
        const availableWorkers = savedWorkers.filter(w =>
          w.availability === 'ONLINE' &&
          !w.currentJob &&
          w.id !== job.workerId // Don't assign to the same worker who rejected
        );

        if (availableWorkers.length > 0) {
          const nextWorker = availableWorkers[0];
          const autoAssignedBookings = updatedVendorBookings.map(b =>
            b.id === id
              ? {
                ...b,
                status: 'ASSIGNED',
                assignedTo: { id: nextWorker.id, name: nextWorker.name },
                workerResponse: null,
                workerResponseAt: null,
              }
              : b
          );
          localStorage.setItem('vendorAcceptedBookings', JSON.stringify(autoAssignedBookings));

          // Create assignment for next worker
          const newAssignment = {
            id: id,
            serviceType: job.serviceType,
            location: job.location,
            price: job.price,
            user: job.user,
            vendorId: job.vendorId,
            vendorName: job.vendorName,
            workerId: nextWorker.id,
            workerStatus: 'PENDING',
            assignedAt: new Date().toISOString(),
            description: job.description,
            timeSlot: job.timeSlot,
          };
          const allAssignedJobs = JSON.parse(localStorage.getItem('workerAssignedJobs') || '[]');
          const existingIndex = allAssignedJobs.findIndex(j => j.id === id && j.workerId === nextWorker.id);
          if (existingIndex === -1) {
            allAssignedJobs.push(newAssignment);
            localStorage.setItem('workerAssignedJobs', JSON.stringify(allAssignedJobs));

            // Send notification to new worker (call/message - preserved functionality)
            // In real app, this would trigger SMS/call API
            console.log(`Sending notification to worker ${nextWorker.name} (${nextWorker.phone}) for job ${id}`);
          }
        }
      }

      // Update worker stats
      const workerStats = JSON.parse(localStorage.getItem('workerStats') || '{}');
      const newStats = {
        ...workerStats,
        pendingJobs: Math.max(0, (workerStats.pendingJobs || 0) - 1),
      };
      localStorage.setItem('workerStats', JSON.stringify(newStats));

      window.dispatchEvent(new Event('workerJobsUpdated'));
      window.dispatchEvent(new Event('vendorJobsUpdated'));

      setJob(updated.find(j => j.id === id));
      alert('Job rejected. Vendor will be notified.');
    } catch (error) {
      console.error('Error rejecting job:', error);
      alert('Failed to reject job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: themeColors.backgroundGradient }}>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const canAcceptReject = job.workerStatus === 'PENDING';
  
  // Status flow: ACCEPTED -> VISITED -> WORK_DONE -> (Request Payment) -> COMPLETED
  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'ACCEPTED': 'VISITED',
      'VISITED': 'WORK_DONE',
      'WORK_DONE': 'COMPLETED',
    };
    return statusFlow[currentStatus];
  };

  const canChangeStatus = () => {
    return ['ACCEPTED', 'VISITED'].includes(job.workerStatus);
  };

  const canRequestPayment = () => {
    return job.workerStatus === 'WORK_DONE' && job.paymentStatus !== 'PAID' && !job.paymentRequested;
  };

  const canComplete = () => {
    return job.workerStatus === 'WORK_DONE' && job.paymentStatus === 'PAID';
  };

  const handleStatusChange = async (newStatus) => {
    if (!canChangeStatus()) return;

    // Validation
    if (newStatus === 'VISITED' && job.workerStatus !== 'ACCEPTED') {
      alert('Please accept the job first before marking as visited.');
      return;
    }
    if (newStatus === 'WORK_DONE' && job.workerStatus !== 'VISITED') {
      alert('Please mark as visited first before marking work as done.');
      return;
    }

    if (!window.confirm(`Are you sure you want to change status to ${newStatus.replace('_', ' ')}?`)) {
      return;
    }

    setLoading(true);
    try {
      const assignedJobs = JSON.parse(localStorage.getItem('workerAssignedJobs') || '[]');
      const updated = assignedJobs.map(j =>
        j.id === id
          ? {
              ...j,
              workerStatus: newStatus,
              [`${newStatus.toLowerCase()}At`]: new Date().toISOString(),
            }
          : j
      );
      localStorage.setItem('workerAssignedJobs', JSON.stringify(updated));

      // Update vendor booking status
      const vendorBookings = JSON.parse(localStorage.getItem('vendorAcceptedBookings') || '[]');
      const updatedVendorBookings = vendorBookings.map(b =>
        b.id === id || b.bookingId === id
          ? {
              ...b,
              status: newStatus,
              [`${newStatus.toLowerCase()}At`]: new Date().toISOString(),
            }
          : b
      );
      localStorage.setItem('vendorAcceptedBookings', JSON.stringify(updatedVendorBookings));

      window.dispatchEvent(new Event('workerJobsUpdated'));
      window.dispatchEvent(new Event('vendorJobsUpdated'));

      setJob(updated.find(j => j.id === id));
      alert(`Status updated to ${newStatus.replace('_', ' ')} successfully!`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayment = async () => {
    if (!canRequestPayment()) return;

    if (!window.confirm(`Request payment of ₹${job.price} from vendor?`)) {
      return;
    }

    setLoading(true);
    try {
      const assignedJobs = JSON.parse(localStorage.getItem('workerAssignedJobs') || '[]');
      const updated = assignedJobs.map(j =>
        j.id === id
          ? {
              ...j,
              paymentRequested: true,
              paymentRequestedAt: new Date().toISOString(),
            }
          : j
      );
      localStorage.setItem('workerAssignedJobs', JSON.stringify(updated));

      // Update vendor booking to show payment requested
      const vendorBookings = JSON.parse(localStorage.getItem('vendorAcceptedBookings') || '[]');
      const updatedVendorBookings = vendorBookings.map(b =>
        b.id === id || b.bookingId === id
          ? {
              ...b,
              paymentRequested: true,
              paymentRequestedAt: new Date().toISOString(),
              paymentRequestedBy: 'WORKER',
            }
          : b
      );
      localStorage.setItem('vendorAcceptedBookings', JSON.stringify(updatedVendorBookings));

      // Add notification to vendor
      const vendorNotifications = JSON.parse(localStorage.getItem('vendorNotifications') || '[]');
      vendorNotifications.unshift({
        id: `payment-request-${Date.now()}`,
        type: 'payment',
        message: `Payment requested by worker for ${job.serviceType}: ₹${job.price}`,
        read: false,
        timestamp: new Date().toISOString(),
        bookingId: id,
      });
      localStorage.setItem('vendorNotifications', JSON.stringify(vendorNotifications));
      window.dispatchEvent(new Event('vendorNotificationsUpdated'));

      window.dispatchEvent(new Event('workerJobsUpdated'));
      window.dispatchEvent(new Event('vendorJobsUpdated'));

      setJob(updated.find(j => j.id === id));
      alert('Payment request sent to vendor!');
    } catch (error) {
      console.error('Error requesting payment:', error);
      alert('Failed to request payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!canComplete()) return;

    if (!window.confirm('Mark this job as completed?')) {
      return;
    }

    setLoading(true);
    try {
      const assignedJobs = JSON.parse(localStorage.getItem('workerAssignedJobs') || '[]');
      const updated = assignedJobs.map(j =>
        j.id === id
          ? {
              ...j,
              workerStatus: 'COMPLETED',
              completedAt: new Date().toISOString(),
            }
          : j
      );
      localStorage.setItem('workerAssignedJobs', JSON.stringify(updated));

      // Update vendor booking status
      const vendorBookings = JSON.parse(localStorage.getItem('vendorAcceptedBookings') || '[]');
      const updatedVendorBookings = vendorBookings.map(b =>
        b.id === id || b.bookingId === id
          ? {
              ...b,
              status: 'COMPLETED',
              completedAt: new Date().toISOString(),
            }
          : b
      );
      localStorage.setItem('vendorAcceptedBookings', JSON.stringify(updatedVendorBookings));

      // Update worker stats
      const workerStats = JSON.parse(localStorage.getItem('workerStats') || '{}');
      const newStats = {
        ...workerStats,
        acceptedJobs: Math.max(0, (workerStats.acceptedJobs || 0) - 1),
        completedJobs: (workerStats.completedJobs || 0) + 1,
      };
      localStorage.setItem('workerStats', JSON.stringify(newStats));

      window.dispatchEvent(new Event('workerJobsUpdated'));
      window.dispatchEvent(new Event('vendorJobsUpdated'));

      setJob(updated.find(j => j.id === id));
      alert('Job completed successfully!');
    } catch (error) {
      console.error('Error completing job:', error);
      alert('Failed to complete job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Job Details" />

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
                {job.serviceType}
              </p>
            </div>
            <div
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                background: `${themeColors.button}15`,
                color: themeColors.button,
              }}
            >
              {job.workerStatus}
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
                <p className="font-semibold text-gray-800">{job.user?.name || 'Customer Name'}</p>
                <p className="text-sm text-gray-600">{job.user?.phone}</p>
              </div>
            </div>
            {job.user?.phone && (
              <a
                href={`tel:${job.user.phone}`}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                style={{ backgroundColor: `${themeColors.button}15` }}
              >
                <FiPhone className="w-5 h-5" style={{ color: themeColors.button }} />
              </a>
            )}
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
              <p className="font-semibold text-gray-800">{job.location?.address || 'Address not available'}</p>
              {job.location?.distance && (
                <p className="text-sm text-gray-500 mt-1">{job.location.distance} away</p>
              )}
            </div>
          </div>

          {/* Map Embed - Only if lat/lng available */}
          {job.location?.lat && job.location?.lng ? (
            <div className="w-full h-48 rounded-lg overflow-hidden mb-3 bg-gray-200">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6d_s6L4c0ZO0xU0&q=${job.location.lat},${job.location.lng}`}
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="w-full h-24 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 mb-3">
              Map not available
            </div>
          )}

          {job.location?.lat && job.location?.lng && (
            <button
              onClick={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${job.location.lat},${job.location.lng}`;
                window.open(url, '_blank');
              }}
              className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{
                background: themeColors.button,
                boxShadow: `0 4px 12px ${themeColors.button}40`,
              }}
            >
              <FiMapPin className="w-5 h-5" />
              Start Journey
            </button>
          )}
        </div>

        {/* Service Description */}
        {job.description && (
          <div
            className="bg-white rounded-xl p-4 mb-4 shadow-md"
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <p className="text-sm text-gray-600 mb-2">Service Description</p>
            <p className="text-gray-800">{job.description}</p>
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
              <p className="font-semibold text-gray-800">{job.timeSlot?.date || 'Today'}</p>
              <p className="text-sm text-gray-600">{job.timeSlot?.time || 'Unspecified'}</p>
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
              <FiCheck className="w-5 h-5" style={{ color: themeColors.icon }} />
              {/* Using Check icon as proxy for money/price icon if needed or stick to dollar/check */}
              <div>
                <p className="text-sm text-gray-600">Earnings</p>
                <p className="text-2xl font-bold" style={{ color: themeColors.button }}>
                  ₹{job.price}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Button */}
        {job.workerStatus !== 'PENDING' && (
          <button
            onClick={() => alert("Timeline feature coming soon!")} // Placeholder for now
            className="w-full py-4 mb-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{
              background: themeColors.button,
              boxShadow: `0 4px 12px ${themeColors.button}40`,
            }}
          >
            View Timeline
            <FiArrowRight className="w-5 h-5" />
          </button>
        )}

        {/* Action Buttons */}
        {canAcceptReject && (
          <div className="space-y-3">
            <button
              onClick={handleAccept}
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: themeColors.icon,
                boxShadow: `0 4px 12px ${themeColors.icon}40`,
              }}
            >
              <FiCheck className="w-5 h-5" />
              Accept Job
            </button>

            <button
              onClick={handleReject}
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: '#EF4444',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
              }}
            >
              <FiX className="w-5 h-5" />
              Reject Job
            </button>
          </div>
        )}

        {/* Status Change Buttons */}
        {canChangeStatus() && (
          <div className="space-y-3 mb-4">
            {job.workerStatus === 'ACCEPTED' && (
              <button
                onClick={() => handleStatusChange('VISITED')}
                disabled={loading}
                className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: '#3B82F6',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                }}
              >
                <FiNavigation className="w-5 h-5" />
                Mark as Visited
              </button>
            )}

            {job.workerStatus === 'VISITED' && (
              <button
                onClick={() => handleStatusChange('WORK_DONE')}
                disabled={loading}
                className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: '#10B981',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                }}
              >
                <FiTool className="w-5 h-5" />
                Mark Work as Done
              </button>
            )}
          </div>
        )}

        {/* Request Payment Button */}
        {canRequestPayment() && (
          <div
            className="bg-white rounded-xl p-4 mb-4 shadow-md border-2"
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              borderColor: '#F59E0B',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <FiDollarSign className="w-5 h-5" style={{ color: '#F59E0B' }} />
              <p className="text-sm font-semibold text-gray-700">Request Payment</p>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Request payment of ₹{job.price} from vendor
            </p>
            <button
              onClick={handleRequestPayment}
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: '#F59E0B',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
              }}
            >
              <FiDollarSign className="w-5 h-5" />
              Request Payment
            </button>
          </div>
        )}

        {/* Complete Job Button (after payment received) */}
        {canComplete() && (
          <button
            onClick={handleComplete}
            disabled={loading}
            className="w-full py-4 mb-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: themeColors.icon,
              boxShadow: `0 4px 12px ${themeColors.icon}40`,
            }}
          >
            <FiCheckCircle className="w-5 h-5" />
            Complete Job
          </button>
        )}

        {/* Status Messages */}
        {job.workerStatus === 'ACCEPTED' && !canChangeStatus() && (
          <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200 mb-4">
            <p className="text-sm font-semibold text-green-800 text-center">
              ✓ Job Accepted! You can now proceed with the work.
            </p>
          </div>
        )}

        {job.workerStatus === 'VISITED' && (
          <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200 mb-4">
            <p className="text-sm font-semibold text-blue-800 text-center">
              ✓ Site Visited! You can now mark work as done.
            </p>
          </div>
        )}

        {job.workerStatus === 'WORK_DONE' && job.paymentStatus !== 'PAID' && (
          <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200 mb-4">
            <p className="text-sm font-semibold text-yellow-800 text-center">
              ✓ Work Done! Please request payment from vendor.
            </p>
          </div>
        )}

        {job.workerStatus === 'WORK_DONE' && job.paymentStatus === 'PAID' && (
          <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200 mb-4">
            <p className="text-sm font-semibold text-green-800 text-center">
              ✓ Payment Received! You can now complete the job.
            </p>
          </div>
        )}

        {job.paymentRequested && job.paymentStatus !== 'PAID' && (
          <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200 mb-4">
            <p className="text-sm font-semibold text-blue-800 text-center">
              ⏳ Payment request sent to vendor. Waiting for payment...
            </p>
          </div>
        )}

        {job.workerStatus === 'COMPLETED' && (
          <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200 mb-4">
            <p className="text-sm font-semibold text-purple-800 text-center">
              ✓ Job Completed! Thank you for your service.
            </p>
          </div>
        )}

        {job.workerStatus === 'REJECTED' && (
          <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200 mb-4">
            <p className="text-sm font-semibold text-red-800 text-center">
              Job Rejected. Vendor has been notified.
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default JobDetails;

