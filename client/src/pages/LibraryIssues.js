import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import Select from '../components/Select';
import {
  BookmarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { libraryService } from '../services/libraryService';
import { useTableData } from '../hooks/useTableData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LibraryIssues = () => {
  const toast = useToast();
  const { isAdmin, isTeacher } = useAuth();
  const [issues, setIssues] = useState([]);
  const [overdueIssues, setOverdueIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [returnCondition, setReturnCondition] = useState('Good');
  const [returnNotes, setReturnNotes] = useState('');

  useEffect(() => {
    fetchIssues();
    fetchOverdueBooks();
  }, [statusFilter]);

  const fetchIssues = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      const data = await libraryService.getAllIssues(params);
      setIssues(data);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to fetch book issues');
    } finally {
      setLoading(false);
    }
  };

  const fetchOverdueBooks = async () => {
    try {
      const data = await libraryService.getOverdueBooks();
      setOverdueIssues(data);
    } catch (error) {
      console.error('Error fetching overdue books:', error);
    }
  };

  const {
    paginatedData,
    searchTerm,
    setSearchTerm,
    clearSearch,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
  } = useTableData(issues, ['book.title', 'student.firstName', 'student.studentId'], 10);

  const handleReturnBook = async (e) => {
    e.preventDefault();
    try {
      const data = {
        condition: returnCondition,
        notes: returnNotes,
      };
      
      const result = await libraryService.returnBook(selectedIssue._id, data);
      
      if (result.fine && result.fine.amount > 0) {
        toast.warning(`Book returned. Fine: PKR ${result.fine.amount}`, {
          duration: 5000,
        });
      } else {
        toast.success('Book returned successfully');
      }
      
      fetchIssues();
      fetchOverdueBooks();
      closeReturnModal();
    } catch (error) {
      console.error('Error returning book:', error);
      toast.error(error.response?.data?.message || 'Error returning book');
    }
  };

  const handleRenewBook = async (issue) => {
    try {
      const newDueDate = new Date();
      newDueDate.setDate(newDueDate.getDate() + 14); // Add 14 days
      
      await libraryService.renewBook(issue._id, { newDueDate });
      toast.success('Book renewed successfully for 14 more days');
      fetchIssues();
    } catch (error) {
      console.error('Error renewing book:', error);
      toast.error(error.response?.data?.message || 'Error renewing book');
    }
  };

  const handlePayFine = async (issue) => {
    if (window.confirm(`Pay fine of PKR ${issue.fine.amount}?`)) {
      try {
        await libraryService.payFine(issue._id);
        toast.success('Fine paid successfully');
        fetchIssues();
        fetchOverdueBooks();
      } catch (error) {
        console.error('Error paying fine:', error);
        toast.error('Error paying fine');
      }
    }
  };

  const closeReturnModal = () => {
    setIsReturnModalOpen(false);
    setSelectedIssue(null);
    setReturnCondition('Good');
    setReturnNotes('');
  };

  const getStatusBadge = (status) => {
    const badges = {
      Issued: 'bg-blue-100 text-blue-800',
      Returned: 'bg-green-100 text-green-800',
      Overdue: 'bg-red-100 text-red-800',
      Lost: 'bg-gray-100 text-gray-800',
      Damaged: 'bg-orange-100 text-orange-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      header: 'Issue ID',
      accessor: 'issueId',
      render: (row) => (
        <div className="font-mono text-sm font-semibold text-primary-600">{row.issueId}</div>
      ),
    },
    {
      header: 'Book',
      accessor: 'book',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.book?.title}</div>
          <div className="text-xs text-gray-500">{row.book?.author}</div>
        </div>
      ),
    },
    {
      header: 'Student',
      accessor: 'student',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.student?.firstName} {row.student?.lastName}
          </div>
          <div className="text-xs text-gray-500">{row.student?.studentId}</div>
        </div>
      ),
    },
    {
      header: 'Issue Date',
      accessor: 'issueDate',
      render: (row) => (
        <span className="text-sm text-gray-600">
          {new Date(row.issueDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Due Date',
      accessor: 'dueDate',
      render: (row) => {
        const isOverdue = new Date(row.dueDate) < new Date() && row.status !== 'Returned';
        return (
          <span className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
            {new Date(row.dueDate).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(row.status)}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Fine',
      accessor: 'fine',
      render: (row) => (
        row.fine?.amount > 0 ? (
          <div>
            <div className={`text-sm font-semibold ${row.fine.paid ? 'text-green-600' : 'text-red-600'}`}>
              PKR {row.fine.amount}
            </div>
            <div className="text-xs text-gray-500">{row.fine.paid ? 'Paid' : 'Unpaid'}</div>
          </div>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex flex-col space-y-1">
          {row.status === 'Issued' && (isAdmin || isTeacher) && (
            <button
              onClick={() => {
                setSelectedIssue(row);
                setIsReturnModalOpen(true);
              }}
              className="text-green-600 hover:text-green-900 text-sm font-medium"
            >
              Return
            </button>
          )}
          {row.status === 'Issued' && row.renewalCount < 2 && (isAdmin || isTeacher) && (
            <button
              onClick={() => handleRenewBook(row)}
              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
            >
              Renew
            </button>
          )}
          {row.fine?.amount > 0 && !row.fine?.paid && (isAdmin || isTeacher) && (
            <button
              onClick={() => handlePayFine(row)}
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              Pay Fine
            </button>
          )}
        </div>
      ),
    },
  ];

  const activeIssues = issues.filter(i => i.status === 'Issued' || i.status === 'Overdue');
  const returnedIssues = issues.filter(i => i.status === 'Returned');
  const totalFines = issues.reduce((sum, i) => sum + (i.fine?.paid ? 0 : i.fine?.amount || 0), 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BookmarkIcon className="h-8 w-8 mr-2 text-primary-600" />
              Book Issues & Returns
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage book borrowing and returns
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            title="Active Issues"
            value={activeIssues.length}
            icon={BookmarkIcon}
            color="blue"
          />
          <Card
            title="Overdue Books"
            value={overdueIssues.length}
            icon={ExclamationCircleIcon}
            color="red"
          />
          <Card
            title="Returned"
            value={returnedIssues.length}
            icon={CheckCircleIcon}
            color="green"
          />
          <Card
            title="Unpaid Fines"
            value={`PKR ${totalFines}`}
            icon={CurrencyDollarIcon}
            color="orange"
          />
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Issues
              </label>
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={clearSearch}
                placeholder="Search by book, student..."
              />
            </div>
            <Select
              label="Status"
              name="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'Issued', label: 'Issued' },
                { value: 'Overdue', label: 'Overdue' },
                { value: 'Returned', label: 'Returned' },
              ]}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Showing {paginatedData.length} of {totalItems} issues
          </div>
        </div>

        {/* Issues Table */}
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

        {/* Return Book Modal */}
        <Modal
          isOpen={isReturnModalOpen}
          onClose={closeReturnModal}
          title="Return Book"
        >
          {selectedIssue && (
            <form onSubmit={handleReturnBook} className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-gray-900 mb-1">{selectedIssue.book?.title}</h3>
                <p className="text-sm text-gray-600">
                  Student: {selectedIssue.student?.firstName} {selectedIssue.student?.lastName} ({selectedIssue.student?.studentId})
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Issue Date:</span>{' '}
                    <span className="font-medium">{new Date(selectedIssue.issueDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Due Date:</span>{' '}
                    <span className={`font-medium ${new Date(selectedIssue.dueDate) < new Date() ? 'text-red-600' : ''}`}>
                      {new Date(selectedIssue.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {selectedIssue.status === 'Overdue' && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                  <p className="text-sm text-red-800">
                    <strong>⚠️ Overdue Book</strong><br/>
                    Fine Amount: <span className="font-bold">PKR {selectedIssue.fine?.amount || 0}</span>
                  </p>
                </div>
              )}

              <Select
                label="Book Condition on Return"
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
                options={[
                  { value: 'New', label: 'New' },
                  { value: 'Good', label: 'Good' },
                  { value: 'Fair', label: 'Fair' },
                  { value: 'Poor', label: 'Poor' },
                  { value: 'Damaged', label: 'Damaged' },
                ]}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Return Notes (Optional)
                </label>
                <textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  rows="2"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Any observations about the book condition..."
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="secondary" onClick={closeReturnModal}>
                  Cancel
                </Button>
                <Button type="submit" icon={CheckCircleIcon}>
                  Confirm Return
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default LibraryIssues;

