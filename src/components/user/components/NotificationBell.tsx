import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Clock, XCircle, CheckCircle, FileText } from 'lucide-react';
import { UserNotification } from '../types';
import { notificationsAPI } from '../../../services/api';

interface NotificationBellProps {
  userId: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load notifications from API
  useEffect(() => {
    loadNotifications();
    
    // Check for new notifications every 30 seconds
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  // Update unread count when notifications change
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const loadNotifications = async () => {
    if (isLoading) return; // Prevent multiple simultaneous requests
    
    setIsLoading(true);
    try {
      const response = await notificationsAPI.getByEmployee(userId);
      if (response.success) {
        const notificationsData = response.data.map((notif: any) => ({
          ...notif,
          id: notif._id,
          timestamp: notif.createdAt
        }));
        setNotifications(notificationsData);
      }
    } catch (error) {
      console.error('Error loading notifications from API:', error);
      // Don't clear notifications on error, keep existing ones
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      const updated = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      setNotifications(updated);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Handle error gracefully - still update UI optimistically
      const updated = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      setNotifications(updated);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead(userId);
      const updated = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updated);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Handle error gracefully - still update UI optimistically
      const updated = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updated);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationsAPI.delete(notificationId);
      const updated = notifications.filter(n => n.id !== notificationId);
      setNotifications(updated);
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Handle error gracefully - still update UI optimistically
      const updated = notifications.filter(n => n.id !== notificationId);
      setNotifications(updated);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'leave_approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'leave_rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'leave_pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors touch-target"
      >
        <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 z-50 max-h-80 sm:max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Pemberitahuan</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Tandai Semua Dibaca
                    </button>
                  )}
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
              {unreadCount > 0 && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {unreadCount} pemberitahuan belum dibaca
                </p>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-64 sm:max-h-80 overflow-y-auto">
              {isLoading && notifications.length === 0 ? (
                <div className="p-4 sm:p-6 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500 mx-auto mb-2 sm:mb-3"></div>
                  <p className="text-xs sm:text-sm text-gray-500">Memuat pemberitahuan...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 sm:p-6 text-center text-gray-500">
                  <Bell className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-300" />
                  <p className="text-xs sm:text-sm">Belum ada pemberitahuan</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`relative p-3 sm:p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-xs sm:text-sm font-medium ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </p>
                              <p className={`text-xs sm:text-sm mt-1 ${
                                !notification.read ? 'text-gray-700' : 'text-gray-500'
                              }`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1 sm:mt-2">
                                {formatTimestamp(notification.timestamp)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1 ml-1 sm:ml-2">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-0.5 sm:p-1 text-blue-600 hover:text-blue-800 touch-target"
                                  title="Tandai sudah dibaca"
                                >
                                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-0.5 sm:p-1 text-gray-400 hover:text-red-600 touch-target"
                                title="Hapus pemberitahuan"
                              >
                                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <div className="p-2 sm:p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={loadNotifications}
                disabled={isLoading}
                className="w-full text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 py-1"
              >
                {isLoading ? 'Memuat...' : 'Refresh Pemberitahuan'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;