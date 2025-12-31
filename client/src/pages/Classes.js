import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import { PlusIcon } from '@heroicons/react/24/outline';
import { classService } from '../services/classService';
import { useToast } from '../context/ToastContext';
import { teacherService } from '../services/teacherService';
import { useTableData } from '../hooks/useTableData';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';

const Classes = () => {
  const toast = useToast();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    className: '',
    grade: '',
    section: '',
    classTeacher: '',
    capacity: '',
    room: '',
    academicYear: '',
  });

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

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
  } = useTableData(classes, ['className', 'grade', 'section', 'classTeacher.firstName', 'classTeacher.lastName', 'room'], 10);

  const fetchClasses = async () => {
    try {
      const data = await classService.getAllClasses();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await classService.updateClass(editingClass._id, formData);
      } else {
        await classService.createClass(formData);
      }
      fetchClasses();
      closeModal();
    } catch (error) {
      console.error('Error saving class:', error);
      toast.error(error.response?.data?.message || 'Error saving class');
    }
  };

  const handleEdit = (classData) => {
    setEditingClass(classData);
    setFormData({
      className: classData.className,
      grade: classData.grade,
      section: classData.section,
      classTeacher: classData.classTeacher?._id || '',
      capacity: classData.capacity || '',
      room: classData.room || '',
      academicYear: classData.academicYear,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (classData) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await classService.deleteClass(classData._id);
        fetchClasses();
      } catch (error) {
        console.error('Error deleting class:', error);
        toast.error(error.response?.data?.message || 'Error deleting class');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
    setFormData({
      className: '',
      grade: '',
      section: '',
      classTeacher: '',
      capacity: '',
      room: '',
      academicYear: '',
    });
  };

  const columns = [
    { header: 'Class Name', accessor: 'className' },
    { header: 'Grade', accessor: 'grade' },
    { header: 'Section', accessor: 'section' },
    {
      header: 'Class Teacher',
      accessor: 'classTeacher',
      render: (row) =>
        row.classTeacher
          ? `${row.classTeacher.firstName} ${row.classTeacher.lastName}`
          : 'N/A',
    },
    {
      header: 'Students',
      accessor: 'students',
      render: (row) => `${row.students?.length || 0} / ${row.capacity || 0}`,
    },
    { header: 'Room', accessor: 'room' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.status === 'active'
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <Button icon={PlusIcon} onClick={() => setIsModalOpen(true)}>
            Add Class
          </Button>
        </div>


        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="max-w-md">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={clearSearch}
                placeholder="Search classes..."
              />
            </div>
          </div>
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : (
            <>
              <Table
                columns={columns}
                data={paginatedData}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingClass ? 'Edit Class' : 'Add New Class'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Class Name"
            name="className"
            value={formData.className}
            onChange={handleInputChange}
            required
            placeholder="e.g., Class 10-A"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Grade"
              name="grade"
              value={formData.grade}
              onChange={handleInputChange}
              required
              placeholder="e.g., 10"
            />
            <Input
              label="Section"
              name="section"
              value={formData.section}
              onChange={handleInputChange}
              required
              placeholder="e.g., A"
            />
          </div>

          <Select
            label="Class Teacher"
            name="classTeacher"
            value={formData.classTeacher}
            onChange={handleInputChange}
            options={teachers.map(teacher => ({
              value: teacher._id,
              label: `${teacher.firstName} ${teacher.lastName}`,
            }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Capacity"
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={handleInputChange}
              placeholder="e.g., 30"
            />
            <Input
              label="Room"
              name="room"
              value={formData.room}
              onChange={handleInputChange}
              placeholder="e.g., Room 101"
            />
          </div>

          <Input
            label="Academic Year"
            name="academicYear"
            value={formData.academicYear}
            onChange={handleInputChange}
            required
            placeholder="e.g., 2023-2024"
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingClass ? 'Update' : 'Create'} Class
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default Classes;

