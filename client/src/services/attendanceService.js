import api from './api';

export const attendanceService = {
  getAllAttendance: async (params = {}) => {
    const response = await api.get('/attendance', { params });
    return response.data;
  },

  getAttendanceById: async (id) => {
    const response = await api.get(`/attendance/${id}`);
    return response.data;
  },

  markAttendance: async (attendanceData) => {
    const response = await api.post('/attendance', attendanceData);
    return response.data;
  },

  bulkMarkAttendance: async (bulkData) => {
    const response = await api.post('/attendance/bulk', bulkData);
    return response.data;
  },

  updateAttendance: async (id, attendanceData) => {
    const response = await api.put(`/attendance/${id}`, attendanceData);
    return response.data;
  },

  deleteAttendance: async (id) => {
    const response = await api.delete(`/attendance/${id}`);
    return response.data;
  },

  getAttendanceStats: async (studentId, params = {}) => {
    const response = await api.get(`/attendance/stats/${studentId}`, { params });
    return response.data;
  },
};

