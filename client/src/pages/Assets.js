import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import { 
  CubeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { assetService } from '../services/assetService';
import { useToast } from '../context/ToastContext';

const Assets = () => {
  const toast = useToast();
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    location: '',
    search: '',
  });

  const [formData, setFormData] = useState({
    assetName: '',
    category: '',
    description: '',
    purchaseDate: '',
    purchasePrice: '',
    currentValue: '',
    supplier: {
      name: '',
      contact: '',
      email: '',
    },
    location: '',
    status: 'Active',
    condition: 'Excellent',
    warrantyExpiry: '',
    serialNumber: '',
    barcode: '',
    notes: '',
    depreciationRate: 0,
  });

  useEffect(() => {
    console.log('📊 Assets page mounted, fetching data...');
    fetchAssets();
    fetchStats();
  }, [filters]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching assets with filters:', filters);
      const data = await assetService.getAllAssets(filters);
      console.log('✅ Assets fetched:', data?.length || 0, 'items');
      setAssets(data || []);
    } catch (error) {
      console.error('❌ Error fetching assets:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to fetch assets');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('🔄 Fetching asset stats...');
      const data = await assetService.getAssetStats();
      console.log('✅ Stats fetched:', data);
      setStats(data);
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      console.error('Error details:', error.response?.data);
      // Don't show error for stats, they're not critical
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
      if (isEditMode && selectedAsset) {
        await assetService.updateAsset(selectedAsset._id, formData);
        toast.success('Asset updated successfully');
      } else {
        await assetService.createAsset(formData);
        toast.success('Asset created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      fetchAssets();
      fetchStats();
    } catch (error) {
      console.error('Error saving asset:', error);
      toast.error(error.response?.data?.message || 'Failed to save asset');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (asset) => {
    setSelectedAsset(asset);
    setFormData({
      assetName: asset.assetName,
      category: asset.category,
      description: asset.description || '',
      purchaseDate: asset.purchaseDate?.split('T')[0] || '',
      purchasePrice: asset.purchasePrice,
      currentValue: asset.currentValue || asset.purchasePrice,
      supplier: asset.supplier || { name: '', contact: '', email: '' },
      location: asset.location,
      status: asset.status,
      condition: asset.condition,
      warrantyExpiry: asset.warrantyExpiry?.split('T')[0] || '',
      serialNumber: asset.serialNumber || '',
      barcode: asset.barcode || '',
      notes: asset.notes || '',
      depreciationRate: asset.depreciationRate || 0,
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await assetService.deleteAsset(id);
        toast.success('Asset deleted successfully');
        fetchAssets();
        fetchStats();
      } catch (error) {
        console.error('Error deleting asset:', error);
        toast.error('Failed to delete asset');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      assetName: '',
      category: '',
      description: '',
      purchaseDate: '',
      purchasePrice: '',
      currentValue: '',
      supplier: { name: '', contact: '', email: '' },
      location: '',
      status: 'Active',
      condition: 'Excellent',
      warrantyExpiry: '',
      serialNumber: '',
      barcode: '',
      notes: '',
      depreciationRate: 0,
    });
    setIsEditMode(false);
    setSelectedAsset(null);
  };

  const categories = [
    { value: 'Furniture', label: 'Furniture' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Laboratory Equipment', label: 'Laboratory Equipment' },
    { value: 'Sports Equipment', label: 'Sports Equipment' },
    { value: 'Vehicles', label: 'Vehicles' },
    { value: 'Books', label: 'Books' },
    { value: 'Computers', label: 'Computers' },
    { value: 'Other', label: 'Other' },
  ];

  const statuses = [
    { value: 'Active', label: 'Active' },
    { value: 'Under Maintenance', label: 'Under Maintenance' },
    { value: 'Retired', label: 'Retired' },
    { value: 'Lost', label: 'Lost' },
    { value: 'Damaged', label: 'Damaged' },
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
              <CubeIcon className="h-8 w-8 mr-2 text-primary-600" />
              Asset Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage school assets, track inventory and maintenance
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={async () => {
                try {
                  await assetService.exportToExcel(filters);
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
                  await assetService.exportToPDF(filters);
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
              Add Asset
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card 
              title="Total Assets" 
              value={stats.totalAssets || 0}
              icon={CubeIcon}
              color="blue"
            />
            <Card 
              title="Active Assets" 
              value={stats.activeAssets || 0}
              icon={ChartBarIcon}
              color="green"
            />
            <Card 
              title="Under Maintenance" 
              value={stats.underMaintenance || 0}
              icon={ChartBarIcon}
              color="yellow"
            />
            <Card 
              title="Total Value" 
              value={`Rs. ${stats.totalValue?.toLocaleString() || 0}`}
              icon={ChartBarIcon}
              color="purple"
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search assets..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              icon={MagnifyingGlassIcon}
            />
            <Select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              options={[{ value: '', label: 'All Categories' }, ...categories]}
            />
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={[{ value: '', label: 'All Statuses' }, ...statuses]}
            />
            <Input
              placeholder="Location..."
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
          </div>
        </div>

        {/* Assets Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
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
                ) : assets.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      No assets found
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => (
                    <tr key={asset._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {asset.assetId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {asset.assetName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {asset.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {asset.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          asset.status === 'Active' ? 'bg-green-100 text-green-800' :
                          asset.status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                          asset.status === 'Retired' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          asset.condition === 'Excellent' ? 'bg-green-100 text-green-800' :
                          asset.condition === 'Good' ? 'bg-blue-100 text-blue-800' :
                          asset.condition === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {asset.condition}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Rs. {asset.currentValue?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(asset)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(asset._id)}
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
          title={isEditMode ? 'Edit Asset' : 'Add New Asset'}
          size="large"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Asset Name"
                name="assetName"
                value={formData.assetName}
                onChange={handleInputChange}
                required
              />
              <Select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                options={[{ value: '', label: 'Select Category' }, ...categories]}
                required
              />
              <Input
                label="Purchase Date"
                name="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Purchase Price"
                name="purchasePrice"
                type="number"
                value={formData.purchasePrice}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Current Value"
                name="currentValue"
                type="number"
                value={formData.currentValue}
                onChange={handleInputChange}
              />
              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                options={statuses}
              />
              <Select
                label="Condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                options={conditions}
              />
              <Input
                label="Serial Number"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleInputChange}
              />
              <Input
                label="Barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleInputChange}
              />
              <Input
                label="Warranty Expiry"
                name="warrantyExpiry"
                type="date"
                value={formData.warrantyExpiry}
                onChange={handleInputChange}
              />
              <Input
                label="Depreciation Rate (%)"
                name="depreciationRate"
                type="number"
                min="0"
                max="100"
                value={formData.depreciationRate}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Supplier Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Supplier Name"
                  name="supplier.name"
                  value={formData.supplier.name}
                  onChange={handleInputChange}
                />
                <Input
                  label="Contact"
                  name="supplier.contact"
                  value={formData.supplier.contact}
                  onChange={handleInputChange}
                />
                <Input
                  label="Email"
                  name="supplier.email"
                  type="email"
                  value={formData.supplier.email}
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
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
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
                {loading ? 'Saving...' : isEditMode ? 'Update Asset' : 'Create Asset'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Assets;

