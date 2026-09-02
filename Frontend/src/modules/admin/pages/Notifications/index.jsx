import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiRefreshCw, FiCheck, FiCheckCircle, FiTrash2, FiFilter, FiUser, FiDollarSign, FiUserCheck, FiSend } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import api from '../../../../services/api';

const Notifications = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isBroadcastPage = location.pathname === '/admin/broadcast';
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [refreshing, setRefreshing] = useState(false);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcast, setBroadcast] = useState({
    audience: 'all',
    title: '',
    message: ''
  });

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications/admin', {
        params: { limit: 50 }
      });
      if (res.data.success) {
        setNotifications(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isBroadcastPage) fetchNotifications();
  }, [fetchNotifications, isBroadcastPage]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
    toast.success('Notifications refreshed');
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const sendBroadcast = async (event) => {
    event.preventDefault();

    if (!broadcast.title.trim() || !broadcast.message.trim()) {
      toast.error('Please enter a title and message.');
      return;
    }

    setIsSendingBroadcast(true);
    try {
      const response = await api.post('/notifications/broadcast', {
        audience: broadcast.audience,
        title: broadcast.title.trim(),
        message: broadcast.message.trim()
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setBroadcast({ audience: 'all', title: '', message: '' });
        navigate('/admin/notifications');
      } else {
        toast.error(response.data.message || 'Failed to send broadcast.');
      }
    } catch (error) {
      console.error('Broadcast error:', error);
      toast.error(error.response?.data?.message || 'Failed to send broadcast.');
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'vendor_withdrawal_request':
        return <FiDollarSign className="text-green-500" />;
      case 'vendor_approval_request':
        return <FiUserCheck className="text-blue-500" />;
      case 'vendor_cash_limit_exceeded':
        return <FiDollarSign className="text-red-500" />;
      default:
        return <FiBell className="text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isBroadcastPage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-lg"
      >
        <div className="rounded-2xl bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <h1 className="text-lg font-bold text-gray-900">Send Broadcast</h1>
            <p className="mt-1 text-xs text-gray-500">This sends an in-app and push notification to the selected audience.</p>
          </div>

          <form onSubmit={sendBroadcast}>
            <div className="space-y-4 p-5">
              <div>
                <label htmlFor="broadcast-audience" className="mb-1.5 block text-xs font-semibold text-gray-700">Send to</label>
                <select
                  id="broadcast-audience"
                  value={broadcast.audience}
                  onChange={(event) => setBroadcast(current => ({ ...current, audience: event.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="all">All users and vendors</option>
                  <option value="users">Users only</option>
                  <option value="vendors">Vendors only</option>
                </select>
              </div>

              <div>
                <label htmlFor="broadcast-title" className="mb-1.5 block text-xs font-semibold text-gray-700">Title</label>
                <input
                  id="broadcast-title"
                  value={broadcast.title}
                  onChange={(event) => setBroadcast(current => ({ ...current, title: event.target.value }))}
                  maxLength={120}
                  placeholder="Example: Service update"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label htmlFor="broadcast-message" className="mb-1.5 block text-xs font-semibold text-gray-700">Message</label>
                <textarea
                  id="broadcast-message"
                  value={broadcast.message}
                  onChange={(event) => setBroadcast(current => ({ ...current, message: event.target.value }))}
                  maxLength={1000}
                  rows={5}
                  placeholder="Write the announcement your audience should receive."
                  className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-right text-xs text-gray-400">{broadcast.message.length}/1000</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 p-5">
              <button
                type="button"
                onClick={() => navigate('/admin/notifications')}
                disabled={isSendingBroadcast}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSendingBroadcast || !broadcast.title.trim() || !broadcast.message.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiSend />
                {isSendingBroadcast ? 'Sending...' : 'Send Broadcast'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <FiBell className="text-blue-600 text-lg" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Notifications</h1>
              <p className="text-xs text-gray-500">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/broadcast')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1"
            >
              <FiSend className="text-sm" />
              Broadcast
            </button>
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={refreshing}
            >
              <FiRefreshCw className={`text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <FiCheckCircle className="text-sm" />
                Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete all notifications?')) {
                    try {
                      await api.delete('/notifications/delete-all');
                      setNotifications([]);
                      toast.success('All notifications cleared');
                    } catch (error) {
                      console.error('Error clearing notifications:', error);
                      toast.error('Failed to clear notifications');
                    }
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <FiTrash2 className="text-sm" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          {['all', 'unread', 'read'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${filter === f
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-xs text-gray-500 mt-2">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <FiBell className="text-4xl text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            <AnimatePresence>
              {filteredNotifications.map(notification => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-4 hover:bg-gray-50 transition-colors flex items-start gap-3 ${!notification.isRead ? 'bg-blue-50/30' : ''
                    }`}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="text-[10px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <FiCheck className="text-xs" />
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="text-[10px] font-semibold text-red-500 hover:underline flex items-center gap-1"
                      >
                        <FiTrash2 className="text-xs" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-2"></div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Notifications;
