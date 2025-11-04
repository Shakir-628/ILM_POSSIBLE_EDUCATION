import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';
import Input from '../components/Input';
import {
  CubeIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
  EyeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { assetService } from '../services/assetService';
import { maintenanceService } from '../services/maintenanceService';
import { useToast } from '../context/ToastContext';

const InventoryReports = () => {
  const toast = useToast();
  const [reportType, setReportType] = useState('asset-summary');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  
  // Interactive features state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      let data;
      
      switch (reportType) {
        case 'asset-summary':
          data = await assetService.getAssetStats();
          setReportData({
            title: 'Asset Summary Report',
            type: 'asset-summary',
            data,
          });
          break;
          
        case 'maintenance-summary':
          data = await maintenanceService.getMaintenanceStats();
          setReportData({
            title: 'Maintenance Summary Report',
            type: 'maintenance-summary',
            data,
          });
          break;
          
        case 'asset-list':
          const assets = await assetService.getAllAssets(filters);
          setReportData({
            title: 'Asset List Report',
            type: 'asset-list',
            data: assets,
          });
          break;
          
        case 'maintenance-history':
          const maintenance = await maintenanceService.getAllMaintenance(filters);
          setReportData({
            title: 'Maintenance History Report',
            type: 'maintenance-history',
            data: maintenance,
          });
          break;
          
        default:
          toast.error('Invalid report type');
      }
      
      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      if (!reportData) {
        toast.error('Please generate a report first');
        return;
      }

      toast.info(`Generating ${format.toUpperCase()} file...`);

      if (reportData.type === 'asset-list' || reportData.type === 'asset-summary') {
        if (format === 'excel') {
          await assetService.exportToExcel(filters);
        } else {
          await assetService.exportToPDF(filters);
        }
      } else if (reportData.type === 'maintenance-history' || reportData.type === 'maintenance-summary') {
        if (format === 'excel') {
          await maintenanceService.exportToExcel(filters);
        } else {
          await maintenanceService.exportToPDF(filters);
        }
      }

      toast.success(`${format.toUpperCase()} report downloaded successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export to ${format.toUpperCase()}`);
    }
  };

  // Reset interactive states when report changes
  useEffect(() => {
    setSearchTerm('');
    setSortConfig({ key: null, direction: 'asc' });
    setCurrentPage(1);
    setExpandedRow(null);
    setSelectedItems([]);
  }, [reportData]);

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sorted data
  const getSortedData = (data) => {
    if (!sortConfig.key || !Array.isArray(data)) return data;
    
    const sortedData = [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortConfig.direction === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    });
    
    return sortedData;
  };

  // Filter data based on search
  const getFilteredData = (data) => {
    if (!searchTerm || !Array.isArray(data)) return data;
    
    return data.filter(item => {
      return Object.values(item).some(value => {
        if (value === null || value === undefined) return false;
        return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  };

  // Get paginated data
  const getPaginatedData = (data) => {
    if (!Array.isArray(data)) return data;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Process data through all filters
  const processTableData = (data) => {
    let processed = data;
    processed = getFilteredData(processed);
    processed = getSortedData(processed);
    return processed;
  };

  // Get total pages
  const getTotalPages = (data) => {
    if (!Array.isArray(data)) return 1;
    const filtered = getFilteredData(data);
    return Math.ceil(filtered.length / itemsPerPage);
  };

  // Sort icon component
  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUpDownIcon className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUpIcon className="h-4 w-4 text-primary-600" />
      : <ChevronDownIcon className="h-4 w-4 text-primary-600" />;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <CubeIcon className="h-8 w-8 mr-2 text-primary-600" />
            Inventory Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Generate comprehensive inventory and maintenance reports
          </p>
        </div>

        {/* Report Generator */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Report</h2>
          <div className="space-y-4">
            <Select
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={[
                { value: 'asset-summary', label: 'Asset Summary' },
                { value: 'maintenance-summary', label: 'Maintenance Summary' },
                { value: 'asset-list', label: 'Detailed Asset List' },
                { value: 'maintenance-history', label: 'Maintenance History' },
              ]}
            />

            {(reportType === 'asset-list' || reportType === 'maintenance-history') && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {reportType === 'asset-list' && (
                  <>
                    <Select
                      label="Category"
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      options={[
                        { value: '', label: 'All Categories' },
                        { value: 'Furniture', label: 'Furniture' },
                        { value: 'Electronics', label: 'Electronics' },
                        { value: 'Laboratory Equipment', label: 'Laboratory Equipment' },
                        { value: 'Sports Equipment', label: 'Sports Equipment' },
                        { value: 'Vehicles', label: 'Vehicles' },
                        { value: 'Books', label: 'Books' },
                        { value: 'Computers', label: 'Computers' },
                        { value: 'Other', label: 'Other' },
                      ]}
                    />
                    <Select
                      label="Status"
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      options={[
                        { value: '', label: 'All Statuses' },
                        { value: 'Active', label: 'Active' },
                        { value: 'Under Maintenance', label: 'Under Maintenance' },
                        { value: 'Retired', label: 'Retired' },
                        { value: 'Lost', label: 'Lost' },
                        { value: 'Damaged', label: 'Damaged' },
                      ]}
                    />
                  </>
                )}
                <Input
                  label="Start Date"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setFilters({ category: '', status: '', startDate: '', endDate: '' });
                  setReportData(null);
                }}
              >
                Reset
              </Button>
              <Button
                onClick={generateReport}
                disabled={loading}
                icon={DocumentTextIcon}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 rounded-xl p-4 h-24"></div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        )}

        {/* Report Display */}
        {reportData && !loading && (
          <div className="bg-white rounded-lg shadow p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{reportData.title}</h2>
              <div className="flex space-x-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportReport('excel')}
                  icon={ArrowDownTrayIcon}
                  className="shadow-sm hover:shadow-md"
                >
                  Export Excel
                </Button>
                <Button
                  size="md"
                  variant="primary"
                  onClick={() => exportReport('pdf')}
                  icon={ArrowDownTrayIcon}
                  className="shadow-sm"
                >
                  Export PDF
                </Button>
              </div>
            </div>

            {/* Asset Summary Report */}
            {reportData.type === 'asset-summary' && reportData.data && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div 
                    className="bg-blue-50 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer"
                    onMouseEnter={() => setHoveredCard('total')}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="text-sm text-blue-600 font-medium">Total Assets</div>
                    <div className={`text-3xl font-bold text-blue-900 transition-all duration-300 ${hoveredCard === 'total' ? 'scale-110' : ''}`}>
                      {reportData.data.totalAssets}
                    </div>
                    {hoveredCard === 'total' && (
                      <div className="text-xs text-blue-500 mt-2 animate-fade-in">All registered assets</div>
                    )}
                  </div>
                  <div 
                    className="bg-green-50 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer"
                    onMouseEnter={() => setHoveredCard('active')}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="text-sm text-green-600 font-medium">Active Assets</div>
                    <div className={`text-3xl font-bold text-green-900 transition-all duration-300 ${hoveredCard === 'active' ? 'scale-110' : ''}`}>
                      {reportData.data.activeAssets}
                    </div>
                    {hoveredCard === 'active' && (
                      <div className="text-xs text-green-500 mt-2 animate-fade-in">Currently in use</div>
                    )}
                  </div>
                  <div 
                    className="bg-yellow-50 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer"
                    onMouseEnter={() => setHoveredCard('maintenance')}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="text-sm text-yellow-600 font-medium">Under Maintenance</div>
                    <div className={`text-3xl font-bold text-yellow-900 transition-all duration-300 ${hoveredCard === 'maintenance' ? 'scale-110' : ''}`}>
                      {reportData.data.underMaintenance}
                    </div>
                    {hoveredCard === 'maintenance' && (
                      <div className="text-xs text-yellow-500 mt-2 animate-fade-in">Being serviced</div>
                    )}
                  </div>
                  <div 
                    className="bg-purple-50 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer"
                    onMouseEnter={() => setHoveredCard('value')}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="text-sm text-purple-600 font-medium">Total Value</div>
                    <div className={`text-3xl font-bold text-purple-900 transition-all duration-300 ${hoveredCard === 'value' ? 'scale-110' : ''}`}>
                      Rs. {reportData.data.totalValue?.toLocaleString()}
                    </div>
                    {hoveredCard === 'value' && (
                      <div className="text-xs text-purple-500 mt-2 animate-fade-in">Combined asset value</div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-3">Category Breakdown</h3>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('_id')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Category</span>
                              <SortIcon columnKey="_id" />
                            </div>
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('count')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Count</span>
                              <SortIcon columnKey="count" />
                            </div>
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('totalValue')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Total Value</span>
                              <SortIcon columnKey="totalValue" />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getSortedData(reportData.data.categoryBreakdown || []).map((category, index) => (
                          <tr 
                            key={category._id}
                            className="hover:bg-blue-50 transition-colors duration-150"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category._id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {category.count}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">Rs. {category.totalValue?.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Maintenance Summary Report */}
            {reportData.type === 'maintenance-summary' && reportData.data && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div 
                    className="bg-blue-50 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer"
                    onMouseEnter={() => setHoveredCard('m-total')}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="text-sm text-blue-600 font-medium">Total Records</div>
                    <div className={`text-3xl font-bold text-blue-900 transition-all duration-300 ${hoveredCard === 'm-total' ? 'scale-110' : ''}`}>
                      {reportData.data.totalMaintenance}
                    </div>
                    {hoveredCard === 'm-total' && (
                      <div className="text-xs text-blue-500 mt-2 animate-fade-in">All maintenance records</div>
                    )}
                  </div>
                  <div 
                    className="bg-purple-50 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer"
                    onMouseEnter={() => setHoveredCard('m-scheduled')}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="text-sm text-purple-600 font-medium">Scheduled</div>
                    <div className={`text-3xl font-bold text-purple-900 transition-all duration-300 ${hoveredCard === 'm-scheduled' ? 'scale-110' : ''}`}>
                      {reportData.data.scheduled}
                    </div>
                    {hoveredCard === 'm-scheduled' && (
                      <div className="text-xs text-purple-500 mt-2 animate-fade-in">Upcoming tasks</div>
                    )}
                  </div>
                  <div 
                    className="bg-yellow-50 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer"
                    onMouseEnter={() => setHoveredCard('m-progress')}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="text-sm text-yellow-600 font-medium">In Progress</div>
                    <div className={`text-3xl font-bold text-yellow-900 transition-all duration-300 ${hoveredCard === 'm-progress' ? 'scale-110' : ''}`}>
                      {reportData.data.inProgress}
                    </div>
                    {hoveredCard === 'm-progress' && (
                      <div className="text-xs text-yellow-500 mt-2 animate-fade-in">Currently working</div>
                    )}
                  </div>
                  <div 
                    className="bg-green-50 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer"
                    onMouseEnter={() => setHoveredCard('m-completed')}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="text-sm text-green-600 font-medium">Completed</div>
                    <div className={`text-3xl font-bold text-green-900 transition-all duration-300 ${hoveredCard === 'm-completed' ? 'scale-110' : ''}`}>
                      {reportData.data.completed}
                    </div>
                    {hoveredCard === 'm-completed' && (
                      <div className="text-xs text-green-500 mt-2 animate-fade-in">Successfully finished</div>
                    )}
                  </div>
                  <div 
                    className="bg-red-50 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer"
                    onMouseEnter={() => setHoveredCard('m-cost')}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="text-sm text-red-600 font-medium">Total Cost</div>
                    <div className={`text-3xl font-bold text-red-900 transition-all duration-300 ${hoveredCard === 'm-cost' ? 'scale-110' : ''}`}>
                      Rs. {reportData.data.totalCost?.toLocaleString()}
                    </div>
                    {hoveredCard === 'm-cost' && (
                      <div className="text-xs text-red-500 mt-2 animate-fade-in">Total expenditure</div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-3">Maintenance by Type</h3>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('_id')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Type</span>
                              <SortIcon columnKey="_id" />
                            </div>
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('count')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Count</span>
                              <SortIcon columnKey="count" />
                            </div>
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('totalCost')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Total Cost</span>
                              <SortIcon columnKey="totalCost" />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getSortedData(reportData.data.maintenanceByType || []).map((type, index) => (
                          <tr 
                            key={type._id}
                            className="hover:bg-purple-50 transition-colors duration-150"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{type._id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {type.count}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">Rs. {type.totalCost?.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Asset List Report */}
            {reportData.type === 'asset-list' && Array.isArray(reportData.data) && (
              <div className="space-y-4">
                {/* Search and Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search assets..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('assetId')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Asset ID</span>
                            <SortIcon columnKey="assetId" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('assetName')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Name</span>
                            <SortIcon columnKey="assetName" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('category')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Category</span>
                            <SortIcon columnKey="category" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('location')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Location</span>
                            <SortIcon columnKey="location" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Status</span>
                            <SortIcon columnKey="status" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('currentValue')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Value</span>
                            <SortIcon columnKey="currentValue" />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getPaginatedData(processTableData(reportData.data)).length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <MagnifyingGlassIcon className="h-12 w-12 mb-3 text-gray-300" />
                              <p className="text-lg font-medium text-gray-900 mb-1">No assets found</p>
                              <p className="text-sm">Try adjusting your search or filters</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        getPaginatedData(processTableData(reportData.data)).map((asset) => (
                          <tr 
                            key={asset._id}
                            className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
                            onClick={() => setExpandedRow(expandedRow === asset._id ? null : asset._id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">{asset.assetId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{asset.assetName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {asset.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.location}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                asset.status === 'Active' ? 'bg-green-100 text-green-800' :
                                asset.status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {asset.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">Rs. {asset.currentValue?.toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {processTableData(reportData.data).length > itemsPerPage && (
                  <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-lg">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(getTotalPages(reportData.data), currentPage + 1))}
                        disabled={currentPage === getTotalPages(reportData.data)}
                        className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                          <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, processTableData(reportData.data).length)}
                          </span>{' '}
                          of <span className="font-medium">{processTableData(reportData.data).length}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronUpIcon className="h-5 w-5 transform -rotate-90" aria-hidden="true" />
                          </button>
                          {[...Array(getTotalPages(reportData.data))].map((_, i) => (
                            <button
                              key={i + 1}
                              onClick={() => setCurrentPage(i + 1)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                currentPage === i + 1
                                  ? 'z-10 bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                                  : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                          <button
                            onClick={() => setCurrentPage(Math.min(getTotalPages(reportData.data), currentPage + 1))}
                            disabled={currentPage === getTotalPages(reportData.data)}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronUpIcon className="h-5 w-5 transform rotate-90" aria-hidden="true" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Maintenance History Report */}
            {reportData.type === 'maintenance-history' && Array.isArray(reportData.data) && (
              <div className="space-y-4">
                {/* Search and Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search maintenance records..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('maintenanceId')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>ID</span>
                            <SortIcon columnKey="maintenanceId" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('asset')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Asset</span>
                            <SortIcon columnKey="asset" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('maintenanceType')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Type</span>
                            <SortIcon columnKey="maintenanceType" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('scheduledDate')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Date</span>
                            <SortIcon columnKey="scheduledDate" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Status</span>
                            <SortIcon columnKey="status" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('cost')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Cost</span>
                            <SortIcon columnKey="cost" />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getPaginatedData(processTableData(reportData.data)).length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <MagnifyingGlassIcon className="h-12 w-12 mb-3 text-gray-300" />
                              <p className="text-lg font-medium text-gray-900 mb-1">No maintenance records found</p>
                              <p className="text-sm">Try adjusting your search or filters</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        getPaginatedData(processTableData(reportData.data)).map((maintenance) => (
                          <tr 
                            key={maintenance._id}
                            className="hover:bg-purple-50 transition-colors duration-150 cursor-pointer"
                            onClick={() => setExpandedRow(expandedRow === maintenance._id ? null : maintenance._id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">{maintenance.maintenanceId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{maintenance.asset?.assetName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {maintenance.maintenanceType}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(maintenance.scheduledDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                maintenance.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                maintenance.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {maintenance.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">Rs. {maintenance.cost?.toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {processTableData(reportData.data).length > itemsPerPage && (
                  <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-lg">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(getTotalPages(reportData.data), currentPage + 1))}
                        disabled={currentPage === getTotalPages(reportData.data)}
                        className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                          <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, processTableData(reportData.data).length)}
                          </span>{' '}
                          of <span className="font-medium">{processTableData(reportData.data).length}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronUpIcon className="h-5 w-5 transform -rotate-90" aria-hidden="true" />
                          </button>
                          {[...Array(getTotalPages(reportData.data))].map((_, i) => (
                            <button
                              key={i + 1}
                              onClick={() => setCurrentPage(i + 1)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                currentPage === i + 1
                                  ? 'z-10 bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                                  : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                          <button
                            onClick={() => setCurrentPage(Math.min(getTotalPages(reportData.data), currentPage + 1))}
                            disabled={currentPage === getTotalPages(reportData.data)}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronUpIcon className="h-5 w-5 transform rotate-90" aria-hidden="true" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InventoryReports;

