import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiCheck, FiBriefcase, FiChevronRight } from 'react-icons/fi';
import { workerTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const bgStyle = themeColors.backgroundGradient;

    if (html) html.style.background = bgStyle;
    if (body) body.style.background = bgStyle;
    if (root) root.style.background = bgStyle;

    return () => {
      if (html) html.style.background = '';
      if (body) body.style.background = '';
      if (root) root.style.background = '';
    };
  }, []);

  useEffect(() => {
    const loadNotifications = () => {
      try {
        const workerNotifications = JSON.parse(localStorage.getItem('workerNotifications') || '[]');
        // Add time formatted for display
        const processNotifications = workerNotifications.map(n => ({
          ...n,
          time: new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        }));
        setNotifications(processNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
    window.addEventListener('workerNotificationsUpdated', loadNotifications);

    return () => {
      window.removeEventListener('workerNotificationsUpdated', loadNotifications);
    };
  }, []);

  const handleMarkAsRead = (id) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('workerNotifications', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all notifications?')) {
      localStorage.setItem('workerNotifications', JSON.stringify([]));
      setNotifications([]);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    return notif.type.toLowerCase() === filter;
  });

  const getNotificationIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'alert':
        return <FiBell className="w-5 h-5" />;
      case 'job':
        return <FiBriefcase className="w-5 h-5" />;
      case 'payment':
        return <span className="text-lg font-bold">₹</span>;
      default:
        return <FiBell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type.toLowerCase()) {
      case 'alert':
        return themeColors.button;
      case 'job':
        return '#3B82F6';
      case 'payment':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Notifications" />

      <main className="px-4 py-6">
        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'all', label: 'All' },
            { id: 'job', label: 'Jobs' },
            { id: 'payment', label: 'Payments' },
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${filter === filterOption.id
                ? 'text-white'
                : 'bg-white text-gray-600'
                }`}
              style={
                filter === filterOption.id
                  ? {
                    background: themeColors.button,
                    boxShadow: `0 2px 8px ${themeColors.button}40`,
                  }
                  : {
                    border: '1px solid rgba(0,0,0,0.05)',
                  }
              }
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {/* Clear All Button */}
        {notifications.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleClearAll}
              className="text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-80"
              style={{ color: themeColors.button }}
            >
              Clear All
            </button>
          </div>
        )}

        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiBell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-bold text-lg mb-1">No notifications</h3>
            <p className="text-gray-500 text-sm max-w-xs">You'll see notifications here when you receive job assignments or payments.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notif) => {
              const iconColor = getNotificationColor(notif.type);
              const isUnread = !notif.read;

              return (
                <div
                  key={notif.id}
                  className={`relative overflow-hidden bg-white rounded-2xl transition-all duration-300 ${isUnread ? 'shadow-md' : 'shadow-sm opacity-90'}`}
                  style={{
                    border: isUnread ? 'none' : '1px solid #F3F4F6',
                    transform: isUnread ? 'scale(1.01)' : 'scale(1)',
                  }}
                >
                  {/* Unread Indicator Bar */}
                  {isUnread && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1.5"
                      style={{ background: iconColor }}
                    />
                  )}

                  <div className={`p-4 ${isUnread ? 'pl-5' : 'pl-4'}`}>
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                        style={{
                          background: isUnread ? iconColor : '#F3F4F6',
                          color: isUnread ? '#FFFFFF' : '#9CA3AF'
                        }}
                      >
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-base ${isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-2 font-medium">{notif.time}</span>
                        </div>
                        <p className={`text-sm leading-relaxed mb-3 ${isUnread ? 'text-gray-600' : 'text-gray-500'}`}>
                          {notif.message}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          {/* Add relevant actions */}
                          {notif.type.toLowerCase() === 'job' && notif.jobId ? (
                            <button
                              onClick={() => navigate(`/worker/job/${notif.jobId}`)}
                              className="text-xs font-bold uppercase tracking-wide flex items-center gap-1 transition-colors hover:opacity-80"
                              style={{ color: iconColor }}
                            >
                              View Job <FiChevronRight className="w-3 h-3" />
                            </button>
                          ) : <div></div>}

                          {isUnread && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notif.id);
                              }}
                              className="text-xs font-medium text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-gray-50"
                            >
                              <FiCheck className="w-3 h-3" /> Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Notifications;

