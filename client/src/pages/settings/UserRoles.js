import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Select from '../../components/Select';
import { UserGroupIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { settingsService } from '../../services/settingsService';
import { useToast } from '../../context/ToastContext';
const UserRoles = () => {
  const toast = useToast();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await settingsService.getUserRoles();
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = (user, currentRole) => {
    setSelectedUser({ ...user, currentRole });
    setNewRole(currentRole);
    setIsModalOpen(true);
  };

  const handleSubmitRoleChange = async (e) => {
    e.preventDefault();
    try {
      await settingsService.updateUserRole(selectedUser._id, newRole);
      toast.success('User role updated successfully');
      setIsModalOpen(false);
      fetchRoles();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error.response?.data?.message || 'Error updating role');
    }
  };

  const handleToggleActive = async (userId) => {
    if (window.confirm('Are you sure you want to toggle user status?')) {
      try {
        await settingsService.toggleUserActive(userId);
        toast.success('User status updated');
        fetchRoles();
      } catch (error) {
        console.error('Error toggling user:', error);
        toast.error(error.response?.data?.message || 'Error updating user status');
      }
    }
  };

  const handleSubmitCreateUser = async (e) => {
    e.preventDefault();
    try {
      await settingsService.createUser(formData);
      toast.success('User created successfully');
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'student',
        phone: '',
        address: ''
      });
      fetchRoles();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.message || 'Error creating user');
    }
  };

  const totalUsers = roles.reduce((sum, role) => sum + role.count, 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Roles Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage user roles and permissions
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Create New User
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <Card
            title="Total Users"
            value={totalUsers}
            icon={UserGroupIcon}
            color="blue"
          />
          {roles.map((role) => (
            <Card
              key={role.role}
              title={role.role.charAt(0).toUpperCase() + role.role.slice(1) + 's'}
              value={role.count}
              icon={ShieldCheckIcon}
              color="purple"
            />
          ))}
        </div>

        {/* Roles List */}
        {roles.map((roleGroup) => (
          <div key={roleGroup.role} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 capitalize">
                {roleGroup.role}s ({roleGroup.count})
              </h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {roleGroup.users && roleGroup.users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive !== false
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                            {user.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleChangeRole(user, roleGroup.role)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Change Role
                          </button>
                          <button
                            onClick={() => handleToggleActive(user._id)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            {user.isActive !== false ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}

        {/* Change Role Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Change User Role"
        >
          {selectedUser && (
            <form onSubmit={handleSubmitRoleChange} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm"><strong>User:</strong> {selectedUser.name}</p>
                <p className="text-sm"><strong>Email:</strong> {selectedUser.email}</p>
                <p className="text-sm"><strong>Current Role:</strong> {selectedUser.currentRole}</p>
              </div>

              <Select
                label="New Role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                options={[
                  { value: 'admin', label: 'Admin' },
                  { value: 'teacher', label: 'Teacher' },
                  { value: 'student', label: 'Student' },
                  { value: 'parent', label: 'Parent' },
                ]}
                required
              />

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Changing user role will affect their access permissions.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Role</Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Create User Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New User"
        >
          <form onSubmit={handleSubmitCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <Select
                  label="Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  options={[
                    { value: 'admin', label: 'Admin' },
                    { value: 'subadmin', label: 'Sub Admin' },
                    { value: 'teacher', label: 'Teacher' },
                    { value: 'student', label: 'Student' },
                    { value: 'parent', label: 'Parent' },
                  ]}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create User</Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default UserRoles;

