import api from './api';

export const classService = {
  getAllClasses: async () => {
    const response = await api.get('/classes');
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

  addStudentToClass: async (classId, studentId) => {
    const response = await api.put(`/classes/${classId}/add-student`, { studentId });
    return response.data;
  },

  removeStudentFromClass: async (classId, studentId) => {
    const response = await api.put(`/classes/${classId}/remove-student`, { studentId });
    return response.data;
  },
};

