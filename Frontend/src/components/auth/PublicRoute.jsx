import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Public Route Component
 * Redirects to dashboard if user is already authenticated
 */
const PublicRoute = ({ children, userType = 'user', redirectTo = null }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      let userData = null;

      // Check for user data based on userType
      switch (userType) {
        case 'user':
          userData = localStorage.getItem('userData');
          break;
        case 'vendor':
          userData = localStorage.getItem('vendorData');
          break;
        case 'worker':
          userData = localStorage.getItem('workerData');
          break;
        case 'admin':
          userData = localStorage.getItem('adminData');
          break;
        default:
          userData = localStorage.getItem('userData');
      }

      if (token && userData) {
        try {
          // Decode JWT token to check expiry and role
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const currentTime = Date.now() / 1000;

            // Check if token is expired
            if (!payload.exp || payload.exp <= currentTime) {
              // Clear expired tokens
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              if (userType === 'user') localStorage.removeItem('userData');
              if (userType === 'vendor') localStorage.removeItem('vendorData');
              if (userType === 'worker') localStorage.removeItem('workerData');
              if (userType === 'admin') localStorage.removeItem('adminData');
              setIsAuthenticated(false);
              return;
            }

            // Check if token role matches expected userType
            const roleMap = {
              user: 'user',
              vendor: 'vendor',
              worker: 'worker',
              admin: 'admin'
            };

            if (payload.role === roleMap[userType]) {
              setIsAuthenticated(true);
            } else {
              // Wrong role, clear tokens
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              if (userType === 'user') localStorage.removeItem('userData');
              if (userType === 'vendor') localStorage.removeItem('vendorData');
              if (userType === 'worker') localStorage.removeItem('workerData');
              if (userType === 'admin') localStorage.removeItem('adminData');
              setIsAuthenticated(false);
            }
          } else {
            // Invalid token format, clear it
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            if (userType === 'user') localStorage.removeItem('userData');
            if (userType === 'vendor') localStorage.removeItem('vendorData');
            if (userType === 'worker') localStorage.removeItem('workerData');
            if (userType === 'admin') localStorage.removeItem('adminData');
            setIsAuthenticated(false);
          }
        } catch (error) {
          // Invalid token, clear it
          console.error('Token validation error:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          if (userType === 'user') localStorage.removeItem('userData');
          if (userType === 'vendor') localStorage.removeItem('vendorData');
          if (userType === 'worker') localStorage.removeItem('workerData');
          if (userType === 'admin') localStorage.removeItem('adminData');
          setIsAuthenticated(false);
        }
      } else {
        // Clear any leftover tokens that don't match userType
        const hasToken = localStorage.getItem('accessToken');
        const hasUserData = localStorage.getItem(userType + 'Data') || localStorage.getItem('userData');

        if (hasToken && !hasUserData) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }

        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [userType, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#00a6a6' }}></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Determine redirect path
    const defaultRedirects = {
      user: '/user',
      vendor: '/vendor/dashboard',
      worker: '/worker/dashboard',
      admin: '/admin/dashboard'
    };
    
    const redirectPath = redirectTo || defaultRedirects[userType] || '/user';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default PublicRoute;

