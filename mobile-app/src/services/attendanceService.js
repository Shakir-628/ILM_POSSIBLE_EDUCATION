// Reused from web app
import api from './api';

export const attendanceService = {
  getAllAttendance: async (params = {}) => {
    const response = await api.get('/attendance', { params });
    return response.data;
  },

  getMyAttendance: async (params = {}) => {
    // Backend uses /attendance with query params to filter by logged-in student
    const response = await api.get('/attendance', { params });
    return response.data;
  },

  markAttendance: async (data) => {
    const response = await api.post('/attendance', data);
    return response.data;
  },

  bulkMarkAttendance: async (data) => {
    const response = await api.post('/attendance/bulk', data);
    return response.data;
  },

  getAttendanceStats: async (studentId) => {
    const response = await api.get(`/attendance/stats/${studentId}`);
    return response.data;
  },

  getMonthlyAttendance: async (month, year) => {
    const response = await api.get('/attendance/monthly', {
      params: { month, year },
    });
    return response.data;
  },
};

