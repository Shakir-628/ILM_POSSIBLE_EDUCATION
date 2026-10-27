import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import Card from '../components/Card';
import {
  PlusIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  EyeIcon,
  DocumentCheckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import certificateService from '../services/certificateService';
import certificateTemplateService from '../services/certificateTemplateService';
import { studentService } from '../services/studentService';
import { useTableData } from '../hooks/useTableData';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const Certificates = () => {
  const toast = useToast();
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState(null);

  const [formData, setFormData] = useState({
    studentId: '',
    certificateType: 'bonafide',
    title: '',
    content: '',
    templateId: '',
    additionalDetails: {
      academicYear: new Date().getFullYear().toString(),
      reasonForLeaving: '',
      dateOfLeaving: '',
      achievementTitle: '',
      position: '',
      eventName: '',
      conductRating: 'good',
      remarks: '',
    },
    signatures: {
      classTeacher: {
        name: '',
        designation: 'Class Teacher',
      },
      principal: {
        name: '',
        designation: 'Principal',
      },
    },
  });

  const certificateTypes = [
    { value: 'transfer', label: 'Transfer Certificate' },
    { value: 'character', label: 'Character Certificate' },
    { value: 'bonafide', label: 'Bonafide Certificate' },
    { value: 'achievement', label: 'Achievement Certificate' },
    { value: 'completion', label: 'Completion Certificate' },
    { value: 'participation', label: 'Participation Certificate' },
    { value: 'merit', label: 'Merit Certificate' },
    { value: 'conduct', label: 'Conduct Certificate' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    fetchCertificates();
    fetchStudents();
    if (user.role === 'admin') {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (formData.certificateType) {
      fetchTemplatesByType(formData.certificateType);
    }
  }, [formData.certificateType]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const data = await certificateService.getCertificates();
      setCertificates(data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error(error.response?.data?.message || 'Error fetching certificates');
    } finally {
      setLoading(false);
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


  const fetchTemplatesByType = async (type) => {
    try {
      const data = await certificateTemplateService.getTemplatesByCertificateType(type);
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await certificateService.getCertificateStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({ total: 0, issued: 0, draft: 0, cancelled: 0 });
    }
  };

  // Filter certificates
  const filteredCertificates = certificates.filter((cert) => {
    const statusMatch = statusFilter === 'all' || cert.status === statusFilter;
    const typeMatch = typeFilter === 'all' || cert.certificateType === typeFilter;
    return statusMatch && typeMatch;
  });

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
  } = useTableData(filteredCertificates, ['certificateNumber', 'certificateType', 'student.firstName', 'student.lastName', 'student.studentId', 'title'], 10);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('additionalDetails.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        additionalDetails: {
          ...formData.additionalDetails,
          [field]: value,
        },
      });
    } else if (name.startsWith('signatures.')) {
      // eslint-disable-next-line no-unused-vars
      const [_, role, field] = name.split('.');
      setFormData({
        ...formData,
        signatures: {
          ...formData.signatures,
          [role]: {
            ...formData.signatures[role],
            [field]: value,
          },
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
      await certificateService.createCertificate(formData);
      toast.success('Certificate created successfully');
      fetchCertificates();
      closeModal();
    } catch (error) {
      console.error('Error creating certificate:', error);
      toast.error(error.response?.data?.message || 'Error creating certificate');
    }
  };

  const handleGenerate = async (certificate) => {
    try {
      setGenerating(true);
      await certificateService.generateCertificate(certificate._id);
      toast.success('Certificate generated successfully');
      fetchCertificates();
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error(error.response?.data?.message || 'Error generating certificate');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (certificate) => {
    try {
      if (!certificate.pdfPath) {
        toast.error('Certificate PDF not generated yet. Please generate it first.');
        return;
      }
      
      const data = await certificateService.downloadCertificate(certificate._id);
      // Remove /api from the URL since uploads are served directly from root
      const baseUrl = 'https://ilm-possible-education.onrender.com';
      // process.env.REACT_APP_API_URL 
      //   ? process.env.REACT_APP_API_URL.replace('/api', '')
      //   : 'http://localhost:5001';
      const pdfUrl = `${baseUrl}${data.downloadUrl}`;
      window.open(pdfUrl, '_blank');
      toast.success('Certificate opened in new tab');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error(error.response?.data?.message || 'Error downloading certificate. Please try again.');
    }
  };

  const handleView = (certificate) => {
    setSelectedCertificate(certificate);
    setIsViewModalOpen(true);
  };

  const handleCancelClick = (certificate) => {
    setSelectedCertificate(certificate);
    setCancellationReason('');
    setIsCancelModalOpen(true);
  };

  const handleCancelSubmit = async () => {
    if (!cancellationReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      await certificateService.cancelCertificate(selectedCertificate._id, cancellationReason);
      toast.success('Certificate cancelled successfully');
      setIsCancelModalOpen(false);
      setCancellationReason('');
      setSelectedCertificate(null);
      fetchCertificates();
    } catch (error) {
      console.error('Error cancelling certificate:', error);
      toast.error('Error cancelling certificate');
    }
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setCancellationReason('');
    setSelectedCertificate(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      studentId: '',
      certificateType: 'bonafide',
      title: '',
      content: '',
      templateId: '',
      additionalDetails: {
        academicYear: new Date().getFullYear().toString(),
        reasonForLeaving: '',
        dateOfLeaving: '',
        achievementTitle: '',
        position: '',
        eventName: '',
        conductRating: 'good',
        remarks: '',
      },
      signatures: {
        classTeacher: {
          name: '',
          designation: 'Class Teacher',
        },
        principal: {
          name: '',
          designation: 'Principal',
        },
      },
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      issued: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const columns = [
    {
      header: 'Certificate No.',
      accessor: (cert) => cert.certificateNumber,
    },
    {
      header: 'Student',
      accessor: (cert) => cert.student ? `${cert.student.firstName} ${cert.student.lastName}` : 'N/A',
    },
    {
      header: 'Student ID',
      accessor: (cert) => cert.student?.studentId || 'N/A',
    },
    {
      header: 'Type',
      accessor: (cert) => cert.certificateType.charAt(0).toUpperCase() + cert.certificateType.slice(1),
    },
    {
      header: 'Issue Date',
      accessor: (cert) => new Date(cert.issueDate).toLocaleDateString(),
    },
    {
      header: 'Status',
      accessor: (cert) => getStatusBadge(cert.status),
    },
    {
      header: 'Actions',
      accessor: (cert) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleView(cert)}
            icon={EyeIcon}
          >
            View
          </Button>
          {cert.status === 'draft' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleGenerate(cert)}
              icon={DocumentCheckIcon}
              disabled={generating}
            >
              Generate
            </Button>
          )}
          {cert.pdfPath && (
            <Button
              size="sm"
              variant="success"
              onClick={() => handleDownload(cert)}
              icon={ArrowDownTrayIcon}
            >
              Download
            </Button>
          )}
          {user.role === 'admin' && cert.status !== 'cancelled' && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleCancelClick(cert)}
              icon={XMarkIcon}
            >
              Cancel
            </Button>
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
            <h1 className="text-3xl font-bold text-gray-900">Certificates</h1>
            <p className="text-gray-600 mt-1">Manage student certificates and documents</p>
          </div>
          {user.role === 'admin' && (
            <Button icon={PlusIcon} onClick={() => setIsModalOpen(true)}>
              Create Certificate
            </Button>
          )}
        </div>

        {/* Statistics Cards */}
        {user.role === 'admin' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card 
              title="Total Certificates" 
              value={stats.total} 
              icon={DocumentTextIcon}
              color="indigo"
            />
            <Card 
              title="Issued" 
              value={stats.issued} 
              icon={CheckCircleIcon}
              color="green"
            />
            <Card 
              title="Drafts" 
              value={stats.draft} 
              icon={ClockIcon}
              color="yellow"
            />
            <Card 
              title="Cancelled" 
              value={stats.cancelled} 
              icon={XCircleIcon}
              color="red"
            />
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white overflow-hidden rounded-lg shadow">
          <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="issued">Issued</option>
                <option value="cancelled">Cancelled</option>
              </Select>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-48"
              >
                <option value="all">All Types</option>
                {certificateTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={clearSearch}
              placeholder="Search by certificate no., student name, student ID, or type..."
            />
          </div>
        </div>

        {/* Certificates Table */}
        <div className="bg-white overflow-hidden rounded-lg shadow">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading certificates...</p>
            </div>
          ) : paginatedData && paginatedData.length > 0 ? (
            <>
              <Table columns={columns} data={paginatedData} />
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No certificates found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search or filters' : 'Get started by creating a new certificate.'}
              </p>
            </div>
          )}
        </div>

        {/* Create/Edit Certificate Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Create Certificate"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Student"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.studentId} - {student.firstName} {student.lastName}
                  </option>
                ))}
              </Select>

              <Select
                label="Certificate Type"
                name="certificateType"
                value={formData.certificateType}
                onChange={handleInputChange}
                required
              >
                {certificateTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>

              <Select
                label="Template (Optional)"
                name="templateId"
                value={formData.templateId}
                onChange={handleInputChange}
              >
                <option value="">Use Default Template</option>
                {templates.map((template) => (
                  <option key={template._id} value={template._id}>
                    {template.templateName} {template.isDefault && '(Default)'}
                  </option>
                ))}
              </Select>

              <Input
                label="Academic Year"
                name="additionalDetails.academicYear"
                value={formData.additionalDetails.academicYear}
                onChange={handleInputChange}
                placeholder="2024-2025"
              />
            </div>

            <Input
              label="Certificate Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="e.g., Character Certificate"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate Content
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows="6"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter certificate content. You can use placeholders like {{studentName}}, {{className}}, etc."
              />
            </div>

            {/* Type-specific fields */}
            {formData.certificateType === 'transfer' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Reason for Leaving"
                  name="additionalDetails.reasonForLeaving"
                  value={formData.additionalDetails.reasonForLeaving}
                  onChange={handleInputChange}
                />
                <Input
                  label="Date of Leaving"
                  name="additionalDetails.dateOfLeaving"
                  type="date"
                  value={formData.additionalDetails.dateOfLeaving}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {formData.certificateType === 'achievement' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Achievement Title"
                  name="additionalDetails.achievementTitle"
                  value={formData.additionalDetails.achievementTitle}
                  onChange={handleInputChange}
                />
                <Input
                  label="Position/Rank"
                  name="additionalDetails.position"
                  value={formData.additionalDetails.position}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {/* Signature fields */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Signatures</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Class Teacher Name"
                  name="signatures.classTeacher.name"
                  value={formData.signatures.classTeacher.name}
                  onChange={handleInputChange}
                />
                <Input
                  label="Principal Name"
                  name="signatures.principal.name"
                  value={formData.signatures.principal.name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create Certificate
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Certificate Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Certificate Details"
          size="lg"
        >
          {selectedCertificate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Certificate Number</p>
                  <p className="text-base text-gray-900">{selectedCertificate.certificateNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Type</p>
                  <p className="text-base text-gray-900 capitalize">{selectedCertificate.certificateType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Student</p>
                  <p className="text-base text-gray-900">
                    {selectedCertificate.student?.firstName} {selectedCertificate.student?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedCertificate.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Issue Date</p>
                  <p className="text-base text-gray-900">
                    {new Date(selectedCertificate.issueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Downloads</p>
                  <p className="text-base text-gray-900">{selectedCertificate.downloadCount || 0}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Content</p>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedCertificate.content}</p>
                </div>
              </div>
              {selectedCertificate.status === 'cancelled' && (
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="text-sm font-medium text-red-800">Cancellation Reason:</p>
                  <p className="text-sm text-red-600 mt-1">{selectedCertificate.cancellationReason}</p>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Cancel Certificate Modal */}
        <Modal
          isOpen={isCancelModalOpen}
          onClose={closeCancelModal}
          title="Cancel Certificate"
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XMarkIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Warning: This action cannot be undone
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      Cancelling this certificate will permanently mark it as invalid. 
                      The certificate will no longer be valid for verification.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {selectedCertificate && (
              <div className="bg-gray-50 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Certificate Details:</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Number:</span> {selectedCertificate.certificateNumber}</p>
                  <p><span className="font-medium">Type:</span> {selectedCertificate.certificateType}</p>
                  <p><span className="font-medium">Student:</span> {selectedCertificate.student?.firstName} {selectedCertificate.student?.lastName}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Cancellation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="Please provide a detailed reason for cancelling this certificate..."
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                This reason will be permanently recorded and visible in the certificate history.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={closeCancelModal}>
                Go Back
              </Button>
              <Button 
                type="button" 
                variant="danger" 
                onClick={handleCancelSubmit}
                disabled={!cancellationReason.trim()}
              >
                Yes, Cancel Certificate
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Certificates;

