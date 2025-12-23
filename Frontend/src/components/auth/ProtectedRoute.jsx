import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

/**
 * Protected Route Component
 * Checks if user is authenticated before allowing access
 */
const ProtectedRoute = ({ children, userType = 'user', redirectTo = null }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      let tokenKey = 'accessToken';
      let refreshTokenKey = 'refreshToken';
      let dataKey = 'userData';

      // Determine keys based on userType
      switch (userType) {
        case 'vendor':
          tokenKey = 'vendorAccessToken';
          refreshTokenKey = 'vendorRefreshToken';
          dataKey = 'vendorData';
          break;
        case 'worker':
          tokenKey = 'workerAccessToken';
          refreshTokenKey = 'workerRefreshToken';
          dataKey = 'workerData';
          break;
        case 'admin':
          tokenKey = 'adminAccessToken';
          refreshTokenKey = 'adminRefreshToken';
          dataKey = 'adminData';
          break;
        case 'user':
        default:
          tokenKey = 'accessToken';
          refreshTokenKey = 'refreshToken';
          dataKey = 'userData';
          break;
      }

      const token = localStorage.getItem(tokenKey);
      const userData = localStorage.getItem(dataKey);

      // If token exists, verify it's not expired (basic check)
      if (token && userData) {
        try {
          // Decode JWT token to check expiry (basic check without verification)
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const currentTime = Date.now() / 1000;

            if (payload.exp && payload.exp > currentTime) {
              setIsAuthenticated(true);
            } else {
              // Token expired
              console.log('Token expired, clearing auth data for:', userType);
              localStorage.removeItem(tokenKey);
              localStorage.removeItem(refreshTokenKey);
              localStorage.removeItem(dataKey);
              setIsAuthenticated(false);
              toast.error('Session expired. Please login again.');
            }
          } else {
            // Invalid token format
            setIsAuthenticated(false);
          }
        } catch (error) {
          // Invalid token format
          console.error('Token validation error:', error);
          setIsAuthenticated(false);
        }
      } else {
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
          <p className="text-gray-600 text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    // Determine redirect path
    const defaultRedirects = {
      user: '/user/login',
      vendor: '/vendor/login',
      worker: '/worker/login',
      admin: '/admin/login'
    };

    const redirectPath = redirectTo || defaultRedirects[userType] || '/user/login';

    // Toast removed from render phase to prevent "Cannot update a component while rendering" error
    // If you need a toast, trigger it in useEffect before setting isAuthenticated(false) or rely on LoginPage to show "Please login"

    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

