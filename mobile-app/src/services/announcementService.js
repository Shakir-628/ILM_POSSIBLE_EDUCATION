// Announcement Service - Mobile App
import api from './api';

export const announcementService = {
  // Get all announcements
  getAllAnnouncements: async (params = {}) => {
    const response = await api.get('/announcements', { params });
    return response.data;
  },

  // Get announcement by ID
  getAnnouncementById: async (id) => {
    const response = await api.get(`/announcements/${id}`);
    return response.data;
  },

  // Create announcement (admin/teacher)
  createAnnouncement: async (data) => {
    const response = await api.post('/announcements', data);
    return response.data;
  },

  // Update announcement
  updateAnnouncement: async (id, data) => {
    const response = await api.put(`/announcements/${id}`, data);
    return response.data;
  },

  // Delete announcement
  deleteAnnouncement: async (id) => {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  },

  // Get announcements by priority
  getAnnouncementsByPriority: async (priority) => {
    const response = await api.get('/announcements', {
      params: { priority },
    });
    return response.data;
  },

  // Get announcements by role
  getAnnouncementsByRole: async (role) => {
    const response = await api.get('/announcements', {
      params: { targetRole: role },
    });
    return response.data;
  },
};

export default announcementService;
