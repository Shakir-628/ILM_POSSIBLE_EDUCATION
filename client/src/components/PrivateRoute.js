import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionContext';

const PrivateRoute = ({ children, roles = [], module = null }) => {
  const { user, loading } = useAuth();
  const { hasModulePermission, loading: permissionsLoading } = usePermissions();

  if (loading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check module permission from database (if specified)
  if (module && !hasModulePermission(module)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Access granted - user has correct role and module permissions
  return children;
};

export default PrivateRoute;

