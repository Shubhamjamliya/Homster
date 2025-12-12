import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { autoInitDummyData } from '../utils/initDummyData';
// Import test helpers (makes window.initVendorData() available)
import '../utils/testDummyData';
import PageTransition from '../components/common/PageTransition';
import BottomNav from '../components/layout/BottomNav';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Lazy load vendor pages for code splitting with error handling
const lazyLoad = (importFunc) => {
  return lazy(() => {
    return Promise.resolve(importFunc()).catch((error) => {
      console.error('Failed to load vendor page:', error);
      // Return a fallback component wrapped in a Promise
      return Promise.resolve({
        default: () => (
          <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="text-center p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Failed to load page</h2>
              <p className="text-gray-600 mb-4">Please refresh the page or try again later.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:opacity-90"
                style={{ backgroundColor: '#00a6a6' }}
              >
                Refresh Page
              </button>
            </div>
          </div>
        ),
      });
    });
  });
};

const Dashboard = lazyLoad(() => import('../pages/Dashboard'));
const BookingAlert = lazyLoad(() => import('../pages/BookingAlert'));
const BookingDetails = lazyLoad(() => import('../pages/BookingDetails'));
const BookingTimeline = lazyLoad(() => import('../pages/BookingTimeline'));
const ActiveJobs = lazyLoad(() => import('../pages/ActiveJobs'));
const WorkersList = lazyLoad(() => import('../pages/WorkersList'));
const AddEditWorker = lazyLoad(() => import('../pages/AddEditWorker'));
const AssignWorker = lazyLoad(() => import('../pages/AssignWorker'));
const Earnings = lazyLoad(() => import('../pages/Earnings'));
const Wallet = lazyLoad(() => import('../pages/Wallet'));
const WithdrawalRequest = lazyLoad(() => import('../pages/WithdrawalRequest'));
const Profile = lazyLoad(() => import('../pages/Profile'));
const ProfileDetails = lazyLoad(() => import('../pages/Profile/ProfileDetails'));
const EditProfile = lazyLoad(() => import('../pages/Profile/EditProfile'));
const Settings = lazyLoad(() => import('../pages/Settings'));
const Notifications = lazyLoad(() => import('../pages/Notifications'));

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
  // Initialize dummy data when vendor routes load
  useEffect(() => {
    try {
      autoInitDummyData();
    } catch (error) {
      console.error('Failed to initialize vendor data:', error);
      // Try to initialize again after a delay
      setTimeout(() => {
        try {
          autoInitDummyData();
        } catch (retryError) {
          console.error('Retry failed to initialize vendor data:', retryError);
        }
      }, 500);
    }
  }, []);

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <PageTransition>
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/booking-alert/:id" element={<BookingAlert />} />
            <Route path="/booking/:id" element={<BookingDetails />} />
            <Route path="/booking/:id/timeline" element={<BookingTimeline />} />
            <Route path="/jobs" element={<ActiveJobs />} />
            <Route path="/workers" element={<WorkersList />} />
            <Route path="/workers/add" element={<AddEditWorker />} />
            <Route path="/workers/:id/edit" element={<AddEditWorker />} />
            <Route path="/booking/:id/assign-worker" element={<AssignWorker />} />
            <Route path="/earnings" element={<Earnings />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/wallet/withdraw" element={<WithdrawalRequest />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/details" element={<ProfileDetails />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </PageTransition>
      </Suspense>
      <BottomNav />
    </ErrorBoundary>
  );
};

export default VendorRoutes;

