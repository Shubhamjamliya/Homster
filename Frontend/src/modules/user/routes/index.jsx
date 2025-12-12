import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import PageTransition from '../components/common/PageTransition';
import BottomNav from '../components/layout/BottomNav';
import ErrorBoundary from '../components/common/ErrorBoundary';

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
const ACService = lazyLoad(() => import('../pages/ACService'));
const Cart = lazyLoad(() => import('../pages/Cart'));
const Checkout = lazyLoad(() => import('../pages/Checkout'));
const SalonForWomen = lazyLoad(() => import('../pages/SalonForWomen'));
const MassageForMen = lazyLoad(() => import('../pages/MassageForMen'));
const BathroomKitchenCleaning = lazyLoad(() => import('../pages/BathroomKitchenCleaning'));
const SofaCarpetCleaning = lazyLoad(() => import('../pages/SofaCarpetCleaning'));
const Electrician = lazyLoad(() => import('../pages/Electrician'));
const MyBookings = lazyLoad(() => import('../pages/MyBookings'));
const BookingDetails = lazyLoad(() => import('../pages/BookingDetails'));
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
  
  // Pages where BottomNav should be shown
  const bottomNavPages = ['/user', '/user/', '/user/rewards', '/user/cart', '/user/account'];
  const shouldShowBottomNav = bottomNavPages.includes(location.pathname);

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/account" element={<Account />} />
            <Route path="/native" element={<Native />} />
            <Route path="/ac-service" element={<ACService />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/salon-for-women" element={<SalonForWomen />} />
            <Route path="/massage-for-men" element={<MassageForMen />} />
            <Route path="/bathroom-kitchen-cleaning" element={<BathroomKitchenCleaning />} />
            <Route path="/sofa-carpet-cleaning" element={<SofaCarpetCleaning />} />
            <Route path="/electrician" element={<Electrician />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/booking/:id" element={<BookingDetails />} />
            <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/manage-payment-methods" element={<ManagePaymentMethods />} />
            <Route path="/manage-addresses" element={<ManageAddresses />} />
            <Route path="/my-subscription" element={<MySubscription />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/my-plan" element={<MyPlan />} />
            <Route path="/my-rating" element={<MyRating />} />
            <Route path="/about-appzeto" element={<AboutAppzeto />} />
            <Route path="/update-profile" element={<UpdateProfile />} />
          </Routes>
        </PageTransition>
      </Suspense>
      {shouldShowBottomNav && <BottomNav />}
    </ErrorBoundary>
  );
};

export default UserRoutes;

