/**
 * Initialize Dummy Data for Vendor App
 * Run this function to populate localStorage with sample data
 */

export const initVendorDummyData = () => {
  // 1. Vendor Profile
  const vendorProfile = {
    name: 'Rajesh Kumar',
    businessName: 'Kumar Services',
    phone: '+91 9876543210',
    email: 'rajesh@kumarservices.com',
    address: '123 Main Street, Indore, Madhya Pradesh 452001',
    photo: null,
    rating: 4.8,
    totalJobs: 45,
    completionRate: 98,
  };
  localStorage.setItem('vendorProfile', JSON.stringify(vendorProfile));

  // 2. Vendor Stats
  const vendorStats = {
    todayEarnings: 2500,
    activeJobs: 3,
    pendingAlerts: 2,
    workersOnline: 4,
    completedJobs: 42,
    rating: 4.8,
    totalEarnings: 125000,
  };
  localStorage.setItem('vendorStats', JSON.stringify(vendorStats));

  // 3. Workers
  const workers = [
    {
      id: '1',
      name: 'Amit Sharma',
      phone: '+91 9876543211',
      skills: ['Fan Repair', 'AC Service', 'Electrical Wiring'],
      serviceArea: 'Indore, MP',
      workingHours: { start: '09:00', end: '18:00' },
      availability: 'ONLINE',
      currentJob: null,
      stats: { jobsCompleted: 25, rating: 4.7, complaints: 0 },
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      name: 'Vikram Singh',
      phone: '+91 9876543212',
      skills: ['Plumbing', 'Carpentry', 'Installation'],
      serviceArea: 'Indore, MP',
      workingHours: { start: '08:00', end: '20:00' },
      availability: 'ONLINE',
      currentJob: 'booking-2',
      stats: { jobsCompleted: 18, rating: 4.9, complaints: 0 },
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      name: 'Suresh Patel',
      phone: '+91 9876543213',
      skills: ['Appliance Repair', 'Cleaning'],
      serviceArea: 'Indore, MP',
      workingHours: { start: '10:00', end: '19:00' },
      availability: 'ONLINE',
      currentJob: null,
      stats: { jobsCompleted: 12, rating: 4.6, complaints: 1 },
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      name: 'Mohan Das',
      phone: '+91 9876543214',
      skills: ['AC Service', 'Electrical Wiring', 'Fan Repair'],
      serviceArea: 'Indore, MP',
      workingHours: { start: '09:00', end: '18:00' },
      availability: 'OFFLINE',
      currentJob: null,
      stats: { jobsCompleted: 30, rating: 4.8, complaints: 0 },
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
  localStorage.setItem('vendorWorkers', JSON.stringify(workers));

  // 4. Accepted Bookings (Active Jobs)
  const acceptedBookings = [
    {
      id: 'booking-1',
      serviceType: 'Fan Repairing',
      customerName: 'John Doe',
      user: {
        name: 'John Doe',
        phone: '+91 9876543220',
      },
      location: {
        address: '456 Park Avenue, Indore, MP 452001',
        lat: 22.7196,
        lng: 75.8577,
        distance: '2.5 km',
      },
      price: 500,
      timeSlot: {
        date: 'Today',
        time: '2:00 PM - 4:00 PM',
      },
      status: 'ASSIGNED',
      assignedTo: { id: '1', name: 'Amit Sharma' },
      description: 'Fan is not working properly, needs repair',
      timeline: [
        { stage: 1, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { stage: 2, timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
        { stage: 3, timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
      ],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'booking-2',
      serviceType: 'AC Service',
      customerName: 'Priya Sharma',
      user: {
        name: 'Priya Sharma',
        phone: '+91 9876543221',
      },
      location: {
        address: '789 MG Road, Indore, MP 452002',
        lat: 22.7200,
        lng: 75.8580,
        distance: '3.2 km',
      },
      price: 1200,
      timeSlot: {
        date: 'Today',
        time: '10:00 AM - 12:00 PM',
      },
      status: 'VISITED',
      assignedTo: { id: '2', name: 'Vikram Singh' },
      description: 'AC not cooling properly',
      timeline: [
        { stage: 1, timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
        { stage: 2, timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
        { stage: 3, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { stage: 4, timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
      ],
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'booking-3',
      serviceType: 'Plumbing',
      customerName: 'Rahul Verma',
      user: {
        name: 'Rahul Verma',
        phone: '+91 9876543222',
      },
      location: {
        address: '321 Station Road, Indore, MP 452003',
        lat: 22.7180,
        lng: 75.8560,
        distance: '1.8 km',
      },
      price: 800,
      timeSlot: {
        date: 'Tomorrow',
        time: '11:00 AM - 1:00 PM',
      },
      status: 'ACCEPTED',
      assignedTo: null,
      description: 'Leakage in bathroom tap',
      timeline: [
        { stage: 1, timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
        { stage: 2, timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
      ],
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ];
  localStorage.setItem('vendorAcceptedBookings', JSON.stringify(acceptedBookings));

  // 5. Pending Jobs (Booking Alerts)
  const pendingJobs = [
    {
      id: 'pending-1',
      serviceType: 'Electrical Wiring',
      location: {
        address: '555 New Colony, Indore, MP 452004',
        distance: '4.5 km',
      },
      price: 1500,
      timeSlot: {
        date: 'Today',
        time: '3:00 PM - 5:00 PM',
      },
      customerName: 'Anita Mehta',
      user: {
        name: 'Anita Mehta',
        phone: '+91 9876543223',
      },
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: 'pending-2',
      serviceType: 'Appliance Repair',
      location: {
        address: '777 Old City, Indore, MP 452005',
        distance: '5.2 km',
      },
      price: 600,
      timeSlot: {
        date: 'Tomorrow',
        time: '9:00 AM - 11:00 AM',
      },
      customerName: 'Deepak Joshi',
      user: {
        name: 'Deepak Joshi',
        phone: '+91 9876543224',
      },
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
  ];
  localStorage.setItem('vendorPendingJobs', JSON.stringify(pendingJobs));

  // 6. Wallet
  const vendorWallet = {
    balance: 25000,
    pending: 5000,
    available: 20000,
  };
  localStorage.setItem('vendorWallet', JSON.stringify(vendorWallet));

  // 7. Transactions
  const transactions = [
    {
      id: 'txn-1',
      type: 'earning',
      amount: 500,
      description: 'Fan Repairing - John Doe',
      date: new Date().toLocaleDateString(),
      status: 'completed',
      bookingId: 'booking-1',
    },
    {
      id: 'txn-2',
      type: 'earning',
      amount: 1200,
      description: 'AC Service - Priya Sharma',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      status: 'completed',
      bookingId: 'booking-2',
    },
    {
      id: 'txn-3',
      type: 'commission',
      amount: -50,
      description: 'Commission for booking-1',
      date: new Date().toLocaleDateString(),
      status: 'completed',
    },
    {
      id: 'txn-4',
      type: 'withdrawal',
      amount: -5000,
      description: 'Withdrawal to ****1234',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      status: 'pending',
    },
    {
      id: 'txn-5',
      type: 'earning',
      amount: 800,
      description: 'Plumbing - Rahul Verma',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      status: 'completed',
      bookingId: 'booking-3',
    },
  ];
  localStorage.setItem('vendorTransactions', JSON.stringify(transactions));

  // 8. Earnings
  const vendorEarnings = {
    today: 2500,
    week: 15000,
    month: 45000,
    total: 125000,
  };
  localStorage.setItem('vendorEarnings', JSON.stringify(vendorEarnings));

  // 9. Earnings History
  const earningsHistory = [
    {
      serviceType: 'Fan Repairing',
      amount: 500,
      date: new Date().toLocaleDateString(),
      worker: 'Amit Sharma',
      commission: 50,
    },
    {
      serviceType: 'AC Service',
      amount: 1200,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      worker: 'Vikram Singh',
      commission: 120,
    },
    {
      serviceType: 'Plumbing',
      amount: 800,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      worker: 'Suresh Patel',
      commission: 80,
    },
    {
      serviceType: 'Electrical Wiring',
      amount: 1500,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      worker: 'Amit Sharma',
      commission: 150,
    },
    {
      serviceType: 'Appliance Repair',
      amount: 600,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      worker: 'Suresh Patel',
      commission: 60,
    },
  ];
  localStorage.setItem('vendorEarningsHistory', JSON.stringify(earningsHistory));

  // 10. Notifications
  const notifications = [
    {
      id: 'notif-1',
      type: 'alert',
      title: 'New Booking Alert',
      message: 'New booking request for Electrical Wiring',
      time: '5 minutes ago',
      read: false,
      action: 'view_booking',
      bookingId: 'pending-1',
    },
    {
      id: 'notif-2',
      type: 'job',
      title: 'Job Status Updated',
      message: 'AC Service job status changed to VISITED',
      time: '1 hour ago',
      read: false,
      action: 'view_booking',
      bookingId: 'booking-2',
    },
    {
      id: 'notif-3',
      type: 'payment',
      title: 'Payment Received',
      message: '₹500 received for Fan Repairing job',
      time: '2 hours ago',
      read: true,
      action: 'view_wallet',
    },
    {
      id: 'notif-4',
      type: 'alert',
      title: 'New Booking Alert',
      message: 'New booking request for Appliance Repair',
      time: '10 minutes ago',
      read: false,
      action: 'view_booking',
      bookingId: 'pending-2',
    },
  ];
  localStorage.setItem('vendorNotifications', JSON.stringify(notifications));

  // 11. Settings
  const vendorSettings = {
    notifications: true,
    soundAlerts: true,
    language: 'en',
  };
  localStorage.setItem('vendorSettings', JSON.stringify(vendorSettings));

  // 12. Bank Account (optional - for withdrawals)
  const bankAccount = {
    accountHolderName: 'Rajesh Kumar',
    bankName: 'State Bank of India',
    accountNumber: '1234567890123456',
    ifsc: 'SBIN0001234',
  };
  localStorage.setItem('vendorBankAccount', JSON.stringify(bankAccount));

  // 13. Withdrawals History
  const withdrawals = [
    {
      id: 'withdraw-1',
      amount: 5000,
      bankAccount: bankAccount,
      status: 'pending',
      requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'withdraw-2',
      amount: 10000,
      bankAccount: bankAccount,
      status: 'completed',
      requestedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
  localStorage.setItem('vendorWithdrawals', JSON.stringify(withdrawals));

  // Dispatch events to update UI
  window.dispatchEvent(new Event('vendorStatsUpdated'));
  window.dispatchEvent(new Event('vendorProfileUpdated'));
  window.dispatchEvent(new Event('vendorJobsUpdated'));
  window.dispatchEvent(new Event('vendorWorkersUpdated'));
  window.dispatchEvent(new Event('vendorWalletUpdated'));
  window.dispatchEvent(new Event('vendorEarningsUpdated'));
  window.dispatchEvent(new Event('vendorNotificationsUpdated'));

  return true;
};

// Auto-initialize if localStorage is empty
export const autoInitDummyData = () => {
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('localStorage is not available');
      return false;
    }

    const hasData = localStorage.getItem('vendorProfile');
    if (!hasData) {
      try {
        initVendorDummyData();
        // Dispatch events after a small delay to ensure listeners are ready
        setTimeout(() => {
          try {
            window.dispatchEvent(new Event('vendorStatsUpdated'));
            window.dispatchEvent(new Event('vendorProfileUpdated'));
            window.dispatchEvent(new Event('vendorJobsUpdated'));
            window.dispatchEvent(new Event('vendorWorkersUpdated'));
            window.dispatchEvent(new Event('vendorWalletUpdated'));
            window.dispatchEvent(new Event('vendorEarningsUpdated'));
            window.dispatchEvent(new Event('vendorNotificationsUpdated'));
          } catch (eventError) {
            console.error('Error dispatching events:', eventError);
          }
        }, 100);
        return true; // Data was initialized
      } catch (initError) {
        console.error('Error initializing vendor dummy data:', initError);
        return false;
      }
    } else {
      return false; // Data already exists
    }
  } catch (error) {
    console.error('Error in autoInitDummyData:', error);
    return false;
  }
};

// Force initialize (useful for testing)
export const forceInitDummyData = () => {
  initVendorDummyData();
  setTimeout(() => {
    window.dispatchEvent(new Event('vendorStatsUpdated'));
    window.dispatchEvent(new Event('vendorProfileUpdated'));
    window.dispatchEvent(new Event('vendorJobsUpdated'));
    window.dispatchEvent(new Event('vendorWorkersUpdated'));
    window.dispatchEvent(new Event('vendorWalletUpdated'));
    window.dispatchEvent(new Event('vendorEarningsUpdated'));
    window.dispatchEvent(new Event('vendorNotificationsUpdated'));
  }, 100);
};

