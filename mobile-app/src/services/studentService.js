// Reused from web app
import api from './api';

export const studentService = {
  getAllStudents: async (params = {}) => {
    const response = await api.get('/students', { params });
    return response.data;
  },

  getStudentById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  getMyProfile: async () => {
    const response = await api.get('/students/me');
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/students/dashboard/stats');
    return response.data;
  },

  downloadIDCard: async (id) => {
    const response = await api.get(`/students/${id}/id-card`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

