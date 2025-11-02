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
  StarIcon,
  TrophyIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { performanceService } from '../services/performanceService';
import { teacherService } from '../services/teacherService';
import { useTableData } from '../hooks/useTableData';
import { useToast } from '../context/ToastContext';

const TeacherPerformance = () => {
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [formData, setFormData] = useState({
    teacher: '',
    academicYear: new Date().getFullYear().toString(),
    reviewPeriod: {
      startDate: '',
      endDate: '',
      term: '1st',
    },
    ratings: {
      teachingQuality: 5,
      classroomManagement: 5,
      studentEngagement: 5,
      punctuality: 5,
      professionalism: 5,
      communicationSkills: 5,
      innovation: 5,
      collaboration: 5,
    },
    strengths: '',
    weaknesses: '',
    recommendations: '',
    areasOfImprovement: [],
  });

  useEffect(() => {
    fetchReviews();
    fetchTeachers();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await performanceService.getAllReviews();
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
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
  } = useTableData(reviews, ['teacher.firstName', 'teacher.lastName', 'academicYear'], 10);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('ratings.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        ratings: {
          ...formData.ratings,
          [field]: parseInt(value),
        },
      });
    } else if (name.startsWith('reviewPeriod.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        reviewPeriod: {
          ...formData.reviewPeriod,
          [field]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await performanceService.createReview(formData);
      toast.success('Performance review created successfully');
      fetchReviews();
      closeModal();
    } catch (error) {
      console.error('Error creating review:', error);
      toast.error(error.response?.data?.message || 'Error saving review');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      teacher: '',
      academicYear: new Date().getFullYear().toString(),
      reviewPeriod: {
        startDate: '',
        endDate: '',
        term: '1st',
      },
      ratings: {
        teachingQuality: 5,
        classroomManagement: 5,
        studentEngagement: 5,
        punctuality: 5,
        professionalism: 5,
        communicationSkills: 5,
        innovation: 5,
        collaboration: 5,
      },
      strengths: '',
      weaknesses: '',
      recommendations: '',
      areasOfImprovement: [],
    });
  };

  const getScoreColor = (score) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-blue-600';
    if (score >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const columns = [
    {
      header: 'Teacher',
      accessor: 'teacher',
      render: (row) =>
        row.teacher ? `${row.teacher.firstName} ${row.teacher.lastName}` : 'N/A',
    },
    {
      header: 'Teacher ID',
      accessor: 'teacherId',
      render: (row) => row.teacher?.teacherId || 'N/A',
    },
    { header: 'Academic Year', accessor: 'academicYear' },
    {
      header: 'Term',
      accessor: 'term',
      render: (row) => row.reviewPeriod?.term || 'N/A',
    },
    {
      header: 'Overall Score',
      accessor: 'overallScore',
      render: (row) => (
        <span className={`font-bold ${getScoreColor(row.overallScore)}`}>
          {row.overallScore?.toFixed(2)} / 5.0
        </span>
      ),
    },
    {
      header: 'Review Date',
      accessor: 'reviewDate',
      render: (row) => new Date(row.reviewDate).toLocaleDateString(),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.status === 'acknowledged'
              ? 'bg-green-100 text-green-800'
              : row.status === 'submitted'
              ? 'bg-yellow-100 text-yellow-800'
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
            <h1 className="text-2xl font-bold text-gray-900">Teacher Performance Review</h1>
            <p className="mt-1 text-sm text-gray-500">
              Evaluate and track teacher performance
            </p>
          </div>
          <Button icon={PlusIcon} onClick={() => setIsModalOpen(true)}>
            Create Review
          </Button>
        </div>

        {/* Search */}
        <div className="bg-white shadow rounded-lg p-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={clearSearch}
            placeholder="Search by teacher name..."
          />
          <div className="mt-2 text-sm text-gray-600">
            Showing {paginatedData.length} of {totalItems} reviews
          </div>
        </div>

        {/* Reviews Table */}
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

        {/* Create Review Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Create Performance Review"
          size="large"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              <Input
                label="Academic Year"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Start Date"
                name="reviewPeriod.startDate"
                type="date"
                value={formData.reviewPeriod.startDate}
                onChange={handleInputChange}
                required
              />
              <Input
                label="End Date"
                name="reviewPeriod.endDate"
                type="date"
                value={formData.reviewPeriod.endDate}
                onChange={handleInputChange}
                required
              />
              <Select
                label="Term"
                name="reviewPeriod.term"
                value={formData.reviewPeriod.term}
                onChange={handleInputChange}
                options={[
                  { value: '1st', label: '1st Term' },
                  { value: '2nd', label: '2nd Term' },
                  { value: '3rd', label: '3rd Term' },
                  { value: 'annual', label: 'Annual' },
                ]}
              />
            </div>

            <hr />
            <h3 className="text-md font-semibold text-gray-900">Performance Ratings (1-5)</h3>

            <div className="grid grid-cols-2 gap-4">
              {Object.keys(formData.ratings).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    type="range"
                    name={`ratings.${key}`}
                    min="1"
                    max="5"
                    value={formData.ratings[key]}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>1</span>
                    <span className="font-semibold">{formData.ratings[key]}</span>
                    <span>5</span>
                  </div>
                </div>
              ))}
            </div>

            <hr />
            <h3 className="text-md font-semibold text-gray-900">Feedback</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Strengths</label>
              <textarea
                name="strengths"
                value={formData.strengths}
                onChange={handleInputChange}
                rows="2"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Key strengths..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weaknesses</label>
              <textarea
                name="weaknesses"
                value={formData.weaknesses}
                onChange={handleInputChange}
                rows="2"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Areas needing improvement..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recommendations
              </label>
              <textarea
                name="recommendations"
                value={formData.recommendations}
                onChange={handleInputChange}
                rows="3"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Recommendations for improvement..."
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">Create Review</Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default TeacherPerformance;

