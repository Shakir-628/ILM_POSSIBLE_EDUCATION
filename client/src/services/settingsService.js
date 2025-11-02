import api from './api';

export const settingsService = {
  // School Profile
  getSchoolProfile: async () => {
    const response = await api.get('/settings/school-profile');
    return response.data;
  },

  updateSchoolProfile: async (profileData) => {
    const response = await api.put('/settings/school-profile', profileData);
    return response.data;
  },

  // User Roles
  getUserRoles: async () => {
    const response = await api.get('/settings/user-roles');
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/settings/user-roles/${userId}`, { role });
    return response.data;
  },

  toggleUserActive: async (userId) => {
    const response = await api.put(`/settings/user-roles/${userId}/toggle-active`);
    return response.data;
  },

  // System
  getSystemStats: async () => {
    const response = await api.get('/settings/system-stats');
    return response.data;
  },

  // Backup
  triggerBackup: async () => {
    const response = await api.post('/settings/backup');
    return response.data;
  },

  getBackups: async () => {
    const response = await api.get('/settings/backups');
    return response.data;
  },

  // System Settings
  getSystemSettings: async () => {
    const response = await api.get('/settings/system');
    return response.data;
  },

  updateSystemSettings: async (settingsData) => {
    const response = await api.put('/settings/system', settingsData);
    return response.data;
  },
};

export default settingsService;

