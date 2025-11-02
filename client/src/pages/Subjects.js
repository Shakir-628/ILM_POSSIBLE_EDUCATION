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
  AcademicCapIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { subjectService } from '../services/subjectService';
import { teacherService } from '../services/teacherService';
import { useTableData } from '../hooks/useTableData';
import { useToast } from '../context/ToastContext';
const Subjects = () => {
  const toast = useToast();
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const [formData, setFormData] = useState({
    subjectName: '',
    subjectCode: '',
    description: '',
    teacher: '',
    creditHours: 3,
    type: 'theory',
  });

  useEffect(() => {
    fetchSubjects();
    fetchTeachers();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await subjectService.getAllSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
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
  } = useTableData(subjects, ['subjectName', 'subjectCode'], 10);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await subjectService.updateSubject(editingSubject._id, formData);
        toast.success('Subject updated successfully');
      } else {
        await subjectService.createSubject(formData);
        toast.success('Subject created successfully');
      }
      fetchSubjects();
      closeModal();
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error(error.response?.data?.message || 'Error saving subject');
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      subjectName: subject.subjectName,
      subjectCode: subject.subjectCode,
      description: subject.description || '',
      teacher: subject.teacher?._id || '',
      creditHours: subject.creditHours || 3,
      type: subject.type || 'theory',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (subject) => {
    if (window.confirm(`Are you sure you want to delete ${subject.subjectName}?`)) {
      try {
        await subjectService.deleteSubject(subject._id);
        toast.success('Subject deleted successfully');
        fetchSubjects();
      } catch (error) {
        console.error('Error deleting subject:', error);
        toast.error(error.response?.data?.message || 'Error deleting subject');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
    setFormData({
      subjectName: '',
      subjectCode: '',
      description: '',
      teacher: '',
      creditHours: 3,
      type: 'theory',
    });
  };

  const columns = [
    { header: 'Subject Code', accessor: 'subjectCode' },
    { header: 'Subject Name', accessor: 'subjectName' },
    {
      header: 'Type',
      accessor: 'type',
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.type === 'theory' ? 'bg-blue-100 text-blue-800' :
          row.type === 'practical' ? 'bg-purple-100 text-purple-800' :
          'bg-green-100 text-green-800'
        }`}>
          {row.type}
        </span>
      ),
    },
    {
      header: 'Credit Hours',
      accessor: 'creditHours',
    },
    {
      header: 'Teacher',
      accessor: 'teacher',
      render: (row) => row.teacher ? `${row.teacher.firstName} ${row.teacher.lastName}` : 'Not Assigned',
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-indigo-600 hover:text-indigo-900 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="text-red-600 hover:text-red-900 text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const stats = {
    total: subjects.length,
    theory: subjects.filter(s => s.type === 'theory').length,
    practical: subjects.filter(s => s.type === 'practical').length,
    lab: subjects.filter(s => s.type === 'lab').length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage school subjects and assign teachers
            </p>
          </div>
          <Button icon={PlusIcon} onClick={() => setIsModalOpen(true)}>
            Add Subject
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <Card
            title="Total Subjects"
            value={stats.total}
            icon={BookOpenIcon}
            color="blue"
          />
          <Card
            title="Theory"
            value={stats.theory}
            icon={AcademicCapIcon}
            color="green"
          />
          <Card
            title="Practical"
            value={stats.practical}
            icon={BookOpenIcon}
            color="purple"
          />
          <Card
            title="Lab"
            value={stats.lab}
            icon={AcademicCapIcon}
            color="orange"
          />
        </div>

        {/* Search */}
        <div className="bg-white shadow rounded-lg p-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={clearSearch}
            placeholder="Search by subject name or code..."
          />
          <div className="mt-2 text-sm text-gray-600">
            Showing {paginatedData.length} of {totalItems} subjects
          </div>
        </div>

        {/* Subjects Table */}
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

        {/* Add/Edit Subject Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Subject Name"
                name="subjectName"
                value={formData.subjectName}
                onChange={handleInputChange}
                placeholder="e.g., Mathematics"
                required
              />
              <Input
                label="Subject Code"
                name="subjectCode"
                value={formData.subjectCode}
                onChange={handleInputChange}
                placeholder="e.g., MATH-101"
                required
              />
            </div>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Subject description (optional)..."
              rows="3"
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                options={[
                  { value: 'theory', label: 'Theory' },
                  { value: 'practical', label: 'Practical' },
                  { value: 'lab', label: 'Lab' },
                  { value: 'both', label: 'Theory + Practical' },
                ]}
                required
              />
              <Input
                label="Credit Hours"
                name="creditHours"
                type="number"
                value={formData.creditHours}
                onChange={handleInputChange}
                min="1"
                max="10"
                required
              />
            </div>

            <Select
              label="Assign Teacher"
              name="teacher"
              value={formData.teacher}
              onChange={handleInputChange}
              options={[
                { value: '', label: 'Select Teacher (Optional)' },
                ...teachers.map((teacher) => ({
                  value: teacher._id,
                  label: `${teacher.firstName} ${teacher.lastName} (${teacher.teacherId})`,
                })),
              ]}
            />

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingSubject ? 'Update' : 'Create'} Subject
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Subjects;

