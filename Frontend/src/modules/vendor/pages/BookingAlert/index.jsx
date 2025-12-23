import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiX, FiMapPin, FiClock, FiDollarSign, FiUser } from 'react-icons/fi';
import { vendorTheme as themeColors } from '../../../../theme';
import { autoInitDummyData } from '../../utils/initDummyData';
import { acceptBooking, rejectBooking } from '../../services/bookingService';
import { playAlertRing } from '../../../../utils/notificationSound';

const BookingAlert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds countdown
  const [isClosing, setIsClosing] = useState(false);
  const [booking, setBooking] = useState(null);
  const audioRef = useRef(null);
  const alarmIntervalRef = useRef(null);
  const audioContextRef = useRef(null);

  // Load booking data from localStorage
  useEffect(() => {
    autoInitDummyData();

    const loadBooking = () => {
      try {
        // First try to find in pending jobs
        const pendingJobs = JSON.parse(localStorage.getItem('vendorPendingJobs') || '[]');
        let foundBooking = pendingJobs.find(job => job.id === id);

        // If not found in pending, try accepted bookings
        if (!foundBooking) {
          const acceptedBookings = JSON.parse(localStorage.getItem('vendorAcceptedBookings') || '[]');
          foundBooking = acceptedBookings.find(job => job.id === id);
        }

        // If still not found, use default
        if (!foundBooking) {
          foundBooking = {
            id: id || 'pending-1',
            serviceType: 'Fan Repairing',
            user: {
              name: 'John Doe',
              phone: '+91 9876543210',
            },
            location: {
              address: '123 Main Street, Indore',
              distance: '2.5 km',
            },
            price: 500,
            timeSlot: {
              date: 'Today',
              time: '2:00 PM - 4:00 PM',
            },
          };
        }

        setBooking(foundBooking);
      } catch (error) {
        console.error('Error loading booking:', error);
      }
    };

    loadBooking();
    setTimeout(loadBooking, 100);
  }, [id]);

  // Play alarm sound
  useEffect(() => {
    // Stop alarm if closing
    if (isClosing) {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (e) {
          // Ignore errors when closing
        }
        audioContextRef.current = null;
      }
      return;
    }

    // Create audio context for alarm sound
    const playAlarm = () => {
      try {
        // Play initial ring
        playAlertRing();

        // Repeat alarm every 1.5 seconds for higher urgency
        const interval = setInterval(() => {
          if (timeLeft > 0 && !isClosing) {
            playAlertRing();
          } else {
            clearInterval(interval);
            alarmIntervalRef.current = null;
          }
        }, 1500);

        alarmIntervalRef.current = interval;

        return () => {
          clearInterval(interval);
          alarmIntervalRef.current = null;
        };
      } catch (error) {
        console.error('Error playing alarm:', error);
      }
    };

    playAlarm();

    // Cleanup on unmount or when closing
    return () => {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (e) {
          // Ignore errors
        }
        audioContextRef.current = null;
      }
    };
  }, [timeLeft, isClosing]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0 && !isClosing) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isClosing) {
      // Auto-reject after timeout
      handleReject();
    }
  }, [timeLeft, isClosing]);

  const handleAccept = async () => {
    if (!booking || isClosing) return;

    // Stop alarm immediately
    setIsClosing(true);
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // Ignore errors
      }
      audioContextRef.current = null;
    }
    try {
      // Call API to accept booking
      await acceptBooking(booking.id);

      // Remove from pending jobs locally
      const pendingJobs = JSON.parse(localStorage.getItem('vendorPendingJobs') || '[]');
      const updatedPending = pendingJobs.filter(job => job.id !== booking.id);
      localStorage.setItem('vendorPendingJobs', JSON.stringify(updatedPending));

      // Update stats locally
      const vendorStats = JSON.parse(localStorage.getItem('vendorStats') || '{}');
      vendorStats.activeJobs = (vendorStats.activeJobs || 0) + 1;
      vendorStats.pendingAlerts = Math.max(0, (vendorStats.pendingAlerts || 0) - 1);
      localStorage.setItem('vendorStats', JSON.stringify(vendorStats));

      // Dispatch events
      window.dispatchEvent(new Event('vendorJobsUpdated'));
      window.dispatchEvent(new Event('vendorStatsUpdated'));

      setTimeout(() => {
        navigate(`/vendor/booking/${booking.id}`);
      }, 300);
    } catch (error) {
      console.error('Error accepting booking:', error);
      alert('Failed to accept booking. It may have been cancelled or assigned to someone else.');
    }
  };

  const handleReject = async () => {
    if (!booking || isClosing) return;

    // Stop alarm immediately
    setIsClosing(true);
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // Ignore errors
      }
      audioContextRef.current = null;
    }
    try {
      // Call API to reject booking
      await rejectBooking(booking.id, 'Vendor rejected');

      // Remove from pending locally
      const pendingJobs = JSON.parse(localStorage.getItem('vendorPendingJobs') || '[]');
      const updated = pendingJobs.filter(job => job.id !== booking.id);
      localStorage.setItem('vendorPendingJobs', JSON.stringify(updated));

      // Update stats
      const vendorStats = JSON.parse(localStorage.getItem('vendorStats') || '{}');
      vendorStats.pendingAlerts = Math.max(0, (vendorStats.pendingAlerts || 0) - 1);
      localStorage.setItem('vendorStats', JSON.stringify(vendorStats));

      // Dispatch events
      window.dispatchEvent(new Event('vendorJobsUpdated'));
      window.dispatchEvent(new Event('vendorStatsUpdated'));

      setTimeout(() => {
        navigate('/vendor/dashboard');
      }, 300);
    } catch (error) {
      console.error('Error rejecting booking:', error);
    }
  };

  const handleClose = () => {
    handleReject();
  };

  if (!booking) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <div className="bg-white rounded-3xl p-6 text-center">
          <p className="text-gray-600">Loading booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors z-50"
      >
        <FiX className="w-6 h-6 text-gray-800" />
      </button>

      {/* Alert Card */}
      <div
        className={`bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
        style={{
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Countdown Timer */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mx-auto mb-4"
            style={{
              background: timeLeft <= 10 ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            }}
          >
            <span className="text-3xl font-bold text-white">{timeLeft}s</span>
          </div>
          <p className="text-lg font-semibold text-gray-800">New Booking Alert!</p>
          <p className="text-sm text-gray-600 mt-1">Respond quickly to accept</p>
        </div>

        {/* Service Type */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-4">
          <p className="text-xl font-bold" style={{ color: themeColors.button }}>
            {booking.serviceType}
          </p>
        </div>

        {/* Booking Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <FiUser className="w-5 h-5 mt-0.5" style={{ color: themeColors.icon }} />
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-semibold text-gray-800">{booking.user?.name || booking.customerName || 'Customer'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FiMapPin className="w-5 h-5 mt-0.5" style={{ color: themeColors.icon }} />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-semibold text-gray-800">{booking.location?.address || 'Address not available'}</p>
              <p className="text-sm text-gray-500 mt-1">{booking.location?.distance || '0'} km away</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FiClock className="w-5 h-5 mt-0.5" style={{ color: themeColors.icon }} />
            <div>
              <p className="text-sm text-gray-600">Time Slot</p>
              <p className="font-semibold text-gray-800">{booking.timeSlot.date}</p>
              <p className="text-sm text-gray-500">{booking.timeSlot.time}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FiDollarSign className="w-5 h-5 mt-0.5" style={{ color: themeColors.icon }} />
            <div>
              <p className="text-sm text-gray-600">Estimated Price</p>
              <p className="text-2xl font-bold" style={{ color: themeColors.button }}>
                ₹{booking.price}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleReject}
            className="flex-1 py-4 rounded-xl font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95"
          >
            Reject
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 py-4 rounded-xl font-semibold text-white transition-all active:scale-95"
            style={{
              background: themeColors.button,
              boxShadow: `0 4px 12px ${themeColors.button}40`,
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingAlert;

