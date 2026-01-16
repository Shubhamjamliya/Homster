import { useState } from 'react';
import { FiMenu, FiBell, FiLogOut } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../Button';
import NotificationWindow from './NotificationWindow';
import { adminAuthService } from '../../../../services/authService';

const AdminHeader = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await adminAuthService.logout();
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local storage and redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('adminData');
      toast.success('Logged out successfully');
      navigate('/admin/login');
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Get page info from pathname
  const getPageInfo = (pathname) => {
    const mappings = [
      { path: '/admin/dashboard', title: 'Dashboard', description: "Welcome back! Here's your business overview." },
      { path: '/admin/users/all', title: 'All Users', description: 'Manage platform customers and their activity' },
      { path: '/admin/users/bookings', title: 'User Bookings', description: 'Track customer booking history' },
      { path: '/admin/users/analytics', title: 'User Analytics', description: 'Analyze customer behavior and growth' },
      { path: '/admin/users/transactions', title: 'User Transactions', description: 'Monitor customer financial transactions' },
      { path: '/admin/users', title: 'Users', description: 'Manage platform customers and their activity' },
      { path: '/admin/vendors/all', title: 'All Vendors', description: 'Manage platform vendors and their activity' },
      { path: '/admin/vendors/analytics', title: 'Vendor Analytics', description: 'Analyze vendor performance' },
      { path: '/admin/vendors', title: 'Vendors', description: 'Manage vendor registrations and performance' },
      { path: '/admin/workers/all', title: 'All Workers', description: 'Manage platform workers and their activity' },
      { path: '/admin/workers/analytics', title: 'Worker Analytics', description: 'Analyze worker performance' },
      { path: '/admin/workers', title: 'Workers', description: 'Monitor and manage platform workers' },
      { path: '/admin/bookings', title: 'Bookings', description: 'Track and manage service bookings' },
      { path: '/admin/bookings/notifications', title: 'Order Notifications', description: 'Track booking alerts and updates' },
      { path: '/admin/user-categories', title: 'Service Catalog', description: 'Manage platform services and categories' },
      { path: '/admin/payments/users', title: 'User Transactions', description: 'Monitor customer financial transactions' },
      { path: '/admin/payments/vendors', title: 'Vendor Transactions', description: 'Monitor vendor earnings and payouts' },
      { path: '/admin/payments/workers', title: 'Worker Payments', description: 'Monitor and manage worker earnings and payouts' },
      { path: '/admin/payments/revenue', title: 'Admin Revenue', description: 'Track platform commissions and income' },
      { path: '/admin/payments/reports', title: 'Payment Report', description: 'Analyze payment data and financial insights' },
      { path: '/admin/payments', title: 'Payments & Settlements', description: 'Monitor transactions and revenue' },
      { path: '/admin/reports', title: 'Reports', description: 'Analyze platform performance with data insights' },
      { path: '/admin/notifications', title: 'Notifications', description: 'Stay updated with platform activities' },
      { path: '/admin/settings', title: 'Settings', description: 'Configure platform preferences' },
      { path: '/admin/plans', title: 'Subscription Plans', description: 'Manage service subscription plans' },
      { path: '/admin/services', title: 'Services', description: 'Manage platform service categories' },
      { path: '/admin/services', title: 'Services', description: 'Manage platform service categories' },
      { path: '/admin/settlements/pending', title: 'Pending Settlements', description: 'Review and approve vendor cash settlements' },
      { path: '/admin/settlements/withdrawals', title: 'Withdrawal Requests', description: 'Manage vendor payout requests' },
      { path: '/admin/settlements/vendors', title: 'Vendor Balances', description: 'Monitor vendor dues and credit limits' },
      { path: '/admin/settlements/history', title: 'Settlement History', description: 'View past transaction records' },
      { path: '/admin/settlements', title: 'Settlements', description: 'Manage financial settlements' },
      { path: '/admin/reviews', title: 'Reviews', description: 'Manage platform reviews and ratings' },
      { path: '/admin/scrap', title: 'Scrap Orders', description: 'Manage platform scrap collection orders' },
    ];

    const match = mappings.find(m => pathname === m.path || pathname.startsWith(m.path + '/'));

    if (match) return match;

    const path = pathname.split('/').pop() || 'dashboard';
    return {
      title: path.charAt(0).toUpperCase() + path.slice(1),
      description: `Manage your ${path} here.`
    };
  };

  const { title, description } = getPageInfo(location.pathname);

  return (
    <header
      className="bg-white fixed top-0 left-0 right-0 z-30 transition-all duration-300 lg:left-[278px] border-b border-gray-100 shadow-sm"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="flex items-center justify-between px-4 lg:px-6 py-6">
        {/* Left: Menu Button & Page Title */}
        <div className="flex items-center gap-4">
          <Button
            onClick={onMenuClick}
            variant="icon"
            className="lg:hidden text-gray-700"
            icon={FiMenu}
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{title}</h1>
            <p className="text-[10px] sm:text-xs text-gray-500 font-medium">{description}</p>
          </div>
        </div>

        {/* Right: Notifications & Logout */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <Button
              data-notification-button
              onClick={toggleNotifications}
              variant="icon"
              className="text-gray-700"
              icon={FiBell}
            />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>

            <NotificationWindow
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              position="right"
            />
          </div>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="ghost"
            icon={FiLogOut}
            size="sm"
            className="text-gray-700 hover:bg-red-600 hover:text-white hover:border-red-600 border border-gray-300"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

