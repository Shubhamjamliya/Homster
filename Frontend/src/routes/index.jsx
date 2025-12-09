import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load all pages for code splitting
const Home = lazy(() => import('../pages/Home'));
const Rewards = lazy(() => import('../pages/Rewards'));
const Account = lazy(() => import('../pages/Account'));
const Native = lazy(() => import('../pages/Native'));
const ACService = lazy(() => import('../pages/ACService'));
const Cart = lazy(() => import('../pages/Cart'));
const Checkout = lazy(() => import('../pages/Checkout'));
const SalonForWomen = lazy(() => import('../pages/SalonForWomen'));
const MassageForMen = lazy(() => import('../pages/MassageForMen'));
const BathroomKitchenCleaning = lazy(() => import('../pages/BathroomKitchenCleaning'));
const SofaCarpetCleaning = lazy(() => import('../pages/SofaCarpetCleaning'));
const Electrician = lazy(() => import('../pages/Electrician'));
const MyBookings = lazy(() => import('../pages/MyBookings'));
const BookingDetails = lazy(() => import('../pages/BookingDetails'));
const BookingConfirmation = lazy(() => import('../pages/BookingConfirmation'));
const Settings = lazy(() => import('../pages/Settings'));
const ManagePaymentMethods = lazy(() => import('../pages/ManagePaymentMethods'));
const ManageAddresses = lazy(() => import('../pages/ManageAddresses'));
const MySubscription = lazy(() => import('../pages/MySubscription'));
const Wallet = lazy(() => import('../pages/Wallet'));
const MyPlan = lazy(() => import('../pages/MyPlan'));
const MyRating = lazy(() => import('../pages/MyRating'));
const AboutAppzeto = lazy(() => import('../pages/AboutAppzeto'));
const UpdateProfile = lazy(() => import('../pages/UpdateProfile'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #FCD34D 0%, #FDE68A 50%, #FFFFFF 100%)' }}>
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      <p className="text-gray-600 text-sm">Loading...</p>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
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
    </Suspense>
  );
};

export default AppRoutes;

