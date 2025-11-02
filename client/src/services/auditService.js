import api from './api';

export const auditService = {
  // Get all audit logs with filters
  getAllAuditLogs: async (params = {}) => {
    const response = await api.get('/audit', { params });
    return response.data;
  },

  // Get audit logs statistics
  getAuditStats: async (params = {}) => {
    const response = await api.get('/audit/stats', { params });
    return response.data;
  },

  // Get recent activity (last 24 hours)
  getRecentActivity: async (params = {}) => {
    const response = await api.get('/audit/recent', { params });
    return response.data;
  },

  // Get audit logs for specific entity
  getEntityAuditLogs: async (entity, id, params = {}) => {
    const response = await api.get(`/audit/entity/${entity}/${id}`, { params });
    return response.data;
  },

  // Get audit logs for specific user
  getUserAuditLogs: async (userId, params = {}) => {
    const response = await api.get(`/audit/user/${userId}`, { params });
    return response.data;
  },

  // Cleanup old logs
  cleanupOldLogs: async (days = 90) => {
    const response = await api.delete(`/audit/cleanup?days=${days}`);
    return response.data;
  },
};

export default auditService;

