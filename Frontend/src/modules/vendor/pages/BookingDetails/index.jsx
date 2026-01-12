import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiMapPin, FiClock, FiDollarSign, FiUser, FiPhone, FiNavigation, FiArrowRight, FiEdit, FiCheckCircle, FiCreditCard, FiX, FiCheck, FiTool, FiXCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { vendorTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import {
  getBookingById,
  updateBookingStatus,
  assignWorker as assignWorkerApi,
  startSelfJob,
  verifySelfVisit,
  completeSelfJob
} from '../../services/bookingService';
import { CashCollectionModal, ConfirmDialog } from '../../components/common';
import vendorWalletService from '../../../../services/vendorWalletService';
import { toast } from 'react-hot-toast';
import { useAppNotifications } from '../../../../hooks/useAppNotifications';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [cashOTP, setCashOTP] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [cashSubmitting, setCashSubmitting] = useState(false);
  const [isPayWorkerModalOpen, setIsPayWorkerModalOpen] = useState(false);
  const [payWorkerAmount, setPayWorkerAmount] = useState('');
  const [payWorkerNotes, setPayWorkerNotes] = useState('');
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isWorkDoneModalOpen, setIsWorkDoneModalOpen] = useState(false);
  const [otpInput, setOtpInput] = useState(['', '', '', '']);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    type: 'warning'
  });

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
          items: apiData.bookedItems || [],
          location: {
            address: (() => {
              const a = apiData.address;
              if (!a) return 'Address not available';
              if (typeof a === 'string') return a;
              return `${a.addressLine2 ? a.addressLine2 + ', ' : ''}${a.addressLine1 || ''}, ${a.city || ''}`;
            })(),
            lat: apiData.address?.lat || 0,
            lng: apiData.address?.lng || 0,
            distance: apiData.distance ? `${apiData.distance.toFixed(1)} km` : 'N/A'
          },
          // Price Breakdown
          basePrice: parseFloat(apiData.basePrice || 0),
          tax: parseFloat(apiData.tax || 0),
          visitingCharges: parseFloat(apiData.visitingCharges || apiData.visitationFee || 0),
          discount: parseFloat(apiData.discount || 0),
          platformCommission: parseFloat(apiData.adminCommission || apiData.platformFee || apiData.commission || 0),
          finalAmount: parseFloat(apiData.finalAmount || 0),
          vendorEarnings: parseFloat(apiData.vendorEarnings || (apiData.finalAmount ? apiData.finalAmount - (apiData.commission || 0) : 0)),

          // Display Price (Vendor Earnings by default as requested)
          price: (apiData.vendorEarnings || (apiData.finalAmount ? apiData.finalAmount - (apiData.commission || 0) : 0)).toFixed(2),

          timeSlot: {
            date: apiData.scheduledDate ? new Date(apiData.scheduledDate).toLocaleDateString() : 'Today',
            time: apiData.scheduledTime || apiData.timeSlot?.start ? `${apiData.timeSlot.start} - ${apiData.timeSlot.end}` : 'Flexible'
          },
          status: apiData.status,
          description: apiData.description || apiData.notes || 'No description provided',
          assignedTo: apiData.workerId ? { name: apiData.workerId.name } : (apiData.assignedAt ? { name: 'You (Self)' } : null),
          workerResponse: apiData.workerResponse,
          workerResponseAt: apiData.workerResponseAt,
          paymentMethod: apiData.paymentMethod,
          paymentStatus: apiData.paymentStatus,
          cashCollected: apiData.cashCollected || false
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

  // Handle modal closing if payment is detected
  useEffect(() => {
    if ((booking?.paymentStatus === 'SUCCESS' || booking?.paymentStatus === 'paid') && isCashModalOpen) {
      setIsCashModalOpen(false);
      toast.success('Online Payment Received!');
    }
    // ADDED: Socket for Live Location Tracking in Details Page
    const socket = useAppNotifications('vendor'); // Get socket

    // Track Vendor Location in Details Page too (for continuous user updates)
    useEffect(() => {
      if (socket && id && (booking?.status === 'journey_started' || booking?.status === 'visited')) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit('update_location', {
              bookingId: id,
              lat: latitude,
              lng: longitude
            });
          },
          (err) => console.log('Location watch error:', err),
          { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
      }
    }, [socket, id, booking?.status]);

    const handleVerifyVisit = async () => {
      const otp = otpInput.join('');
      if (otp.length !== 4) return toast.error('Enter 4-digit OTP');

      try {
        setActionLoading(true);
        if (!navigator.geolocation) {
          toast.error('Geolocation required for verification');
          return;
        }

        // Updated Geolocation Options for Mobile
        const options = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(async (position) => {
          try {
            const location = { lat: position.coords.latitude, lng: position.coords.longitude };
            await verifySelfVisit(id, otp, location);
            toast.success('Visit Verified');
            setIsVisitModalOpen(false);
            window.location.reload();
          } catch (err) {
            toast.error(err.response?.data?.message || 'Verification failed');
          } finally {
            setActionLoading(false);
          }
        }, (error) => {
          console.error("Geo Error:", error);
          // Fallback: Try low accuracy if high fails, or just error out with clear message
          if (error.code === error.TIMEOUT) {
            toast.error('Location timeout. Please ensure GPS is on and try again.');
          } else if (error.code === error.PERMISSION_DENIED) {
            toast.error('Location permission denied. Please enable it in browser settings.');
          } else {
            toast.error('Failed to get location. Ensure GPS is enabled.');
          }
          setActionLoading(false);
        }, options);
      } catch (error) {
        toast.error('Something went wrong');
        setActionLoading(false);
      }
    };
    const getAvailableStatuses = (currentStatus, booking) => {
      // Check payment status
      const workerPaymentDone = booking?.workerPaymentStatus === 'PAID';
      const finalSettlementDone = booking?.finalSettlementStatus === 'DONE';
      const isSelfJob = booking?.assignedTo?.name === 'You (Self)';

      const statusFlow = {
        'confirmed': ['assigned', 'visited', 'journey_started'],
        'assigned': ['visited', 'journey_started'],
        'journey_started': ['visited'],
        'visited': ['in_progress', 'work_done'],
        'in_progress': ['work_done'],
        'work_done': ['completed', 'final_settlement'],
        'final_settlement': ['completed'],
        'completed': [],
      };
      return statusFlow[currentStatus] || [];
    };

    const canPayWorker = (booking) => {
      // If assigned to self, no worker payment needed
      if (booking?.assignedTo?.name === 'You (Self)') return false;

      // Allow payment ONLY if booking is completed (Vendor Approved)
      const validStatus = booking?.status === 'completed';
      return validStatus && booking?.workerPaymentStatus !== 'PAID';
    };

    const canDoFinalSettlement = (booking) => {
      // Check if payment is already done (Online SUCCESS or Cash COLLECTED)
      const isPaid = booking?.paymentStatus === 'SUCCESS' || booking?.paymentStatus === 'paid' || booking?.cashCollected;
      const isWorkDone = booking?.status === 'work_done' || booking?.status === 'completed' || booking?.status === 'WORKER_PAID';

      // For self-jobs, final settlement can be done after work is done AND payment is done
      if (booking?.assignedTo?.name === 'You (Self)') {
        return isWorkDone && isPaid && booking?.finalSettlementStatus !== 'DONE';
      }

      // For worker jobs, requires work done, worker paid, and customer payment done
      return isWorkDone &&
        (booking?.workerPaymentStatus === 'PAID' || booking?.workerPaymentStatus === 'SUCCESS') &&
        isPaid &&
        booking?.finalSettlementStatus !== 'DONE';
    };

    const handleStatusChange = async (newStatus) => {
      if (!booking) return;

      const availableStatuses = getAvailableStatuses(booking.status, booking);
      if (!availableStatuses.includes(newStatus)) {
        toast.error(`Cannot change status from ${booking.status} to ${newStatus}. Please follow the proper flow.`);
        return;
      }

      setConfirmDialog({
        isOpen: true,
        title: 'Update Status',
        message: `Are you sure you want to change status to ${newStatus.replace('_', ' ')}?`,
        type: 'info',
        onConfirm: async () => {
          setLoading(true);
          try {
            await updateBookingStatus(id, newStatus);
            window.dispatchEvent(new Event('vendorJobsUpdated'));
            toast.success(`Status updated to ${newStatus.replace('_', ' ')} successfully!`);
            window.location.reload();
          } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status. Please try again.');
          } finally {
            setLoading(false);
          }
        }
      });
    };

    const handlePayWorkerClick = () => {
      setPayWorkerAmount('');
      setPayWorkerNotes('');
      setIsPayWorkerModalOpen(true);
    };

    const handlePayWorkerSubmit = async () => {
      if (!payWorkerAmount || isNaN(payWorkerAmount) || parseFloat(payWorkerAmount) <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      try {
        setPaySubmitting(true);
        const res = await vendorWalletService.payWorker(
          booking.id || booking._id,
          parseFloat(payWorkerAmount),
          payWorkerNotes
        );

        if (res.success) {
          toast.success(res.message || 'Payment recorded successfully');
          setIsPayWorkerModalOpen(false);
          // Refresh booking data
          window.location.reload();
        } else {
          toast.error(res.message || 'Failed to record payment');
        }
      } catch (error) {
        toast.error('Failed to process payment');
      } finally {
        setPaySubmitting(false);
      }
    };

    const handleFinalSettlement = async () => {
      if (!booking) return;

      setConfirmDialog({
        isOpen: true,
        title: 'Final Settlement',
        message: 'Mark final settlement as done? This will allow you to complete the booking.',
        type: 'warning',
        onConfirm: async () => {
          setLoading(true);
          try {
            await updateBookingStatus(id, booking.status, {
              finalSettlementStatus: 'DONE'
            });
            window.dispatchEvent(new Event('vendorJobsUpdated'));
            toast.success('Final settlement marked as done!');
            window.location.reload();
          } catch (error) {
            console.error('Error updating settlement:', error);
            toast.error('Failed to update settlement. Please try again.');
          } finally {
            setLoading(false);
          }
        }
      });
    };

    // Handle initiating cash collection (Send OTP) with new Unified Modal
    const handleInitiateCashCollection = async (totalAmount, extraItems = []) => {
      try {
        setCashSubmitting(true);
        const res = await vendorWalletService.initiateCashCollection(booking.id || booking._id, totalAmount, extraItems);
        if (res.success) {
          return res; // Modal handles success toast
        } else {
          throw new Error(res.message || 'Failed to send OTP');
        }
      } catch (error) {
        console.error('Initiate cash error:', error);
        throw error;
      } finally {
        setCashSubmitting(false);
      }
    };

    // Handle final confirmation of cash collection with new Unified Modal
    const handleConfirmCashCollection = async (totalAmount, extraItems, otp) => {
      try {
        setCashSubmitting(true);
        const res = await vendorWalletService.confirmCashCollection(
          booking.id || booking._id,
          totalAmount,
          otp,
          extraItems
        );

        if (res.success) {
          toast.success('Cash collection recorded successfully!');
          window.dispatchEvent(new Event('vendorJobsUpdated'));
          // Reload or update state
          window.location.reload();
        } else {
          throw new Error(res.message || 'Failed to confirm');
        }
      } catch (error) {
        console.error('Confirm cash error:', error);
        throw error;
      } finally {
        setCashSubmitting(false);
      }
    };

    // Handle cash collection button click
    const handleCollectCashClick = () => {
      setIsCashModalOpen(true);
    };

    const canCollectCash = (booking) => {
      // Hide if already collected or paid online
      if (booking?.cashCollected || booking?.paymentStatus === 'SUCCESS' || booking?.paymentStatus === 'paid' || booking?.paymentStatus === 'collected_by_vendor') {
        return false;
      }

      // Cash can be collected when booking is completed/work_done and payment was cash/at home
      const isSelfJob = booking?.assignedTo?.name === 'You (Self)';
      const validStatus = isSelfJob
        ? (booking?.status === 'work_done' || booking?.status === 'completed')
        : booking?.status === 'completed';

      // IMPORTANT: Only for Cash/Pay at Home methods. If method is 'online' but status is pending, we still might wait.
      // However, if the user switches to cash, the method usually updates.
      // For now, assume simple logic.
      return validStatus &&
        (booking?.paymentMethod === 'cash' || booking?.paymentMethod === 'pay_at_home');
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

    const handleAssignToSelf = async () => {
      setConfirmDialog({
        isOpen: true,
        title: 'Assign to Self',
        message: 'Are you sure you want to do this job yourself?',
        type: 'info',
        onConfirm: async () => {
          setLoading(true);
          try {
            const response = await assignWorkerApi(id, 'SELF');
            if (response && response.success) {
              toast.success('Assigned to yourself successfully');
              window.dispatchEvent(new Event('vendorJobsUpdated'));
              window.location.reload();
            } else {
              throw new Error(response?.message || 'Failed to assign');
            }
          } catch (error) {
            console.error('Error assigning to self:', error);
            toast.error(error.message || 'Failed to assign to yourself');
          } finally {
            setLoading(false);
          }
        }
      });
    };

    const handleStartJourney = async () => {
      // If self-job, call the start API first
      if (booking.assignedTo?.name === 'You (Self)') {
        try {
          setLoading(true);
          await startSelfJob(id);
          toast.success('Journey Started');
          // Refresh to update status
          const response = await getBookingById(id);
          const apiData = response.data || response;
          setBooking(prev => ({ ...prev, status: apiData.status }));
        } catch (error) {
          console.error('Error starting self journey:', error);
          toast.error('Failed to start journey');
          return;
        } finally {
          setLoading(false);
        }
      }

      navigate(`/vendor/booking/${booking.id || id}/map`);
    };

    const handleOtpChange = (index, value) => {
      if (value.length > 1) return;
      const newOtp = [...otpInput];
      newOtp[index] = value;
      setOtpInput(newOtp);
      if (value && index < 3) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    };



    const handleCompleteWork = async () => {
      try {
        setActionLoading(true);
        await completeSelfJob(id, { workPhotos: ['https://placehold.co/600x400'] });
        toast.success('Work marked done');
        setIsWorkDoneModalOpen(false);
        window.location.reload();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to complete job');
      } finally {
        setActionLoading(false);
      }
    };

    const handleApproveWork = () => {
      setConfirmDialog({
        isOpen: true,
        title: 'Approve Work',
        message: 'Approve the work done by the worker? This will mark the job as completed and enable payout.',
        type: 'success',
        onConfirm: async () => {
          setLoading(true);
          try {
            await updateBookingStatus(id, 'completed');
            window.dispatchEvent(new Event('vendorJobsUpdated'));
            toast.success('Work Approved! You can now pay the worker.');
            window.location.reload();
          } catch (error) {
            console.error('Error approving work:', error);
            toast.error('Failed to approve work');
          } finally {
            setLoading(false);
          }
        }
      });
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
              <div className="flex flex-col items-end gap-1">
                <div
                  className="px-3 py-1 rounded-full text-sm font-semibold"
                  style={{
                    background: `${themeColors.button}15`,
                    color: themeColors.button,
                  }}
                >
                  {booking.status}
                </div>
                {booking.assignedTo?.name === 'You (Self)' && (
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100 uppercase tracking-wider">
                    Personal Job
                  </span>
                )}
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

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => navigate(`/vendor/booking/${booking.id || id}/map`)}
                className="flex-1 py-3.5 rounded-xl font-bold border-2 flex items-center justify-center gap-2 transition-all active:scale-95 bg-white"
                style={{
                  borderColor: themeColors.button,
                  color: themeColors.button,
                }}
              >
                <FiMapPin className="w-5 h-5" />
                View Map
              </button>
              <button
                onClick={() => {
                  const hasCoords = booking.location.lat && booking.location.lng;
                  const dest = hasCoords
                    ? `${booking.location.lat},${booking.location.lng}`
                    : encodeURIComponent(booking.location.address);
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
                }}
                className="flex-1 py-3.5 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-200"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                }}
              >
                <FiNavigation className="w-5 h-5 animate-pulse" />
                Navigate
              </button>
            </div>
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

          {/* Booked Items Details */}
          {booking.items && booking.items.length > 0 && (
            <div
              className="bg-white rounded-xl p-4 mb-4 shadow-md"
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <p className="text-sm font-semibold text-gray-700 mb-3">Booked Services</p>
              <div className="space-y-3">
                {booking.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-gray-800">{item.card?.title || 'Service Item'}</p>
                      <p className="text-xs text-gray-500">{item.sectionTitle || 'General'}</p>
                      {item.card?.features && item.card.features.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">• {item.card.features.join(', ')}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        ₹{item.card?.price || 0} <span className="text-xs text-gray-500 font-normal">x {item.quantity}</span>
                      </p>
                      <p className="text-xs font-bold text-gray-900 mt-1">₹{((item.card?.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                <p className="font-semibold text-gray-700">Total Price</p>
                <p className="font-bold text-lg" style={{ color: themeColors.button }}>₹{booking.price}</p>
              </div>
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

          {/* Payment Details */}
          <div
            className="bg-white rounded-xl p-4 mb-4 shadow-md"
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <FiDollarSign className="w-5 h-5" style={{ color: themeColors.icon }} />
              <h3 className="font-bold text-gray-800">Payment Summary</h3>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Base Price</span>
                <span>₹{(booking.basePrice || 0).toFixed(2)}</span>
              </div>
              {(booking.tax > 0) && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>+₹{(booking.tax || 0).toFixed(2)}</span>
                </div>
              )}
              {(booking.visitingCharges > 0) && (
                <div className="flex justify-between text-gray-600">
                  <span>Convenience Fee</span>
                  <span>+₹{(booking.visitingCharges || 0).toFixed(2)}</span>
                </div>
              )}
              {(booking.discount > 0) && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount</span>
                  <span>-₹{(booking.discount || 0).toFixed(2)}</span>
                </div>
              )}

              <div className="my-2 border-t border-gray-200"></div>

              <div className="flex justify-between font-bold text-gray-900">
                <span>Total Amount (User Pays)</span>
                <span>₹{(booking.finalAmount || 0).toFixed(2)}</span>
              </div>

              <div className="my-2 border-t border-dashed border-gray-200"></div>

              <div className="flex justify-between text-gray-500 text-xs">
                <span>Platform Commission</span>
                <span>-₹{(booking.platformCommission || 0).toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center mt-2 bg-green-50 p-2 rounded-lg">
                <span className="font-bold text-gray-700">Your Net Earnings</span>
                <span className="font-bold text-xl" style={{ color: themeColors.button }}>
                  ₹{(booking.vendorEarnings || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Work Photos (after completion) */}
          {booking.workPhotos && booking.workPhotos.length > 0 && booking.assignedTo?.name !== 'You (Self)' && (
            <div className="bg-white rounded-xl p-4 mb-4 shadow-md border-t-4 border-green-500">
              <p className="text-sm font-semibold text-gray-700 mb-3">Work Evidence (Photos)</p>
              <div className="grid grid-cols-2 gap-2">
                {booking.workPhotos.map((photo, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100 border relative group">
                    <img
                      src={photo.replace('/api/upload', 'http://localhost:5000/upload')}
                      alt={`Work evidence ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => window.open(photo.replace('/api/upload', 'http://localhost:5000/upload'), '_blank')}
                        className="bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-bold"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Approval/Reject Buttons */}
              {booking.status === 'work_done' && booking.workerPaymentStatus !== 'PAID' && booking.assignedTo?.name !== 'You (Self)' && (
                <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setConfirmDialog({
                        isOpen: true,
                        title: 'Reject Work',
                        message: 'Reject work? This will notify the worker to fix issues.',
                        type: 'warning',
                        onConfirm: () => {
                          toast.error('Work Marked as Rejected');
                          // Add actual reject logic here if available
                        }
                      });
                    }}
                    className="flex-1 py-3 bg-white text-red-600 rounded-xl font-bold text-sm active:scale-95 transition-transform border border-red-200 shadow-sm"
                  >
                    <FiX className="inline w-4 h-4 mr-1" /> Reject Work
                  </button>
                  <button
                    onClick={handleApproveWork}
                    className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold text-sm shadow-md shadow-green-200 active:scale-95 transition-transform"
                  >
                    <FiCheckCircle className="inline w-4 h-4 mr-1" /> Approve Work
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Worker & Job Status Card (Enhanced) */}
          {booking.assignedTo && booking.assignedTo?.name !== 'You (Self)' && (
            <div className="bg-white rounded-2xl p-5 mb-5 shadow-lg border border-gray-100">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                    <FiUser className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{booking.assignedTo.name}</h3>
                    <p className="text-xs text-gray-500 font-medium">Service Partner</p>
                  </div>
                </div>

                {/* Call Button */}
                {booking.assignedTo?.phone && (
                  <a href={`tel:${booking.assignedTo.phone}`} className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors">
                    <FiPhone className="w-5 h-5" />
                  </a>
                )}
              </div>

              {/* Status Section */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Status</span>
                  {booking.workerAcceptedAt && <span className="text-[10px] text-gray-400 font-medium">{new Date(booking.workerAcceptedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                </div>

                {/* Status Display */}
                {!booking.workerResponse || booking.workerResponse === 'PENDING' ? (
                  <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                    <FiClock className="w-5 h-5 animate-pulse" />
                    <div className="flex-1">
                      <p className="font-bold text-sm">Awaiting Acceptance</p>
                      <p className="text-[10px] opacity-80">Worker has not responded yet</p>
                    </div>
                  </div>
                ) : booking.workerResponse === 'ACCEPTED' ? (
                  <div className="space-y-4">
                    {/* Progress Steps Visual */}
                    <div className="relative flex justify-between items-center px-2">
                      {/* Track Line */}
                      <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -z-10"></div>

                      {/* Accepted Step */}
                      <div className={`flex flex-col items-center gap-1 bg-gray-50 px-1`}>
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs shadow-sm ring-2 ring-white">
                          <FiCheck className="w-3 h-3" />
                        </div>
                        <span className="text-[9px] font-bold text-green-700">Accepted</span>
                      </div>

                      {/* Started Step */}
                      <div className={`flex flex-col items-center gap-1 bg-gray-50 px-1`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm ring-2 ring-white ${['journey_started', 'visited', 'in_progress', 'work_done', 'completed'].includes(booking.status) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                          <FiNavigation className="w-3 h-3" />
                        </div>
                        <span className={`text-[9px] font-bold ${['journey_started', 'visited', 'in_progress', 'work_done', 'completed'].includes(booking.status) ? 'text-blue-700' : 'text-gray-400'}`}>On Way</span>
                      </div>

                      {/* Working Step */}
                      <div className={`flex flex-col items-center gap-1 bg-gray-50 px-1`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm ring-2 ring-white ${['visited', 'in_progress', 'work_done', 'completed'].includes(booking.status) ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                          <FiTool className="w-3 h-3" />
                        </div>
                        <span className={`text-[9px] font-bold ${['visited', 'in_progress', 'work_done', 'completed'].includes(booking.status) ? 'text-orange-700' : 'text-gray-400'}`}>Working</span>
                      </div>

                      {/* Done Step */}
                      <div className={`flex flex-col items-center gap-1 bg-gray-50 px-1`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm ring-2 ring-white ${['work_done', 'completed'].includes(booking.status) ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                          <FiCheckCircle className="w-3 h-3" />
                        </div>
                        <span className={`text-[9px] font-bold ${['work_done', 'completed'].includes(booking.status) ? 'text-green-700' : 'text-gray-400'}`}>Done</span>
                      </div>
                    </div>

                    {/* Clear Text Status */}
                    <div className="bg-white rounded-lg p-3 border border-gray-100 flex items-center gap-3 shadow-sm">
                      <div className={`p-2 rounded-lg ${booking.status === 'journey_started' ? 'bg-blue-100 text-blue-600' :
                        booking.status === 'in_progress' ? 'bg-orange-100 text-orange-600' :
                          ['work_done', 'completed'].includes(booking.status) ? 'bg-green-100 text-green-600' :
                            'bg-gray-100 text-gray-600'
                        }`}>
                        {booking.status === 'journey_started' ? <FiNavigation className="w-5 h-5" /> :
                          booking.status === 'in_progress' ? <FiTool className="w-5 h-5 animate-pulse" /> :
                            ['work_done', 'completed'].includes(booking.status) ? <FiCheckCircle className="w-5 h-5" /> :
                              <FiCheck className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-800">
                          {booking.status === 'journey_started' ? 'Marked: On the Way' :
                            booking.status === 'visited' ? 'Worker Reached' :
                              booking.status === 'in_progress' ? 'Marked: In Progress' :
                                ['work_done', 'completed'].includes(booking.status) ? 'Marked: Work Done' :
                                  'Worker Accepted Job'}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {booking.status === 'journey_started' ? 'Worker is traveling to site' :
                            booking.status === 'visited' ? 'Waiting for start otp verification' :
                              booking.status === 'in_progress' ? 'Service is being performed' :
                                ['work_done', 'completed'].includes(booking.status) ? 'Worker waiting for payment' :
                                  'Worker will start journey soon'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                    <FiXCircle className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="font-bold text-sm">Request Declined</p>
                      <p className="text-[10px] opacity-80">Worker is unavailable.</p>
                    </div>
                    <button onClick={handleAssignWorker} className="px-3 py-1 bg-white border border-red-200 rounded shadow-sm text-xs font-bold text-red-600 hover:bg-red-50">
                      Reassign
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Collection Section (New Improved UI) */}
          {canCollectCash(booking) && (
            <div
              className="bg-white rounded-2xl mb-4 overflow-hidden shadow-lg border-none relative group"
              style={{
                boxShadow: '0 10px 30px -5px rgba(249, 115, 22, 0.2)',
              }}
            >
              {/* Top Accent Gradient */}
              <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-600" />

              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-inner">
                    <FiCreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">Collect Payment</h3>
                    <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Step 1: Finish Settlement</p>
                  </div>
                </div>

                <div className="bg-orange-50/50 rounded-2xl p-4 mb-6 border border-orange-100/50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Amount to Collect</span>
                    <span className="text-2xl font-black text-orange-600">
                      ₹{(booking.finalAmount || parseFloat(booking.price) || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-3 flex items-start gap-2 text-[11px] text-orange-700/80 leading-relaxed">
                    <FiClock className="w-3 h-3 mt-0.5" />
                    <span>Customer chose {booking.paymentMethod?.replace('_', ' ') || 'Cash'} payment. Please verify collection to proceed.</span>
                  </div>
                </div>

                <button
                  onClick={handleCollectCashClick}
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 hover:brightness-105"
                  style={{
                    background: 'linear-gradient(135deg, #F97316, #EA580C)',
                    boxShadow: '0 8px 16px -4px rgba(249, 115, 22, 0.4)',
                  }}
                >
                  <FiCreditCard className="w-5 h-5" />
                  Collect Cash Now
                </button>
              </div>
            </div>
          )}

          {/* Online Payment Done State */}
          {(booking?.paymentStatus === 'SUCCESS' || booking?.paymentStatus === 'paid') && booking?.status !== 'completed' && (
            <div className="bg-white rounded-2xl mb-4 overflow-hidden shadow-lg border-none relative group"
              style={{ boxShadow: '0 10px 30px -5px rgba(16, 185, 129, 0.2)' }}
            >
              <div className="h-2 bg-gradient-to-r from-green-400 to-green-600" />
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-500 shadow-inner">
                    <FiCheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">Paid Online</h3>
                    <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Payment Verified</p>
                  </div>
                </div>
                <div className="mt-4 bg-green-50/50 rounded-xl p-3 border border-green-100">
                  <p className="text-xs text-green-800 font-medium">Customer has paid ₹{booking.finalAmount.toLocaleString()} online via Razorpay. No cash collection needed.</p>
                </div>
              </div>
            </div>
          )}

          {/* Worker Payment Button */}
          {canPayWorker(booking) && (
            <div
              id="worker-payment-section"
              className="bg-white rounded-2xl p-5 mb-4 shadow-md border-l-4 border-green-500"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                  <FiDollarSign className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-800">Worker Payout</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Service complete. Pay {booking.assignedTo?.name}'s share to close this booking.
              </p>
              <button
                onClick={handlePayWorkerClick}
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md hover:brightness-105"
                style={{
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                }}
              >
                <FiCheckCircle className="w-5 h-5" />
                Pay Worker ₹{(booking.vendorEarnings || 0).toLocaleString()}
              </button>
            </div>
          )}

          {/* Final Settlement Button (Improved UI) */}
          {canDoFinalSettlement(booking) && (
            <div
              className="bg-white rounded-2xl mb-4 overflow-hidden shadow-lg border-none relative"
              style={{
                boxShadow: '0 10px 30px -5px rgba(139, 92, 246, 0.15)',
              }}
            >
              <div className="h-2 bg-gradient-to-r from-violet-400 to-indigo-600" />

              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-500 shadow-inner">
                    <FiCheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Finish Job</h3>
                    <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Step 2: Close Booking</p>
                  </div>
                </div>

                <div className="bg-violet-50/50 rounded-2xl p-4 mb-6 border border-violet-100/50">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <FiCheck className="w-4 h-4 text-violet-600" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-700 font-medium">Payment Verified</span>
                      <p className="text-xs text-gray-500 mt-0.5">Payment has been successfully recorded. You can now close this booking.</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleFinalSettlement}
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 hover:brightness-105"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                    boxShadow: '0 8px 16px -4px rgba(139, 92, 246, 0.4)',
                  }}
                >
                  <FiCheckCircle className="w-5 h-5" />
                  Close Booking & Finalize
                </button>
              </div>
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

            {(booking.status === 'confirmed' || (booking.assignedTo && booking.workerResponse === 'rejected')) && (
              <div className="flex gap-3">
                <button
                  onClick={handleAssignToSelf}
                  className="flex-1 py-4 rounded-xl font-semibold border-2 transition-all active:scale-95"
                  style={{
                    borderColor: themeColors.button,
                    color: themeColors.button,
                    background: 'white',
                  }}
                >
                  Do it Myself
                </button>
                <button
                  onClick={handleAssignWorker}
                  className="flex-1 py-4 rounded-xl font-semibold text-white transition-all active:scale-95 px-4"
                  style={{
                    background: themeColors.button,
                    boxShadow: `0 4px 12px ${themeColors.button}40`,
                  }}
                >
                  {booking.workerResponse === 'rejected' ? 'Reassign' : 'Assign'}
                </button>
              </div>
            )}

            {/* Self-Job Operational Buttons */}
            {booking.assignedTo?.name === 'You (Self)' && (
              <div className="space-y-3 pt-2">
                {(booking.status === 'confirmed' || booking.status === 'assigned') && (
                  <button
                    onClick={handleStartJourney}
                    className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    <FiNavigation className="w-5 h-5" />
                    Start Journey
                  </button>
                )}

                {booking.status === 'journey_started' && (
                  <button
                    onClick={() => setIsVisitModalOpen(true)}
                    className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                    }}
                  >
                    <FiMapPin className="w-5 h-5" />
                    Arrived (Arrived at customer's site)
                  </button>
                )}

                {(booking.status === 'visited' || booking.status === 'in_progress') && (
                  <button
                    onClick={() => setIsWorkDoneModalOpen(true)}
                    className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    <FiCheckCircle className="w-5 h-5" />
                    Work Done
                  </button>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Unified Cash Collection Modal */}
        <CashCollectionModal
          isOpen={isCashModalOpen}
          onClose={() => setIsCashModalOpen(false)}
          booking={booking}
          onInitiateOTP={handleInitiateCashCollection}
          onConfirm={handleConfirmCashCollection}
          loading={cashSubmitting}
        />

        {/* Pay Worker Modal */}
        <AnimatePresence>
          {isPayWorkerModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPayWorkerModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl relative z-10"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Worker Payout</h3>
                    <button onClick={() => setIsPayWorkerModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-colors">
                      <FiX className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="bg-green-50 rounded-2xl p-5 mb-8 border border-green-100">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-green-100">
                        <FiUser className="w-7 h-7 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Paying to</p>
                        <p className="text-xl font-bold text-gray-900">{booking.assignedTo?.name || 'Worker'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Payout Amount</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">₹</span>
                        <input
                          type="number"
                          value={payWorkerAmount}
                          onChange={(e) => setPayWorkerAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-bold text-2xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Notes (Optional)</label>
                      <textarea
                        value={payWorkerNotes}
                        onChange={(e) => setPayWorkerNotes(e.target.value)}
                        placeholder="Add a remark about this payment..."
                        rows="2"
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-gray-700"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handlePayWorkerSubmit}
                        disabled={paySubmitting || !payWorkerAmount}
                        className="w-full py-5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg"
                        style={{
                          background: 'linear-gradient(135deg, #10B981, #059669)',
                          boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        {paySubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <span>Pay ₹{payWorkerAmount || '0'} & Complete</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Visit OTP Modal */}
        <AnimatePresence>
          {isVisitModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsVisitModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-sm rounded-[24px] p-8 shadow-2xl relative z-10"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">Verify Arrival</h3>
                    <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mt-1">Check-in Verification</p>
                  </div>
                  <button
                    onClick={() => setIsVisitModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                  Please enter the <span className="text-gray-900 font-bold">4-digit OTP</span> from the customer to verify your arrival at the location.
                </p>

                <div className="flex gap-3 justify-center mb-10">
                  {[0, 1, 2, 3].map((i) => (
                    <input
                      key={i}
                      id={`otp-input-${i}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={otpInput[i]}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      className="w-14 h-16 border-2 border-gray-100 rounded-2xl text-center text-3xl font-bold focus:border-blue-500 focus:outline-none bg-gray-50 transition-all font-mono shadow-sm"
                      maxLength={1}
                    />
                  ))}
                </div>

                <button
                  onClick={handleVerifyVisit}
                  disabled={actionLoading}
                  className="w-full py-5 rounded-2xl font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                    boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)',
                  }}
                >
                  {actionLoading ? 'Verifying...' : 'Verify & Arrive'}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Work Done Modal */}
        <AnimatePresence>
          {isWorkDoneModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsWorkDoneModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-sm rounded-[24px] p-8 shadow-2xl relative z-10"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">Complete Work</h3>
                    <p className="text-xs text-green-500 font-bold uppercase tracking-wider mt-1">Final Step</p>
                  </div>
                  <button
                    onClick={() => setIsWorkDoneModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed font-medium">
                  Are you sure you have completed all the tasks for this service? Clicking "Confirm" will notify the customer for payment.
                </p>

                <div className="bg-emerald-50/50 p-6 rounded-2xl mb-8 border border-emerald-100">
                  <div className="flex items-center gap-3 text-emerald-600 mb-3">
                    <FiCheckCircle className="w-6 h-6" />
                    <span className="font-bold">Quality Checklist</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-2 list-none font-medium">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span>Double check the results</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span>Clean up the work area</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span>Customer satisfaction check</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleCompleteWork}
                  disabled={actionLoading}
                  className="w-full py-5 rounded-2xl font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  {actionLoading ? 'Updating...' : 'Confirm Work Completed'}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
        />

        <BottomNav />
      </div>
    );
  };

  export default BookingDetails;
