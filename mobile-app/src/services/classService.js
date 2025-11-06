// Class Service
import api from './api';

export const classService = {
  getAllClasses: async (params = {}) => {
    const response = await api.get('/classes', { params });
    return response.data;
  },

  getClassById: async (id) => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  },

  createClass: async (classData) => {
    const response = await api.post('/classes', classData);
    return response.data;
  },

  updateClass: async (id, classData) => {
    const response = await api.put(`/classes/${id}`, classData);
    return response.data;
  },

  deleteClass: async (id) => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  },

  getClassStudents: async (id) => {
    const response = await api.get(`/classes/${id}/students`);
    return response.data;
  },

  assignTeacher: async (id, teacherId) => {
    const response = await api.post(`/classes/${id}/assign-teacher`, { teacherId });
    return response.data;
  },
};

export default classService;

