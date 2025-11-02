import api from './api';

export const logService = {
  // Get all logs with filters
  getAllLogs: async (params = {}) => {
    const response = await api.get('/logs', { params });
    return response.data;
  },

  // Get log statistics
  getLogStats: async (params = {}) => {
    const response = await api.get('/logs/stats', { params });
    return response.data;
  },

  // Cleanup old logs
  cleanupLogs: async (days = 90) => {
    const response = await api.post('/logs/cleanup', { days });
    return response.data;
  },

  // Delete specific log
  deleteLog: async (id) => {
    const response = await api.delete(`/logs/${id}`);
    return response.data;
  },
};

export default logService;

