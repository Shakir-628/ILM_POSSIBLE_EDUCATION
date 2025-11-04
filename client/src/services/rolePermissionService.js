import api from './api';

export const rolePermissionService = {
  // Get all role permissions
  getAllRolePermissions: async () => {
    const response = await api.get('/role-permissions');
    return response.data;
  },

  // Get permissions for a specific role
  getRolePermissionByRole: async (role) => {
    const response = await api.get(`/role-permissions/${role}`);
    return response.data;
  },

  // Create or update role permissions
  upsertRolePermission: async (data) => {
    const response = await api.post('/role-permissions', data);
    return response.data;
  },

  // Update module visibility for a role
  updateModuleVisibility: async (role, data) => {
    const response = await api.patch(`/role-permissions/${role}/modules`, data);
    return response.data;
  },

  // Initialize default permissions
  initializeDefaultPermissions: async () => {
    const response = await api.post('/role-permissions/initialize');
    return response.data;
  },

  // Delete role permissions
  deleteRolePermission: async (role) => {
    const response = await api.delete(`/role-permissions/${role}`);
    return response.data;
  },
};

export default rolePermissionService;

