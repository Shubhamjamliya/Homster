/**
 * Initialize dummy data for Worker App
 * This file auto-initializes dummy data when the worker dashboard loads
 */

export const autoInitDummyData = () => {
  // Check if data already exists
  const hasWorkerProfile = localStorage.getItem('workerProfile');
  const hasAssignedJobs = localStorage.getItem('workerAssignedJobs');

  // Initialize if data doesn't exist
  if (!hasWorkerProfile || !hasAssignedJobs) {
    initWorkerData();
  } else {
    // Check if profile has "serviceCategory" field (migration check)
    try {
      const profile = JSON.parse(hasWorkerProfile);
      if (!profile.serviceCategory) {
        // Upgrade existing profile with serviceCategory
        const updatedProfile = {
          ...profile,
          serviceCategory: profile.category || 'Electrician', // Migrate from category if exists
          skills: profile.skills || ['Fan Repair', 'AC', 'Lightings', 'House Wiring']
        };
        localStorage.setItem('workerProfile', JSON.stringify(updatedProfile));
        // Force reload to pick up changes
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      initWorkerData();
    }

    // Check if assignedJobs array is empty and populate it
    try {
      const assignedJobs = JSON.parse(hasAssignedJobs);
      if (Array.isArray(assignedJobs) && assignedJobs.length === 0) {
        initWorkerData();
      }
    } catch (e) {
      initWorkerData();
    }
  }
};

const initWorkerData = () => {
  // 1. Worker Profile
  const workerProfile = {
    id: 'worker-1',
    name: 'Ramesh Kumar',
    phone: '+91 9876543210',
    email: 'ramesh@example.com',
    photo: null,
    serviceCategory: 'Electrician',
    skills: ['Fan Repair', 'AC', 'Lightings', 'House Wiring'],
    rating: 4.7,
    totalJobs: 35,
    completedJobs: 32,
    cancelledJobs: 3,
    joinedDate: '2024-01-15',
    address: '123 Worker Street, Indore, MP 452001',
  };
  localStorage.setItem('workerProfile', JSON.stringify(workerProfile));

  // 2. Assigned Jobs
  const assignedJobs = [
    {
      id: 'booking-1',
      serviceType: 'Fan Repairing',
      location: {
        address: '456 Park Avenue, Indore, MP 452001',
        lat: 22.7196,
        lng: 75.8577,
        distance: '2.5 km',
      },
      price: 500,
      user: {
        name: 'John Doe',
        phone: '+91 9876543220',
      },
      vendorId: 'vendor-1',
      vendorName: 'Kumar Services',
      workerId: 'worker-1',
      workerStatus: 'PENDING',
      assignedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      description: 'Fan is not working properly, needs repair',
      timeSlot: {
        date: 'Today',
        time: '2:00 PM - 4:00 PM',
      },
    },
    {
      id: 'booking-3',
      serviceType: 'AC Service',
      location: {
        address: '789 MG Road, Indore, MP 452001',
        lat: 22.7200,
        lng: 75.8580,
        distance: '3.2 km',
      },
      price: 1200,
      user: {
        name: 'Priya Sharma',
        phone: '+91 9876543222',
      },
      vendorId: 'vendor-1',
      vendorName: 'Kumar Services',
      workerId: 'worker-1',
      workerStatus: 'ACCEPTED',
      assignedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      acceptedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      description: 'AC not cooling properly, needs service',
      timeSlot: {
        date: 'Tomorrow',
        time: '10:00 AM - 12:00 PM',
      },
    },
    {
      id: 'booking-5',
      serviceType: 'Electrical Wiring',
      location: {
        address: '321 Station Road, Indore, MP 452001',
        lat: 22.7180,
        lng: 75.8560,
        distance: '1.8 km',
      },
      price: 800,
      user: {
        name: 'Rahul Verma',
        phone: '+91 9876543224',
      },
      vendorId: 'vendor-1',
      vendorName: 'Kumar Services',
      workerId: 'worker-1',
      workerStatus: 'COMPLETED',
      assignedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      acceptedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      description: 'New electrical wiring needed for room',
      timeSlot: {
        date: 'Yesterday',
        time: '3:00 PM - 5:00 PM',
      },
    },
  ];
  localStorage.setItem('workerAssignedJobs', JSON.stringify(assignedJobs));

  // 3. Worker Stats
  const workerStats = {
    pendingJobs: 1,
    acceptedJobs: 1,
    completedJobs: 32,
    totalEarnings: 18500,
    thisMonthEarnings: 5200,
    rating: 4.7,
  };
  localStorage.setItem('workerStats', JSON.stringify(workerStats));

  // 4. Notifications
  const notifications = [
    {
      id: 'notif-1',
      type: 'JOB',
      title: 'New Job Assigned',
      message: 'You have been assigned a new job: Fan Repairing',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      jobId: 'booking-1',
    },
    {
      id: 'notif-2',
      type: 'JOB',
      title: 'Job Accepted',
      message: 'You accepted the job: AC Service',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: true,
      jobId: 'booking-3',
    },
    {
      id: 'notif-3',
      type: 'PAYMENT',
      title: 'Payment Received',
      message: '₹800 received for Electrical Wiring job',
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
  ];
  localStorage.setItem('workerNotifications', JSON.stringify(notifications));

  // 5. Settings
  const settings = {
    notifications: true,
    soundAlerts: true,
    language: 'en',
  };
  localStorage.setItem('workerSettings', JSON.stringify(settings));

  console.log('Worker dummy data initialized with sample jobs');
};

