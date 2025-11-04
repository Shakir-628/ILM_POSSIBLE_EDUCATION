import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { rolePermissionService } from '../services/rolePermissionService';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role) {
      fetchPermissions();
    } else {
      setPermissions(null);
      setLoading(false);
    }
  }, [user]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await rolePermissionService.getRolePermissionByRole(user.role);
      setPermissions(response.data);
    } catch (error) {
      console.error('Error fetching permissions:', error.response?.data?.message || error.message);
      // If permissions not found, use default behavior
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  };

  const hasModulePermission = (moduleName) => {
    if (!permissions || !permissions.modules) {
      return true; // Default to true if no permissions set
    }
    
    const module = permissions.modules.find(m => m.moduleName === moduleName);
    return module ? module.enabled : false;
  };

  const hasSubmodulePermission = (moduleName, submoduleName) => {
    if (!permissions || !permissions.modules) return true; // Default to true if no permissions set
    const module = permissions.modules.find(m => m.moduleName === moduleName);
    if (!module || !module.enabled) return false;
    
    if (!module.submodules || module.submodules.length === 0) return true;
    
    const submodule = module.submodules.find(s => s.name === submoduleName);
    return submodule ? submodule.enabled : false;
  };

  const value = {
    permissions,
    loading,
    hasModulePermission,
    hasSubmodulePermission,
    refreshPermissions: fetchPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

export default PermissionContext;

