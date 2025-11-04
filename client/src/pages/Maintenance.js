import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import {
  WrenchScrewdriverIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { maintenanceService } from '../services/maintenanceService';
import { assetService } from '../services/assetService';
import { useToast } from '../context/ToastContext';

const Maintenance = () => {
  const toast = useToast();
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    startDate: '',
    endDate: '',
  });

  const [formData, setFormData] = useState({
    asset: '',
    maintenanceType: '',
    scheduledDate: '',
    status: 'Scheduled',
    priority: 'Medium',
    description: '',
    performedBy: '',
    cost: 0,
    serviceProvider: {
      name: '',
      contact: '',
      email: '',
    },
    beforeCondition: '',
    notes: '',
  });

  useEffect(() => {
    fetchMaintenanceRecords();
    fetchAssets();
    fetchStats();
  }, [filters]);

  const fetchMaintenanceRecords = async () => {
    setLoading(true);
    try {
      const data = await maintenanceService.getAllMaintenance(filters);
      setMaintenanceRecords(data);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      toast.error('Failed to fetch maintenance records');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const data = await assetService.getAllAssets({ status: 'Active' });
      setAssets(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await maintenanceService.getMaintenanceStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode && selectedMaintenance) {
        await maintenanceService.updateMaintenance(selectedMaintenance._id, formData);
        toast.success('Maintenance record updated successfully');
      } else {
        await maintenanceService.createMaintenance(formData);
        toast.success('Maintenance record created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      fetchMaintenanceRecords();
      fetchStats();
    } catch (error) {
      console.error('Error saving maintenance record:', error);
      toast.error(error.response?.data?.message || 'Failed to save maintenance record');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (maintenance) => {
    setSelectedMaintenance(maintenance);
    setFormData({
      asset: maintenance.asset._id,
      maintenanceType: maintenance.maintenanceType,
      scheduledDate: maintenance.scheduledDate?.split('T')[0] || '',
      status: maintenance.status,
      priority: maintenance.priority,
      description: maintenance.description,
      performedBy: maintenance.performedBy || '',
      cost: maintenance.cost || 0,
      serviceProvider: maintenance.serviceProvider || { name: '', contact: '', email: '' },
      beforeCondition: maintenance.beforeCondition || '',
      notes: maintenance.notes || '',
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      try {
        await maintenanceService.deleteMaintenance(id);
        toast.success('Maintenance record deleted successfully');
        fetchMaintenanceRecords();
        fetchStats();
      } catch (error) {
        console.error('Error deleting maintenance record:', error);
        toast.error('Failed to delete maintenance record');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      asset: '',
      maintenanceType: '',
      scheduledDate: '',
      status: 'Scheduled',
      priority: 'Medium',
      description: '',
      performedBy: '',
      cost: 0,
      serviceProvider: { name: '', contact: '', email: '' },
      beforeCondition: '',
      notes: '',
    });
    setIsEditMode(false);
    setSelectedMaintenance(null);
  };

  const maintenanceTypes = [
    { value: 'Preventive', label: 'Preventive' },
    { value: 'Corrective', label: 'Corrective' },
    { value: 'Inspection', label: 'Inspection' },
    { value: 'Repair', label: 'Repair' },
    { value: 'Upgrade', label: 'Upgrade' },
    { value: 'Replacement', label: 'Replacement' },
  ];

  const statuses = [
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Pending', label: 'Pending' },
  ];

  const priorities = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' },
  ];

  const conditions = [
    { value: 'Excellent', label: 'Excellent' },
    { value: 'Good', label: 'Good' },
    { value: 'Fair', label: 'Fair' },
    { value: 'Poor', label: 'Poor' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <WrenchScrewdriverIcon className="h-8 w-8 mr-2 text-primary-600" />
              Maintenance Tracking
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Track and manage asset maintenance schedules
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={async () => {
                try {
                  await maintenanceService.exportToExcel(filters);
                  toast.success('Excel report downloaded successfully');
                } catch (error) {
                  toast.error('Failed to export to Excel');
                }
              }}
            >
              Export Excel
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                try {
                  await maintenanceService.exportToPDF(filters);
                  toast.success('PDF report downloaded successfully');
                } catch (error) {
                  toast.error('Failed to export to PDF');
                }
              }}
            >
              Export PDF
            </Button>
            <Button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              icon={PlusIcon}
            >
              Schedule Maintenance
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card 
              title="Total Records" 
              value={stats.totalMaintenance || 0}
              icon={ChartBarIcon}
              color="blue"
            />
            <Card 
              title="Scheduled" 
              value={stats.scheduled || 0}
              icon={ClockIcon}
              color="blue"
            />
            <Card 
              title="In Progress" 
              value={stats.inProgress || 0}
              icon={WrenchScrewdriverIcon}
              color="yellow"
            />
            <Card 
              title="Completed" 
              value={stats.completed || 0}
              icon={CheckCircleIcon}
              color="green"
            />
            <Card 
              title="Total Cost" 
              value={`Rs. ${stats.totalCost?.toLocaleString() || 0}`}
              icon={ChartBarIcon}
              color="purple"
            />
          </div>
        )}

        {/* Alert Cards */}
        {stats && (stats.upcomingMaintenance > 0 || stats.overdueMaintenance > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.upcomingMaintenance > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900">Upcoming Maintenance (Next 7 Days)</h3>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.upcomingMaintenance} Records</p>
              </div>
            )}
            {stats.overdueMaintenance > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-red-900">Overdue Maintenance</h3>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.overdueMaintenance} Records</p>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={[{ value: '', label: 'All Statuses' }, ...statuses]}
            />
            <Select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              options={[{ value: '', label: 'All Priorities' }, ...priorities]}
            />
            <Input
              type="date"
              placeholder="Start Date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
            <Input
              type="date"
              placeholder="End Date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
        </div>

        {/* Maintenance Records Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : maintenanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      No maintenance records found
                    </td>
                  </tr>
                ) : (
                  maintenanceRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.maintenanceId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.asset?.assetName}
                        <div className="text-xs text-gray-500">{record.asset?.assetId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.maintenanceType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.scheduledDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          record.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                          record.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                          record.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {record.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          record.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          record.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          record.status === 'Scheduled' ? 'bg-purple-100 text-purple-800' :
                          record.status === 'Cancelled' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Rs. {record.cost?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(record._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={isEditMode ? 'Edit Maintenance Record' : 'Schedule New Maintenance'}
          size="large"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Asset"
                name="asset"
                value={formData.asset}
                onChange={handleInputChange}
                options={[
                  { value: '', label: 'Select Asset' },
                  ...assets.map(asset => ({ value: asset._id, label: `${asset.assetName} (${asset.assetId})` }))
                ]}
                required
              />
              <Select
                label="Maintenance Type"
                name="maintenanceType"
                value={formData.maintenanceType}
                onChange={handleInputChange}
                options={[{ value: '', label: 'Select Type' }, ...maintenanceTypes]}
                required
              />
              <Input
                label="Scheduled Date"
                name="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={handleInputChange}
                required
              />
              <Select
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                options={priorities}
              />
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                options={statuses}
              />
              <Select
                label="Before Condition"
                name="beforeCondition"
                value={formData.beforeCondition}
                onChange={handleInputChange}
                options={[{ value: '', label: 'Select Condition' }, ...conditions]}
              />
              <Input
                label="Performed By"
                name="performedBy"
                value={formData.performedBy}
                onChange={handleInputChange}
              />
              <Input
                label="Cost"
                name="cost"
                type="number"
                min="0"
                value={formData.cost}
                onChange={handleInputChange}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Service Provider</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Provider Name"
                  name="serviceProvider.name"
                  value={formData.serviceProvider.name}
                  onChange={handleInputChange}
                />
                <Input
                  label="Contact"
                  name="serviceProvider.contact"
                  value={formData.serviceProvider.contact}
                  onChange={handleInputChange}
                />
                <Input
                  label="Email"
                  name="serviceProvider.email"
                  type="email"
                  value={formData.serviceProvider.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : isEditMode ? 'Update Record' : 'Create Record'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Maintenance;

