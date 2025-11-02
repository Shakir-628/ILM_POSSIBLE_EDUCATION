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
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserPlusIcon,
  DocumentTextIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { admissionService } from '../services/admissionService';
import { classService } from '../services/classService';
import { useTableData } from '../hooks/useTableData';
import { useToast } from '../context/ToastContext';

const Admissions = () => {
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  
  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isScoresModalOpen, setIsScoresModalOpen] = useState(false);
  const [isMeritListModalOpen, setIsMeritListModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [meritList, setMeritList] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    fatherName: '',
    fatherPhone: '',
    fatherOccupation: '',
    motherName: '',
    motherPhone: '',
    appliedForClass: '',
    academicYear: new Date().getFullYear().toString(),
    previousSchool: {
      name: '',
      lastClass: '',
      lastGrade: '',
    },
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Pakistan',
    },
  });

  const [reviewData, setReviewData] = useState({
    status: 'approved',
    reviewComments: '',
  });

  const [scoresData, setScoresData] = useState({
    entranceTestScore: '',
    interviewScore: '',
    entranceTestDate: '',
    interviewDate: '',
  });

  useEffect(() => {
    fetchApplications();
    fetchClasses();
    fetchStats();
  }, [statusFilter, academicYear]);

  const fetchApplications = async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (academicYear) params.academicYear = academicYear;
      
      const response = await admissionService.getAllApplications(params);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
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

  const fetchStats = async () => {
    try {
      const response = await admissionService.getAdmissionStats(academicYear);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Filter and search
  const filteredApplications = statusFilter === 'all' 
    ? applications 
    : applications.filter(app => app.status === statusFilter);

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
  } = useTableData(
    filteredApplications,
    ['applicationNumber', 'firstName', 'lastName', 'email'],
    10
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await admissionService.submitApplication(formData);
      toast.success('Application submitted successfully');
      fetchApplications();
      fetchStats();
      setIsFormModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.response?.data?.message || 'Error submitting application');
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await admissionService.reviewApplication(selectedApplication._id, reviewData);
      toast.success(`Application ${reviewData.status} successfully`);
      fetchApplications();
      fetchStats();
      setIsReviewModalOpen(false);
      setSelectedApplication(null);
      setReviewData({ status: 'approved', reviewComments: '' });
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast.error('Error reviewing application');
    }
  };

  const handleScores = async (e) => {
    e.preventDefault();
    try {
      await admissionService.updateScores(selectedApplication._id, scoresData);
      toast.success('Scores updated successfully');
      fetchApplications();
      setIsScoresModalOpen(false);
      setSelectedApplication(null);
      setScoresData({
        entranceTestScore: '',
        interviewScore: '',
        entranceTestDate: '',
        interviewDate: '',
      });
    } catch (error) {
      console.error('Error updating scores:', error);
      toast.error('Error updating scores');
    }
  };

  const handleEnroll = async (application) => {
    if (window.confirm(`Are you sure you want to enroll ${application.firstName} ${application.lastName}?`)) {
      try {
        await admissionService.enrollStudent(application._id);
        toast.success('Student enrolled successfully');
        fetchApplications();
        fetchStats();
      } catch (error) {
        console.error('Error enrolling student:', error);
        toast.error(error.response?.data?.message || 'Error enrolling student');
      }
    }
  };

  const handleDelete = async (application) => {
    if (window.confirm(`Are you sure you want to delete this application?`)) {
      try {
        await admissionService.deleteApplication(application._id);
        toast.success('Application deleted successfully');
        fetchApplications();
        fetchStats();
      } catch (error) {
        console.error('Error deleting application:', error);
        toast.error('Error deleting application');
      }
    }
  };

  const handleGenerateMeritList = async (classId) => {
    try {
      const response = await admissionService.generateMeritList(classId, academicYear);
      setMeritList(response.data);
      setIsMeritListModalOpen(true);
    } catch (error) {
      console.error('Error generating merit list:', error);
      toast.error('Error generating merit list');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      email: '',
      phone: '',
      fatherName: '',
      fatherPhone: '',
      fatherOccupation: '',
      motherName: '',
      motherPhone: '',
      appliedForClass: '',
      academicYear: new Date().getFullYear().toString(),
      previousSchool: {
        name: '',
        lastClass: '',
        lastGrade: '',
      },
      address: {
        street: '',
        city: '',
        state: '',
        country: 'Pakistan',
      },
    });
  };

  const columns = [
    { header: 'App. No.', accessor: 'applicationNumber' },
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => `${row.firstName} ${row.lastName}`,
    },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Applied For',
      accessor: 'appliedForClass',
      render: (row) => row.appliedForClass ? `${row.appliedForClass.className} - ${row.appliedForClass.grade}` : 'N/A',
    },
    {
      header: 'Merit Score',
      accessor: 'totalMeritScore',
      render: (row) => row.totalMeritScore ? row.totalMeritScore.toFixed(2) : 'N/A',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.status === 'enrolled' ? 'bg-green-100 text-green-800' :
          row.status === 'approved' ? 'bg-blue-100 text-blue-800' :
          row.status === 'rejected' ? 'bg-red-100 text-red-800' :
          row.status === 'under-review' ? 'bg-yellow-100 text-yellow-800' :
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
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => {
                  setSelectedApplication(row);
                  setReviewData({ ...reviewData, status: 'under-review' });
                  setIsReviewModalOpen(true);
                }}
                className="text-blue-600 hover:text-blue-900 text-sm"
              >
                Review
              </button>
              <button
                onClick={() => {
                  setSelectedApplication(row);
                  setIsScoresModalOpen(true);
                }}
                className="text-purple-600 hover:text-purple-900 text-sm"
              >
                Scores
              </button>
            </>
          )}
          {row.status === 'approved' && !row.enrolledStudent && (
            <button
              onClick={() => handleEnroll(row)}
              className="text-green-600 hover:text-green-900 text-sm"
            >
              Enroll
            </button>
          )}
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admissions</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage student admission applications
            </p>
          </div>
          <Button icon={PlusIcon} onClick={() => setIsFormModalOpen(true)}>
            New Application
          </Button>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Card
              title="Total Applications"
              value={stats.total}
              icon={DocumentTextIcon}
              color="blue"
            />
            <Card
              title="Pending Review"
              value={stats.pending + stats.underReview}
              icon={ClockIcon}
              color="yellow"
            />
            <Card
              title="Approved"
              value={stats.approved}
              icon={CheckCircleIcon}
              color="green"
            />
            <Card
              title="Enrolled"
              value={stats.enrolled}
              icon={UserPlusIcon}
              color="purple"
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={clearSearch}
                placeholder="Search by app no, name, or email..."
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'under-review', label: 'Under Review' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'enrolled', label: 'Enrolled' },
              ]}
            />
            <Input
              type="number"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="Academic Year"
            />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Showing {paginatedData.length} of {totalItems} applications
          </div>
        </div>

        {/* Merit List Button */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Merit List Generation</h3>
              <p className="text-sm text-gray-500">Generate merit list for a specific class</p>
            </div>
            <Select
              onChange={(e) => e.target.value && handleGenerateMeritList(e.target.value)}
              options={[
                { value: '', label: 'Select Class' },
                ...classes.map((cls) => ({
                  value: cls._id,
                  label: `${cls.className} - ${cls.grade}`,
                })),
              ]}
            />
          </div>
        </div>

        {/* Applications Table */}
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

        {/* Application Form Modal */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            resetForm();
          }}
          title="New Admission Application"
          size="large"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
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
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
              />
              <Select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                options={[
                  { value: '', label: 'Select Gender' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
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
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <hr className="my-4" />
            <h3 className="text-lg font-medium">Parent Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Father Name"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Father Phone"
                name="fatherPhone"
                value={formData.fatherPhone}
                onChange={handleInputChange}
                required
              />
            </div>
            <Input
              label="Father Occupation"
              name="fatherOccupation"
              value={formData.fatherOccupation}
              onChange={handleInputChange}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Mother Name"
                name="motherName"
                value={formData.motherName}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Mother Phone"
                name="motherPhone"
                value={formData.motherPhone}
                onChange={handleInputChange}
              />
            </div>
            
            <hr className="my-4" />
            <h3 className="text-lg font-medium">Academic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Applied For Class"
                name="appliedForClass"
                value={formData.appliedForClass}
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
              <Input
                label="Academic Year"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                required
              />
            </div>
            <Input
              label="Previous School Name"
              name="previousSchool.name"
              value={formData.previousSchool.name}
              onChange={handleInputChange}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Last Class"
                name="previousSchool.lastClass"
                value={formData.previousSchool.lastClass}
                onChange={handleInputChange}
              />
              <Input
                label="Last Grade/Percentage"
                name="previousSchool.lastGrade"
                type="number"
                value={formData.previousSchool.lastGrade}
                onChange={handleInputChange}
                placeholder="e.g., 85"
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsFormModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Submit Application</Button>
            </div>
          </form>
        </Modal>

        {/* Review Modal */}
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedApplication(null);
          }}
          title="Review Application"
        >
          {selectedApplication && (
            <form onSubmit={handleReview} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm"><strong>Applicant:</strong> {selectedApplication.firstName} {selectedApplication.lastName}</p>
                <p className="text-sm"><strong>Application No:</strong> {selectedApplication.applicationNumber}</p>
              </div>
              
              <Select
                label="Decision"
                value={reviewData.status}
                onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                options={[
                  { value: 'under-review', label: 'Under Review' },
                  { value: 'approved', label: 'Approve' },
                  { value: 'rejected', label: 'Reject' },
                ]}
                required
              />
              
              <Input
                label="Comments"
                value={reviewData.reviewComments}
                onChange={(e) => setReviewData({ ...reviewData, reviewComments: e.target.value })}
                placeholder="Add review comments..."
              />
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="secondary" onClick={() => setIsReviewModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Review</Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Scores Modal */}
        <Modal
          isOpen={isScoresModalOpen}
          onClose={() => {
            setIsScoresModalOpen(false);
            setSelectedApplication(null);
          }}
          title="Update Test/Interview Scores"
        >
          {selectedApplication && (
            <form onSubmit={handleScores} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm"><strong>Applicant:</strong> {selectedApplication.firstName} {selectedApplication.lastName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Entrance Test Score"
                  type="number"
                  value={scoresData.entranceTestScore}
                  onChange={(e) => setScoresData({ ...scoresData, entranceTestScore: e.target.value })}
                  placeholder="Out of 100"
                  max="100"
                />
                <Input
                  label="Test Date"
                  type="date"
                  value={scoresData.entranceTestDate}
                  onChange={(e) => setScoresData({ ...scoresData, entranceTestDate: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Interview Score"
                  type="number"
                  value={scoresData.interviewScore}
                  onChange={(e) => setScoresData({ ...scoresData, interviewScore: e.target.value })}
                  placeholder="Out of 100"
                  max="100"
                />
                <Input
                  label="Interview Date"
                  type="date"
                  value={scoresData.interviewDate}
                  onChange={(e) => setScoresData({ ...scoresData, interviewDate: e.target.value })}
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="secondary" onClick={() => setIsScoresModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Scores</Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Merit List Modal */}
        <Modal
          isOpen={isMeritListModalOpen}
          onClose={() => setIsMeritListModalOpen(false)}
          title="Merit List"
          size="large"
        >
          <div className="space-y-4">
            {meritList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">App. No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interview</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Merit Score</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {meritList.map((app) => (
                      <tr key={app._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="flex items-center">
                            {app.meritRank <= 3 && <TrophyIcon className="h-5 w-5 text-yellow-500 mr-2" />}
                            {app.meritRank}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{app.firstName} {app.lastName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{app.applicationNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{app.entranceTestScore || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{app.interviewScore || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold">{app.totalMeritScore?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No applications with scores found</p>
            )}
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Admissions;

