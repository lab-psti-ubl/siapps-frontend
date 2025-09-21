import { UserNotification } from '../components/user/types';
import { notificationsAPI } from '../services/api';

// This utility is now mainly for type definitions and helper functions
// All notification operations should go through the API

export const formatTimestamp = (timestamp: string): string => {
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

export const getNotificationTypeText = (type: string): string => {
  switch (type) {
    case 'leave_approved':
      return 'Izin Disetujui';
    case 'leave_rejected':
      return 'Izin Ditolak';
    case 'leave_pending':
      return 'Izin Pending';
    case 'general':
      return 'Pemberitahuan Umum';
    default:
      return 'Pemberitahuan';
  }
};

export const getNotificationIcon = (type: string): string => {
  switch (type) {
    case 'leave_approved':
      return '✅';
    case 'leave_rejected':
      return '❌';
    case 'leave_pending':
      return '⏳';
    case 'general':
      return '📢';
    default:
      return '📝';
  }
};

// Helper function to get unread count from API
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const response = await notificationsAPI.getUnreadCount(userId);
    if (response.success) {
      return response.data.unreadCount;
    }
    return 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};