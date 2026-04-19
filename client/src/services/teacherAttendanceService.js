import api from './api';

export const teacherAttendanceService = {
  getAttendance: async (params = {}) => {
    const response = await api.get('/teacher-attendance', { params });
    return response.data;
  },

  markAttendance: async (attendanceData) => {
    const response = await api.post('/teacher-attendance', attendanceData);
    return response.data;
  },

  getStats: async (teacherId, params = {}) => {
    const response = await api.get(`/teacher-attendance/stats/${teacherId}`, { params });
    return response.data;
  },
};

export default teacherAttendanceService;
