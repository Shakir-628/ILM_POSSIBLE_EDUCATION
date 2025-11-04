import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import Card from '../../components/Card';
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { rolePermissionService } from '../../services/rolePermissionService';
import { useToast } from '../../context/ToastContext';

const RolePermissions = () => {
  const toast = useToast();
  const [rolePermissions, setRolePermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRolePermissions();
  }, []);

  const fetchRolePermissions = async () => {
    setLoading(true);
    try {
      const response = await rolePermissionService.getAllRolePermissions();
      setRolePermissions(response.data);
      if (response.data.length > 0 && !selectedRole) {
        setSelectedRole(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      if (error.response?.status === 404 || error.response?.data?.message?.includes('not found')) {
        toast.info('Initializing role permissions...');
        await initializePermissions();
      } else {
        toast.error('Failed to fetch role permissions');
      }
    } finally {
      setLoading(false);
    }
  };

  const initializePermissions = async () => {
    try {
      await rolePermissionService.initializeDefaultPermissions();
      toast.success('Role permissions initialized successfully');
      await fetchRolePermissions();
    } catch (error) {
      console.error('Error initializing permissions:', error);
      if (error.response?.data?.message?.includes('already initialized')) {
        await fetchRolePermissions();
      } else {
        toast.error('Failed to initialize role permissions');
      }
    }
  };

  const handleModuleToggle = async (moduleIndex, enabled) => {
    const updatedRole = { ...selectedRole };
    updatedRole.modules[moduleIndex].enabled = enabled;
    setSelectedRole(updatedRole);
  };

  const handleSubmoduleToggle = async (moduleIndex, submoduleIndex, enabled) => {
    const updatedRole = { ...selectedRole };
    updatedRole.modules[moduleIndex].submodules[submoduleIndex].enabled = enabled;
    setSelectedRole(updatedRole);
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      await rolePermissionService.upsertRolePermission(selectedRole);
      toast.success('Permissions updated successfully');
      await fetchRolePermissions();
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      superadmin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      teacher: 'bg-green-100 text-green-800',
      student: 'bg-yellow-100 text-yellow-800',
      parent: 'bg-orange-100 text-orange-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading role permissions...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ShieldCheckIcon className="h-8 w-8 mr-2 text-primary-600" />
              Role & Module Permissions
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Configure which modules and features are visible to each role
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              icon={ArrowPathIcon}
              onClick={fetchRolePermissions}
            >
              Refresh
            </Button>
            {selectedRole && (
              <Button
                onClick={handleSavePermissions}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>

        {rolePermissions.length === 0 ? (
          <Card className="p-12 text-center">
            <ShieldCheckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Role Permissions Found
            </h3>
            <p className="text-gray-500 mb-4">
              Initialize default role permissions to get started
            </p>
            <Button onClick={initializePermissions}>
              Initialize Permissions
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Role Selection Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Roles</h2>
                <div className="space-y-2">
                  {rolePermissions.map((role) => (
                    <button
                      key={role._id}
                      onClick={() => setSelectedRole(role)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        selectedRole?._id === role._id
                          ? 'bg-primary-50 border-2 border-primary-500 text-primary-900'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{role.displayName}</div>
                          <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getRoleBadgeColor(role.role)}`}>
                            {role.role}
                          </div>
                        </div>
                        {selectedRole?._id === role._id && (
                          <CheckCircleIcon className="h-5 w-5 text-primary-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{role.description}</p>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Module Permissions */}
            {selectedRole && (
              <div className="lg:col-span-3">
                <Card className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedRole.displayName} Permissions
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Toggle modules and submodules to control visibility
                    </p>
                  </div>

                  <div className="space-y-4">
                    {selectedRole.modules.map((module, moduleIndex) => (
                      <div
                        key={moduleIndex}
                        className={`border-2 rounded-lg p-4 transition-all ${
                          module.enabled
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        {/* Module Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleModuleToggle(moduleIndex, !module.enabled)}
                              className={`w-12 h-6 rounded-full transition-colors ${
                                module.enabled ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                                  module.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {module.moduleName}
                              </h3>
                              {module.enabled ? (
                                <span className="text-xs text-green-600 font-medium">Enabled</span>
                              ) : (
                                <span className="text-xs text-gray-500 font-medium">Disabled</span>
                              )}
                            </div>
                          </div>
                          {module.enabled ? (
                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                          ) : (
                            <XCircleIcon className="h-6 w-6 text-gray-400" />
                          )}
                        </div>

                        {/* Submodules */}
                        {module.submodules && module.submodules.length > 0 && (
                          <div className="ml-8 space-y-2 border-l-2 border-gray-300 pl-4">
                            {module.submodules.map((submodule, submoduleIndex) => (
                              <div
                                key={submoduleIndex}
                                className={`flex items-center justify-between p-3 rounded-md ${
                                  module.enabled
                                    ? submodule.enabled
                                      ? 'bg-white border border-green-200'
                                      : 'bg-white border border-gray-200'
                                    : 'bg-gray-100 opacity-50'
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <button
                                    onClick={() =>
                                      handleSubmoduleToggle(
                                        moduleIndex,
                                        submoduleIndex,
                                        !submodule.enabled
                                      )
                                    }
                                    disabled={!module.enabled}
                                    className={`w-10 h-5 rounded-full transition-colors ${
                                      module.enabled
                                        ? submodule.enabled
                                          ? 'bg-green-500'
                                          : 'bg-gray-300'
                                        : 'bg-gray-200 cursor-not-allowed'
                                    }`}
                                  >
                                    <div
                                      className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                                        submodule.enabled ? 'translate-x-5' : 'translate-x-0.5'
                                      }`}
                                    />
                                  </button>
                                  <span className="text-sm font-medium text-gray-700">
                                    {submodule.name}
                                  </span>
                                </div>
                                {module.enabled && submodule.enabled && (
                                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Save Button */}
                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={handleSavePermissions}
                      disabled={saving}
                      size="lg"
                    >
                      {saving ? 'Saving Changes...' : 'Save All Changes'}
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RolePermissions;

