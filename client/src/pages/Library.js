import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import {
  PlusIcon,
  BookOpenIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { libraryService } from '../services/libraryService';
import { studentService } from '../services/studentService';
import { useTableData } from '../hooks/useTableData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Library = () => {
  const toast = useToast();
  const { user, isAdmin, isTeacher } = useAuth();
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [bookFormData, setBookFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    category: 'Textbook',
    language: 'English',
    edition: '',
    publicationYear: new Date().getFullYear(),
    numberOfPages: '',
    price: '',
    totalCopies: 1,
    shelf: '',
    rack: '',
    floor: '',
    description: '',
  });

  const [issueFormData, setIssueFormData] = useState({
    studentId: '',
    dueDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchBooks();
    fetchStats();
  }, [categoryFilter, statusFilter]);

  const fetchBooks = async () => {
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      
      const data = await libraryService.getAllBooks(params);
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await libraryService.getLibraryStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
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
  } = useTableData(books, ['title', 'author', 'isbn', 'bookId'], 10);

  const handleBookInputChange = (e) => {
    setBookFormData({
      ...bookFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleIssueInputChange = (e) => {
    setIssueFormData({
      ...issueFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...bookFormData,
        location: {
          shelf: bookFormData.shelf,
          rack: bookFormData.rack,
          floor: bookFormData.floor,
        },
      };
      
      await libraryService.createBook(dataToSend);
      toast.success('Book added successfully');
      fetchBooks();
      fetchStats();
      closeAddBookModal();
    } catch (error) {
      console.error('Error adding book:', error);
      toast.error(error.response?.data?.message || 'Error adding book');
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    try {
      // Find student by studentId first
      const studentIdInput = issueFormData.studentId.trim();
      
      // Search for student by studentId
      const studentsResponse = await studentService.getAllStudents();
      const studentsData = Array.isArray(studentsResponse) ? studentsResponse : studentsResponse.data || [];
      
      const student = studentsData.find(s => 
        s.studentId?.toLowerCase() === studentIdInput.toLowerCase()
      );
      
      if (!student) {
        toast.error(`Student with ID "${studentIdInput}" not found`);
        return;
      }
      
      const dataToSend = {
        bookId: selectedBook._id,
        studentId: student._id, // Use MongoDB ObjectId
        dueDate: issueFormData.dueDate,
        notes: issueFormData.notes,
      };
      
      await libraryService.issueBook(dataToSend);
      toast.success(`Book issued successfully to ${student.firstName} ${student.lastName}`);
      fetchBooks();
      fetchStats();
      closeIssueModal();
    } catch (error) {
      console.error('Error issuing book:', error);
      toast.error(error.response?.data?.message || 'Error issuing book');
    }
  };

  const handleDeleteBook = async (book) => {
    if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      try {
        await libraryService.deleteBook(book._id);
        toast.success('Book deleted successfully');
        fetchBooks();
        fetchStats();
      } catch (error) {
        console.error('Error deleting book:', error);
        toast.error(error.response?.data?.message || 'Error deleting book');
      }
    }
  };

  const closeAddBookModal = () => {
    setIsAddBookModalOpen(false);
    setBookFormData({
      title: '',
      author: '',
      isbn: '',
      publisher: '',
      category: 'Textbook',
      language: 'English',
      edition: '',
      publicationYear: new Date().getFullYear(),
      numberOfPages: '',
      price: '',
      totalCopies: 1,
      shelf: '',
      rack: '',
      floor: '',
      description: '',
    });
  };

  const closeIssueModal = () => {
    setIsIssueModalOpen(false);
    setSelectedBook(null);
    setIssueFormData({
      studentId: '',
      dueDate: '',
      notes: '',
    });
  };

  const columns = [
    {
      header: 'Book ID',
      accessor: 'bookId',
      render: (row) => (
        <div className="font-mono text-sm font-semibold text-primary-600">{row.bookId}</div>
      ),
    },
    {
      header: 'Title',
      accessor: 'title',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.title}</div>
          <div className="text-xs text-gray-500">{row.author}</div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => (
        <span className="text-sm text-gray-600">{row.category}</span>
      ),
    },
    {
      header: 'ISBN',
      accessor: 'isbn',
      render: (row) => (
        <span className="font-mono text-xs text-gray-500">{row.isbn || 'N/A'}</span>
      ),
    },
    {
      header: 'Copies',
      accessor: 'copies',
      render: (row) => (
        <div className="text-sm">
          <div className="text-green-600 font-semibold">{row.availableCopies} Available</div>
          <div className="text-gray-500">{row.totalCopies} Total</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.status === 'Available' ? 'bg-green-100 text-green-800' :
          row.status === 'Issued' ? 'bg-blue-100 text-blue-800' :
          row.status === 'Damaged' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          {row.availableCopies > 0 && (isAdmin || isTeacher) && (
            <button
              onClick={() => {
                setSelectedBook(row);
                setIsIssueModalOpen(true);
              }}
              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
            >
              Issue
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => handleDeleteBook(row)}
              className="text-red-600 hover:text-red-900 text-sm font-medium"
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  const categories = [
    'Fiction', 'Non-Fiction', 'Science', 'Mathematics', 'History', 
    'Geography', 'Literature', 'Reference', 'Textbook', 'Magazine', 'Other'
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BookOpenIcon className="h-8 w-8 mr-2 text-primary-600" />
              Library Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage books, issues, and student borrowing
            </p>
          </div>
          {(isAdmin || isTeacher) && (
            <Button icon={PlusIcon} onClick={() => setIsAddBookModalOpen(true)}>
              Add New Book
            </Button>
          )}
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Card
              title="Total Books"
              value={stats.totalBooks}
              icon={BookOpenIcon}
              color="blue"
            />
            <Card
              title="Available"
              value={stats.availableBooks}
              icon={CheckCircleIcon}
              color="green"
            />
            <Card
              title="Issued"
              value={stats.issuedBooks}
              icon={UserGroupIcon}
              color="indigo"
            />
            <Card
              title="Overdue"
              value={stats.overdueBooks}
              icon={ExclamationTriangleIcon}
              color="red"
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Books
              </label>
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={clearSearch}
                placeholder="Search by title, author, ISBN..."
              />
            </div>
            <Select
              label="Category"
              name="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map(cat => ({ value: cat, label: cat })),
              ]}
            />
            <Select
              label="Status"
              name="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'Available', label: 'Available' },
                { value: 'Issued', label: 'Issued' },
                { value: 'Damaged', label: 'Damaged' },
                { value: 'Lost', label: 'Lost' },
              ]}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Showing {paginatedData.length} of {totalItems} books
          </div>
        </div>

        {/* Books Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {books.length === 0 && !loading ? (
            <div className="p-12 text-center">
              <BookOpenIcon className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Books Yet</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first book to the library</p>
              {(isAdmin || isTeacher) && (
                <Button icon={PlusIcon} onClick={() => setIsAddBookModalOpen(true)}>
                  Add First Book
                </Button>
              )}
            </div>
          ) : (
            <Table columns={columns} data={paginatedData} loading={loading} />
          )}
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

        {/* Add Book Modal */}
        <Modal
          isOpen={isAddBookModalOpen}
          onClose={closeAddBookModal}
          title="Add New Book"
          size="large"
        >
          <form onSubmit={handleAddBook} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Book Title"
                name="title"
                value={bookFormData.title}
                onChange={handleBookInputChange}
                required
              />
              <Input
                label="Author"
                name="author"
                value={bookFormData.author}
                onChange={handleBookInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="ISBN"
                name="isbn"
                value={bookFormData.isbn}
                onChange={handleBookInputChange}
                placeholder="978-XXXXXXXXXX"
              />
              <Input
                label="Publisher"
                name="publisher"
                value={bookFormData.publisher}
                onChange={handleBookInputChange}
              />
              <Input
                label="Edition"
                name="edition"
                value={bookFormData.edition}
                onChange={handleBookInputChange}
                placeholder="e.g., 1st, 2nd"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Select
                label="Category"
                name="category"
                value={bookFormData.category}
                onChange={handleBookInputChange}
                options={categories.map(cat => ({ value: cat, label: cat }))}
                required
              />
              <Select
                label="Language"
                name="language"
                value={bookFormData.language}
                onChange={handleBookInputChange}
                options={[
                  { value: 'English', label: 'English' },
                  { value: 'Urdu', label: 'Urdu' },
                  { value: 'Arabic', label: 'Arabic' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
              <Input
                label="Publication Year"
                name="publicationYear"
                type="number"
                value={bookFormData.publicationYear}
                onChange={handleBookInputChange}
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Number of Pages"
                name="numberOfPages"
                type="number"
                value={bookFormData.numberOfPages}
                onChange={handleBookInputChange}
              />
              <Input
                label="Price (PKR)"
                name="price"
                type="number"
                value={bookFormData.price}
                onChange={handleBookInputChange}
                min="0"
              />
              <Input
                label="Total Copies"
                name="totalCopies"
                type="number"
                value={bookFormData.totalCopies}
                onChange={handleBookInputChange}
                min="1"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Shelf"
                name="shelf"
                value={bookFormData.shelf}
                onChange={handleBookInputChange}
                placeholder="e.g., A1"
              />
              <Input
                label="Rack"
                name="rack"
                value={bookFormData.rack}
                onChange={handleBookInputChange}
                placeholder="e.g., R5"
              />
              <Input
                label="Floor"
                name="floor"
                value={bookFormData.floor}
                onChange={handleBookInputChange}
                placeholder="e.g., 1st Floor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={bookFormData.description}
                onChange={handleBookInputChange}
                rows="3"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Brief description of the book..."
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={closeAddBookModal}>
                Cancel
              </Button>
              <Button type="submit" icon={PlusIcon}>
                Add Book
              </Button>
            </div>
          </form>
        </Modal>

        {/* Issue Book Modal */}
        <Modal
          isOpen={isIssueModalOpen}
          onClose={closeIssueModal}
          title="Issue Book"
        >
          {selectedBook && (
            <form onSubmit={handleIssueBook} className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-1">{selectedBook.title}</h3>
                <p className="text-sm text-gray-600">by {selectedBook.author}</p>
                <div className="mt-2 flex items-center space-x-4 text-sm">
                  <span className="text-green-600 font-medium">
                    {selectedBook.availableCopies} copies available
                  </span>
                  <span className="text-gray-500">Book ID: {selectedBook.bookId}</span>
                </div>
              </div>

              <Input
                label="Student ID"
                name="studentId"
                value={issueFormData.studentId}
                onChange={handleIssueInputChange}
                placeholder="Enter Student ID (e.g., S001)"
                required
              />

              <Input
                label="Due Date"
                name="dueDate"
                type="date"
                value={issueFormData.dueDate}
                onChange={handleIssueInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={issueFormData.notes}
                  onChange={handleIssueInputChange}
                  rows="2"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Any special notes..."
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Default borrowing period is 14 days. Students can renew up to 2 times.
                </p>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="secondary" onClick={closeIssueModal}>
                  Cancel
                </Button>
                <Button type="submit" icon={CheckCircleIcon}>
                  Issue Book
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default Library;

