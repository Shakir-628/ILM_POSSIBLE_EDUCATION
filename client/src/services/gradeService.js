import api from './api';

export const gradeService = {
  getAllGrades: async (params = {}) => {
    const response = await api.get('/grades', { params });
    return response.data;
  },

  getGradeById: async (id) => {
    const response = await api.get(`/grades/${id}`);
    return response.data;
  },

  createGrade: async (gradeData) => {
    const response = await api.post('/grades', gradeData);
    return response.data;
  },

  updateGrade: async (id, gradeData) => {
    const response = await api.put(`/grades/${id}`, gradeData);
    return response.data;
  },

  deleteGrade: async (id) => {
    const response = await api.delete(`/grades/${id}`);
    return response.data;
  },

  getStudentReport: async (studentId, params = {}) => {
    const response = await api.get(`/grades/report/${studentId}`, { params });
    return response.data;
  },

  getClassGradeStats: async (classId, params = {}) => {
    const response = await api.get(`/grades/class-stats/${classId}`, { params });
    return response.data;
  },
};

