import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import Card from '../components/Card';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { useTableData } from '../hooks/useTableData';
import {
  PlusIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { feeService } from '../services/feeService';
import { classService } from '../services/classService';
import { studentService } from '../services/studentService';
import { useToast } from '../context/ToastContext';

const FeeManagement = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('structures');
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  
  // Fee Structures
  const [feeStructures, setFeeStructures] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [structureFormData, setStructureFormData] = useState({
    class: '',
    academicYear: '2024-2025',
    feeType: 'tuition',
    feeName: '',
    amount: '',
    frequency: 'monthly',
    dueDay: '10',
    description: '',
  });

  // Payments
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentFormData, setPaymentFormData] = useState({
    studentId: '',
    feeStructureId: '',
    dueDate: '',
    lateFee: '0',
    discount: '0',
    academicYear: '2024-2025',
    term: '1st',
  });
  const [processFormData, setProcessFormData] = useState({
    amountPaid: '',
    paymentMethod: 'cash',
    remarks: '',
  });

  // Pagination and search for payments
  const {
    paginatedData: paginatedPayments,
    searchTerm: paymentSearch,
    setSearchTerm: setPaymentSearch,
    clearSearch: clearPaymentSearch,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
  } = useTableData(payments, ['invoiceNumber', 'student.firstName', 'student.lastName'], 10);

  useEffect(() => {
    fetchStatistics();
    fetchClasses();
    fetchStudents();
    if (activeTab === 'structures') {
      fetchFeeStructures();
    } else if (activeTab === 'payments') {
      fetchPayments();
    }
  }, [activeTab]);

  const fetchStatistics = async () => {
    try {
      const data = await feeService.getFeeStatistics({ academicYear: '2024-2025' });
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchFeeStructures = async () => {
    try {
      setLoading(true);
      const data = await feeService.getFeeStructures();
      setFeeStructures(data);
    } catch (error) {
      console.error('Error fetching fee structures:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await feeService.getFeePayments();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await classService.getAllClasses();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Fee Structure Handlers
  const handleStructureChange = (e) => {
    setStructureFormData({
      ...structureFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleStructureSubmit = async (e) => {
    e.preventDefault();
    try {
      await feeService.createFeeStructure(structureFormData);
      fetchFeeStructures();
      setIsStructureModalOpen(false);
      resetStructureForm();
      toast.success('Fee structure created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating fee structure');
    }
  };

  const resetStructureForm = () => {
    setStructureFormData({
      class: '',
      academicYear: '2024-2025',
      feeType: 'tuition',
      feeName: '',
      amount: '',
      frequency: 'monthly',
      dueDay: '10',
      description: '',
    });
  };

  // Payment Handlers
  const handlePaymentChange = (e) => {
    setPaymentFormData({
      ...paymentFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await feeService.createFeePayment(paymentFormData);
      fetchPayments();
      setIsPaymentModalOpen(false);
      resetPaymentForm();
      toast.success('Invoice created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating invoice');
    }
  };

  const resetPaymentForm = () => {
    setPaymentFormData({
      studentId: '',
      feeStructureId: '',
      dueDate: '',
      lateFee: '0',
      discount: '0',
      academicYear: '2024-2025',
      term: '1st',
    });
  };

  const handleProcessChange = (e) => {
    setProcessFormData({
      ...processFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    try {
      await feeService.processPayment(selectedPayment._id, processFormData);
      fetchPayments();
      fetchStatistics();
      setIsProcessModalOpen(false);
      setSelectedPayment(null);
      resetProcessForm();
      toast.success('Payment processed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error processing payment');
    }
  };

  const resetProcessForm = () => {
    setProcessFormData({
      amountPaid: '',
      paymentMethod: 'cash',
      remarks: '',
    });
  };

  const openProcessModal = (payment) => {
    setSelectedPayment(payment);
    setProcessFormData({
      ...processFormData,
      amountPaid: payment.balance.toString(),
    });
    setIsProcessModalOpen(true);
  };

  const handleDownloadInvoice = async (payment) => {
    try {
      const blob = await feeService.downloadInvoice(payment._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${payment.invoiceNumber}.pdf`;
      a.click();
    } catch (error) {
      toast.error('Error downloading invoice');
    }
  };

  const handleDownloadReceipt = async (payment) => {
    try {
      const blob = await feeService.downloadReceipt(payment._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${payment.receiptNumber || payment.invoiceNumber}.pdf`;
      a.click();
    } catch (error) {
      toast.error('Error downloading receipt');
    }
  };

  const handleSendReminder = async (payment) => {
    try {
      await feeService.sendPaymentReminder(payment._id);
      toast.success('Payment reminder sent successfully!');
    } catch (error) {
      toast.error('Error sending reminder');
    }
  };

  // Columns
  const structureColumns = [
    {
      header: 'Fee Name',
      accessor: 'feeName',
    },
    {
      header: 'Class',
      accessor: 'class',
      render: (row) => row.class?.className || 'N/A',
    },
    {
      header: 'Type',
      accessor: 'feeType',
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row) => `PKR ${row.amount.toLocaleString()}`,
    },
    {
      header: 'Frequency',
      accessor: 'frequency',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {row.status}
        </span>
      ),
    },
  ];

  const paymentColumns = [
    {
      header: 'Invoice #',
      accessor: 'invoiceNumber',
    },
    {
      header: 'Student',
      accessor: 'student',
      render: (row) => row.student ? `${row.student.firstName} ${row.student.lastName}` : 'N/A',
    },
    {
      header: 'Fee',
      accessor: 'feeStructure',
      render: (row) => row.feeStructure?.feeName || 'N/A',
    },
    {
      header: 'Amount',
      accessor: 'totalAmount',
      render: (row) => `PKR ${row.totalAmount.toLocaleString()}`,
    },
    {
      header: 'Paid',
      accessor: 'amountPaid',
      render: (row) => `PKR ${row.amountPaid.toLocaleString()}`,
    },
    {
      header: 'Balance',
      accessor: 'balance',
      render: (row) => `PKR ${row.balance.toLocaleString()}`,
    },
    {
      header: 'Status',
      accessor: 'paymentStatus',
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
          row.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
          row.paymentStatus === 'overdue' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.paymentStatus}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          {row.paymentStatus !== 'paid' && (
            <button
              onClick={() => openProcessModal(row)}
              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
            >
              Pay
            </button>
          )}
          <button
            onClick={() => handleDownloadInvoice(row)}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            Invoice
          </button>
          {row.paymentStatus === 'paid' && (
            <button
              onClick={() => handleDownloadReceipt(row)}
              className="text-green-600 hover:text-green-900 text-sm font-medium"
            >
              Receipt
            </button>
          )}
          {row.paymentStatus !== 'paid' && (
            <button
              onClick={() => handleSendReminder(row)}
              className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
            >
              Remind
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage fee structures, payments, and invoices
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            title="Total Invoiced"
            value={`PKR ${(statistics?.totalInvoiced || 0).toLocaleString()}`}
            icon={BanknotesIcon}
            color="blue"
            subtitle="Current year"
          />
          <Card
            title="Total Collected"
            value={`PKR ${(statistics?.totalCollected || 0).toLocaleString()}`}
            icon={CheckCircleIcon}
            color="green"
            subtitle="Paid fees"
          />
          <Card
            title="Pending Amount"
            value={`PKR ${(statistics?.totalPending || 0).toLocaleString()}`}
            icon={ClockIcon}
            color="yellow"
            subtitle="Awaiting payment"
          />
          <Card
            title="Overdue Payments"
            value={statistics?.overdueCount || 0}
            icon={ExclamationCircleIcon}
            color="red"
            subtitle="Past due date"
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('structures')}
              className={`${
                activeTab === 'structures'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors duration-200`}
            >
              Fee Structures
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`${
                activeTab === 'payments'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors duration-200`}
            >
              Payments & Invoices
            </button>
          </nav>
        </div>

        {/* Fee Structures Tab */}
        {activeTab === 'structures' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Configure fee structures for different classes
              </p>
              <Button icon={PlusIcon} onClick={() => setIsStructureModalOpen(true)}>
                Add Fee Structure
              </Button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <Table
                columns={structureColumns}
                data={feeStructures}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex-1 max-w-md">
                <SearchBar
                  value={paymentSearch}
                  onChange={setPaymentSearch}
                  onClear={clearPaymentSearch}
                  placeholder="Search by invoice, student name..."
                />
              </div>
              <Button icon={PlusIcon} onClick={() => setIsPaymentModalOpen(true)}>
                Create Invoice
              </Button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <Table
                columns={paymentColumns}
                data={paginatedPayments}
                loading={loading}
              />
              
              {!loading && totalItems > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fee Structure Modal */}
      <Modal
        isOpen={isStructureModalOpen}
        onClose={() => {
          setIsStructureModalOpen(false);
          resetStructureForm();
        }}
        title="Add Fee Structure"
        size="lg"
      >
        <form onSubmit={handleStructureSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Class"
              name="class"
              value={structureFormData.class}
              onChange={handleStructureChange}
              required
              options={classes.map(cls => ({
                value: cls._id,
                label: cls.className,
              }))}
            />
            <Input
              label="Academic Year"
              name="academicYear"
              value={structureFormData.academicYear}
              onChange={handleStructureChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Fee Type"
              name="feeType"
              value={structureFormData.feeType}
              onChange={handleStructureChange}
              required
              options={[
                { value: 'tuition', label: 'Tuition Fee' },
                { value: 'admission', label: 'Admission Fee' },
                { value: 'exam', label: 'Exam Fee' },
                { value: 'library', label: 'Library Fee' },
                { value: 'transport', label: 'Transport Fee' },
                { value: 'hostel', label: 'Hostel Fee' },
                { value: 'sports', label: 'Sports Fee' },
                { value: 'other', label: 'Other' },
              ]}
            />
            <Input
              label="Fee Name"
              name="feeName"
              value={structureFormData.feeName}
              onChange={handleStructureChange}
              required
              placeholder="e.g., Monthly Tuition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount (PKR)"
              name="amount"
              type="number"
              value={structureFormData.amount}
              onChange={handleStructureChange}
              required
              min="0"
            />
            <Select
              label="Frequency"
              name="frequency"
              value={structureFormData.frequency}
              onChange={handleStructureChange}
              required
              options={[
                { value: 'one-time', label: 'One Time' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'quarterly', label: 'Quarterly' },
                { value: 'semi-annual', label: 'Semi-Annual' },
                { value: 'annual', label: 'Annual' },
              ]}
            />
          </div>

          <Input
            label="Due Day of Month"
            name="dueDay"
            type="number"
            value={structureFormData.dueDay}
            onChange={handleStructureChange}
            min="1"
            max="31"
          />

          <Input
            label="Description"
            name="description"
            value={structureFormData.description}
            onChange={handleStructureChange}
            placeholder="Optional description"
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsStructureModalOpen(false);
                resetStructureForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Create Fee Structure</Button>
          </div>
        </form>
      </Modal>

      {/* Create Payment/Invoice Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          resetPaymentForm();
        }}
        title="Create Invoice"
        size="lg"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <Select
            label="Student"
            name="studentId"
            value={paymentFormData.studentId}
            onChange={handlePaymentChange}
            required
            options={students.map(student => ({
              value: student._id,
              label: `${student.firstName} ${student.lastName} (${student.studentId})`,
            }))}
          />

          <Select
            label="Fee Structure"
            name="feeStructureId"
            value={paymentFormData.feeStructureId}
            onChange={handlePaymentChange}
            required
            options={feeStructures.filter(f => f.status === 'active').map(fee => ({
              value: fee._id,
              label: `${fee.feeName} - PKR ${fee.amount}`,
            }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Due Date"
              name="dueDate"
              type="date"
              value={paymentFormData.dueDate}
              onChange={handlePaymentChange}
              required
            />
            <Select
              label="Term"
              name="term"
              value={paymentFormData.term}
              onChange={handlePaymentChange}
              required
              options={[
                { value: '1st', label: '1st Term' },
                { value: '2nd', label: '2nd Term' },
                { value: '3rd', label: '3rd Term' },
                { value: 'annual', label: 'Annual' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Late Fee (PKR)"
              name="lateFee"
              type="number"
              value={paymentFormData.lateFee}
              onChange={handlePaymentChange}
              min="0"
            />
            <Input
              label="Discount (PKR)"
              name="discount"
              type="number"
              value={paymentFormData.discount}
              onChange={handlePaymentChange}
              min="0"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsPaymentModalOpen(false);
                resetPaymentForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Generate Invoice</Button>
          </div>
        </form>
      </Modal>

      {/* Process Payment Modal */}
      <Modal
        isOpen={isProcessModalOpen}
        onClose={() => {
          setIsProcessModalOpen(false);
          setSelectedPayment(null);
          resetProcessForm();
        }}
        title="Process Payment"
        size="md"
      >
        {selectedPayment && (
          <form onSubmit={handleProcessPayment} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Student:</p>
              <p className="font-medium">
                {selectedPayment.student?.firstName} {selectedPayment.student?.lastName}
              </p>
              <p className="text-sm text-gray-600 mt-2">Invoice:</p>
              <p className="font-medium">{selectedPayment.invoiceNumber}</p>
              <p className="text-sm text-gray-600 mt-2">Balance Due:</p>
              <p className="font-medium text-lg text-red-600">
                PKR {selectedPayment.balance.toLocaleString()}
              </p>
            </div>

            <Input
              label="Amount Paying (PKR)"
              name="amountPaid"
              type="number"
              value={processFormData.amountPaid}
              onChange={handleProcessChange}
              required
              min="1"
              max={selectedPayment.balance}
            />

            <Select
              label="Payment Method"
              name="paymentMethod"
              value={processFormData.paymentMethod}
              onChange={handleProcessChange}
              required
              options={[
                { value: 'cash', label: 'Cash' },
                { value: 'bank-transfer', label: 'Bank Transfer' },
                { value: 'cheque', label: 'Cheque' },
                { value: 'online', label: 'Online' },
              ]}
            />

            <Input
              label="Remarks (Optional)"
              name="remarks"
              value={processFormData.remarks}
              onChange={handleProcessChange}
              placeholder="Payment notes..."
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsProcessModalOpen(false);
                  setSelectedPayment(null);
                  resetProcessForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Process Payment</Button>
            </div>
          </form>
        )}
      </Modal>
    </Layout>
  );
};

export default FeeManagement;

