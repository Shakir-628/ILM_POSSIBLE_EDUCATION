import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  TableCellsIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { rolePermissionService } from '../../services/rolePermissionService';
import { useToast } from '../../context/ToastContext';
import { TableSkeleton } from '../../components/LoadingSkeleton';

const RolePermissions = () => {
  const toast = useToast();
  const [rolePermissions, setRolePermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('role'); // 'role' or 'matrix'

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

  const handleModuleToggle = (moduleIndex, enabled) => {
    const updatedRole = { ...selectedRole };
    const module = updatedRole.modules[moduleIndex];
    module.enabled = enabled;

    // If we disable a module, disable all its submodules
    // If we enable a module, enable all its submodules by default
    if (module.submodules) {
      module.submodules = module.submodules.map(sub => ({
        ...sub,
        enabled: enabled
      }));
    }

    setSelectedRole(updatedRole);
  };

  const handleSubmoduleToggle = (moduleIndex, submoduleIndex, enabled) => {
    const updatedRole = { ...selectedRole };
    const module = updatedRole.modules[moduleIndex];
    module.submodules[submoduleIndex].enabled = enabled;

    if (enabled) {
      // If a submodule is enabled, the parent module MUST be enabled
      module.enabled = true;
    } else {
      // If a submodule is disabled, check if there are any other enabled submodules
      const hasOtherEnabledSubmodules = module.submodules.some(sub => sub.enabled);
      if (!hasOtherEnabledSubmodules) {
        // If no submodules are enabled, the parent module should be disabled
        module.enabled = false;
      }
    }

    setSelectedRole(updatedRole);
  };

  const handlePermissionToggle = (moduleIndex, permissionType, enabled) => {
    const updatedRole = { ...selectedRole };
    if (!updatedRole.modules[moduleIndex].permissions) {
      updatedRole.modules[moduleIndex].permissions = {
        create: false,
        read: true,
        update: false,
        delete: false
      };
    }
    updatedRole.modules[moduleIndex].permissions[permissionType] = enabled;
    setSelectedRole(updatedRole);
  };

  const handleMatrixModuleToggle = (roleIndex, moduleName, enabled) => {
    const updatedPermissions = [...rolePermissions];
    const role = updatedPermissions[roleIndex];
    let mIndex = role.modules.findIndex(m => m.moduleName === moduleName);

    if (mIndex !== -1) {
      const module = role.modules[mIndex];
      module.enabled = enabled;

      // Sync submodules
      if (module.submodules) {
        module.submodules = module.submodules.map(sub => ({
          ...sub,
          enabled: enabled
        }));
      }
      setRolePermissions(updatedPermissions);
    } else if (enabled) {
      // If module doesn't exist and we're enabling it
      role.modules.push({
        moduleName: moduleName,
        enabled: true,
        submodules: []
      });
      setRolePermissions(updatedPermissions);
    }
  };

  const handleMatrixSubmoduleToggle = (roleIndex, moduleName, submoduleName, enabled) => {
    const updatedPermissions = [...rolePermissions];
    const role = updatedPermissions[roleIndex];
    let mIndex = role.modules.findIndex(m => m.moduleName === moduleName);

    if (mIndex !== -1) {
      const module = role.modules[mIndex];
      let sIndex = module.submodules.findIndex(s => s.name === submoduleName);

      if (sIndex !== -1) {
        module.submodules[sIndex].enabled = enabled;
      } else if (enabled) {
        module.submodules.push({
          name: submoduleName,
          enabled: true
        });
      }

      // Handle parent dependency
      if (enabled) {
        module.enabled = true;
      } else {
        const hasOtherEnabledSubmodules = module.submodules.some(sub => sub.enabled);
        if (!hasOtherEnabledSubmodules) {
          module.enabled = false;
        }
      }

      setRolePermissions(updatedPermissions);
    }
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      if (viewMode === 'role') {
        await rolePermissionService.upsertRolePermission(selectedRole);
      } else {
        // In matrix mode, save all roles that have changes
        const savePromises = rolePermissions.map(role =>
          rolePermissionService.upsertRolePermission(role)
        );
        await Promise.all(savePromises);
      }
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
        <div className="space-y-6">
          <div className="h-10 w-64 bg-gray-200 animate-pulse rounded" />
          <TableSkeleton rows={10} cols={5} />
        </div>
      </Layout>
    );
  }

  // Generate a master list of all modules and submodules for the matrix view
  const allModules = [];
  if (rolePermissions.length > 0) {
    // We use superadmin as the template for all modules
    const templateRole = rolePermissions.find(r => r.role === 'superadmin') || rolePermissions[0];
    templateRole.modules.forEach(m => {
      allModules.push({
        name: m.moduleName,
        isModule: true,
        submodules: m.submodules.map(s => s.name)
      });
    });
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ShieldCheckIcon className="h-8 w-8 mr-2 text-primary-600" />
              Role & Module Permissions
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Configure which modules and features are visible to each role
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-gray-100 p-1 rounded-lg flex mr-4">
              <button
                onClick={() => setViewMode('role')}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'role' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <UserCircleIcon className="h-4 w-4 mr-1.5" />
                By Role
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'matrix' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <TableCellsIcon className="h-4 w-4 mr-1.5" />
                Matrix View
              </button>
            </div>

            <Button
              variant="secondary"
              icon={ArrowPathIcon}
              onClick={fetchRolePermissions}
            >
              Refresh
            </Button>
            <Button
              onClick={handleSavePermissions}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        </div>

        {rolePermissions.length === 0 ? (
          <div className="bg-white shadow-md rounded-2xl border border-gray-100 p-12 text-center">
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
          </div>
        ) : viewMode === 'role' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Role Selection Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-md rounded-2xl border border-gray-100 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Roles</h2>
                <div className="space-y-2">
                  {rolePermissions.map((role) => (
                    <button
                      key={role._id}
                      onClick={() => setSelectedRole(role)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedRole?._id === role._id
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
              </div>
            </div>

            {/* Module Permissions */}
            {selectedRole && (
              <div className="lg:col-span-3">
                <div className="bg-white shadow-md rounded-2xl border border-gray-100 p-6">
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
                        className={`border-2 rounded-lg p-4 transition-all ${module.enabled
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                          }`}
                      >
                        {/* Module Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleModuleToggle(moduleIndex, !module.enabled)}
                              disabled={selectedRole.role === 'superadmin'}
                              className={`w-12 h-6 rounded-full transition-colors ${module.enabled ? 'bg-green-500' : 'bg-gray-300'
                                } ${selectedRole.role === 'superadmin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div
                                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${module.enabled ? 'translate-x-6' : 'translate-x-1'
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
                          
                          {/* CRUD Permissions */}
                          <div className="flex items-center gap-6 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
                            {(['create', 'read', 'update', 'delete']).map((perm) => (
                              <label key={perm} className="flex items-center space-x-2 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={module.permissions ? !!module.permissions[perm] : perm === 'read'}
                                  disabled={selectedRole.role === 'superadmin'}
                                  onChange={(e) => handlePermissionToggle(moduleIndex, perm, e.target.checked)}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer group-hover:scale-110 transition-transform disabled:opacity-50"
                                />
                                <span className={`text-xs font-bold uppercase tracking-wider ${
                                  (module.permissions ? !!module.permissions[perm] : perm === 'read') 
                                    ? 'text-primary-700' 
                                    : 'text-gray-400'
                                }`}>
                                  {perm}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Submodules */}
                        {module.submodules && module.submodules.length > 0 && (
                          <div className="ml-8 mt-4 space-y-2 border-l-2 border-gray-300 pl-4">
                            {module.submodules.map((submodule, submoduleIndex) => (
                              <div
                                key={submoduleIndex}
                                className={`flex items-center justify-between p-3 rounded-md ${module.enabled
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
                                    disabled={!module.enabled || selectedRole.role === 'superadmin'}
                                    className={`w-10 h-5 rounded-full transition-colors ${module.enabled
                                      ? submodule.enabled
                                        ? 'bg-green-500'
                                        : 'bg-gray-300'
                                      : 'bg-gray-200 cursor-not-allowed'
                                      } ${selectedRole.role === 'superadmin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >
                                    <div
                                      className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${submodule.enabled ? 'translate-x-5' : 'translate-x-0.5'
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
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Matrix View */
          <div className="bg-white shadow-md rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10 w-64">
                      Modules & Options
                    </th>
                    {rolePermissions.map(role => (
                      <th key={role.role} className="px-4 py-4 text-center text-sm font-semibold text-gray-700 min-w-[120px]">
                        <div className="flex flex-col items-center">
                          <span>{role.displayName}</span>
                          <span className={`text-[10px] uppercase mt-1 px-1.5 py-0.5 rounded ${getRoleBadgeColor(role.role)}`}>
                            {role.role}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allModules.map((moduleMeta, mIdx) => (
                    <React.Fragment key={moduleMeta.name}>
                      {/* Module Row */}
                      <tr className="bg-gray-50/50">
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 sticky left-0 bg-gray-50 z-10">
                          {moduleMeta.name}
                        </td>
                        {rolePermissions.map((role, rIdx) => {
                          const mIndex = role.modules.findIndex(m => m.moduleName === moduleMeta.name);
                          const isEnabled = mIndex !== -1 && role.modules[mIndex].enabled;
                          const isSuperAdmin = role.role === 'superadmin';
                          return (
                            <td key={role.role} className="px-4 py-4 text-center">
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                disabled={isSuperAdmin}
                                title={isSuperAdmin ? "Superadmin permissions cannot be modified" : ""}
                                onChange={(e) => handleMatrixModuleToggle(rIdx, moduleMeta.name, e.target.checked)}
                                className={`h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-all ${isSuperAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                                  }`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                      {/* Submodule Rows */}
                      {moduleMeta.submodules.map((subName, sIdx) => (
                        <tr key={`${moduleMeta.name}-${subName}`} className="hover:bg-gray-50">
                          <td className="px-10 py-3 text-sm text-gray-600 sticky left-0 bg-white z-10 border-r border-gray-100">
                            {subName}
                          </td>
                          {rolePermissions.map((role, rIdx) => {
                            const mIndex = role.modules.findIndex(m => m.moduleName === moduleMeta.name);
                            const mEnabled = mIndex !== -1 && role.modules[mIndex].enabled;
                            const sIndex = mIndex !== -1 ? role.modules[mIndex].submodules.findIndex(s => s.name === subName) : -1;
                            const sEnabled = sIndex !== -1 && role.modules[mIndex].submodules[sIndex].enabled;
                            const isSuperAdmin = role.role === 'superadmin';

                            return (
                              <td key={role.role} className={`px-4 py-3 text-center ${!mEnabled ? 'bg-gray-50/50' : ''}`}>
                                <input
                                  type="checkbox"
                                  checked={sEnabled}
                                  disabled={!mEnabled || isSuperAdmin}
                                  title={isSuperAdmin ? "Superadmin permissions cannot be modified" : ""}
                                  onChange={(e) => handleMatrixSubmoduleToggle(rIdx, moduleMeta.name, subName, e.target.checked)}
                                  className={`h-4 w-4 rounded transition-all ${mEnabled && !isSuperAdmin
                                    ? 'text-primary-600 focus:ring-primary-500 border-gray-300 cursor-pointer hover:scale-110'
                                    : 'text-gray-300 border-gray-200 cursor-not-allowed opacity-30'
                                    }`}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                <span className="font-bold">Pro Tip:</span> In Matrix View, submodules are only editable if their parent module is enabled.
              </div>
              <Button
                onClick={handleSavePermissions}
                disabled={saving}
                size="lg"
              >
                {saving ? 'Saving Matrix...' : 'Save Matrix Changes'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RolePermissions;