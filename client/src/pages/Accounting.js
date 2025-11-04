import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import {
  BanknotesIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  WalletIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';

const Accounting = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, income, expense
  
  // States for interactive features
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
    period: 'all', // all, today, week, month, year
  });

  // Statistics
  const [statistics, setStatistics] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    todayIncome: 0,
    todayExpense: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
  });

  // Transactions
  const [transactions, setTransactions] = useState([
    {
      _id: '1',
      date: '2024-11-03',
      type: 'income',
      category: 'Tuition Fees',
      description: 'Tuition payment - Grade 10 - November',
      amount: 15000,
      paymentMethod: 'Bank Transfer',
      reference: 'TXN001',
      studentName: 'Ahmed Khan',
    },
    {
      _id: '2',
      date: '2024-11-02',
      type: 'expense',
      category: 'Salaries',
      description: 'Teacher salary - October',
      amount: 45000,
      paymentMethod: 'Bank Transfer',
      reference: 'PAY001',
      recipientName: 'Staff Payment',
    },
    {
      _id: '3',
      date: '2024-11-01',
      type: 'income',
      category: 'Transport Fees',
      description: 'Transport fee - November',
      amount: 3000,
      paymentMethod: 'Cash',
      reference: 'TXN002',
      studentName: 'Fatima Ali',
    },
    {
      _id: '4',
      date: '2024-11-01',
      type: 'expense',
      category: 'Utilities',
      description: 'Electricity bill - October',
      amount: 8500,
      paymentMethod: 'Cash',
      reference: 'UTIL001',
      recipientName: 'WAPDA',
    },
    {
      _id: '5',
      date: '2024-10-31',
      type: 'income',
      category: 'Admission Fees',
      description: 'New admission - Grade 6',
      amount: 25000,
      paymentMethod: 'Cash',
      reference: 'ADM001',
      studentName: 'Hassan Raza',
    },
  ]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'income',
    category: '',
    description: '',
    amount: '',
    paymentMethod: 'cash',
    reference: '',
    studentName: '',
    recipientName: '',
  });

  // Categories
  const incomeCategories = [
    'Tuition Fees',
    'Transport Fees',
    'Admission Fees',
    'Exam Fees',
    'Library Fees',
    'Sports Fees',
    'Other Fees',
    'Donations',
    'Other Income',
  ];

  const expenseCategories = [
    'Salaries',
    'Utilities',
    'Maintenance',
    'Supplies',
    'Transportation',
    'Marketing',
    'Events',
    'Equipment',
    'Other Expenses',
  ];

  useEffect(() => {
    calculateStatistics();
  }, [transactions]);

  const calculateStatistics = () => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const stats = transactions.reduce((acc, txn) => {
      const txnDate = new Date(txn.date);
      const amount = parseFloat(txn.amount);

      if (txn.type === 'income') {
        acc.totalIncome += amount;
        if (txn.date === today) acc.todayIncome += amount;
        if (txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear) {
          acc.monthlyIncome += amount;
        }
      } else {
        acc.totalExpense += amount;
        if (txn.date === today) acc.todayExpense += amount;
        if (txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear) {
          acc.monthlyExpense += amount;
        }
      }
      return acc;
    }, {
      totalIncome: 0,
      totalExpense: 0,
      todayIncome: 0,
      todayExpense: 0,
      monthlyIncome: 0,
      monthlyExpense: 0,
    });

    stats.netBalance = stats.totalIncome - stats.totalExpense;
    setStatistics(stats);
  };

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
    if (!sortConfig.key) return data;
    
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

  // Filter data
  const getFilteredData = (data) => {
    let filtered = [...data];

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(txn => txn.type === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(txn => {
        return Object.values(txn).some(value => {
          if (value === null || value === undefined) return false;
          return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    // Filter by date
    if (dateFilter.startDate) {
      filtered = filtered.filter(txn => txn.date >= dateFilter.startDate);
    }
    if (dateFilter.endDate) {
      filtered = filtered.filter(txn => txn.date <= dateFilter.endDate);
    }

    return filtered;
  };

  // Get paginated data
  const getPaginatedData = (data) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingTransaction) {
        // Update existing transaction
        setTransactions(transactions.map(txn => 
          txn._id === editingTransaction._id ? { ...formData, _id: txn._id } : txn
        ));
        toast.success('Transaction updated successfully!');
      } else {
        // Add new transaction
        const newTransaction = {
          ...formData,
          _id: Date.now().toString(),
        };
        setTransactions([newTransaction, ...transactions]);
        toast.success('Transaction added successfully!');
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(transactions.filter(txn => txn._id !== id));
      toast.success('Transaction deleted successfully!');
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      category: '',
      description: '',
      amount: '',
      paymentMethod: 'cash',
      reference: '',
      studentName: '',
      recipientName: '',
    });
  };

  const handleExport = () => {
    toast.info('Generating report...');
    // TODO: Implement export functionality
    setTimeout(() => {
      toast.success('Report exported successfully!');
    }, 1000);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BanknotesIcon className="h-8 w-8 mr-2 text-primary-600" />
              Accounting
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Track income and expenses for complete financial management
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleExport}
              icon={DocumentArrowDownIcon}
            >
              Export Report
            </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              icon={PlusIcon}
            >
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Income */}
          <div 
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer"
            onMouseEnter={() => setHoveredCard('income')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Income</p>
                <p className={`text-3xl font-bold text-green-900 mt-2 transition-all duration-300 ${hoveredCard === 'income' ? 'scale-110' : ''}`}>
                  Rs. {statistics.totalIncome.toLocaleString()}
                </p>
                {hoveredCard === 'income' && (
                  <p className="text-xs text-green-600 mt-2 animate-fade-in">
                    Today: Rs. {statistics.todayIncome.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Expense */}
          <div 
            className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border border-red-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer"
            onMouseEnter={() => setHoveredCard('expense')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Total Expense</p>
                <p className={`text-3xl font-bold text-red-900 mt-2 transition-all duration-300 ${hoveredCard === 'expense' ? 'scale-110' : ''}`}>
                  Rs. {statistics.totalExpense.toLocaleString()}
                </p>
                {hoveredCard === 'expense' && (
                  <p className="text-xs text-red-600 mt-2 animate-fade-in">
                    Today: Rs. {statistics.todayExpense.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <ArrowTrendingDownIcon className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Net Balance */}
          <div 
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer"
            onMouseEnter={() => setHoveredCard('balance')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Net Balance</p>
                <p className={`text-3xl font-bold ${statistics.netBalance >= 0 ? 'text-blue-900' : 'text-red-900'} mt-2 transition-all duration-300 ${hoveredCard === 'balance' ? 'scale-110' : ''}`}>
                  Rs. {statistics.netBalance.toLocaleString()}
                </p>
                {hoveredCard === 'balance' && (
                  <p className="text-xs text-blue-600 mt-2 animate-fade-in">
                    Income - Expense
                  </p>
                )}
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <WalletIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Monthly Summary */}
          <div 
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer"
            onMouseEnter={() => setHoveredCard('monthly')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">This Month</p>
                <p className={`text-xl font-bold text-purple-900 mt-2 transition-all duration-300 ${hoveredCard === 'monthly' ? 'scale-110' : ''}`}>
                  Income: Rs. {statistics.monthlyIncome.toLocaleString()}
                </p>
                <p className="text-lg font-semibold text-purple-700">
                  Expense: Rs. {statistics.monthlyExpense.toLocaleString()}
                </p>
                {hoveredCard === 'monthly' && (
                  <p className="text-xs text-purple-600 mt-2 animate-fade-in">
                    Net: Rs. {(statistics.monthlyIncome - statistics.monthlyExpense).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <BanknotesIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Tabs */}
          <div className="flex space-x-1 border-b border-gray-200 mb-6">
            {[
              { key: 'all', label: 'All Transactions' },
              { key: 'income', label: 'Income' },
              { key: 'expense', label: 'Expense' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setCurrentPage(1);
                }}
                className={`px-6 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                  activeTab === tab.key
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
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
            <Input
              type="date"
              label="From Date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
            />
            <Input
              type="date"
              label="To Date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
            />
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      <SortIcon columnKey="date" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Type</span>
                      <SortIcon columnKey="type" />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Amount</span>
                      <SortIcon columnKey="amount" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getPaginatedData(processTableData(transactions)).length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <MagnifyingGlassIcon className="h-12 w-12 mb-3 text-gray-300" />
                        <p className="text-lg font-medium text-gray-900 mb-1">No transactions found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  getPaginatedData(processTableData(transactions)).map((transaction) => (
                    <tr 
                      key={transaction._id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                        <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.type === 'income' ? '+' : '-'} Rs. {transaction.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction._id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
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

          {/* Pagination */}
          {processTableData(transactions).length > itemsPerPage && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 mt-4">
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
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, processTableData(transactions).length)}
                  </span>{' '}
                  of <span className="font-medium">{processTableData(transactions).length}</span> results
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(getTotalPages(transactions), currentPage + 1))}
                  disabled={currentPage === getTotalPages(transactions)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <Select
              label="Transaction Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
              options={[
                { value: 'income', label: 'Income' },
                { value: 'expense', label: 'Expense' },
              ]}
              required
            />
          </div>

          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={[
              { value: '', label: 'Select category' },
              ...(formData.type === 'income' ? incomeCategories : expenseCategories).map(cat => ({
                value: cat,
                label: cat,
              })),
            ]}
            required
          />

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter transaction description"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Amount (Rs.)"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0"
              required
            />
            <Select
              label="Payment Method"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              options={[
                { value: 'cash', label: 'Cash' },
                { value: 'Bank Transfer', label: 'Bank Transfer' },
                { value: 'Cheque', label: 'Cheque' },
                { value: 'Online', label: 'Online Payment' },
              ]}
              required
            />
          </div>

          <Input
            label="Reference Number"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            placeholder="TXN001"
          />

          {formData.type === 'income' && (
            <Input
              label="Student Name (if applicable)"
              value={formData.studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              placeholder="Enter student name"
            />
          )}

          {formData.type === 'expense' && (
            <Input
              label="Recipient Name"
              value={formData.recipientName}
              onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
              placeholder="Enter recipient name"
            />
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : editingTransaction ? 'Update Transaction' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default Accounting;

