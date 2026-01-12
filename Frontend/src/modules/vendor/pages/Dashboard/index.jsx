import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase, FiUsers, FiBell, FiArrowRight, FiUser, FiClock, FiMapPin, FiCheckCircle, FiTrendingUp, FiChevronRight } from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';
import { vendorTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import { vendorDashboardService } from '../../services/dashboardService';
import { acceptBooking, rejectBooking } from '../../services/bookingService';
import { BookingAlertModal } from '../../components/bookings';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';

import { registerFCMToken } from '../../../../services/pushNotificationService';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, '') || 'http://localhost:5000';

const Dashboard = () => {
  const navigate = useNavigate();

  // Helper function to convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const [stats, setStats] = useState({
    todayEarnings: 0,
    activeJobs: 0,
    pendingAlerts: 0,
    workersOnline: 0,
    totalEarnings: 0,
    completedJobs: 0,
    rating: 0,
  });
  const [vendorProfile, setVendorProfile] = useState({
    name: 'Vendor Name',
    businessName: 'Business Name',
    photo: null,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeAlertBooking, setActiveAlertBooking] = useState(null);

  // Set background gradient
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

  // Load dashboard data from API
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard stats from API
        const response = await vendorDashboardService.getDashboardStats();

        if (response.success) {
          const { stats: apiStats, recentBookings } = response.data;

          // Separate REQUESTED/SEARCHING bookings from other bookings
          const requestedBookings = (recentBookings || []).filter(booking =>
            booking.status === 'REQUESTED' || booking.status === 'searching'
          );
          const otherBookings = (recentBookings || []).filter(booking =>
            booking.status !== 'REQUESTED' && booking.status !== 'searching'
          );

          // --- MERGE LOGIC START ---
          const localPending = JSON.parse(localStorage.getItem('vendorPendingJobs') || '[]');

          // Use a Map to ensure uniqueness by String ID
          const mergedMap = new Map();
          const apiIds = new Set();

          // Add API items first - THIS IS THE SOURCE OF TRUTH
          requestedBookings.forEach(b => {
            const id = String(b._id || b.id);
            apiIds.add(id);
            mergedMap.set(id, {
              id: id,
              serviceType: b.serviceId?.title || 'Service Request',
              customerName: b.userId?.name || 'Customer',
              location: {
                address: b.address?.addressLine1 || 'Address not available',
                distance: 'N/A'
              },
              price: (b.vendorEarnings || (b.finalAmount ? b.finalAmount * 0.9 : 0)).toFixed(2),
              timeSlot: {
                date: new Date(b.scheduledDate).toLocaleDateString(),
                time: b.scheduledTimeSlot || 'Time not set'
              },
              status: b.status,
              ...b
            });
          });

          // Sync localStorage: Remove items that are NO LONGER in the API stats
          // (This handles the case where user deleted from DB)
          // We only keep local items if we are sure they are valid but missing from API (unlikely now)
          // OR if we want to trust API fully, we just filter localPending to be subset of API

          const validLocalPending = localPending.filter(localB => {
            const id = String(localB.id || localB._id);
            return apiIds.has(id); // Only keep if it exists in API response
          });

          // Update localStorage to match API reality (removing deleted items)
          localStorage.setItem('vendorPendingJobs', JSON.stringify(validLocalPending));

          // The final list is just the API items (since we validated local against it)
          const finalPendingBookings = Array.from(mergedMap.values());
          // --- MERGE LOGIC END ---

          // Update stats
          setStats({
            todayEarnings: apiStats.vendorEarnings || 0,
            activeJobs: apiStats.inProgressBookings || 0,
            pendingAlerts: finalPendingBookings.length,
            workersOnline: apiStats.workersOnline || 0,
            totalEarnings: apiStats.vendorEarnings || 0,
            completedJobs: apiStats.completedBookings || 0,
            rating: apiStats.rating || 0,
          });

          // Update pending bookings state
          setPendingBookings(finalPendingBookings);

          // Update recent jobs from API data (show recent non-requested bookings)
          const recentJobsData = otherBookings.slice(0, 3).map(booking => ({
            id: booking._id,
            serviceType: booking.serviceId?.title || 'Service',
            customerName: booking.userId?.name || 'Customer',
            location: booking.address?.addressLine1 || 'Address not available',
            price: (booking.vendorEarnings || (booking.finalAmount ? booking.finalAmount * 0.9 : 0)).toFixed(2),
            timeSlot: {
              date: new Date(booking.scheduledDate).toLocaleDateString(),
              time: booking.scheduledTimeSlot || 'Time not set'
            },
            status: booking.status,
            assignedTo: booking.workerId ? { name: booking.workerId.name } : null,
          }));
          setRecentJobs(recentJobsData);

          // Load vendor profile from localStorage (for now)
          const profile = JSON.parse(localStorage.getItem('vendorData') || '{}');
          setVendorProfile({
            name: profile.name || 'Vendor Name',
            businessName: profile.businessName || 'Business Name',
            photo: profile.profilePhoto || null,
          });
        } else {
          throw new Error(response.message || 'Failed to load dashboard data');
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(String(err.message || 'Failed to load dashboard data'));
        // Fallback logic remains same...
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Listen for real-time updates via window events (dispatched by useAppNotifications)
  useEffect(() => {
    const handleUpdate = () => {
      console.log('🔄 Dashboard: Refreshing data due to real-time update');
      // Re-fetch dashboard data
      // We can just call the loading function again
      const refreshData = async () => {
        try {
          const response = await vendorDashboardService.getDashboardStats();
          if (response.success) {
            const { stats: apiStats, recentBookings } = response.data;

            // Separate REQUESTED/SEARCHING bookings from other bookings
            const requestedBookings = (recentBookings || []).filter(booking =>
              booking.status === 'REQUESTED' || booking.status === 'searching'
            );
            const otherBookings = (recentBookings || []).filter(booking =>
              booking.status !== 'REQUESTED' && booking.status !== 'searching'
            );

            // --- MERGE LOGIC START ---
            const localPending = JSON.parse(localStorage.getItem('vendorPendingJobs') || '[]');
            const mergedMap = new Map();
            const apiIds = new Set();

            // Add API items first - THIS IS THE SOURCE OF TRUTH
            requestedBookings.forEach(b => {
              const id = String(b._id || b.id);
              apiIds.add(id);
              mergedMap.set(id, {
                id: id,
                serviceType: b.serviceId?.title || 'Service Request',
                customerName: b.userId?.name || 'Customer',
                location: {
                  address: b.address?.addressLine1 || 'Address not available',
                  distance: 'N/A'
                },
                price: (b.vendorEarnings || (b.finalAmount ? b.finalAmount * 0.9 : 0)).toFixed(2),
                timeSlot: {
                  date: new Date(b.scheduledDate).toLocaleDateString(),
                  time: b.scheduledTimeSlot || 'Time not set'
                },
                status: b.status,
                ...b
              });
            });

            // Sync localStorage: Remove items that are NO LONGER in the API stats
            const validLocalPending = localPending.filter(localB => {
              const id = String(localB.id || localB._id);
              return apiIds.has(id);
            });

            // Update localStorage
            localStorage.setItem('vendorPendingJobs', JSON.stringify(validLocalPending));

            const finalPendingBookings = Array.from(mergedMap.values());
            // --- MERGE LOGIC END ---

            setStats({
              todayEarnings: apiStats.vendorEarnings || 0,
              activeJobs: apiStats.inProgressBookings || 0,
              pendingAlerts: finalPendingBookings.length,
              workersOnline: apiStats.workersOnline || 0,
              totalEarnings: apiStats.vendorEarnings || 0,
              completedJobs: apiStats.completedBookings || 0,
              rating: apiStats.rating || 0,
            });

            setPendingBookings(finalPendingBookings);

            const recentJobsData = otherBookings.slice(0, 3).map(booking => ({
              id: booking._id,
              serviceType: booking.serviceId?.title || 'Service',
              customerName: booking.userId?.name || 'Customer',
              location: booking.address?.addressLine1 || 'Address not available',
              price: (booking.vendorEarnings || (booking.finalAmount ? booking.finalAmount * 0.9 : 0)).toFixed(2),
              timeSlot: {
                date: new Date(booking.scheduledDate).toLocaleDateString(),
                time: booking.scheduledTimeSlot || 'Time not set'
              },
              status: booking.status,
              assignedTo: booking.workerId ? { name: booking.workerId.name } : null,
            }));
            setRecentJobs(recentJobsData);
          }
        } catch (err) {
          console.error('Error refreshing dashboard data:', err);
        }
      };
      refreshData();
    };

    // Ask for notification permission and register FCM
    registerFCMToken('vendor', true).catch(err => console.error('FCM registration failed:', err));

    window.addEventListener('vendorJobsUpdated', handleUpdate);
    window.addEventListener('vendorStatsUpdated', handleUpdate);

    return () => {
      window.removeEventListener('vendorJobsUpdated', handleUpdate);
      window.removeEventListener('vendorStatsUpdated', handleUpdate);
    };
  }, []);

  const quickActions = [
    {
      title: 'Active Jobs',
      icon: FiBriefcase,
      color: '#00a6a6',
      path: '/vendor/jobs',
      count: stats.activeJobs,
      subtitle: `${stats.activeJobs} running`,
    },
    {
      title: 'Manage Workers',
      icon: FiUsers,
      color: '#29ad81',
      path: '/vendor/workers',
      count: stats.workersOnline,
      subtitle: `${stats.workersOnline} online`,
    },
    {
      title: 'Wallet',
      icon: FaWallet,
      color: '#F59E0B',
      path: '/vendor/wallet',
      subtitle: `₹${stats.totalEarnings.toLocaleString()} total`,
    },
  ];

  const getStatusColor = (status) => {
    const statusColors = {
      'ACCEPTED': '#3B82F6',
      'ASSIGNED': '#8B5CF6',
      'VISITED': '#F59E0B',
      'WORK_DONE': '#10B981',
      'WORKER_PAID': '#06B6D4',
      'SETTLEMENT_PENDING': '#F97316',
    };
    return statusColors[status] || '#6B7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'ACCEPTED': 'Accepted',
      'ASSIGNED': 'Assigned',
      'VISITED': 'Visited',
      'WORK_DONE': 'Work Done',
      'WORKER_PAID': 'Payment Done',
      'SETTLEMENT_PENDING': 'Settlement',
    };
    return labels[status] || status;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center" style={{ background: themeColors.backgroundGradient }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center" style={{ background: themeColors.backgroundGradient }}>
        <div className="text-center px-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-xl font-semibold mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && error.length > 0 && !loading) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center" style={{ background: themeColors.backgroundGradient }}>
        <div className="text-center px-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-xl font-semibold mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Dashboard" showBack={false} notificationCount={stats.pendingAlerts} />

      <main className="pt-0">
        {/* Profile Card Section */}
        <div className="px-4 pt-4 pb-2">
          <div
            className="rounded-2xl p-4 cursor-pointer active:scale-98 transition-all duration-200 relative overflow-hidden"
            onClick={() => navigate('/vendor/profile')}
            style={{
              background: themeColors.button,
              border: `2px solid ${themeColors.button}`,
            }}
          >
            {/* Decorative Pattern */}
            <div
              className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
              style={{
                background: `radial-gradient(circle, ${themeColors.button} 0%, transparent 70%)`,
                transform: 'translate(20px, -20px)',
              }}
            />

            <div className="relative z-10 flex items-center gap-3">
              {/* Profile Photo */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.button} 0%, ${themeColors.button}dd 100%)`,
                  border: `2.5px solid #FFFFFF`,
                }}
              >
                {vendorProfile.photo ? (
                  <img
                    src={vendorProfile.photo}
                    alt={vendorProfile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUser className="w-7 h-7" style={{ color: '#FFFFFF' }} />
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold uppercase tracking-wider mb-0.5" style={{
                  color: '#FFFFFF',
                  textShadow: `1px 1px 0px rgba(0, 0, 0, 0.2)`,
                  letterSpacing: '0.12em',
                }}>
                  WELCOME !
                </p>
                <h2 className="text-base font-bold text-white truncate mb-0.5">{vendorProfile.name}</h2>
                <p className="text-xs text-white truncate font-medium opacity-90">{vendorProfile.businessName}</p>
              </div>

              {/* Arrow Icon */}
              <div
                className="p-2.5 rounded-lg flex-shrink-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.35)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                }}
              >
                <FiChevronRight className="w-6 h-6" style={{ color: '#FFFFFF', fontWeight: 'bold' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Outside Gradient */}
        <div className="px-4 pt-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Card 1: Today's Earnings - Dark Blue Gradient */}
            <div
              onClick={() => navigate('/vendor/wallet')}
              className="rounded-xl p-4 relative overflow-hidden cursor-pointer active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #001947 0%, #003b77 100%)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {/* Decorative Pattern */}
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
                  transform: 'translate(20px, -20px)',
                }}
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-white font-semibold mb-1 opacity-90 uppercase tracking-wide">Today's Earnings</p>
                    <p className="text-2xl font-bold text-white leading-tight">
                      ₹{stats.todayEarnings.toLocaleString()}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-xl flex-shrink-0"
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <FaWallet className="w-6 h-6" style={{ color: '#FFFFFF' }} />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <FiTrendingUp className="w-4 h-4 text-white opacity-80" />
                  <span className="text-xs text-white opacity-80 font-medium">Today</span>
                </div>
              </div>
            </div>

            {/* Card 2: Active Jobs - Light Blue Gradient */}
            <div
              onClick={() => navigate('/vendor/jobs')}
              className="rounded-xl p-4 relative overflow-hidden cursor-pointer active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #406788 0%, #304a63 100%)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {/* Decorative Pattern */}
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
                  transform: 'translate(20px, -20px)',
                }}
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-white font-semibold mb-1 opacity-90 uppercase tracking-wide">Active Jobs</p>
                    <p className="text-2xl font-bold text-white leading-tight">
                      {stats.activeJobs}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-xl flex-shrink-0"
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <FiBriefcase className="w-6 h-6" style={{ color: '#FFFFFF' }} />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <FiCheckCircle className="w-4 h-4 text-white opacity-80" />
                  <span className="text-xs text-white opacity-80 font-medium">Running</span>
                </div>
              </div>
            </div>

            {/* Card 3: Pending Alerts - Light Blue Gradient */}
            <div
              onClick={() => navigate('/vendor/booking-alerts')}
              className="rounded-xl p-4 relative overflow-hidden cursor-pointer active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #406788 0%, #304a63 100%)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {/* Decorative Pattern */}
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
                  transform: 'translate(20px, -20px)',
                }}
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-white font-semibold mb-1 opacity-90 uppercase tracking-wide">Pending Alerts</p>
                    <p className="text-2xl font-bold text-white leading-tight">
                      {stats.pendingAlerts}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-xl flex-shrink-0"
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <FiBell className="w-6 h-6" style={{ color: '#FFFFFF' }} />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <FiBell className="w-4 h-4 text-white opacity-80" />
                  <span className="text-xs text-white opacity-80 font-medium">
                    {stats.pendingAlerts > 0 ? 'Action needed' : 'All clear'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: Workers Online - Dark Blue Gradient */}
            <div
              onClick={() => navigate('/vendor/workers')}
              className="rounded-xl p-4 relative overflow-hidden cursor-pointer active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #001947 0%, #003b77 100%)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {/* Decorative Pattern */}
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
                  transform: 'translate(20px, -20px)',
                }}
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-white font-semibold mb-1 opacity-90 uppercase tracking-wide">Workers Online</p>
                    <p className="text-2xl font-bold text-white leading-tight">
                      {stats.workersOnline}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-xl flex-shrink-0"
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <FiUsers className="w-6 h-6" style={{ color: '#FFFFFF' }} />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-2 h-2 rounded-full bg-white opacity-80 animate-pulse" />
                  <span className="text-xs text-white opacity-80 font-medium">Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section (below gradient) */}
        <div className="px-4 py-4 space-y-4">
          {/* Pending Booking Alerts */}
          {pendingBookings.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-gray-800">Pending Alerts</h2>
                <button
                  onClick={() => navigate('/vendor/booking-alerts')}
                  className="text-sm font-medium"
                  style={{ color: themeColors.button }}
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {pendingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    onClick={() => setActiveAlertBooking(booking)}
                    className="bg-white rounded-xl p-4 shadow-md cursor-pointer active:scale-98 transition-transform border-l-4"
                    style={{
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)', // Orange for REQUESTED
                      borderLeftColor: '#F59E0B',
                      borderTop: '1px solid rgba(245, 158, 11, 0.2)',
                      borderRight: '1px solid rgba(245, 158, 11, 0.2)',
                      borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-800">{booking.serviceType || 'New Booking Request'}</p>
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-100 text-yellow-600">
                            REQUEST
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{booking.customerName || 'Customer'}</p>
                        <p className="text-sm text-gray-600 mt-1">{booking.location?.address || 'Location'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiBell className="w-5 h-5 animate-pulse" style={{ color: '#F59E0B' }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <FiClock className="w-4 h-4" />
                        <span>{booking.timeSlot?.time || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <FiMapPin className="w-4 h-4" />
                        <span>{booking.location?.distance || 'N/A'} km</span>
                      </div>
                      <div className="text-sm font-bold text-gray-800">
                        ₹{booking.price || 0}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await acceptBooking(booking.id);

                            // Remove this booking from pending list
                            setPendingBookings(prev => prev.filter(b => b.id !== booking.id));

                            // Sync localStorage
                            const pendingJobs = JSON.parse(localStorage.getItem('vendorPendingJobs') || '[]');
                            const updated = pendingJobs.filter(b => b.id !== booking.id);
                            localStorage.setItem('vendorPendingJobs', JSON.stringify(updated));

                            // Dispatch stats update event
                            window.dispatchEvent(new Event('vendorStatsUpdated'));
                            toast.success('Booking accepted successfully!');
                          } catch (error) {
                            console.error('Error accepting:', error);
                            toast.error('Failed to accept booking');
                          }
                        }}
                        className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await rejectBooking(booking.id, 'Vendor Dashboard Reject');

                            setPendingBookings(prev => prev.filter(b => b.id !== booking.id));

                            // Sync localStorage
                            const pendingJobs = JSON.parse(localStorage.getItem('vendorPendingJobs') || '[]');
                            const updated = pendingJobs.filter(b => b.id !== booking.id);
                            localStorage.setItem('vendorPendingJobs', JSON.stringify(updated));
                            toast.success('Booking rejected');
                            navigate('/vendor/jobs');
                          } catch (error) {
                            console.error('Error rejecting:', error);
                            toast.error('Failed to reject booking');
                            navigate('/vendor/jobs');
                          }
                        }}
                        className="flex-1 bg-red-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Performance</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Completed Jobs Card */}
              <div
                className="rounded-2xl shadow-lg relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%)',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.15), 0 4px 12px rgba(16, 185, 129, 0.1), 0 0 0 2px rgba(16, 185, 129, 0.2)',
                  border: '2px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                {/* Left border accent */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                  style={{
                    background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
                  }}
                />
                {/* Top Border with Heading */}
                <div
                  className="w-full py-3 px-4 rounded-t-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <p className="text-base font-bold text-white text-center">Completed</p>
                </div>
                {/* Icon at top left - just below heading */}
                <div
                  className="absolute top-14 left-4 p-3 rounded-xl z-10"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.2) 100%)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2)',
                    border: '2px solid rgba(16, 185, 129, 0.4)',
                  }}
                >
                  <FiCheckCircle className="w-7 h-7" style={{ color: '#10B981' }} />
                </div>
                {/* Content */}
                <div className="p-5 pt-16">
                  <p className="text-4xl font-bold mb-2 text-center" style={{ color: '#10B981' }}>
                    {stats.completedJobs}
                  </p>
                  <p className="text-sm text-gray-600 font-semibold text-center">Total jobs</p>
                </div>
              </div>

              {/* Rating Card */}
              <div
                className="rounded-2xl shadow-lg relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFBEB 100%)',
                  boxShadow: '0 8px 24px rgba(245, 158, 11, 0.15), 0 4px 12px rgba(245, 158, 11, 0.1), 0 0 0 2px rgba(245, 158, 11, 0.2)',
                  border: '2px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                {/* Left border accent */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                  style={{
                    background: 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
                  }}
                />
                {/* Top Border with Heading */}
                <div
                  className="w-full py-3 px-4 rounded-t-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                  }}
                >
                  <p className="text-base font-bold text-white text-center">Rating</p>
                </div>
                {/* Icon at top left - just below heading */}
                <div
                  className="absolute top-14 left-4 p-3 rounded-xl z-10"
                  style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.2) 100%)',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2)',
                    border: '2px solid rgba(245, 158, 11, 0.4)',
                  }}
                >
                  <FiTrendingUp className="w-7 h-7" style={{ color: '#F59E0B' }} />
                </div>
                {/* Content */}
                <div className="p-5 pt-16">
                  <p className="text-4xl font-bold mb-2 text-center" style={{ color: '#F59E0B' }}>
                    {stats.rating > 0 ? stats.rating.toFixed(1) : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 font-semibold text-center">Average rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Jobs - List View */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Active Jobs</h2>
              {recentJobs.length > 0 && (
                <button
                  onClick={() => navigate('/vendor/jobs')}
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.button} 0%, ${themeColors.button}dd 100%)`,
                    color: '#FFFFFF',
                    boxShadow: `0 4px 12px ${hexToRgba(themeColors.button, 0.3)}, 0 2px 6px ${hexToRgba(themeColors.button, 0.2)}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 6px 16px ${hexToRgba(themeColors.button, 0.4)}, 0 3px 8px ${hexToRgba(themeColors.button, 0.3)}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 4px 12px ${hexToRgba(themeColors.button, 0.3)}, 0 2px 6px ${hexToRgba(themeColors.button, 0.2)}`;
                  }}
                >
                  View All
                </button>
              )}
            </div>
            {recentJobs.length > 0 ? (
              <div className="space-y-3">
                {recentJobs.map((job, index) => {
                  // Alternating colors
                  const isDarkBlue = index % 2 === 0;
                  const accentColor = isDarkBlue ? '#001947' : '#406788';

                  return (
                    <div
                      key={job.id}
                      onClick={() => navigate(`/vendor/booking/${job.id}`)}
                      className="bg-white rounded-xl shadow-lg cursor-pointer active:scale-98 transition-all duration-200 relative overflow-hidden"
                      style={{
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08)',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {/* Left accent border */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl"
                        style={{
                          background: `linear-gradient(180deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
                        }}
                      />

                      {/* Compact Content - All in one row */}
                      <div className="px-3 py-2.5">
                        <div className="flex items-center gap-3">
                          {/* Profile Image Circle */}
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                            style={{
                              border: `2.5px solid ${accentColor}40`,
                              boxShadow: `0 2px 8px ${hexToRgba(accentColor, 0.25)}, inset 0 1px 0 rgba(255, 255, 255, 0.4)`,
                              background: `linear-gradient(135deg, ${accentColor}20 0%, ${accentColor}10 100%)`,
                            }}
                          >
                            <FiUser className="w-5 h-5" style={{ color: accentColor }} />
                          </div>

                          {/* Main Content */}
                          <div className="flex-1 min-w-0">
                            {/* Name and Service in one line */}
                            <div className="flex items-center gap-2 mb-1.5">
                              <p className="text-sm font-bold text-gray-800 truncate">{job.customerName}</p>
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0"
                                style={{
                                  background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
                                  color: '#FFFFFF',
                                  boxShadow: `0 2px 5px ${hexToRgba(accentColor, 0.3)}`,
                                }}
                              >
                                {job.serviceType || 'Service'}
                              </span>
                            </div>

                            {/* Address, Time, Status in one line */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <div
                                className="flex items-center gap-1 px-2 py-0.5 rounded"
                                style={{
                                  background: 'rgba(0, 166, 166, 0.1)',
                                  border: '1px solid rgba(0, 166, 166, 0.2)',
                                }}
                              >
                                <FiMapPin className="w-3 h-3" style={{ color: themeColors.button }} />
                                <span className="text-xs font-semibold text-gray-700 truncate max-w-[100px]">{job.location}</span>
                              </div>
                              <div
                                className="flex items-center gap-1 px-2 py-0.5 rounded"
                                style={{
                                  background: 'rgba(245, 158, 11, 0.1)',
                                  border: '1px solid rgba(245, 158, 11, 0.2)',
                                }}
                              >
                                <FiClock className="w-3 h-3" style={{ color: '#F59E0B' }} />
                                <span className="text-xs font-semibold text-gray-700">{job.time}</span>
                              </div>
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{
                                  background: `${accentColor}15`,
                                  color: accentColor,
                                  border: `1px solid ${accentColor}30`,
                                }}
                              >
                                {getStatusLabel(job.status)}
                              </span>
                            </div>
                          </div>

                          {/* Navigate Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/vendor/booking/${job.id}`);
                            }}
                            className="p-2 rounded-lg flex-shrink-0 transition-all duration-300 active:scale-95"
                            style={{
                              background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
                              boxShadow: `0 3px 10px ${hexToRgba(accentColor, 0.3)}, 0 2px 5px ${hexToRgba(accentColor, 0.2)}`,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.1)';
                              e.currentTarget.style.boxShadow = `0 5px 14px ${hexToRgba(accentColor, 0.4)}, 0 3px 7px ${hexToRgba(accentColor, 0.3)}`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = `0 3px 10px ${hexToRgba(accentColor, 0.3)}, 0 2px 5px ${hexToRgba(accentColor, 0.2)}`;
                            }}
                          >
                            <FiArrowRight className="w-4 h-4" style={{ color: '#FFFFFF' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="bg-white rounded-xl p-6 shadow-md text-center"
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                }}
              >
                <FiBriefcase className="w-12 h-12 mx-auto mb-3" style={{ color: '#D1D5DB' }} />
                <p className="text-sm text-gray-600 mb-1">No active jobs</p>
                <p className="text-xs text-gray-500">New bookings will appear here</p>
              </div>
            )}
          </div>
        </div>
      </main>
      {/* Slick New Booking Alert Modal */}
      <BookingAlertModal
        isOpen={!!activeAlertBooking}
        booking={activeAlertBooking}
        onAccept={async (id) => {
          try {
            await acceptBooking(id);
            setActiveAlertBooking(null);
            setPendingBookings(prev => prev.filter(b => b.id !== id));
            window.dispatchEvent(new Event('vendorStatsUpdated'));
            toast.success('Job claimed successfully!');
          } catch (e) {
            toast.error('Failed to claim job');
          }
        }
        }
        onReject={async (id) => {
          try {
            await rejectBooking(id, 'Vendor Declined');
            setActiveAlertBooking(null);
            setPendingBookings(prev => prev.filter(b => b.id !== id));
          } catch (e) {
            setActiveAlertBooking(null);
          }
        }}
        onMinimize={() => {
          setActiveAlertBooking(null);
          // Sound is stopped inside the component
        }}
      />
    </div>
  );
};

export default Dashboard;
