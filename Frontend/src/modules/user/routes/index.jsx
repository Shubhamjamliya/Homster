import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import PageTransition from '../components/common/PageTransition';
import BottomNav from '../components/layout/BottomNav';
import ErrorBoundary from '../components/common/ErrorBoundary';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import PublicRoute from '../../../components/auth/PublicRoute';
import useAppNotifications from '../../../hooks/useAppNotifications.jsx';

// Lazy load wrapper with error handling
const lazyLoad = (importFunc) => {
  return lazy(() => {
    return Promise.resolve(importFunc()).catch((error) => {
      console.error('Failed to load user page:', error);
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

// Lazy load all user pages for code splitting with error handling
const Home = lazyLoad(() => import('../pages/Home'));
const Rewards = lazyLoad(() => import('../pages/Rewards'));
const Account = lazyLoad(() => import('../pages/Account'));
const Native = lazyLoad(() => import('../pages/Native'));
const Cart = lazyLoad(() => import('../pages/Cart'));
const Checkout = lazyLoad(() => import('../pages/Checkout'));
const MyBookings = lazyLoad(() => import('../pages/MyBookings'));
const BookingDetails = lazyLoad(() => import('../pages/BookingDetails'));
const BookingTrack = lazyLoad(() => import('../pages/BookingTrack'));
const BookingConfirmation = lazyLoad(() => import('../pages/BookingConfirmation'));
const Settings = lazyLoad(() => import('../pages/Settings'));
const ManagePaymentMethods = lazyLoad(() => import('../pages/ManagePaymentMethods'));
const ManageAddresses = lazyLoad(() => import('../pages/ManageAddresses'));
const MySubscription = lazyLoad(() => import('../pages/MySubscription'));
const Wallet = lazyLoad(() => import('../pages/Wallet'));
const MyPlan = lazyLoad(() => import('../pages/MyPlan'));
const MyRating = lazyLoad(() => import('../pages/MyRating'));
const AboutAppzeto = lazyLoad(() => import('../pages/AboutAppzeto'));
const UpdateProfile = lazyLoad(() => import('../pages/UpdateProfile'));
const Login = lazyLoad(() => import('../pages/login'));
const Signup = lazyLoad(() => import('../pages/signup'));
const ServiceDynamic = lazyLoad(() => import('../pages/ServiceDynamic'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-white">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#00a6a6' }}></div>
      <p className="text-gray-600 text-sm">Loading...</p>
    </div>
  </div>
);

const UserRoutes = () => {
  const location = useLocation();

  // Enable global notifications for user
  useAppNotifications('user');

  // Pages where BottomNav should be shown
  const bottomNavPages = ['/user', '/user/', '/user/rewards', '/user/cart', '/user/account'];
  const shouldShowBottomNav = bottomNavPages.includes(location.pathname);

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <PageTransition>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<PublicRoute userType="user"><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute userType="user"><Signup /></PublicRoute>} />

            {/* Public pages (no auth required) */}
            <Route path="/" element={<Home />} />
            <Route path="/native" element={<Native />} />
            {/* All service pages now use ServiceDynamic component */}
            {/* <Route path="/ac-service" element={<ACService />} /> */}
            {/* <Route path="/salon-for-women" element={<SalonForWomen />} /> */}
            {/* <Route path="/massage-for-men" element={<MassageForMen />} /> */}
            {/* <Route path="/bathroom-kitchen-cleaning" element={<BathroomKitchenCleaning />} /> */}
            {/* <Route path="/sofa-carpet-cleaning" element={<SofaCarpetCleaning />} /> */}
            {/* <Route path="/electrician" element={<Electrician />} /> */}
            <Route path="/:slug" element={<ServiceDynamic />} />

            {/* Protected routes (auth required) */}
            <Route path="/rewards" element={<ProtectedRoute userType="user"><Rewards /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute userType="user"><Account /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute userType="user"><Cart /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute userType="user"><Checkout /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute userType="user"><MyBookings /></ProtectedRoute>} />
            <Route path="/booking/:id" element={<ProtectedRoute userType="user"><BookingDetails /></ProtectedRoute>} />
            <Route path="/booking/:id/track" element={<ProtectedRoute userType="user"><BookingTrack /></ProtectedRoute>} />
            <Route path="/booking-confirmation/:id" element={<ProtectedRoute userType="user"><BookingConfirmation /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute userType="user"><Settings /></ProtectedRoute>} />
            <Route path="/manage-payment-methods" element={<ProtectedRoute userType="user"><ManagePaymentMethods /></ProtectedRoute>} />
            <Route path="/manage-addresses" element={<ProtectedRoute userType="user"><ManageAddresses /></ProtectedRoute>} />
            <Route path="/my-subscription" element={<ProtectedRoute userType="user"><MySubscription /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute userType="user"><Wallet /></ProtectedRoute>} />
            <Route path="/my-plan" element={<ProtectedRoute userType="user"><MyPlan /></ProtectedRoute>} />
            <Route path="/my-rating" element={<ProtectedRoute userType="user"><MyRating /></ProtectedRoute>} />
            <Route path="/about-appzeto" element={<ProtectedRoute userType="user"><AboutAppzeto /></ProtectedRoute>} />
            <Route path="/update-profile" element={<ProtectedRoute userType="user"><UpdateProfile /></ProtectedRoute>} />
          </Routes>
        </PageTransition>
      </Suspense>
      {shouldShowBottomNav && <BottomNav />}
    </ErrorBoundary>
  );
};

export default UserRoutes;

