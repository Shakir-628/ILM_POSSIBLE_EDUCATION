import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Select from '../components/Select';
import Input from '../components/Input';
import Pagination from '../components/Pagination';
import {
  ClipboardDocumentListIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { auditService } from '../services/auditService';
import { useToast } from '../context/ToastContext';

const AuditLogs = () => {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    entity: '',
    action: '',
    userId: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLogs: 0,
  });

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await auditService.getAllAuditLogs(filters);
      setLogs(response.logs || []);
      setPagination({
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
        totalLogs: response.totalLogs || 0,
      });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await auditService.getAuditStats({
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      setStats(response);
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
    if (window.confirm('Are you sure you want to delete audit logs older than 90 days?')) {
      try {
        const response = await auditService.cleanupOldLogs(90);
        toast.success(response.message);
        fetchLogs();
        fetchStats();
      } catch (error) {
        console.error('Error cleaning up logs:', error);
        toast.error('Failed to cleanup logs');
      }
    }
  };

  const getActionBadge = (action) => {
    const colors = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      login: 'bg-purple-100 text-purple-800',
      logout: 'bg-gray-100 text-gray-800',
    };
    return colors[action] || colors.create;
  };

  const getActionIcon = (action) => {
    const icons = {
      create: PlusCircleIcon,
      update: PencilSquareIcon,
      delete: TrashIcon,
      login: UserIcon,
      logout: UserIcon,
    };
    return icons[action] || PlusCircleIcon;
  };

  const columns = [
    {
      header: 'Action',
      accessor: 'action',
      render: (row) => {
        const Icon = getActionIcon(row.action);
        return (
          <div className="flex items-center">
            <Icon className="h-4 w-4 mr-2 text-gray-500" />
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadge(row.action)}`}>
              {row.action.toUpperCase()}
            </span>
          </div>
        );
      },
    },
    { header: 'Entity', accessor: 'entity' },
    {
      header: 'User',
      accessor: 'user',
      render: (row) => row.user ? `${row.user.name} (${row.user.role})` : 'System',
    },
    {
      header: 'IP Address',
      accessor: 'ipAddress',
      render: (row) => row.ipAddress || 'N/A',
    },
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      render: (row) => new Date(row.timestamp).toLocaleString(),
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
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track all user actions and entity changes
            </p>
          </div>
          <Button onClick={handleCleanup} variant="secondary" icon={TrashIcon}>
            Cleanup Old Logs
          </Button>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-5">
            <Card
              title="Total Actions"
              value={stats.totalLogs}
              icon={ClipboardDocumentListIcon}
              color="blue"
            />
            <Card
              title="Created"
              value={stats.actionBreakdown?.create || 0}
              icon={PlusCircleIcon}
              color="green"
            />
            <Card
              title="Updated"
              value={stats.actionBreakdown?.update || 0}
              icon={PencilSquareIcon}
              color="blue"
            />
            <Card
              title="Deleted"
              value={stats.actionBreakdown?.delete || 0}
              icon={TrashIcon}
              color="red"
            />
            <Card
              title="Logins"
              value={stats.actionBreakdown?.login || 0}
              icon={UserIcon}
              color="purple"
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select
              label="Entity"
              value={filters.entity}
              onChange={(e) => handleFilterChange('entity', e.target.value)}
              options={[
                { value: '', label: 'All Entities' },
                { value: 'Student', label: 'Student' },
                { value: 'Teacher', label: 'Teacher' },
                { value: 'Parent', label: 'Parent' },
                { value: 'Class', label: 'Class' },
                { value: 'Subject', label: 'Subject' },
                { value: 'Attendance', label: 'Attendance' },
                { value: 'Grade', label: 'Grade' },
                { value: 'Assignment', label: 'Assignment' },
                { value: 'FeePayment', label: 'Fee Payment' },
                { value: 'Admission', label: 'Admission' },
                { value: 'Message', label: 'Message' },
                { value: 'Announcement', label: 'Announcement' },
                { value: 'Event', label: 'Event' },
              ]}
            />
            <Select
              label="Action"
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              options={[
                { value: '', label: 'All Actions' },
                { value: 'create', label: 'Create' },
                { value: 'update', label: 'Update' },
                { value: 'delete', label: 'Delete' },
                { value: 'login', label: 'Login' },
                { value: 'logout', label: 'Logout' },
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
            <div className="flex items-end">
              <Button
                onClick={() => setFilters({
                  entity: '',
                  action: '',
                  userId: '',
                  startDate: '',
                  endDate: '',
                  page: 1,
                  limit: 50,
                })}
                variant="secondary"
              >
                Clear Filters
              </Button>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Showing {logs.length} of {pagination.totalLogs} audit logs
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Table columns={columns} data={logs} loading={loading} />
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalLogs}
          itemsPerPage={filters.limit}
          onPageChange={(page) => handleFilterChange('page', page)}
          onItemsPerPageChange={(limit) => handleFilterChange('limit', limit)}
        />

        {/* Detail Modal */}
        {isDetailModalOpen && selectedLog && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" onClick={() => setIsDetailModalOpen(false)}>
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Audit Log Details</h3>
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
                        <p className="text-sm font-medium text-gray-500">Action</p>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadge(selectedLog.action)}`}>
                          {selectedLog.action.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Entity</p>
                        <p className="text-sm text-gray-900">{selectedLog.entity}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Entity ID</p>
                        <p className="text-sm text-gray-900 font-mono">{selectedLog.entityId}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">User</p>
                        <p className="text-sm text-gray-900">
                          {selectedLog.user ? `${selectedLog.user.name} (${selectedLog.user.email})` : 'System'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">User Role</p>
                        <p className="text-sm text-gray-900">{selectedLog.user?.role || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">IP Address</p>
                        <p className="text-sm text-gray-900">{selectedLog.ipAddress || 'N/A'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">User Agent</p>
                      <p className="text-sm text-gray-900 truncate">{selectedLog.userAgent || 'N/A'}</p>
                    </div>

                    {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Changes Made</p>
                        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-60">
                          {JSON.stringify(selectedLog.changes, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-gray-500">Timestamp</p>
                      <p className="text-sm text-gray-900">{new Date(selectedLog.timestamp).toLocaleString()}</p>
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

export default AuditLogs;

