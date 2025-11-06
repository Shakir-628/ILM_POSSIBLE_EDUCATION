// Reused from web app
import api from './api';

export const announcementService = {
  getAllAnnouncements: async () => {
    const response = await api.get('/announcements');
    return response.data;
  },

  getAnnouncementById: async (id) => {
    const response = await api.get(`/announcements/${id}`);
    return response.data;
  },

  createAnnouncement: async (data) => {
    const response = await api.post('/announcements', data);
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/announcements/${id}/read`);
    return response.data;
  },
};

