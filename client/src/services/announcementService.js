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

  // Create announcement
  createAnnouncement: async (announcementData) => {
    const response = await api.post('/announcements', announcementData);
    return response.data;
  },

  // Update announcement
  updateAnnouncement: async (id, announcementData) => {
    const response = await api.put(`/announcements/${id}`, announcementData);
    return response.data;
  },

  // Delete announcement
  deleteAnnouncement: async (id) => {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  },
};

export default announcementService;

