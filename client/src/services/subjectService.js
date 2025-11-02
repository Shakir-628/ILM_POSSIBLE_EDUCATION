import api from './api';

export const subjectService = {
  // Get all subjects
  getAllSubjects: async () => {
    const response = await api.get('/subjects');
    return response.data;
  },

  // Get subject by ID
  getSubjectById: async (id) => {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },

  // Create subject
  createSubject: async (subjectData) => {
    const response = await api.post('/subjects', subjectData);
    return response.data;
  },

  // Update subject
  updateSubject: async (id, subjectData) => {
    const response = await api.put(`/subjects/${id}`, subjectData);
    return response.data;
  },

  // Delete subject
  deleteSubject: async (id) => {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
  },
};

export default subjectService;

