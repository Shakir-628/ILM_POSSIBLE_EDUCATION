import api from './api';

export const assignmentService = {
  // Get all assignments
  getAllAssignments: async (params = {}) => {
    const response = await api.get('/assignments', { params });
    return response.data;
  },

  // Get assignment by ID
  getAssignmentById: async (id) => {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },

  // Create assignment
  createAssignment: async (formData) => {
    const response = await api.post('/assignments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update assignment
  updateAssignment: async (id, formData) => {
    const response = await api.put(`/assignments/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete assignment
  deleteAssignment: async (id) => {
    const response = await api.delete(`/assignments/${id}`);
    return response.data;
  },

  // Get assignment submissions
  getAssignmentSubmissions: async (id) => {
    const response = await api.get(`/assignments/${id}/submissions`);
    return response.data;
  },

  // Get assignment statistics
  getAssignmentStats: async (id) => {
    const response = await api.get(`/assignments/${id}/stats`);
    return response.data;
  },
};

export default assignmentService;

