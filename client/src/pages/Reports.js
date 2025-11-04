import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Select from '../components/Select';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import {
  DocumentChartBarIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TableCellsIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';
import { reportService } from '../services/reportService';
import { classService } from '../services/classService';
import { useToast } from '../context/ToastContext';

const Reports = () => {
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine initial tab from URL
  const getInitialTab = () => {
    const path = location.pathname;
    if (path.includes('/reports/student')) return 'student';
    if (path.includes('/reports/attendance')) return 'attendance';
    if (path.includes('/reports/financial')) return 'financial';
    if (path.includes('/reports/custom')) return 'custom';
    return 'attendance'; // default
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Attendance Report State
  const [attendanceFilters, setAttendanceFilters] = useState({
    startDate: '',
    endDate: '',
    classId: '',
    status: '',
    format: 'json',
  });

  // Financial Report State
  const [financialFilters, setFinancialFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'summary',
    format: 'json',
  });

  // Custom Report State
  const [customReportType, setCustomReportType] = useState('student-performance');
  const [customFilters, setCustomFilters] = useState({
    classId: '',
    startDate: '',
    endDate: '',
    paymentStatus: '',
    format: 'json',
  });

  // Update tab when URL changes
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  useEffect(() => {
    console.log('📊 Reports page mounted, current tab:', activeTab);
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      console.log('🔄 Fetching classes for report filters...');
      const data = await classService.getAllClasses();
      console.log('✅ Classes fetched:', data?.length || 0, 'classes');
      setClasses(data || []);
    } catch (error) {
      console.error('❌ Error fetching classes:', error);
      console.error('Error details:', error.response?.data);
      setClasses([]);
    }
  };

  const handleGenerateAttendanceReport = async () => {
    if (!attendanceFilters.startDate || !attendanceFilters.endDate) {
      toast.error('Please select date range');
      return;
    }

    setLoading(true);
    try {
      if (attendanceFilters.format === 'json') {
        const response = await reportService.generateAttendanceReport(attendanceFilters);
        setReportData(response.data);
        toast.success('Report generated successfully');
      } else {
        await reportService.downloadReport(
          '/reports/attendance',
          attendanceFilters,
          `attendance-report.${attendanceFilters.format === 'excel' ? 'xlsx' : 'pdf'}`
        );
        toast.success(`Report downloaded as ${attendanceFilters.format.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Error generating attendance report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFinancialReport = async () => {
    if (!financialFilters.startDate || !financialFilters.endDate) {
      toast.error('Please select date range');
      return;
    }

    setLoading(true);
    try {
      if (financialFilters.format === 'json') {
        const response = await reportService.generateFinancialReport(financialFilters);
        setReportData(response.data);
        toast.success('Report generated successfully');
      } else {
        await reportService.downloadReport(
          '/reports/financial',
          financialFilters,
          `financial-report.${financialFilters.format === 'excel' ? 'xlsx' : 'pdf'}`
        );
        toast.success(`Report downloaded as ${financialFilters.format.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Error generating financial report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCustomReport = async () => {
    setLoading(true);
    try {
      const data = {
        reportType: customReportType,
        filters: customFilters,
        fields: [],
        format: customFilters.format,
      };

      if (customFilters.format === 'json') {
        const response = await reportService.generateCustomReport(data);
        setReportData(response.data);
        toast.success('Report generated successfully');
      } else {
        await reportService.downloadReport(
          '/reports/custom',
          data,
          `${customReportType}-report.${customFilters.format === 'excel' ? 'xlsx' : 'pdf'}`
        );
        toast.success(`Report downloaded as ${customFilters.format.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Error generating custom report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'student', name: 'Student Reports', icon: AcademicCapIcon },
    { id: 'attendance', name: 'Attendance Reports', icon: ClipboardDocumentCheckIcon },
    { id: 'financial', name: 'Financial Reports', icon: CurrencyDollarIcon },
    { id: 'custom', name: 'Custom Reports', icon: ChartPieIcon },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <DocumentChartBarIcon className="h-8 w-8 mr-2 text-primary-600" />
            Reports & Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Generate comprehensive reports for attendance, finances, and custom analytics
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  navigate(`/reports/${tab.id}`);
                  setReportData(null);
                }}
                className={`${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200`}
              >
                <tab.icon
                  className={`${
                    activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                  } -ml-0.5 mr-2 h-5 w-5`}
                />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Student Reports */}
        {activeTab === 'student' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Report Generator</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Select
                  label="Class (Optional)"
                  value={customFilters.classId}
                  onChange={(e) => setCustomFilters({ ...customFilters, classId: e.target.value })}
                  options={[
                    { value: '', label: 'All Classes' },
                    ...classes.map((cls) => ({ value: cls._id, label: `${cls.className} - ${cls.grade}` })),
                  ]}
                />
                <Input
                  label="Start Date"
                  type="date"
                  value={customFilters.startDate}
                  onChange={(e) => setCustomFilters({ ...customFilters, startDate: e.target.value })}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={customFilters.endDate}
                  onChange={(e) => setCustomFilters({ ...customFilters, endDate: e.target.value })}
                />
                <Select
                  label="Export Format"
                  value={customFilters.format}
                  onChange={(e) => setCustomFilters({ ...customFilters, format: e.target.value })}
                  options={[
                    { value: 'json', label: 'View Online' },
                    { value: 'excel', label: 'Excel (.xlsx)' },
                    { value: 'pdf', label: 'PDF (.pdf)' },
                  ]}
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCustomFilters({ classId: '', startDate: '', endDate: '', paymentStatus: '', format: 'json' });
                    setReportData(null);
                  }}
                >
                  Reset
                </Button>
                <Button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const data = {
                        reportType: 'student-performance',
                        filters: customFilters,
                        fields: [],
                        format: customFilters.format,
                      };

                      if (customFilters.format === 'json') {
                        const response = await reportService.generateCustomReport(data);
                        setReportData(response.data);
                        toast.success('Report generated successfully');
                      } else {
                        await reportService.downloadReport(
                          '/reports/custom',
                          data,
                          `student-report.${customFilters.format === 'excel' ? 'xlsx' : 'pdf'}`
                        );
                        toast.success(`Report downloaded as ${customFilters.format.toUpperCase()}`);
                      }
                    } catch (error) {
                      console.error('Error generating student report:', error);
                      toast.error('Failed to generate report');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  icon={customFilters.format === 'json' ? DocumentTextIcon : ArrowDownTrayIcon}
                >
                  {loading ? 'Generating...' : customFilters.format === 'json' ? 'Generate Report' : 'Download Report'}
                </Button>
              </div>
            </div>

            {/* Display Student Report */}
            {reportData && customFilters.format === 'json' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{reportData.title || 'Student Performance Report'}</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Generated: {new Date(reportData.generatedAt).toLocaleString()}
                </p>
                
                {/* Summary Statistics */}
                {reportData.summary && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                      <div className="text-sm text-blue-600 font-medium">Total Students</div>
                      <div className="text-3xl font-bold text-blue-900">{reportData.summary.totalStudents || 0}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                      <div className="text-sm text-green-600 font-medium">Average Grade</div>
                      <div className="text-3xl font-bold text-green-900">{reportData.summary.averageGrade}%</div>
                      <div className="text-xs text-green-600 mt-1">Across all students</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                      <div className="text-sm text-purple-600 font-medium">Average Attendance</div>
                      <div className="text-3xl font-bold text-purple-900">{reportData.summary.averageAttendance}%</div>
                      <div className="text-xs text-purple-600 mt-1">Across all students</div>
                    </div>
                  </div>
                )}

                {/* Student Performance Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Grade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Grades</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.data?.map((student, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.studentId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.class?.className || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              parseFloat(student.averageGrade) >= 80 ? 'bg-green-100 text-green-800' :
                              parseFloat(student.averageGrade) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {student.averageGrade}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              parseFloat(student.attendanceRate) >= 90 ? 'bg-green-100 text-green-800' :
                              parseFloat(student.attendanceRate) >= 75 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {student.attendanceRate}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.totalGrades}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!reportData.data || reportData.data.length === 0 && (
                    <p className="text-sm text-gray-500 mt-4 text-center">
                      No student data found for the selected filters.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Attendance Reports */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance Report Generator</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={attendanceFilters.startDate}
                  onChange={(e) => setAttendanceFilters({ ...attendanceFilters, startDate: e.target.value })}
                  required
                />
                <Input
                  label="End Date"
                  type="date"
                  value={attendanceFilters.endDate}
                  onChange={(e) => setAttendanceFilters({ ...attendanceFilters, endDate: e.target.value })}
                  required
                />
                <Select
                  label="Class (Optional)"
                  value={attendanceFilters.classId}
                  onChange={(e) => setAttendanceFilters({ ...attendanceFilters, classId: e.target.value })}
                  options={[
                    { value: '', label: 'All Classes' },
                    ...classes.map((cls) => ({ value: cls._id, label: `${cls.className} - ${cls.grade}` })),
                  ]}
                />
                <Select
                  label="Status (Optional)"
                  value={attendanceFilters.status}
                  onChange={(e) => setAttendanceFilters({ ...attendanceFilters, status: e.target.value })}
                  options={[
                    { value: '', label: 'All Statuses' },
                    { value: 'present', label: 'Present' },
                    { value: 'absent', label: 'Absent' },
                    { value: 'late', label: 'Late' },
                  ]}
                />
                <Select
                  label="Export Format"
                  value={attendanceFilters.format}
                  onChange={(e) => setAttendanceFilters({ ...attendanceFilters, format: e.target.value })}
                  options={[
                    { value: 'json', label: 'View Online' },
                    { value: 'excel', label: 'Excel (.xlsx)' },
                    { value: 'pdf', label: 'PDF (.pdf)' },
                  ]}
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setAttendanceFilters({ startDate: '', endDate: '', classId: '', status: '', format: 'json' });
                    setReportData(null);
                  }}
                >
                  Reset
                </Button>
                <Button
                  onClick={handleGenerateAttendanceReport}
                  disabled={loading}
                  icon={attendanceFilters.format === 'json' ? DocumentTextIcon : ArrowDownTrayIcon}
                >
                  {loading ? 'Generating...' : attendanceFilters.format === 'json' ? 'Generate Report' : 'Download Report'}
                </Button>
              </div>
            </div>

            {/* Display Report Data */}
            {reportData && attendanceFilters.format === 'json' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Results</h2>
                
                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="text-sm text-blue-600 font-medium">Total Records</div>
                    <div className="text-2xl font-bold text-blue-900">{reportData.statistics?.totalRecords}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <div className="text-sm text-green-600 font-medium">Present</div>
                    <div className="text-2xl font-bold text-green-900">{reportData.statistics?.presentCount}</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
                    <div className="text-sm text-red-600 font-medium">Absent</div>
                    <div className="text-2xl font-bold text-red-900">{reportData.statistics?.absentCount}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                    <div className="text-sm text-purple-600 font-medium">Attendance Rate</div>
                    <div className="text-2xl font-bold text-purple-900">{reportData.statistics?.attendanceRate}</div>
                  </div>
                </div>

                {/* Records Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.records?.slice(0, 10).map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.student?.firstName} {record.student?.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.class?.className}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              record.status === 'present' ? 'bg-green-100 text-green-800' :
                              record.status === 'absent' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reportData.records?.length > 10 && (
                    <p className="text-sm text-gray-500 mt-4 text-center">
                      Showing 10 of {reportData.records.length} records. Download full report for complete data.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Financial Reports */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Report Generator</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={financialFilters.startDate}
                  onChange={(e) => setFinancialFilters({ ...financialFilters, startDate: e.target.value })}
                  required
                />
                <Input
                  label="End Date"
                  type="date"
                  value={financialFilters.endDate}
                  onChange={(e) => setFinancialFilters({ ...financialFilters, endDate: e.target.value })}
                  required
                />
                <Select
                  label="Report Type"
                  value={financialFilters.type}
                  onChange={(e) => setFinancialFilters({ ...financialFilters, type: e.target.value })}
                  options={[
                    { value: 'summary', label: 'Summary' },
                    { value: 'detailed', label: 'Detailed' },
                  ]}
                />
                <Select
                  label="Export Format"
                  value={financialFilters.format}
                  onChange={(e) => setFinancialFilters({ ...financialFilters, format: e.target.value })}
                  options={[
                    { value: 'json', label: 'View Online' },
                    { value: 'excel', label: 'Excel (.xlsx)' },
                    { value: 'pdf', label: 'PDF (.pdf)' },
                  ]}
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFinancialFilters({ startDate: '', endDate: '', type: 'summary', format: 'json' });
                    setReportData(null);
                  }}
                >
                  Reset
                </Button>
                <Button
                  onClick={handleGenerateFinancialReport}
                  disabled={loading}
                  icon={financialFilters.format === 'json' ? DocumentTextIcon : ArrowDownTrayIcon}
                >
                  {loading ? 'Generating...' : financialFilters.format === 'json' ? 'Generate Report' : 'Download Report'}
                </Button>
              </div>
            </div>

            {/* Display Financial Report */}
            {reportData && financialFilters.format === 'json' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                    <div className="text-sm text-green-600 font-medium mb-2">Total Income</div>
                    <div className="text-3xl font-bold text-green-900">
                      Rs. {reportData.summary?.totalIncome?.toLocaleString()}
                    </div>
                    <div className="text-xs text-green-600 mt-2">
                      Fee: Rs. {reportData.summary?.totalFeeIncome?.toLocaleString()} | 
                      Other: Rs. {reportData.summary?.totalOtherIncome?.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6">
                    <div className="text-sm text-red-600 font-medium mb-2">Total Expenses</div>
                    <div className="text-3xl font-bold text-red-900">
                      Rs. {reportData.summary?.totalExpenses?.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                    <div className="text-sm text-blue-600 font-medium mb-2">Net Profit</div>
                    <div className={`text-3xl font-bold ${reportData.summary?.netProfit >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                      Rs. {reportData.summary?.netProfit?.toLocaleString()}
                    </div>
                    <div className="text-xs text-blue-600 mt-2">
                      Profit Margin: {reportData.summary?.profitMargin}%
                    </div>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-3">Expense by Category</h3>
                    <div className="space-y-2">
                      {Object.entries(reportData.breakdown?.expenseByCategory || {}).map(([category, amount]) => (
                        <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700 capitalize">{category}</span>
                          <span className="text-sm font-semibold text-gray-900">Rs. {amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-3">Income by Category</h3>
                    <div className="space-y-2">
                      {Object.entries(reportData.breakdown?.incomeByCategory || {}).map(([category, amount]) => (
                        <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700 capitalize">{category}</span>
                          <span className="text-sm font-semibold text-gray-900">Rs. {amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom Reports */}
        {activeTab === 'custom' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Custom Report Builder</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Select
                  label="Report Type"
                  value={customReportType}
                  onChange={(e) => setCustomReportType(e.target.value)}
                  options={[
                    { value: 'student-performance', label: 'Student Performance' },
                    { value: 'class-summary', label: 'Class Summary' },
                    { value: 'teacher-workload', label: 'Teacher Workload' },
                    { value: 'fee-collection', label: 'Fee Collection' },
                  ]}
                />
                
                {customReportType === 'student-performance' && (
                  <>
                    <Select
                      label="Class (Optional)"
                      value={customFilters.classId}
                      onChange={(e) => setCustomFilters({ ...customFilters, classId: e.target.value })}
                      options={[
                        { value: '', label: 'All Classes' },
                        ...classes.map((cls) => ({ value: cls._id, label: `${cls.className} - ${cls.grade}` })),
                      ]}
                    />
                    <Input
                      label="Start Date"
                      type="date"
                      value={customFilters.startDate}
                      onChange={(e) => setCustomFilters({ ...customFilters, startDate: e.target.value })}
                    />
                    <Input
                      label="End Date"
                      type="date"
                      value={customFilters.endDate}
                      onChange={(e) => setCustomFilters({ ...customFilters, endDate: e.target.value })}
                    />
                  </>
                )}

                {customReportType === 'class-summary' && (
                  <Select
                    label="Class (Optional)"
                    value={customFilters.classId}
                    onChange={(e) => setCustomFilters({ ...customFilters, classId: e.target.value })}
                    options={[
                      { value: '', label: 'All Classes' },
                      ...classes.map((cls) => ({ value: cls._id, label: `${cls.className} - ${cls.grade}` })),
                    ]}
                  />
                )}

                {customReportType === 'fee-collection' && (
                  <>
                    <Input
                      label="Start Date"
                      type="date"
                      value={customFilters.startDate}
                      onChange={(e) => setCustomFilters({ ...customFilters, startDate: e.target.value })}
                    />
                    <Input
                      label="End Date"
                      type="date"
                      value={customFilters.endDate}
                      onChange={(e) => setCustomFilters({ ...customFilters, endDate: e.target.value })}
                    />
                    <Select
                      label="Payment Status"
                      value={customFilters.paymentStatus}
                      onChange={(e) => setCustomFilters({ ...customFilters, paymentStatus: e.target.value })}
                      options={[
                        { value: '', label: 'All Statuses' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'overdue', label: 'Overdue' },
                      ]}
                    />
                  </>
                )}

                <Select
                  label="Export Format"
                  value={customFilters.format}
                  onChange={(e) => setCustomFilters({ ...customFilters, format: e.target.value })}
                  options={[
                    { value: 'json', label: 'View Online' },
                    { value: 'excel', label: 'Excel (.xlsx)' },
                    { value: 'pdf', label: 'PDF (.pdf)' },
                  ]}
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCustomFilters({ classId: '', startDate: '', endDate: '', paymentStatus: '', format: 'json' });
                    setReportData(null);
                  }}
                >
                  Reset
                </Button>
                <Button
                  onClick={handleGenerateCustomReport}
                  disabled={loading}
                  icon={customFilters.format === 'json' ? DocumentTextIcon : ArrowDownTrayIcon}
                >
                  {loading ? 'Generating...' : customFilters.format === 'json' ? 'Generate Report' : 'Download Report'}
                </Button>
              </div>
            </div>

            {/* Display Custom Report */}
            {reportData && customFilters.format === 'json' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{reportData.title}</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Generated: {new Date(reportData.generatedAt).toLocaleString()}
                </p>
                
                {reportData.summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {Object.entries(reportData.summary).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-4">
                        <div className="text-xs text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                        <div className="text-xl font-bold text-gray-900">{value}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {reportData.data && reportData.data.length > 0 && Object.keys(reportData.data[0]).slice(0, 5).map((key) => (
                          <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.data?.slice(0, 10).map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {Object.values(row).slice(0, 5).map((value, idx) => (
                            <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {typeof value === 'object' ? JSON.stringify(value).substring(0, 50) : String(value).substring(0, 50)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reportData.data?.length > 10 && (
                    <p className="text-sm text-gray-500 mt-4 text-center">
                      Showing 10 of {reportData.data.length} records. Download full report for complete data.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
