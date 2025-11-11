// Notification Service - Mobile App
import api from './api';

export const notificationService = {
  // Get my notifications (automatically filtered by current user)
  getMyNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Get all notifications (same as getMyNotifications - backend filters by user)
  getAllNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Get notification by ID
  getNotificationById: async (id) => {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },

  // Create notification (admin/system)
  createNotification: async (data) => {
    const response = await api.post('/notifications', data);
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread/count');
    return response.data;
  },

  // Get notifications by type
  getNotificationsByType: async (type) => {
    const response = await api.get('/notifications', {
      params: { type },
    });
    return response.data;
  },

  // Get unread notifications
  getUnreadNotifications: async () => {
    const response = await api.get('/notifications', {
      params: { read: false },
    });
    return response.data;
  },

  // Send bulk notification (admin)
  sendBulkNotification: async (data) => {
    const response = await api.post('/notifications/bulk', data);
    return response.data;
  },
};

export default notificationService;

