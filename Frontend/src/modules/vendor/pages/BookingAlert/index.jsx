import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { acceptBooking, rejectBooking } from '../../services/bookingService';
import BookingAlertModal from '../../components/bookings/BookingAlertModal';
import { toast } from 'react-hot-toast';

const BookingAlert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooking = () => {
      try {
        const pendingJobs = JSON.parse(localStorage.getItem('vendorPendingJobs') || '[]');
        let foundBooking = pendingJobs.find(job => job.id === id);

        if (!foundBooking) {
          const acceptedBookings = JSON.parse(localStorage.getItem('vendorAcceptedBookings') || '[]');
          foundBooking = acceptedBookings.find(job => job.id === id);
        }

        if (!foundBooking) {
          // Fallback static data if not found in local storage (for testing)
          foundBooking = {
            id: id || 'pending-1',
            serviceType: 'Ac Repairing',
            vendorEarnings: 450,
            location: {
              address: '123 Main Street, Indore',
              distance: '2.5 km',
            },
            timeSlot: {
              date: 'Today',
              time: '2:00 PM - 4:00 PM',
            },
          };
        }
        setBooking(foundBooking);
      } catch (error) {
        console.error('Error loading booking:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [id]);

  const handleAccept = async () => {
    try {
      await acceptBooking(id);

      // Update local storage states
      const pendingJobs = JSON.parse(localStorage.getItem('vendorPendingJobs') || '[]');
      const updatedPending = pendingJobs.filter(job => job.id !== id);
      localStorage.setItem('vendorPendingJobs', JSON.stringify(updatedPending));

      window.dispatchEvent(new Event('vendorJobsUpdated'));
      toast.success('Booking accepted successfully!');
      navigate('/vendor/dashboard');
    } catch (error) {
      console.error('Error accepting:', error);
      toast.error('Failed to accept booking. It may have expired.');
      navigate('/vendor/dashboard');
    }
  };

  const handleReject = async () => {
    try {
      await rejectBooking(id, 'Vendor rejected');

      const pendingJobs = JSON.parse(localStorage.getItem('vendorPendingJobs') || '[]');
      const updated = pendingJobs.filter(job => job.id !== id);
      localStorage.setItem('vendorPendingJobs', JSON.stringify(updated));

      window.dispatchEvent(new Event('vendorJobsUpdated'));
      navigate('/vendor/dashboard');
    } catch (error) {
      console.error('Error rejecting:', error);
      navigate('/vendor/dashboard');
    }
  };

  if (loading) return null;

  return (
    <BookingAlertModal
      isOpen={true}
      booking={booking}
      onAccept={handleAccept}
      onReject={handleReject}
      onMinimize={() => navigate('/vendor/dashboard')}
    />
  );
};

export default BookingAlert;



