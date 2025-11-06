// Reused from web app
import api from './api';

export const gradeService = {
  getAllGrades: async (params = {}) => {
    const response = await api.get('/grades', { params });
    return response.data;
  },

  getMyGrades: async () => {
    const response = await api.get('/grades/me');
    return response.data;
  },

  getGradesByStudent: async (studentId) => {
    const response = await api.get(`/grades/student/${studentId}`);
    return response.data;
  },

  createGrade: async (data) => {
    const response = await api.post('/grades', data);
    return response.data;
  },

  updateGrade: async (id, data) => {
    const response = await api.put(`/grades/${id}`, data);
    return response.data;
  },
};

