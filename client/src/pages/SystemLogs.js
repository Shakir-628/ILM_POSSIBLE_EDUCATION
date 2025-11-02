import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Select from '../components/Select';
import Input from '../components/Input';
import Pagination from '../components/Pagination';
import {
  ServerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { logService } from '../services/logService';
import { useToast } from '../context/ToastContext';

const SystemLogs = () => {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    level: '',
    category: '',
    search: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50,
  });

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await logService.getAllLogs(filters);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await logService.getLogStats({
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1, // Reset to page 1 when filters change
    }));
  };

  const handleCleanup = async () => {
    if (window.confirm('Are you sure you want to delete logs older than 90 days?')) {
      try {
        const response = await logService.cleanupLogs(90);
        toast.success(response.message);
        fetchLogs();
        fetchStats();
      } catch (error) {
        console.error('Error cleaning up logs:', error);
        toast.error('Failed to cleanup logs');
      }
    }
  };

  const getLevelBadge = (level) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      warn: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      debug: 'bg-gray-100 text-gray-800',
      critical: 'bg-red-600 text-white',
    };
    return colors[level] || colors.info;
  };

  const columns = [
    {
      header: 'Level',
      accessor: 'level',
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLevelBadge(row.level)}`}>
          {row.level.toUpperCase()}
        </span>
      ),
    },
    { header: 'Category', accessor: 'category' },
    {
      header: 'Message',
      accessor: 'message',
      render: (row) => (
        <div className="max-w-md truncate" title={row.message}>
          {row.message}
        </div>
      ),
    },
    {
      header: 'User',
      accessor: 'userEmail',
      render: (row) => row.userEmail || 'System',
    },
    {
      header: 'Time',
      accessor: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleString(),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <button
          onClick={() => {
            setSelectedLog(row);
            setIsDetailModalOpen(true);
          }}
          className="text-indigo-600 hover:text-indigo-900 text-sm"
        >
          View Details
        </button>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor and track system activity and errors
            </p>
          </div>
          <Button onClick={handleCleanup} variant="secondary" icon={TrashIcon}>
            Cleanup Old Logs
          </Button>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <Card
              title="Total Logs"
              value={stats.totalLogs}
              icon={ServerIcon}
              color="blue"
            />
            <Card
              title="Error Rate"
              value={`${stats.errorRate}%`}
              icon={ExclamationTriangleIcon}
              color="red"
            />
            <Card
              title="Avg Response Time"
              value={`${stats.averageResponseTime}ms`}
              icon={CheckCircleIcon}
              color="green"
            />
            <Card
              title="Info Logs"
              value={stats.levelStats?.info || 0}
              icon={InformationCircleIcon}
              color="blue"
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              label="Search"
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search logs..."
            />
            <Select
              label="Level"
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              options={[
                { value: '', label: 'All Levels' },
                { value: 'info', label: 'Info' },
                { value: 'warn', label: 'Warning' },
                { value: 'error', label: 'Error' },
                { value: 'debug', label: 'Debug' },
                { value: 'critical', label: 'Critical' },
              ]}
            />
            <Select
              label="Category"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              options={[
                { value: '', label: 'All Categories' },
                { value: 'auth', label: 'Authentication' },
                { value: 'database', label: 'Database' },
                { value: 'api', label: 'API' },
                { value: 'system', label: 'System' },
                { value: 'security', label: 'Security' },
                { value: 'user-action', label: 'User Action' },
                { value: 'error', label: 'Error' },
              ]}
            />
            <Input
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Table columns={columns} data={logs} loading={loading} />
        </div>

        {/* Log Detail Modal */}
        {isDetailModalOpen && selectedLog && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" onClick={() => setIsDetailModalOpen(false)}>
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Log Details</h3>
                    <button
                      onClick={() => setIsDetailModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Level</p>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLevelBadge(selectedLog.level)}`}>
                          {selectedLog.level.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Category</p>
                        <p className="text-sm text-gray-900">{selectedLog.category}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">User</p>
                        <p className="text-sm text-gray-900">{selectedLog.userEmail || 'System'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">User Role</p>
                        <p className="text-sm text-gray-900">{selectedLog.userRole || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Method</p>
                        <p className="text-sm text-gray-900">{selectedLog.method}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status Code</p>
                        <p className="text-sm text-gray-900">{selectedLog.statusCode}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Response Time</p>
                        <p className="text-sm text-gray-900">{selectedLog.responseTime}ms</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">IP Address</p>
                        <p className="text-sm text-gray-900">{selectedLog.ip}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">URL</p>
                      <p className="text-sm text-gray-900">{selectedLog.url}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">Message</p>
                      <p className="text-sm text-gray-900">{selectedLog.message}</p>
                    </div>

                    {selectedLog.errorStack && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Error Stack</p>
                        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-60">
                          {selectedLog.errorStack}
                        </pre>
                      </div>
                    )}

                    {selectedLog.metadata && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Metadata</p>
                        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                          {JSON.stringify(selectedLog.metadata, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-gray-500">Timestamp</p>
                      <p className="text-sm text-gray-900">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button onClick={() => setIsDetailModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SystemLogs;

