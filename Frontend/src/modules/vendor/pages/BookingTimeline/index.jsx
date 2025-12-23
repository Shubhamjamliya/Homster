import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiCheck, FiClock, FiUser, FiMapPin, FiTool, FiDollarSign, FiFileText, FiCheckCircle } from 'react-icons/fi';
import { vendorTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import { getBookingById, updateBookingStatus } from '../../services/bookingService';

const BookingTimeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [currentStage, setCurrentStage] = useState(1);

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
    const loadBooking = async () => {
      try {
        const response = await getBookingById(id);
        const apiData = response.data || response;

        const mappedBooking = {
          ...apiData,
          id: apiData._id || apiData.id,
          assignedTo: apiData.workerId ? { name: apiData.workerId.name } : null,
          location: {
            address: apiData.address?.addressLine1 || apiData.location?.address || 'Address not available',
            lat: apiData.address?.lat || apiData.location?.lat,
            lng: apiData.address?.lng || apiData.location?.lng
          },
          status: apiData.status,
          // Timeline mapping if backend supports it, otherwise derived from status/timestamps
          timeline: [
            { stage: 1, timestamp: apiData.createdAt },
            { stage: 2, timestamp: apiData.acceptedAt },
            { stage: 3, timestamp: apiData.assignedAt },
            { stage: 4, timestamp: apiData.startedAt }, // Assuming started means visited for now? Or keep null
            { stage: 5, timestamp: apiData.completedAt }, // Simplified mapping
          ]
        };
        setBooking(mappedBooking);

        // Determine current stage based on status
        const statusMap = {
          'REQUESTED': 1,
          'SEARCHING': 1,
          'ACCEPTED': 2,
          'ASSIGNED': 3, // Worker assigned but not visited
          'IN_PROGRESS': 4, // Visited/Started
          'VISITED': 4, // Explicit visited status if used
          'WORK_DONE': 5,
          'WORKER_PAID': 6,
          'SETTLEMENT_PENDING': 7,
          'COMPLETED': 8,
        };
        // Mapping might need adjustment based on validTransitions in backend
        setCurrentStage(statusMap[apiData.status] || 2);
      } catch (error) {
        console.error('Error loading booking:', error);
      }
    };

    loadBooking();
  }, [id]);

  const timelineStages = [
    {
      id: 1,
      title: 'Booking Requested',
      icon: FiClock,
      action: null,
      description: 'Booking request received',
    },
    {
      id: 2,
      title: 'Booking Accepted',
      icon: FiCheck,
      action: null,
      description: 'You accepted the booking',
    },
    {
      id: 3,
      title: 'Assigned',
      icon: FiUser,
      action: currentStage === 2 ? () => navigate(`/vendor/booking/${id}/assign-worker`) : null,
      description: booking?.assignedTo === 'SELF' ? 'Assigned to yourself' : booking?.assignedTo ? `Assigned to ${booking.assignedTo.name}` : 'Assign worker or yourself',
    },
    {
      id: 4,
      title: 'Visited Site',
      icon: FiMapPin,
      action: currentStage === 3 ? handleVisitSite : null,
      description: 'Worker has visited the site',
    },
    {
      id: 5,
      title: 'Work Done',
      icon: FiTool,
      action: currentStage === 4 ? handleWorkDone : null,
      description: 'Service work completed',
    },
    {
      id: 6,
      title: 'Worker Payment Done',
      icon: FiDollarSign,
      action: currentStage === 5 && booking?.assignedTo && booking.assignedTo !== 'SELF' ? handleWorkerPayment : null,
      description: booking?.assignedTo === 'SELF' ? 'Not applicable' : 'Worker payment confirmed',
    },
    {
      id: 7,
      title: 'Settlement Pending',
      icon: FiFileText,
      action: null,
      description: 'Waiting for admin settlement',
    },
    {
      id: 8,
      title: 'Completed',
      icon: FiCheckCircle,
      action: null,
      description: 'Booking completed and settled',
    },
  ];

  async function handleVisitSite() {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${booking.location?.lat || 22.7196},${booking.location?.lng || 75.8577}`;
    window.open(url, '_blank');

    try {
      // Assuming 'in_progress' covers the visit stage in backend
      await updateBookingStatus(id, 'in_progress');
      setCurrentStage(4);
      // Reload booking to get latest state
      const response = await getBookingById(id);
      setBooking(prev => ({ ...prev, status: response.data.status }));
    } catch (error) {
      console.error('Error updating status to visited:', error);
      // alert('Failed to update status');
    }
  }

  async function handleWorkDone() {
    try {
      // Try to mark as completed or work_done if backend supports it
      // Currently backend supports IN_PROGRESS -> COMPLETED
      await updateBookingStatus(id, 'completed');
      setCurrentStage(8); // Jump to completed for now as simplified flow
      window.location.reload();
    } catch (error) {
      console.error('Error updating status to work done:', error);
      alert('Failed to update status. Please follow valid status flow.');
    }
  }

  async function handleWorkerPayment() {
    // This requires specific API for payments which might be different than status update
    // For now just alert or log
    alert('Worker payment integration pending backend support.');
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: themeColors.backgroundGradient }}>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Booking Timeline" />

      <main className="px-4 py-6">
        <div
          className="bg-white rounded-xl p-6 shadow-md"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Timeline */}
          <div className="relative">
            {timelineStages.map((stage, index) => {
              const IconComponent = stage.icon;
              const isCompleted = stage.id < currentStage;
              const isCurrent = stage.id === currentStage;
              const isPending = stage.id > currentStage;
              const isSkipped = stage.id === 6 && booking?.assignedTo === 'SELF';

              return (
                <div key={stage.id} className="relative pb-8 last:pb-0">
                  {/* Timeline Line */}
                  {index < timelineStages.length - 1 && (
                    <div
                      className="absolute left-6 top-12 w-0.5 h-full"
                      style={{
                        background: isCompleted ? themeColors.button : '#E5E7EB',
                      }}
                    />
                  )}

                  {/* Timeline Item */}
                  <div className="flex items-start gap-4">
                    {/* Icon Circle */}
                    <div
                      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-white' : isCurrent ? 'bg-white' : 'bg-gray-100'
                        }`}
                      style={{
                        border: `3px solid ${isCompleted || isCurrent ? themeColors.button : '#E5E7EB'}`,
                        boxShadow: isCurrent ? `0 0 0 4px ${themeColors.button}20` : 'none',
                      }}
                    >
                      {isCompleted ? (
                        <FiCheck className="w-6 h-6" style={{ color: themeColors.button }} />
                      ) : (
                        <IconComponent
                          className="w-6 h-6"
                          style={{
                            color: isCurrent ? themeColors.button : '#9CA3AF',
                          }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className={`font-semibold ${isCompleted || isCurrent ? 'text-gray-800' : 'text-gray-400'
                            }`}
                        >
                          {stage.title}
                        </h3>
                        {isSkipped && (
                          <span className="text-xs text-gray-500">Skipped</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{stage.description}</p>

                      {/* Action Button */}
                      {stage.action && !isSkipped && (
                        <button
                          onClick={stage.action}
                          className="px-4 py-2 rounded-lg font-semibold text-white text-sm transition-all active:scale-95"
                          style={{
                            background: themeColors.button,
                            boxShadow: `0 2px 8px ${themeColors.button}40`,
                          }}
                        >
                          {stage.id === 3 ? 'Assign Worker' : stage.id === 4 ? 'Start Journey' : stage.id === 5 ? 'Mark Work Done' : 'Confirm Payment'}
                        </button>
                      )}

                      {/* Timestamp */}
                      {isCompleted && booking.timeline && booking.timeline.find(t => t.stage === stage.id) && (
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(booking.timeline.find(t => t.stage === stage.id).timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default BookingTimeline;

