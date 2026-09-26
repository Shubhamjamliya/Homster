import React, { useState, useEffect, useLayoutEffect, useCallback, memo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiBriefcase, FiUsers, FiBell, FiArrowRight, FiUser, FiClock, FiMapPin, FiCheckCircle, FiTrendingUp, FiChevronRight, FiGift, FiX, FiStar } from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';
import { vendorTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import { vendorDashboardService } from '../../services/dashboardService';
// Booking alert handled globally
import { toast } from 'react-hot-toast';
import api from '../../../../services/api';
import { registerFCMToken } from '../../../../services/pushNotificationService';
import LogoLoader from '../../../../components/common/LogoLoader';
import StatsCards from './components/StatsCards';
import PendingBookings from './components/PendingBookings';


const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, '') || 'http://localhost:5000';

const Dashboard = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();

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
    service: [],
    categories: [],
    isOnline: false
  });
  const [isOnline, setIsOnline] = useState(false);
  const [recentJobs, setRecentJobs] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [globalConfig, setGlobalConfig] = useState({ maxSearchTime: 5, waveDuration: 60 });
  const [showCategoryRequiredModal, setShowCategoryRequiredModal] = useState(false);

  const ignoredBookingIds = useRef(new Set());
  const categoryPopupShown = useRef(false);

  const hasBookingCategory = [
    ...(Array.isArray(vendorProfile.service) ? vendorProfile.service : []),
    ...(Array.isArray(vendorProfile.categories) ? vendorProfile.categories : [])
  ].some(category => typeof category === 'string' && category.trim().length > 0);

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



  // Process API response - extracted to avoid duplication
  const processApiResponse = useCallback((response) => {
    if (!response.success) return;

    const { stats: apiStats, recentBookings, config } = response.data;
    if (config) setGlobalConfig(config);

    // Separate requested/searching bookings from other bookings
    const requestedBookings = (recentBookings || []).filter(booking => {
      const status = booking.status?.toLowerCase();
      return status === 'requested' || status === 'searching';
    });
    const otherBookings = (recentBookings || []).filter(booking => {
      const status = booking.status?.toLowerCase();
      return status !== 'requested' && status !== 'searching';
    });

    // Build pending bookings map
    const mergedMap = new Map();
    const vendorData = JSON.parse(localStorage.getItem('vendorData') || '{}');
    const vendorId = vendorData._id || vendorData.id;

    requestedBookings.forEach(b => {
      const id = String(b._id || b.id);

      // Find distance for this vendor if available
      let distance = 'N/A';
      if (b.potentialVendors && vendorId) {
        const potentialVendor = b.potentialVendors.find(pv =>
          String(pv.vendorId?._id || pv.vendorId) === String(vendorId)
        );
        if (potentialVendor && potentialVendor.distance) {
          distance = `${potentialVendor.distance.toFixed(1)} km`;
        }
      }

      mergedMap.set(id, {
        ...b, // Spread first!
        id,
        serviceName: b.serviceName || b.serviceId?.title || 'New Booking Request',
        serviceCategory: b.serviceCategory || b.serviceId?.categoryId?.title || 'General Service',
        customerName: b.userId?.name || 'Customer',
        location: {
          address: b.address?.addressLine1 || 'Address not available',
          distance: distance
        },
        // Prioritize vendorEarnings, fallback to 90% of finalAmount if it's not a free plan (finalAmount > 0)
        price: (b.vendorEarnings > 0 ? b.vendorEarnings : (b.finalAmount > 0 ? b.finalAmount * 0.9 : 0)).toFixed(2),
        vendorEarnings: b.vendorEarnings, // Ensure it's explicitly passed
        timeSlot: {
          date: new Date(b.scheduledDate).toLocaleDateString(),
          time: b.scheduledTime || 'Time not set'
        },
        status: b.status,
        expiresAt: b.expiresAt || (b.createdAt && config ? new Date(new Date(b.createdAt).getTime() + (config.maxSearchTime || 5) * 60000).toISOString() : null)
      });
    });

    // Filter out locally ignored bookings
    const finalMap = new Map();
    mergedMap.forEach((value, key) => {
      if (!ignoredBookingIds.current.has(key)) {
        finalMap.set(key, value);
      }
    });

    // Merge with local storage to avoid losing real-time updates that haven't hit API yet
    const localPending = JSON.parse(localStorage.getItem('vendorPendingJobs') || '[]');
    const apiPending = Array.from(finalMap.values());
    const mergedPending = [...apiPending];

    localPending.forEach(localJob => {
      const id = String(localJob.id || localJob._id);
      if (!mergedPending.find(job => String(job.id || job._id) === id) && !ignoredBookingIds.current.has(id)) {

        const createdAt = localJob.createdAt ? new Date(localJob.createdAt).getTime() : Date.now();
        const expiresAt = localJob.expiresAt || (localJob.createdAt && config ? new Date(createdAt + (config.maxSearchTime || 5) * 60000).toISOString() : null);
        const isExpired = (expiresAt && new Date(expiresAt) <= new Date()) || (Date.now() - createdAt > 300000);

        const lowerStatus = String(localJob.status || '').toLowerCase();

        if (!isExpired && (lowerStatus === 'requested' || lowerStatus === 'searching')) {
          mergedPending.push({
            ...localJob,
            id,
            serviceName: localJob.serviceName || localJob.serviceId?.title || 'New Booking Request',
            serviceCategory: localJob.serviceCategory || localJob.serviceId?.categoryId?.title || 'General Service',
            customerName: localJob.customerName || localJob.userId?.name || 'Customer',
            expiresAt
          });
        }
      }
    });

    setPendingBookings(mergedPending);
    localStorage.setItem('vendorPendingJobs', JSON.stringify(mergedPending));

    // Update stats
    setStats({
      todayEarnings: apiStats.todayEarnings || 0,
      monthlyEarnings: apiStats.monthlyEarnings || 0,
      totalRevenue: apiStats.totalRevenue || apiStats.totalEarnings || 0,
      totalEarnings: apiStats.totalEarnings || apiStats.totalRevenue || 0,
      activeJobs: apiStats.activeJobs || apiStats.inProgressBookings || 0,
      pendingAlerts: mergedPending.length,
      workersOnline: apiStats.workersOnline || 0,
      completedJobs: apiStats.completedJobs || apiStats.completedBookings || 0,
      rating: apiStats.rating || apiStats.averageRating || 0,
    });

    // Recent jobs (non-requested)
    const recentJobsData = otherBookings.slice(0, 3).map(booking => ({
      id: booking._id,
      serviceType: booking.serviceId?.title || 'Service',
      customerName: booking.userId?.name || 'Customer',
      location: booking.address?.addressLine1 || 'Address not available',
      price: (booking.vendorEarnings > 0 ? booking.vendorEarnings : (booking.finalAmount ? booking.finalAmount * 0.9 : 0)).toFixed(2),
      vendorEarnings: booking.vendorEarnings,
      timeSlot: {
        date: new Date(booking.scheduledDate).toLocaleDateString(),
        time: booking.scheduledTime || 'Time not set'
      },
      status: booking.status,
      assignedTo: booking.workerId ? { name: booking.workerId.name } : null,
    }));
    setRecentJobs(recentJobsData);

    // Load vendor profile from localStorage (once)
    const profile = JSON.parse(localStorage.getItem('vendorData') || '{}');
    const profileHasCategory = [
      ...(Array.isArray(profile.service) ? profile.service : []),
      ...(Array.isArray(profile.categories) ? profile.categories : [])
    ].some(category => typeof category === 'string' && category.trim().length > 0);

    setVendorProfile({
      name: profile.name || 'Vendor Name',
      businessName: profile.businessName || 'Business Name',
      photo: profile.profilePhoto || null,
      service: profile.service || [],
      categories: profile.categories || [],
      isOnline: profile.isOnline || false
    });
    setIsOnline(profile.isOnline || false);

    if (!profileHasCategory && !categoryPopupShown.current) {
      categoryPopupShown.current = true;
      setShowCategoryRequiredModal(true);
    }
  }, []);

  // Main data loader - useCallback to prevent recreation
  const loadDashboardData = useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      setError(null);

      const response = await vendorDashboardService.getDashboardStats();
      processApiResponse(response);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(String(err.message || 'Failed to load dashboard data'));
    } finally {
      setLoading(false);
    }
  }, [processApiResponse]);

  const handleToggleOnline = async (e) => {
    e.stopPropagation();
    const newStatus = !isOnline;
    // Optimistic UI update
    setIsOnline(newStatus);
    try {
      const res = await api.put('/vendors/status', { isOnline: newStatus });
      if (res.data.success) {
        toast.success(newStatus ? 'You are now Online!' : 'You are now Offline!');
        const profile = JSON.parse(localStorage.getItem('vendorData') || '{}');
        profile.isOnline = newStatus;
        localStorage.setItem('vendorData', JSON.stringify(profile));
      }
    } catch {
      // Revert if failed
      setIsOnline(!newStatus);
      toast.error('Failed to change status');
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Check for redirected state (to open a specific alert modal)
  useEffect(() => {
    if (location.state?.openBookingId && pendingBookings.length > 0) {
      const bId = String(location.state.openBookingId);
      const booking = pendingBookings.find(b => String(b.id || b._id) === bId);
      if (booking) {
        window.dispatchEvent(new CustomEvent('showDashboardBookingAlert', { detail: booking }));
        // Clear state to avoid reopening on refresh
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, location.pathname, pendingBookings, navigate]);

  // Listen for real-time updates via window events (dispatched by useAppNotifications)
  useEffect(() => {
    const handleUpdate = () => {
      loadDashboardData(false); // false = don't show spinner for background refresh
    };

    // Ask for notification permission and register FCM
    registerFCMToken('vendor', true).catch(err => console.error('FCM registration failed:', err));

    // Listen for custom dashboard events from SocketContext
    const handleShowAlert = (e) => {
      // e.detail contains the new booking job
      if (e.detail) {
        // Also add to pending if not present
        setPendingBookings(prev => {
          if (prev.find(b => b.id === e.detail.id)) return prev;
          return [e.detail, ...prev];
        });
      }
    };

    const handleRemoveBooking = (e) => {
      if (e.detail?.id) {
        const idToRemove = String(e.detail.id);

        // Add to ignored list so it doesn't come back on next fetch
        ignoredBookingIds.current.add(idToRemove);

        // Remove from pending bookings state immediately
        setPendingBookings(prev => prev.filter(b => String(b.id || b._id) !== idToRemove));

        // Remove from recent jobs state
        setRecentJobs(prev => prev.filter(b => String(b.id || b._id) !== idToRemove));

        // Remove from localStorage
        const pendingJobs = JSON.parse(localStorage.getItem('vendorPendingJobs') || '[]');
        const updatedPending = pendingJobs.filter(job => String(job.id || job._id) !== idToRemove);
        localStorage.setItem('vendorPendingJobs', JSON.stringify(updatedPending));
      }
    };

    window.addEventListener('vendorJobsUpdated', handleUpdate);
    window.addEventListener('vendorStatsUpdated', handleUpdate);
    window.addEventListener('showDashboardBookingAlert', handleShowAlert);
    window.addEventListener('removeVendorBooking', handleRemoveBooking);

    return () => {
      window.removeEventListener('vendorJobsUpdated', handleUpdate);
      window.removeEventListener('vendorStatsUpdated', handleUpdate);
      window.removeEventListener('showDashboardBookingAlert', handleShowAlert);
      window.removeEventListener('removeVendorBooking', handleRemoveBooking);
    };
  }, [loadDashboardData]);



  const getStatusLabel = (status) => {
    const s = String(status).toLowerCase();
    const labels = {
      'requested': 'Requested',
      'searching': 'Searching',
      'accepted': 'Accepted',
      'confirmed': 'Confirmed',
      'assigned': 'Assigned',
      'journey_started': 'On the way',
      'visited': 'Visited',
      'in_progress': 'In Progress',
      'work_done': 'Work Done',
      'completed': 'Completed',
      'worker_paid': 'Payment Done',
      'settlement_pending': 'Settlement',
      'cancelled': 'Cancelled',
      'rejected': 'Rejected'
    };
    return labels[s] || status;
  };

  // Show loading state
  if (loading) {
    return <LogoLoader />;
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
    <div className="min-h-screen pb-28" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Dashboard" showBack={false} notificationCount={stats.pendingAlerts} />

      {showCategoryRequiredModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="category-required-title">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 px-6 pb-6 pt-7">
              <button type="button" onClick={() => setShowCategoryRequiredModal(false)} aria-label="Close popup"
                className="absolute right-4 top-4 rounded-full p-2 text-slate-500 transition-colors hover:bg-white/80 hover:text-slate-800">
                <FiX className="h-5 w-5" />
              </button>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/25">
                <FiBriefcase className="h-6 w-6" />
              </div>
              <h2 id="category-required-title" className="pr-8 text-xl font-black text-slate-900">Add a service category</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Choose at least one service category to start receiving booking requests from customers.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 px-6 py-6 sm:grid-cols-2">
              <button type="button" onClick={() => setShowCategoryRequiredModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50">
                Not now
              </button>
              <button type="button" onClick={() => {
                setShowCategoryRequiredModal(false);
                navigate('/vendor/your-services');
              }}
                className="rounded-xl px-4 py-3 font-bold text-white shadow-lg transition-colors hover:brightness-95"
                style={{ backgroundColor: themeColors.button }}>
                Add category
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="pt-0">
        {/* Profile Card Section */}
        <div className="px-4 pt-2.5 pb-1">
          <div
            className="rounded-[20px] p-3.5 cursor-pointer active:scale-[0.99] transition-all duration-200 relative overflow-hidden shadow-xs hover:shadow-sm"
            onClick={() => navigate('/vendor/profile')}
            style={{
              background: 'linear-gradient(135deg, #18414b 0%, #245865 50%, #347989 100%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            {/* Subtle Ambient Radial Highlight */}
            <div
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)',
              }}
            />

            <div className="relative z-10 flex items-center justify-between gap-2.5">
              {/* Left: Avatar & Info */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* Profile Photo with Online Indicator */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/80 shadow-xs bg-white/10 flex items-center justify-center">
                    {vendorProfile.photo ? (
                      <img
                        src={vendorProfile.photo}
                        alt={vendorProfile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser className="w-6 h-6 text-white" />
                    )}
                  </div>
                  {/* Status dot indicator */}
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white shadow-xs transition-colors ${
                      isOnline ? 'bg-emerald-400' : 'bg-gray-400'
                    }`}
                  />
                </div>

                {/* Profile Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-teal-200/90 bg-white/15 px-1.5 py-0.5 rounded-full backdrop-blur-xs">
                      WELCOME
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        isOnline
                          ? 'bg-emerald-400/20 text-emerald-300'
                          : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      {isOnline ? '● Online' : '○ Offline'}
                    </span>
                  </div>
                  <h2 className="text-sm font-black text-white truncate mt-0.5 leading-tight">
                    {vendorProfile.name}
                  </h2>
                  <p className="text-[11px] text-teal-100/80 truncate font-medium mt-0.5">
                    {vendorProfile.businessName || 'Homster Verified Partner'}
                  </p>
                </div>
              </div>

              {/* Right: Online Toggle & Profile Link */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Online Toggle Switch */}
                <button
                  type="button"
                  onClick={handleToggleOnline}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center shadow-inner cursor-pointer ${
                    isOnline ? 'bg-emerald-500' : 'bg-white/20'
                  }`}
                  aria-label="Toggle Online Status"
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                      isOnline ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>

                {/* Profile Arrow */}
                <div className="w-7 h-7 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
                  <FiChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Incomplete Profile Prompt */}
        {!hasBookingCategory && (
          <div className="px-4 pt-2 -mb-2">
            <div
              onClick={() => navigate('/vendor/your-services')}
              className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-r shadow-xs cursor-pointer hover:bg-orange-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiClock className="h-4 w-4 text-orange-500" />
                </div>
                <div className="ml-2.5">
                  <p className="text-xs font-bold text-orange-700">Profile Incomplete</p>
                  <p className="text-[11px] text-orange-600">
                    Add services to your profile to start receiving bookings.
                  </p>
                </div>
                <div className="ml-auto">
                  <FiArrowRight className="h-4 w-4 text-orange-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards - Optimized Component */}
        <StatsCards stats={stats} />

        {/* Content Section (below gradient) */}
        <div className="px-4 py-3 space-y-3.5">
          {/* Pending Booking Alerts - Optimized Component */}
          <PendingBookings
            bookings={pendingBookings}
            maxSearchTimeMins={globalConfig.maxSearchTime}
            setPendingBookings={setPendingBookings}
            setActiveAlertBooking={(booking) => {
              // Dispatch to global alert via CustomEvent
              window.dispatchEvent(new CustomEvent('showDashboardBookingAlert', { detail: booking }));
            }}
          />

          {/* Performance & Quick Hub */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-500">Performance & Rating</h2>
              <button
                onClick={() => navigate('/vendor/my-ratings')}
                className="text-[11px] font-bold text-teal-750 hover:underline flex items-center gap-0.5"
                style={{ color: themeColors.button }}
              >
                View Ratings <FiChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Performance Overview Card */}
            <div className="bg-white rounded-[20px] p-3.5 border border-gray-100 shadow-xs space-y-3">
              <div className="grid grid-cols-2 divide-x divide-gray-100">
                {/* Rating Column */}
                <div
                  className="pr-3.5 cursor-pointer active:scale-98 transition-all"
                  onClick={() => navigate('/vendor/my-ratings')}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-gray-500 text-[11px] font-semibold">
                    <FiStar className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Customer Rating</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-gray-900">
                      {stats.rating > 0 ? stats.rating.toFixed(1) : '3.8'}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">/ 5.0</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-600">
                    <FiCheckCircle className="w-3 h-3" />
                    <span>Good Standing</span>
                  </div>
                </div>

                {/* Fulfillment Column */}
                <div
                  className="pl-3.5 cursor-pointer active:scale-98 transition-all"
                  onClick={() => navigate('/vendor/jobs?tab=completed')}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-gray-500 text-[11px] font-semibold">
                    <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Completed Jobs</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-gray-900">
                      {stats.completedJobs || 0}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">Jobs Done</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-teal-700">
                    <FiTrendingUp className="w-3 h-3" />
                    <span>100% Fulfillment</span>
                  </div>
                </div>
              </div>

              {/* Quick Action Shortcuts inside Performance Hub */}
              <div className="pt-2 border-t border-gray-100 grid grid-cols-3 gap-2">
                <button
                  onClick={() => navigate('/vendor/pricing')}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-teal-50/50 active:scale-95 transition-all text-center border border-gray-200/60 flex flex-col items-center gap-1 shadow-xs"
                >
                  <span className="text-sm">🏷️</span>
                  <span className="text-[9px] font-extrabold text-gray-800 tracking-tight">Rate Card</span>
                </button>

                <button
                  onClick={() => navigate('/vendor/jobs')}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-teal-50/50 active:scale-95 transition-all text-center border border-gray-200/60 flex flex-col items-center gap-1 shadow-xs"
                >
                  <span className="text-sm">💼</span>
                  <span className="text-[9px] font-extrabold text-gray-800 tracking-tight">Active Jobs</span>
                </button>

                <button
                  onClick={() => navigate('/vendor/workers')}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-teal-50/50 active:scale-95 transition-all text-center border border-gray-200/60 flex flex-col items-center gap-1 shadow-xs"
                >
                  <span className="text-sm">👥</span>
                  <span className="text-[9px] font-extrabold text-gray-800 tracking-tight">Workers</span>
                </button>
              </div>
            </div>
          </div>

          {/* Refer & Earn Promotional Card */}
          {globalConfig.vendorReferralEnabled !== false && (
            <div
              onClick={() => navigate('/vendor/refer-earn')}
              className="rounded-[20px] p-3.5 bg-gradient-to-r from-[#1b4450] via-[#245866] to-[#347989] text-white shadow-xs hover:shadow-sm cursor-pointer active:scale-98 transition-all relative overflow-hidden flex items-center justify-between border border-teal-500/20"
            >
              <div className="flex items-center gap-3 z-10">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner border border-amber-300/30">
                  <FiGift className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[8px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded-full border border-amber-300/20">
                    REFER & EARN
                  </span>
                  <h3 className="text-xs font-black text-white mt-0.5 leading-snug">
                    Invite Vendors & Earn ₹{globalConfig.referralReward || stats.referralReward || 100}
                  </h3>
                  <p className="text-[10px] text-teal-100/80 font-medium mt-0.5">
                    Instant cash reward credited directly into your wallet
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white z-10 shrink-0 ml-2">
                <FiChevronRight className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Recent Jobs - List View */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-sm font-black text-gray-900 tracking-tight">Active Jobs</h2>
              {recentJobs.length > 0 && (
                <button
                  onClick={() => navigate('/vendor/jobs')}
                  className="px-3 py-1 rounded-lg font-bold text-xs transition-all duration-300 active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.button} 0%, ${themeColors.button}dd 100%)`,
                    color: '#FFFFFF',
                    boxShadow: `0 3px 10px ${hexToRgba(themeColors.button, 0.25)}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
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

    </div>
  );
});

export default Dashboard;
