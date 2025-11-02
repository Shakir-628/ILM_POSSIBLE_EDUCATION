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
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  PaperClipIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import { assignmentService } from '../services/assignmentService';
import { submissionService } from '../services/submissionService';
import { classService } from '../services/classService';
import { subjectService } from '../services/subjectService';
import { teacherService } from '../services/teacherService';
import { useTableData } from '../hooks/useTableData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
const Assignments = () => {
  const toast = useToast();
  const { user, isAdmin, isTeacher, isStudent } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [stats, setStats] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class: '',
    subject: '',
    teacher: '',
    dueDate: '',
    totalMarks: 100,
    instructions: '',
  });

  const [submissionData, setSubmissionData] = useState({
    comments: '',
  });

  useEffect(() => {
    fetchAssignments();
    fetchClasses();
    fetchSubjects();
    fetchTeachers();
    
  }, []);

  const fetchTeachers = async () => {
    try {
      const data = await teacherService.getAllTeachers();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const data = await assignmentService.getAllAssignments();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
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

  const fetchSubjects = async () => {
    try {
      const data = await subjectService.getAllSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
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
  } = useTableData(assignments, ['title', 'class.className', 'subject.subjectName'], 10);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmissionFileChange = (e) => {
    setSubmissionFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      selectedFiles.forEach((file) => {
        formDataToSend.append('files', file);
      });

      await assignmentService.createAssignment(formDataToSend);
        toast.success('Assignment created successfully');
      fetchAssignments();
      closeModal();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error(error.response?.data?.message || 'Error creating assignment');
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('assignment', selectedAssignment._id);
      formDataToSend.append('comments', submissionData.comments);

      submissionFiles.forEach((file) => {
        formDataToSend.append('files', file);
      });

      await submissionService.submitAssignment(formDataToSend);
      toast.success('Assignment submitted successfully');
      setIsSubmitModalOpen(false);
      setSubmissionFiles([]);
      setSubmissionData({ comments: '' });
      fetchAssignments();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error(error.response?.data?.message || 'Error submitting assignment');
    }
  };

  const handleDelete = async (assignment) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await assignmentService.deleteAssignment(assignment._id);
        toast.success('Assignment deleted successfully');
        fetchAssignments();
      } catch (error) {
        console.error('Error deleting assignment:', error);
        toast.error('Error deleting assignment');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      title: '',
      description: '',
      class: '',
      subject: '',
      teacher: '',
      dueDate: '',
      totalMarks: 100,
      instructions: '',
    });
    setSelectedFiles([]);
  };

  const columns = [
    { header: 'Title', accessor: 'title' },
    {
      header: 'Class',
      accessor: 'class',
      render: (row) => row.class ? `${row.class.className} - ${row.class.grade}` : 'N/A',
    },
    {
      header: 'Subject',
      accessor: 'subject',
      render: (row) => row.subject?.subjectName || 'N/A',
    },
    {
      header: 'Due Date',
      accessor: 'dueDate',
      render: (row) => new Date(row.dueDate).toLocaleDateString(),
    },
    {
      header: 'Marks',
      accessor: 'totalMarks',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.status === 'active' ? 'bg-green-100 text-green-800' :
          row.status === 'closed' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
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
          {isStudent && (
            <button
              onClick={() => {
                setSelectedAssignment(row);
                setIsSubmitModalOpen(true);
              }}
              className="text-blue-600 hover:text-blue-900 text-sm"
            >
              Submit
            </button>
          )}
          {(isAdmin || isTeacher) && (
            <>
              <button
                onClick={() => window.open(`/assignments/${row._id}/submissions`, '_blank')}
                className="text-green-600 hover:text-green-900 text-sm"
              >
                Submissions
              </button>
              <button
                onClick={() => handleDelete(row)}
                className="text-red-600 hover:text-red-900 text-sm"
              >
                Delete
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage class assignments
            </p>
          </div>
          {(isAdmin || isTeacher) && (
            <Button icon={PlusIcon} onClick={() => setIsModalOpen(true)}>
              Create Assignment
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="bg-white shadow rounded-lg p-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={clearSearch}
            placeholder="Search assignments..."
          />
          <div className="mt-2 text-sm text-gray-600">
            Showing {paginatedData.length} of {totalItems} assignments
          </div>
        </div>

        {/* Assignments Table */}
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

        {/* Create Assignment Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Create Assignment"
          size="large"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Assignment description..."
              rows="4"
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Class"
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                options={[
                  { value: '', label: 'Select Class' },
                  ...classes.map((cls) => ({
                    value: cls._id,
                    label: `${cls.className} - ${cls.grade}`,
                  })),
                ]}
                required
              />
              <Select
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                options={[
                  { value: '', label: 'Select Subject' },
                  ...subjects.map((subj) => ({
                    value: subj._id,
                    label: subj.subjectName,
                  })),
                ]}
                required
              />
            </div>
            <Select
              label="Teacher"
              name="teacher"
              value={formData.teacher}
              onChange={handleInputChange}
              options={[
                { value: '', label: 'Select Teacher' },
                ...teachers.map((teacher) => ({
                  value: teacher._id,
                  label: `${teacher.firstName} ${teacher.lastName} (${teacher.teacherId})`,
                })),
              ]}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Due Date"
                name="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Total Marks"
                name="totalMarks"
                type="number"
                value={formData.totalMarks}
                onChange={handleInputChange}
                required
              />
            </div>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              placeholder="Special instructions (optional)..."
              rows="3"
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attach Files (optional)
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100"
              />
              {selectedFiles.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {selectedFiles.length} file(s) selected
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">Create Assignment</Button>
            </div>
          </form>
        </Modal>

        {/* Submit Assignment Modal (For Students) */}
        <Modal
          isOpen={isSubmitModalOpen}
          onClose={() => {
            setIsSubmitModalOpen(false);
            setSubmissionFiles([]);
            setSubmissionData({ comments: '' });
          }}
          title="Submit Assignment"
        >
          {selectedAssignment && (
            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold text-gray-900">{selectedAssignment.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedAssignment.description}</p>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Due:</strong> {new Date(selectedAssignment.dueDate).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Marks:</strong> {selectedAssignment.totalMarks}
                </p>
              </div>

              <textarea
                value={submissionData.comments}
                onChange={(e) => setSubmissionData({ comments: e.target.value })}
                placeholder="Add your comments (optional)..."
                rows="3"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Your Work (Required)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleSubmissionFileChange}
                  required
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary-50 file:text-primary-700
                    hover:file:bg-primary-100"
                />
                {submissionFiles.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {submissionFiles.length} file(s) selected
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsSubmitModalOpen(false);
                    setSubmissionFiles([]);
                    setSubmissionData({ comments: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" icon={ArrowUpTrayIcon}>
                  Submit Assignment
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default Assignments;

