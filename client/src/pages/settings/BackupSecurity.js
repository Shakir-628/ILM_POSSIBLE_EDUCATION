import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {
  ShieldCheckIcon,
  ServerIcon,
  ClockIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { settingsService } from '../../services/settingsService';
import { useToast } from '../../context/ToastContext';

const BackupSecurity = () => {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backingUp, setBackingUp] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchBackups();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await settingsService.getSystemStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      
    } finally {
      setLoading(false);
    }
  };

  const fetchBackups = async () => {
    try {
      const response = await settingsService.getBackups();
      setBackups(response.data);
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast.error(error.response?.data?.message || 'Error fetching backups');
    }
  };

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const response = await settingsService.triggerBackup();
      toast.success(response.message || 'Backup created successfully');
      fetchBackups();
      fetchStats();
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error(error.response?.data?.message || 'Error creating backup');
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backup & Security</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage database backups and security settings
          </p>
        </div>

        {/* System Statistics */}
        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <Card
              title="Total Users"
              value={stats.totalUsers}
              icon={ShieldCheckIcon}
              color="blue"
            />
            <Card
              title="Active Users"
              value={stats.activeUsers}
              icon={ShieldCheckIcon}
              color="green"
            />
            <Card
              title="Database Size"
              value={stats.databaseSize}
              icon={ServerIcon}
              color="purple"
            />
            <Card
              title="Last Backup"
              value={stats.lastBackup}
              icon={ClockIcon}
              color="orange"
            />
          </div>
        )}

        {/* Backup Management */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Database Backups</h2>
              <p className="text-sm text-gray-500 mt-1">
                Create and manage database backups
              </p>
            </div>
            <Button
              onClick={handleBackup}
              disabled={backingUp}
              icon={ArrowDownTrayIcon}
            >
              {backingUp ? 'Creating Backup...' : 'Create Backup Now'}
            </Button>
          </div>

          {/* Backup List */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Backup History</h3>
            {backups.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Backup Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Size
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {backups.map((backup, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {backup.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(backup.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(backup.size / 1024 / 1024).toFixed(2)} MB
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No backups found. Create your first backup above.</p>
            )}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Password Policy</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Minimum password length: 6 characters</li>
                <li>• Password must contain letters and numbers</li>
                <li>• Passwords are hashed using bcrypt</li>
                <li>• Session timeout: 30 minutes</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-md">
              <h3 className="text-sm font-semibold text-green-900 mb-2">Active Security Features</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>✓ JWT-based authentication</li>
                <li>✓ Role-based access control (RBAC)</li>
                <li>✓ Password encryption (bcrypt)</li>
                <li>✓ Audit logging</li>
                <li>✓ Protected API routes</li>
                <li>✓ Input validation and sanitization</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">Security Recommendations</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Enable two-factor authentication (2FA)</li>
                <li>• Regular password updates for all users</li>
                <li>• Monitor audit logs regularly</li>
                <li>• Keep system and dependencies updated</li>
                <li>• Use strong JWT secret in production</li>
              </ul>
            </div>
          </div>
        </div>

        {/* User Activity */}
        {stats && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Distribution by Role</h2>
            <div className="space-y-3">
              {stats.usersByRole.map((role) => (
                <div key={role._id} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {role._id}s
                  </span>
                  <div className="flex items-center">
                    <div className="w-64 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${(role.count / stats.totalUsers) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{role.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BackupSecurity;

