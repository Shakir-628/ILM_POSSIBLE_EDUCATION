import api from './api';

export const analyticsService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/reports/stats');
    return response.data;
  },

  // Get attendance trends (last 30 days)
  getAttendanceTrends: async (days = 30) => {
    const response = await api.get(`/analytics/attendance-trends?days=${days}`);
    return response.data;
  },

  // Get grade distribution
  getGradeDistribution: async (classId = null) => {
    const url = classId ? `/analytics/grade-distribution?classId=${classId}` : '/analytics/grade-distribution';
    const response = await api.get(url);
    return response.data;
  },

  // Get class performance comparison
  getClassPerformance: async () => {
    const response = await api.get('/analytics/class-performance');
    return response.data;
  },

  // Get student enrollment trends
  getEnrollmentTrends: async () => {
    const response = await api.get('/analytics/enrollment-trends');
    return response.data;
  },

  // Get teacher workload
  getTeacherWorkload: async () => {
    const response = await api.get('/analytics/teacher-workload');
    return response.data;
  },

  // Get subject-wise performance
  getSubjectPerformance: async () => {
    const response = await api.get('/analytics/subject-performance');
    return response.data;
  },

  // Get attendance statistics by class
  getAttendanceByClass: async () => {
    const response = await api.get('/analytics/attendance-by-class');
    return response.data;
  },

  // Get smart alerts for attendance drops
  getSmartAlerts: async () => {
    const response = await api.get('/analytics/smart-alerts');
    return response.data;
  },
};

export default analyticsService;

