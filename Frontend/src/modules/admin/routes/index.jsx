import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import PublicRoute from '../../../components/auth/PublicRoute';
import useAppNotifications from '../../../hooks/useAppNotifications.jsx';

// Login page (not lazy loaded for faster initial access)
import Login from '../pages/login';

// Lazy load admin pages for code splitting
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Settings = lazy(() => import('../pages/Settings'));
const UserCategories = lazy(() => import('../pages/UserCategories'));
const Users = lazy(() => import('../pages/Users'));
const Vendors = lazy(() => import('../pages/Vendors'));
const Workers = lazy(() => import('../pages/Workers'));
const Bookings = lazy(() => import('../pages/Bookings'));
const Payments = lazy(() => import('../pages/Payments'));
const Reports = lazy(() => import('../pages/Reports'));
const Notifications = lazy(() => import('../pages/Notifications'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p className="text-gray-600 text-sm">Loading...</p>
    </div>
  </div>
);

const AdminRoutes = () => {
  // Enable global notifications for admin
  useAppNotifications('admin');

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Login route - outside of layout (public) */}
        <Route path="/login" element={<PublicRoute userType="admin"><Login /></PublicRoute>} />

        {/* Protected routes - inside layout */}
        <Route path="/" element={
          <ProtectedRoute userType="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users/*" element={<Users />} />
          <Route path="vendors/*" element={<Vendors />} />
          <Route path="workers/*" element={<Workers />} />
          <Route path="bookings/*" element={<Bookings />} />
          <Route path="user-categories/*" element={<UserCategories />} />
          <Route path="payments/*" element={<Payments />} />
          <Route path="reports/*" element={<Reports />} />
          <Route path="notifications/*" element={<Notifications />} />
          <Route path="settings/*" element={<Settings />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;

