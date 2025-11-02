import api from './api';

export const admissionService = {
  // Submit new application
  submitApplication: async (applicationData) => {
    const response = await api.post('/admissions', applicationData);
    return response.data;
  },

  // Get all applications
  getAllApplications: async (params = {}) => {
    const response = await api.get('/admissions', { params });
    return response.data;
  },

  // Get single application
  getApplicationById: async (id) => {
    const response = await api.get(`/admissions/${id}`);
    return response.data;
  },

  // Update application
  updateApplication: async (id, data) => {
    const response = await api.put(`/admissions/${id}`, data);
    return response.data;
  },

  // Review application (approve/reject)
  reviewApplication: async (id, reviewData) => {
    const response = await api.post(`/admissions/${id}/review`, reviewData);
    return response.data;
  },

  // Update test/interview scores
  updateScores: async (id, scoresData) => {
    const response = await api.post(`/admissions/${id}/scores`, scoresData);
    return response.data;
  },

  // Generate merit list
  generateMeritList: async (classId, academicYear) => {
    const response = await api.get(`/admissions/merit-list/${classId}`, {
      params: { academicYear },
    });
    return response.data;
  },

  // Enroll student
  enrollStudent: async (id) => {
    const response = await api.post(`/admissions/${id}/enroll`);
    return response.data;
  },

  // Delete application
  deleteApplication: async (id) => {
    const response = await api.delete(`/admissions/${id}`);
    return response.data;
  },

  // Upload document
  uploadDocument: async (id, formData) => {
    const response = await api.post(`/admissions/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get statistics
  getAdmissionStats: async (academicYear) => {
    const response = await api.get('/admissions/stats', {
      params: { academicYear },
    });
    return response.data;
  },
};

export default admissionService;

