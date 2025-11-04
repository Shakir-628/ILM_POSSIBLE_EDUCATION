import api from './api';

export const examAnalyticsService = {
  // Get exam dashboard stats
  getExamDashboard: async (params = {}) => {
    const response = await api.get('/exam-analytics/dashboard', { params });
    return response.data;
  },

  // Get class-wise exam performance
  getClassExamPerformance: async (params = {}) => {
    const response = await api.get('/exam-analytics/class-performance', { params });
    return response.data;
  },

  // Get subject-wise exam performance
  getSubjectExamPerformance: async (params = {}) => {
    const response = await api.get('/exam-analytics/subject-performance', { params });
    return response.data;
  },

  // Get top performers
  getTopPerformers: async (params = {}) => {
    const response = await api.get('/exam-analytics/top-performers', { params });
    return response.data;
  },

  // Get exam trends over time
  getExamTrends: async (params = {}) => {
    const response = await api.get('/exam-analytics/trends', { params });
    return response.data;
  },

  // Get grade analytics by class
  getGradeAnalyticsByClass: async (classId, params = {}) => {
    const response = await api.get(`/exam-analytics/grade-analytics/${classId}`, { params });
    return response.data;
  },
};

export default examAnalyticsService;

