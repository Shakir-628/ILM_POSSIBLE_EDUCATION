import api from './api';

export const submissionService = {
  // Get all submissions
  getAllSubmissions: async (params = {}) => {
    const response = await api.get('/submissions', { params });
    return response.data;
  },

  // Get submission by ID
  getSubmissionById: async (id) => {
    const response = await api.get(`/submissions/${id}`);
    return response.data;
  },

  // Submit assignment
  submitAssignment: async (formData) => {
    const response = await api.post('/submissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update submission
  updateSubmission: async (id, formData) => {
    const response = await api.put(`/submissions/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Grade submission
  gradeSubmission: async (id, gradeData) => {
    const response = await api.post(`/submissions/${id}/grade`, gradeData);
    return response.data;
  },

  // Delete submission
  deleteSubmission: async (id) => {
    const response = await api.delete(`/submissions/${id}`);
    return response.data;
  },
};

export default submissionService;

