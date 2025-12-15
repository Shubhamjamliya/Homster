import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiBriefcase, FiUsers, FiShoppingBag, FiDollarSign, FiActivity } from 'react-icons/fi';
import RevenueLineChart from '../../components/dashboard/RevenueLineChart';
import BookingsBarChart from '../../components/dashboard/BookingsBarChart';
import BookingStatusPieChart from '../../components/dashboard/BookingStatusPieChart';
import PaymentBreakdownPieChart from '../../components/dashboard/PaymentBreakdownPieChart';
import RevenueVsBookingsChart from '../../components/dashboard/RevenueVsBookingsChart';
import TimePeriodFilter from '../../components/dashboard/TimePeriodFilter';
import { formatCurrency } from '../../utils/adminHelpers';
import { filterByDateRange, getDateRange } from '../../utils/adminHelpers';
import CustomerGrowthAreaChart from '../../components/dashboard/CustomerGrowthAreaChart';
import TopServices from '../../components/dashboard/TopServices';
import RecentBookings from '../../components/dashboard/RecentBookings';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalWorkers: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    todayRevenue: 0,
  });

  useEffect(() => {
    // Load stats from localStorage
    const loadStats = () => {
      try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const vendors = JSON.parse(localStorage.getItem('vendorWorkers') || '[]');
        const workers = JSON.parse(localStorage.getItem('workerAssignedJobs') || '[]');
        const bookings = JSON.parse(localStorage.getItem('vendorAcceptedBookings') || '[]');
        
        const activeBookings = bookings.filter(b => 
          ['ACCEPTED', 'ASSIGNED', 'VISITED', 'WORK_DONE'].includes(b.status)
        ).length;
        
        const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
        
        // Calculate revenue from completed bookings
        const totalRevenue = bookings
          .filter(b => b.status === 'COMPLETED')
          .reduce((sum, b) => sum + (b.price || 0), 0);

        setStats({
          totalUsers: users.length || 0,
          totalVendors: vendors.length || 0,
          totalWorkers: workers.length || 0,
          activeBookings,
          completedBookings,
          totalRevenue,
          todayRevenue: 0, // Can be calculated based on date
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
    window.addEventListener('vendorJobsUpdated', loadStats);
    window.addEventListener('workerJobsUpdated', loadStats);
    
    return () => {
      window.removeEventListener('vendorJobsUpdated', loadStats);
      window.removeEventListener('workerJobsUpdated', loadStats);
    };
  }, []);

  const revenueData = useMemo(() => {
    // Build last 30 days analytics from vendorAcceptedBookings
    const bookings = JSON.parse(localStorage.getItem('vendorAcceptedBookings') || '[]');
    const days = 365; // keep a year so This Year works
    const map = new Map();
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, { date: key, revenue: 0, orders: 0 });
    }
    bookings.forEach((b) => {
      const createdAt = b.createdAt || b.acceptedAt || b.assignedAt || b.visitedAt || b.work_doneAt || b.completedAt;
      const key = createdAt ? new Date(createdAt).toISOString().slice(0, 10) : null;
      if (!key || !map.has(key)) return;
      const row = map.get(key);
      row.orders += 1;
      if (b.status === 'COMPLETED') row.revenue += Number(b.price || 0);
      map.set(key, row);
    });
    return Array.from(map.values());
  }, []);

  const allBookings = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('vendorAcceptedBookings') || '[]');
    } catch {
      return [];
    }
  }, []);

  const handleExportCsv = () => {
    try {
      const range = getDateRange(period);
      const filtered = filterByDateRange(revenueData, range.start, range.end);
      const rows = filtered.map((r) => ({
        date: r.date,
        bookings: r.orders,
        revenue: r.revenue,
      }));

      const headers = ['date', 'bookings', 'revenue'];
      const csv = [
        headers.join(','),
        ...rows.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin_dashboard_${period}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('CSV export failed', e);
      alert('Export failed. Please try again.');
    }
  };

  // Single-vendor style cards (same gradients + layout), but values from our app
  const statsCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue || 0),
      change: 18,
      icon: FiDollarSign,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
      cardBg: 'bg-gradient-to-br from-green-50 to-emerald-50',
      iconBg: 'bg-white/20',
    },
    {
      title: 'Active Bookings',
      value: (stats.activeBookings || 0).toLocaleString(),
      change: 5,
      icon: FiShoppingBag,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      cardBg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      iconBg: 'bg-white/20',
    },
    {
      title: 'Completed Bookings',
      value: (stats.completedBookings || 0).toLocaleString(),
      change: 20,
      icon: FiActivity,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-purple-500 to-violet-600',
      cardBg: 'bg-gradient-to-br from-purple-50 to-violet-50',
      iconBg: 'bg-white/20',
    },
    {
      title: 'Total Users',
      value: (stats.totalUsers || 0).toLocaleString(),
      change: 12,
      icon: FiUser,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-orange-500 to-amber-600',
      cardBg: 'bg-gradient-to-br from-orange-50 to-amber-50',
      iconBg: 'bg-white/20',
    },
    {
      title: 'Total Vendors',
      value: (stats.totalVendors || 0).toLocaleString(),
      change: 8,
      icon: FiBriefcase,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-teal-500 to-cyan-600',
      cardBg: 'bg-gradient-to-br from-teal-50 to-cyan-50',
      iconBg: 'bg-white/20',
    },
    {
      title: 'Total Workers',
      value: (stats.totalWorkers || 0).toLocaleString(),
      change: 15,
      icon: FiUsers,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-rose-500 to-pink-600',
      cardBg: 'bg-gradient-to-br from-rose-50 to-pink-50',
      iconBg: 'bg-white/20',
    },
  ];

  const onViewBooking = (booking) => {
    // keep UX similar to single-vendor "view" action; open vendor booking details
    if (booking?.id) navigate(`/vendor/booking/${booking.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="lg:hidden">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Welcome back! Here's your business overview.</p>
        </div>
        <div className="w-full">
          <TimePeriodFilter
            selectedPeriod={period}
            onPeriodChange={setPeriod}
            onExport={handleExportCsv}
          />
        </div>
      </div>

      {/* Stats Cards (single-vendor style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          const isPositive = (card.change || 0) >= 0;

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`${card.cardBg} rounded-xl p-4 sm:p-6 shadow-md border-2 border-transparent hover:shadow-lg transition-all duration-300 relative overflow-hidden`}
            >
              {/* Decorative gradient overlay */}
              <div className={`absolute top-0 right-0 w-32 h-32 ${card.bgColor} opacity-10 rounded-full -mr-16 -mt-16`} />

              <div className="flex items-center justify-between mb-3 sm:mb-4 relative z-10">
                <div className={`${card.bgColor} ${card.iconBg} p-2 sm:p-3 rounded-lg shadow-md`}>
                  <Icon className={`${card.color} text-lg sm:text-xl`} />
                </div>
                <div
                  className={`text-xs sm:text-sm font-semibold px-2 py-1 rounded-full ${
                    isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {Math.abs(card.change || 0)}%
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-gray-600 text-xs sm:text-sm font-medium mb-1">{card.title}</h3>
                <p className="text-gray-800 text-xl sm:text-2xl font-bold">{card.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row (like single-vendor) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueLineChart data={revenueData} period={period} />
        <BookingsBarChart data={revenueData} period={period} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BookingStatusPieChart bookings={allBookings} />
        <PaymentBreakdownPieChart bookings={allBookings} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <RevenueVsBookingsChart data={revenueData} period={period} />
      </div>

      {/* Customer Growth (single-vendor style section) */}
      <div className="grid grid-cols-1 gap-6">
        <CustomerGrowthAreaChart timelineData={revenueData} bookings={allBookings} period={period} />
      </div>

      {/* Bottom row: Top Services + Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopServices
          bookings={allBookings}
          periodLabel="Top Booked Services"
        />
        <RecentBookings bookings={allBookings} onViewBooking={onViewBooking} />
      </div>
    </motion.div>
  );
};

export default AdminDashboard;

