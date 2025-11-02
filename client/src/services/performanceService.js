import api from './api';

export const performanceService = {
  // Get all reviews
  getAllReviews: async (params = {}) => {
    const response = await api.get('/performance', { params });
    return response.data;
  },

  // Get review by ID
  getReviewById: async (id) => {
    const response = await api.get(`/performance/${id}`);
    return response.data;
  },

  // Create review
  createReview: async (reviewData) => {
    const response = await api.post('/performance', reviewData);
    return response.data;
  },

  // Update review
  updateReview: async (id, reviewData) => {
    const response = await api.put(`/performance/${id}`, reviewData);
    return response.data;
  },

  // Delete review
  deleteReview: async (id) => {
    const response = await api.delete(`/performance/${id}`);
    return response.data;
  },

  // Get teacher statistics
  getTeacherStats: async (teacherId) => {
    const response = await api.get(`/performance/stats/${teacherId}`);
    return response.data;
  },
};

export default performanceService;

