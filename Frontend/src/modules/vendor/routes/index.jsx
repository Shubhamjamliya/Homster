import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PageTransition from '../components/common/PageTransition';
import BottomNav from '../components/layout/BottomNav';
import ErrorBoundary from '../components/common/ErrorBoundary';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import PublicRoute from '../../../components/auth/PublicRoute';
// import useAppNotifications from '../../../hooks/useAppNotifications.jsx'; // Handled globally

// Lazy load vendor pages for code splitting
const Login = lazy(() => import('../pages/login'));
const Signup = lazy(() => import('../pages/signup'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const BookingAlert = lazy(() => import('../pages/BookingAlert'));
const BookingAlerts = lazy(() => import('../pages/BookingAlerts'));
const BookingDetails = lazy(() => import('../pages/BookingDetails'));
const BookingTimeline = lazy(() => import('../pages/BookingTimeline'));
const ActiveJobs = lazy(() => import('../pages/ActiveJobs'));
const WorkersList = lazy(() => import('../pages/WorkersList'));
const AddEditWorker = lazy(() => import('../pages/AddEditWorker'));
const AssignWorker = lazy(() => import('../pages/AssignWorker'));
const Earnings = lazy(() => import('../pages/Earnings'));
const Wallet = lazy(() => import('../pages/Wallet'));
const WithdrawalRequest = lazy(() => import('../pages/WithdrawalRequest'));
const Profile = lazy(() => import('../pages/Profile'));
const ProfileDetails = lazy(() => import('../pages/Profile/ProfileDetails'));
const EditProfile = lazy(() => import('../pages/Profile/EditProfile'));
const BookingMap = lazy(() => import('../pages/BookingMap'));
const Settings = lazy(() => import('../pages/Settings'));
const AddressManagement = lazy(() => import('../pages/AddressManagement'));
const Notifications = lazy(() => import('../pages/Notifications'));
const Scrap = lazy(() => import('../pages/Scrap'));
const SettlementRequest = lazy(() => import('../pages/Wallet/SettlementRequest'));
const SettlementHistory = lazy(() => import('../pages/Wallet/SettlementHistory'));
const MyRatings = lazy(() => import('../pages/MyRatings'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-white">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#00a6a6' }}></div>
      <p className="text-gray-600 text-sm">Loading...</p>
    </div>
  </div>
);

const VendorRoutes = () => {
  const location = useLocation();

  // Check if current route should hide bottom nav (auth routes or map)
  // Check if current route should hide bottom nav (auth routes or map or booking alert)
  const shouldHideBottomNav = location.pathname === '/vendor/login' ||
    location.pathname === '/vendor/signup' ||
    location.pathname.endsWith('/map') ||
    location.pathname.includes('/booking-alert/');

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <PageTransition>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<PublicRoute userType="vendor"><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute userType="vendor"><Signup /></PublicRoute>} />

            {/* Protected routes (auth required) */}
            <Route path="/" element={<ProtectedRoute userType="vendor"><Navigate to="dashboard" replace /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute userType="vendor"><Dashboard /></ProtectedRoute>} />
            <Route path="/booking-alerts" element={<ProtectedRoute userType="vendor"><BookingAlerts /></ProtectedRoute>} />
            <Route path="/booking-alert/:id" element={<ProtectedRoute userType="vendor"><BookingAlert /></ProtectedRoute>} />
            <Route path="/booking/:id" element={<ProtectedRoute userType="vendor"><BookingDetails /></ProtectedRoute>} />
            <Route path="/booking/:id/map" element={<ProtectedRoute userType="vendor"><BookingMap /></ProtectedRoute>} />
            <Route path="/booking/:id/timeline" element={<ProtectedRoute userType="vendor"><BookingTimeline /></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute userType="vendor"><ActiveJobs /></ProtectedRoute>} />
            <Route path="/workers" element={<ProtectedRoute userType="vendor"><WorkersList /></ProtectedRoute>} />
            <Route path="/workers/add" element={<ProtectedRoute userType="vendor"><AddEditWorker /></ProtectedRoute>} />
            <Route path="/workers/:id/edit" element={<ProtectedRoute userType="vendor"><AddEditWorker /></ProtectedRoute>} />
            <Route path="/booking/:id/assign-worker" element={<ProtectedRoute userType="vendor"><AssignWorker /></ProtectedRoute>} />
            <Route path="/earnings" element={<ProtectedRoute userType="vendor"><Earnings /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute userType="vendor"><Wallet /></ProtectedRoute>} />
            <Route path="/wallet/withdraw" element={<ProtectedRoute userType="vendor"><WithdrawalRequest /></ProtectedRoute>} />
            <Route path="/wallet/settle" element={<ProtectedRoute userType="vendor"><SettlementRequest /></ProtectedRoute>} />
            <Route path="/wallet/settlements" element={<ProtectedRoute userType="vendor"><SettlementHistory /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute userType="vendor"><Profile /></ProtectedRoute>} />
            <Route path="/profile/details" element={<ProtectedRoute userType="vendor"><ProfileDetails /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute userType="vendor"><EditProfile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute userType="vendor"><Settings /></ProtectedRoute>} />
            <Route path="/address-management" element={<ProtectedRoute userType="vendor"><AddressManagement /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute userType="vendor"><Notifications /></ProtectedRoute>} />
            <Route path="/scrap" element={<ProtectedRoute userType="vendor"><Scrap /></ProtectedRoute>} />
            <Route path="/my-ratings" element={<ProtectedRoute userType="vendor"><MyRatings /></ProtectedRoute>} />
          </Routes>
        </PageTransition>
      </Suspense>
      {!shouldHideBottomNav && <BottomNav />}
    </ErrorBoundary>
  );
};

export default VendorRoutes;
