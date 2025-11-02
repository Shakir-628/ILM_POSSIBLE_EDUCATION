import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { PlusIcon } from '@heroicons/react/24/outline';
import { teacherService } from '../services/teacherService';
import { useToast } from '../context/ToastContext';
import { useTableData } from '../hooks/useTableData';

const Teachers = () => {
  const toast = useToast();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    teacherId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    qualification: '',
    specialization: '',
    experience: '',
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const data = await teacherService.getAllTeachers();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter teachers by status
  const filteredTeachers = statusFilter === 'all' 
    ? teachers 
    : teachers.filter(t => t.status === statusFilter);

  // Use table data hook for pagination and search
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
  } = useTableData(filteredTeachers, ['teacherId', 'firstName', 'lastName', 'email', 'specialization'], 10);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await teacherService.updateTeacher(editingTeacher._id, formData);
      } else {
        await teacherService.createTeacher(formData);
      }
      fetchTeachers();
      closeModal();
    } catch (error) {
      console.error('Error saving teacher:', error);
      toast.error(error.response?.data?.message || 'Error saving teacher');
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      teacherId: teacher.teacherId,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phone: teacher.phone || '',
      dateOfBirth: teacher.dateOfBirth?.split('T')[0] || '',
      gender: teacher.gender,
      qualification: teacher.qualification,
      specialization: teacher.specialization,
      experience: teacher.experience || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (teacher) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await teacherService.deleteTeacher(teacher._id);
        fetchTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
        toast.error('Error deleting teacher');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
    setFormData({
      teacherId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      qualification: '',
      specialization: '',
      experience: '',
    });
  };

  const columns = [
    { header: 'Teacher ID', accessor: 'teacherId' },
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => `${row.firstName} ${row.lastName}`,
    },
    { header: 'Email', accessor: 'email' },
    { header: 'Specialization', accessor: 'specialization' },
    {
      header: 'Experience',
      accessor: 'experience',
      render: (row) => `${row.experience} years`,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage teacher records and assignments
            </p>
          </div>
          <Button icon={PlusIcon} onClick={() => setIsModalOpen(true)}>
            Add Teacher
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={clearSearch}
                placeholder="Search by ID, name, email, or specialization..."
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
            <span>
              {totalItems} {totalItems === 1 ? 'teacher' : 'teachers'} found
            </span>
            {searchTerm && (
              <span className="text-primary-600">
                Searching for: "{searchTerm}"
              </span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Table
            columns={columns}
            data={paginatedData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
          
          {/* Pagination */}
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

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Teacher ID"
              name="teacherId"
              value={formData.teacherId}
              onChange={handleInputChange}
              required
            />
            <Select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <Input
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Qualification"
              name="qualification"
              value={formData.qualification}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              required
            />
          </div>

          <Input
            label="Experience (years)"
            name="experience"
            type="number"
            value={formData.experience}
            onChange={handleInputChange}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTeacher ? 'Update' : 'Create'} Teacher
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default Teachers;

