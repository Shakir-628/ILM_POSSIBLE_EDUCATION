import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import Pagination from '../components/Pagination';
import {
  PlusIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import { payrollService } from '../services/payrollService';
import { teacherService } from '../services/teacherService';
import { useTableData } from '../hooks/useTableData';
import { useToast } from '../context/ToastContext';

const TeacherPayroll = () => {
  const toast = useToast();
  const [payrolls, setPayrolls] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

  const [formData, setFormData] = useState({
    teacher: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: 50000,
    allowances: {
      houseRent: 0,
      transport: 0,
      medical: 0,
      special: 0,
      other: 0,
    },
    bonuses: 0,
    deductions: {
      tax: 0,
      providentFund: 0,
      insurance: 0,
      loan: 0,
      absent: 0,
      late: 0,
      other: 0,
    },
    workingDays: 26,
    presentDays: 26,
    absentDays: 0,
    leaves: 0,
    paymentMethod: 'bank-transfer',
    notes: '',
  });

  useEffect(() => {
    fetchPayrolls();
    fetchTeachers();
    fetchStats();
  }, [monthFilter, yearFilter]);

  const fetchPayrolls = async () => {
    try {
      const response = await payrollService.getAllPayroll({
        month: monthFilter,
        year: yearFilter,
      });
      setPayrolls(response.data);
    } catch (error) {
      console.error('Error fetching payrolls:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const data = await teacherService.getAllTeachers();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await payrollService.getPayrollStats({
        month: monthFilter,
        year: yearFilter,
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
  } = useTableData(payrolls, [], 10);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('allowances.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        allowances: {
          ...formData.allowances,
          [field]: parseFloat(value) || 0,
        },
      });
    } else if (name.startsWith('deductions.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        deductions: {
          ...formData.deductions,
          [field]: parseFloat(value) || 0,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await payrollService.createPayroll(formData);
            toast.success('Payroll created successfully');
      fetchPayrolls();
      fetchStats();
      closeModal();
    } catch (error) {
      console.error('Error creating payroll:', error);
      toast.error(error.response?.data?.message || 'Error creating payroll');
    }
  };

  const handleMarkPaid = async (payroll) => {
    try {
      await payrollService.markAsPaid(payroll._id, {
        paymentDate: new Date(),
        paymentMethod: payroll.paymentMethod,
      });
      toast.success('Marked as paid successfully');
      fetchPayrolls();
      fetchStats();
    } catch (error) {
      console.error('Error marking paid:', error);
      toast.error('Error marking as paid');
    }
  };

  const handleDownloadPayslip = async (payroll) => {
    try {
      const blob = await payrollService.downloadPayslip(payroll._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip_${payroll.payrollNumber}.pdf`;
      a.click();
    } catch (error) {
      console.error('Error downloading payslip:', error);
      toast.error('Error downloading payslip');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      teacher: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      basicSalary: 50000,
      allowances: { houseRent: 0, transport: 0, medical: 0, special: 0, other: 0 },
      bonuses: 0,
      deductions: { tax: 0, providentFund: 0, insurance: 0, loan: 0, absent: 0, late: 0, other: 0 },
      workingDays: 26,
      presentDays: 26,
      absentDays: 0,
      leaves: 0,
      paymentMethod: 'bank-transfer',
      notes: '',
    });
  };

  const columns = [
    { header: 'Payroll #', accessor: 'payrollNumber' },
    {
      header: 'Teacher',
      accessor: 'teacher',
      render: (row) =>
        row.teacher ? `${row.teacher.firstName} ${row.teacher.lastName}` : 'N/A',
    },
    {
      header: 'Month/Year',
      accessor: 'month',
      render: (row) => {
        const date = new Date(row.year, row.month - 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      },
    },
    {
      header: 'Gross Salary',
      accessor: 'grossSalary',
      render: (row) => `PKR ${row.grossSalary.toLocaleString()}`,
    },
    {
      header: 'Deductions',
      accessor: 'totalDeductions',
      render: (row) => `PKR ${row.totalDeductions.toLocaleString()}`,
    },
    {
      header: 'Net Salary',
      accessor: 'netSalary',
      render: (row) => (
        <span className="font-bold text-green-600">
          PKR {row.netSalary.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.status === 'paid'
              ? 'bg-green-100 text-green-800'
              : row.status === 'processed'
              ? 'bg-blue-100 text-blue-800'
              : row.status === 'hold'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          {row.status === 'pending' && (
            <button
              onClick={() => payrollService.approvePayroll(row._id).then(fetchPayrolls)}
              className="text-blue-600 hover:text-blue-900 text-sm"
            >
              Approve
            </button>
          )}
          {row.status === 'processed' && (
            <button
              onClick={() => handleMarkPaid(row)}
              className="text-green-600 hover:text-green-900 text-sm"
            >
              Mark Paid
            </button>
          )}
          <button
            onClick={() => handleDownloadPayslip(row)}
            className="text-indigo-600 hover:text-indigo-900 text-sm"
          >
            Payslip
          </button>
        </div>
      ),
    },
  ];

  const grossTotal =
    parseFloat(formData.basicSalary) +
    Object.values(formData.allowances).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) +
    (parseFloat(formData.bonuses) || 0);

  const deductionsTotal = Object.values(formData.deductions).reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0
  );

  const netTotal = grossTotal - deductionsTotal;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teacher Payroll</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage teacher salaries and payment records
            </p>
          </div>
          <Button icon={PlusIcon} onClick={() => setIsModalOpen(true)}>
            Generate Payroll
          </Button>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <Card
              title="Total Payrolls"
              value={stats.totalPayrolls}
              icon={BanknotesIcon}
              color="blue"
            />
            <Card
              title="Total Net Salary"
              value={`PKR ${stats.totalNetSalary.toLocaleString()}`}
              icon={BanknotesIcon}
              color="green"
              subtitle="This month"
            />
            <Card
              title="Paid"
              value={stats.paid}
              icon={CheckCircleIcon}
              color="green"
            />
            <Card
              title="Pending"
              value={stats.pending}
              icon={ClockIcon}
              color="yellow"
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(parseInt(e.target.value))}
              options={[
                { value: 1, label: 'January' },
                { value: 2, label: 'February' },
                { value: 3, label: 'March' },
                { value: 4, label: 'April' },
                { value: 5, label: 'May' },
                { value: 6, label: 'June' },
                { value: 7, label: 'July' },
                { value: 8, label: 'August' },
                { value: 9, label: 'September' },
                { value: 10, label: 'October' },
                { value: 11, label: 'November' },
                { value: 12, label: 'December' },
              ]}
            />
            <Input
              label="Year"
              type="number"
              value={yearFilter}
              onChange={(e) => setYearFilter(parseInt(e.target.value))}
            />
          </div>
        </div>

        {/* Payroll Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Table columns={columns} data={paginatedData} loading={loading} />
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />

        {/* Create Payroll Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Generate Payroll"
          size="large"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Select
                label="Teacher"
                name="teacher"
                value={formData.teacher}
                onChange={handleInputChange}
                options={[
                  { value: '', label: 'Select Teacher' },
                  ...teachers.map((teacher) => ({
                    value: teacher._id,
                    label: `${teacher.firstName} ${teacher.lastName}`,
                  })),
                ]}
                required
              />
              <Select
                label="Month"
                name="month"
                value={formData.month}
                onChange={handleInputChange}
                options={Array.from({ length: 12 }, (_, i) => ({
                  value: i + 1,
                  label: new Date(2024, i).toLocaleDateString('en-US', { month: 'long' }),
                }))}
                required
              />
              <Input
                label="Year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Attendance */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Attendance</h3>
              <div className="grid grid-cols-4 gap-4">
                <Input
                  label="Working Days"
                  name="workingDays"
                  type="number"
                  value={formData.workingDays}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Present Days"
                  name="presentDays"
                  type="number"
                  value={formData.presentDays}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Absent Days"
                  name="absentDays"
                  type="number"
                  value={formData.absentDays}
                  onChange={handleInputChange}
                />
                <Input
                  label="Leaves"
                  name="leaves"
                  type="number"
                  value={formData.leaves}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Earnings */}
            <div className="bg-green-50 p-4 rounded-md">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Earnings</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Basic Salary"
                  name="basicSalary"
                  type="number"
                  value={formData.basicSalary}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="House Rent Allowance"
                  name="allowances.houseRent"
                  type="number"
                  value={formData.allowances.houseRent}
                  onChange={handleInputChange}
                />
                <Input
                  label="Transport Allowance"
                  name="allowances.transport"
                  type="number"
                  value={formData.allowances.transport}
                  onChange={handleInputChange}
                />
                <Input
                  label="Medical Allowance"
                  name="allowances.medical"
                  type="number"
                  value={formData.allowances.medical}
                  onChange={handleInputChange}
                />
                <Input
                  label="Special Allowance"
                  name="allowances.special"
                  type="number"
                  value={formData.allowances.special}
                  onChange={handleInputChange}
                />
                <Input
                  label="Bonuses"
                  name="bonuses"
                  type="number"
                  value={formData.bonuses}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mt-3 text-right">
                <span className="text-sm font-semibold text-green-800">
                  Gross Total: PKR {grossTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Deductions */}
            <div className="bg-red-50 p-4 rounded-md">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Deductions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Tax"
                  name="deductions.tax"
                  type="number"
                  value={formData.deductions.tax}
                  onChange={handleInputChange}
                />
                <Input
                  label="Provident Fund"
                  name="deductions.providentFund"
                  type="number"
                  value={formData.deductions.providentFund}
                  onChange={handleInputChange}
                />
                <Input
                  label="Insurance"
                  name="deductions.insurance"
                  type="number"
                  value={formData.deductions.insurance}
                  onChange={handleInputChange}
                />
                <Input
                  label="Loan Deduction"
                  name="deductions.loan"
                  type="number"
                  value={formData.deductions.loan}
                  onChange={handleInputChange}
                />
                <Input
                  label="Absent Deduction"
                  name="deductions.absent"
                  type="number"
                  value={formData.deductions.absent}
                  onChange={handleInputChange}
                />
                <Input
                  label="Late Deduction"
                  name="deductions.late"
                  type="number"
                  value={formData.deductions.late}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mt-3 text-right">
                <span className="text-sm font-semibold text-red-800">
                  Total Deductions: PKR {deductionsTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Net Salary */}
            <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-md">
              <div className="text-center">
                <p className="text-sm text-gray-700">Net Salary</p>
                <p className="text-2xl font-bold text-blue-600">
                  PKR {netTotal.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Payment Method"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                options={[
                  { value: 'bank-transfer', label: 'Bank Transfer' },
                  { value: 'cash', label: 'Cash' },
                  { value: 'cheque', label: 'Cheque' },
                ]}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="1"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Optional notes..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">Generate Payroll</Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default TeacherPayroll;

