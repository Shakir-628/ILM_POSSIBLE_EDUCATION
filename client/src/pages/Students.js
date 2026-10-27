import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { studentService } from '../services/studentService';
import { classService } from '../services/classService';
import { useTableData } from '../hooks/useTableData';
import { useToast } from '../context/ToastContext';
import { usePermissions } from '../context/PermissionContext';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import { QRCodeSVG } from 'qrcode.react';
import { TableSkeleton } from '../components/LoadingSkeleton';
import {
  DocumentArrowDownIcon,
  PlusIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon,
  PaperClipIcon,
  ArrowRightIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
  handleValidatedInput,
  validateForm,
  validationPatterns,
  validationMessages,
} from '../utils/validation';

const Students = () => {
  const location = useLocation();
  const toast = useToast();
  const { canCreate, canUpdate, canDelete, canRead } = usePermissions();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('birth-certificate');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importing, setImporting] = useState(false);

  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    guardianName: '',
    guardianPhone: '',
    classId: '',
  });

  const [promoteData, setPromoteData] = useState({
    toClassId: '',
    academicYear: new Date().getFullYear().toString(),
  });

  const [transferData, setTransferData] = useState({
    toSchool: '',
    reason: '',
  });

  useEffect(() => {
    fetchStudents();
    fetchClasses();

    // Check if we came from an "investigate" button on the dashboard
    if (location.state && location.state.searchTerm) {
      setSearchTerm(location.state.searchTerm);
    }
  }, [location]);

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
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

  // Filter students by status
  const filteredStudents = statusFilter === 'all'
    ? students
    : students.filter(s => s.status === statusFilter);

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
  } = useTableData(filteredStudents, ['studentId', 'firstName', 'lastName', 'email'], 10);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Use generic validation handler
    switch (name) {
      case 'firstName':
      case 'lastName':
      case 'guardianName':
        handleValidatedInput(e, 'name', setFormData, formData, { maxLength: 50 });
        break;
      case 'email':
        handleValidatedInput(e, 'email', setFormData, formData);
        break;
      case 'phone':
      case 'guardianPhone':
        handleValidatedInput(e, 'phone', setFormData, formData, { maxLength: 15 });
        break;
      case 'studentId':
        handleValidatedInput(e, 'studentId', setFormData, formData, { maxLength: 20 });
        break;
      default:
        // For other fields, just update form data
        setFormData({
          ...formData,
          [name]: value,
        });
        break;
    }
  };

  const generateStudentId = () => {
    if (students.length === 0) return 'S001';

    // Extract numeric part from existing student IDs and find the highest
    const studentIds = students.map(s => s.studentId).filter(id => id && id.startsWith('S'));
    const numbers = studentIds.map(id => {
      const num = id.replace('S', '');
      return parseInt(num) || 0;
    }).filter(num => num > 0);

    const maxNumber = Math.max(...numbers, 0);
    const nextNumber = maxNumber + 1;

    return `S${nextNumber.toString().padStart(3, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Define validation rules for the student form
    const validationRules = {
      firstName: { type: 'name', required: true, label: 'First Name' },
      lastName: { type: 'name', required: true, label: 'Last Name' },
      email: { type: 'email', required: false, label: 'Email' },
      phone: { type: 'phone', required: false, label: 'Phone', minLength: 10 },
      guardianName: { type: 'name', required: true, label: 'Guardian Name' },
      guardianPhone: { type: 'phone', required: true, label: 'Guardian Phone', minLength: 10 },
      dateOfBirth: { type: 'dateOfBirth', required: true, label: 'Date of Birth' },
      gender: { type: 'select', required: true, label: 'Gender' },
      classId: { type: 'select', required: true, label: 'Class' },
    };

    // Validate entire form
    const validation = validateForm(formData, validationRules);

    if (!validation.isValid) {
      // Show first error message
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return;
    }

    try {
      // Auto-generate student ID if empty and not editing
      const submitData = { ...formData };
      if (!editingStudent && !submitData.studentId) {
        submitData.studentId = generateStudentId();
      }

      if (editingStudent) {
        await studentService.updateStudent(editingStudent._id, submitData);
      } else {
        await studentService.createStudent(submitData);
      }
      fetchStudents();
      closeModal();
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error(error.response?.data?.message || 'Error saving student');
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setEditingStudent(null);
    const newId = generateStudentId();
    setFormData({
      studentId: newId,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      guardianName: '',
      guardianPhone: '',
      classId: '',
    });
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone || '',
      dateOfBirth: student.dateOfBirth?.split('T')[0] || '',
      gender: student.gender,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      classId: student.class?._id || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (student) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentService.deleteStudent(student._id);
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error('Error deleting student');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormData({
      studentId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      guardianName: '',
      guardianPhone: '',
      classId: '',
    });
  };

  // QR Code functions
  const handleShowQR = (student) => {
    setSelectedStudent(student);
    setShowQRModal(true);
  };

  const downloadQR = () => {
    const container = document.getElementById('qr-canvas');
    if (container) {
      // Find the SVG element within the container
      const svgElement = container.querySelector('svg');
      if (svgElement) {
        // Get SVG data
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        downloadLink.download = `${selectedStudent.studentId}_qr.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // Clean up
        URL.revokeObjectURL(svgUrl);
      }
    }
  };

  const downloadIDCard = () => {
    // Create a canvas for the ID card
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set ID card dimensions (standard credit card size ratio)
    canvas.width = 600;
    canvas.height = 380;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // School Header
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(10, 10, canvas.width - 20, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ILM POSSIBLE SCHOOL', canvas.width / 2, 35);
    ctx.font = '16px Arial';
    ctx.fillText('Student Identification Card', canvas.width / 2, 55);

    // Student Photo placeholder (if no photo available)
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(30, 90, 120, 150);
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 90, 120, 150);

    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PHOTO', 90, 165);

    // Student Information
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${selectedStudent.firstName} ${selectedStudent.lastName}`, 170, 110);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#374151';
    ctx.fillText(`Student ID: ${selectedStudent.studentId}`, 170, 135);
    ctx.fillText(`Class: ${selectedStudent.class?.className || 'N/A'}`, 170, 155);
    ctx.fillText(`Roll No: ${selectedStudent.rollNumber || 'N/A'}`, 170, 175);

    // Add more student details
    if (selectedStudent.dateOfBirth) {
      ctx.fillText(`DOB: ${new Date(selectedStudent.dateOfBirth).toLocaleDateString()}`, 170, 195);
    }
    if (selectedStudent.gender) {
      ctx.fillText(`Gender: ${selectedStudent.gender}`, 170, 215);
    }
    if (selectedStudent.phone) {
      ctx.fillText(`Phone: ${selectedStudent.phone}`, 170, 235);
    }
    if (selectedStudent.email) {
      ctx.fillText(`Email: ${selectedStudent.email}`, 170, 255);
    }

    // QR Code Section
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN FOR VERIFICATION', 450, 280);

    // Get QR code and draw it on canvas
    const container = document.getElementById('qr-canvas');
    if (container) {
      const svgElement = container.querySelector('svg');
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const img = new Image();
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        img.onload = function () {
          // Draw QR code
          ctx.drawImage(img, 380, 300, 140, 140);

          // Valid Until date
          ctx.fillStyle = '#6b7280';
          ctx.font = '12px Arial';
          ctx.textAlign = 'left';
          const validDate = new Date();
          validDate.setFullYear(validDate.getFullYear() + 1);
          ctx.fillText(`Valid Until: ${validDate.toLocaleDateString()}`, 30, 350);

          // Signature line
          ctx.strokeStyle = '#9ca3af';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(400, 350);
          ctx.lineTo(570, 350);
          ctx.stroke();

          ctx.fillStyle = '#6b7280';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Principal Signature', 485, 365);

          // Convert canvas to blob and download
          canvas.toBlob(function (blob) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${selectedStudent.studentId}_ID_Card.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            URL.revokeObjectURL(link.href);
          }, 'image/png');
        };

        img.src = url;
      }
    }
  };

  // Document upload functions
  const handleShowDocuments = async (student) => {
    try {
      const fullStudent = await studentService.getStudentById(student._id);
      setSelectedStudent(fullStudent);
      setShowDocModal(true);
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      toast.warning('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('documentType', documentType);

    try {
      await studentService.uploadDocument(selectedStudent._id, formData);
      toast.success('Document uploaded successfully');
      setSelectedFile(null);
      handleShowDocuments(selectedStudent); // Refresh
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Error uploading document');
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await studentService.deleteDocument(selectedStudent._id, documentId);
        toast.success('Document deleted successfully');
        handleShowDocuments(selectedStudent); // Refresh
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('Error deleting document');
      }
    }
  };

  // Promotion functions
  const handleShowPromote = (student) => {
    setSelectedStudent(student);
    setShowPromoteModal(true);
  };

  const handlePromoteSubmit = async (e) => {
    e.preventDefault();
    try {
      await studentService.promoteStudent(selectedStudent._id, promoteData);
      toast.success('Student promoted successfully');
      setShowPromoteModal(false);
      setPromoteData({ toClassId: '', academicYear: new Date().getFullYear().toString() });
      fetchStudents();
    } catch (error) {
      console.error('Error promoting student:', error);
      toast.error('Error promoting student');
    }
  };

  // Transfer functions
  const handleShowTransfer = (student) => {
    setSelectedStudent(student);
    setShowTransferModal(true);
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    try {
      await studentService.transferStudent(selectedStudent._id, transferData);
      toast.success('Student transferred successfully');
      setShowTransferModal(false);
      setTransferData({ toSchool: '', reason: '' });
      fetchStudents();
    } catch (error) {
      console.error('Error transferring student:', error);
      toast.error('Error transferring student');
    }
  };

  // Export functions
  const handleExportExcel = async () => {
    try {
      const blob = await studentService.exportToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'students.xlsx';
      a.click();
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error(error.response?.data?.message || 'Error exporting to Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      const blob = await studentService.exportToPDF();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'students.pdf';
      a.click();
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error(error.response?.data?.message || 'Error exporting to PDF');
    }
  };

  // Bulk import functions
  const handleDownloadTemplate = async () => {
    try {
      const blob = await studentService.downloadImportTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'student_import_template.xlsx';
      a.click();
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error(error.response?.data?.message || 'Error downloading template');
    }
  };

  const handleImportFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportFile(file);
    setImporting(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await studentService.uploadBulkImportFile(formData);
      setImportPreview(response.data);

      if (response.data.errorCount > 0) {
        toast.warning(`File processed: ${response.data.validCount} valid, ${response.data.errorCount} errors. Please review.`);
      } else {
        toast.success(`File validated successfully! ${response.data.validCount} students ready to import.`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.response?.data?.message || 'Error processing file');
      setImportFile(null);
      setImportPreview(null);
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview || importPreview.validCount === 0) {
      toast.warning('No valid students to import');
      return;
    }

    if (!window.confirm(`Are you sure you want to import ${importPreview.validCount} students?`)) {
      return;
    }

    setImporting(true);
    try {
      const response = await studentService.confirmBulkImport(importPreview.students);
      toast.success(`Import complete! ${response.data.success.length} students imported, ${response.data.failed.length} failed.`);
      setShowBulkImportModal(false);
      setImportFile(null);
      setImportPreview(null);
      fetchStudents(); // Refresh list
    } catch (error) {
      console.error('Error confirming import:', error);
      toast.error(error.response?.data?.message || 'Error importing students');
    } finally {
      setImporting(false);
    }
  };

  const cancelImport = () => {
    setShowBulkImportModal(false);
    setImportFile(null);
    setImportPreview(null);
  };

  // ID Card generation functions
  const handleGenerateIDCard = async (student) => {
    try {
      const blob = await studentService.generateIDCard(student._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${student.studentId}_id_card.pdf`;
      a.click();
    } catch (error) {
      console.error('Error generating ID card:', error);
      toast.error(error.response?.data?.message || 'Error generating ID card');
    }
  };

  const handleBulkIDCards = async () => {
    if (selectedStudents.length === 0) {
      toast.warning('Please select at least one student');
      return;
    }

    try {
      const blob = await studentService.generateBulkIDCards(selectedStudents);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulk_id_cards_${Date.now()}.pdf`;
      a.click();
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error generating bulk ID cards:', error);
      toast.error(error.response?.data?.message || 'Error generating bulk ID cards');
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === paginatedData.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(paginatedData.map((s) => s._id));
    }
  };

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={selectedStudents.length === paginatedData.length && paginatedData.length > 0}
          onChange={toggleSelectAll}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      ),
      accessor: 'select',
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedStudents.includes(row._id)}
          onChange={() => toggleStudentSelection(row._id)}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      ),
    },
    { header: 'Student ID', accessor: 'studentId' },
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => `${row.firstName} ${row.lastName}`,
    },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Class',
      accessor: 'class',
      render: (row) => row.class?.className || 'N/A',
    },
    {
      header: 'Parent',
      accessor: 'parent',
      render: (row) => row.parent ? `${row.parent.firstName} ${row.parent.lastName}` : 'N/A',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.status === 'active' ? 'bg-green-100 text-green-800' :
            row.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
              row.status === 'graduated' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
            }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          {canRead('Students') && (
            <>
              <button
                onClick={() => handleShowQR(row)}
                className="text-purple-600 hover:text-purple-900 text-sm"
                title="Show QR Code"
              >
                QR
              </button>
              <button
                onClick={() => handleGenerateIDCard(row)}
                className="text-green-600 hover:text-green-900 text-sm"
                title="Generate ID Card"
              >
                ID
              </button>
            </>
          )}
          {canUpdate('Students') && (
            <>
              <button
                onClick={() => handleShowDocuments(row)}
                className="text-indigo-600 hover:text-indigo-900 text-sm"
                title="Documents"
              >
                Docs
              </button>
              <button
                onClick={() => handleShowPromote(row)}
                className="text-blue-600 hover:text-blue-900 text-sm"
                title="Promote"
              >
                Promote
              </button>
              <button
                onClick={() => handleShowTransfer(row)}
                className="text-orange-600 hover:text-orange-900 text-sm"
                title="Transfer"
              >
                Transfer
              </button>
              <button
                onClick={() => handleEdit(row)}
                className="text-indigo-600 hover:text-indigo-900 text-sm"
              >
                Edit
              </button>
            </>
          )}
          {canDelete('Students') && (
            <button
              onClick={() => handleDelete(row)}
              className="text-red-600 hover:text-red-900 text-sm"
            >
              Delete
            </button>
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
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="mt-1 text-sm text-gray-500">
              Digital student registration and profile management
            </p>
          </div>
          <div className="flex gap-2">
            {canRead('Students') && (
              <>
                <Button
                  variant="outline"
                  icon={DocumentArrowDownIcon}
                  onClick={handleExportExcel}
                  className="hidden md:flex"
                >
                  Excel
                </Button>
                <Button
                  variant="outline"
                  icon={DocumentTextIcon}
                  onClick={handleExportPDF}
                  className="hidden md:flex"
                >
                  PDF
                </Button>
              </>
            )}
            {canCreate('Students') && (
              <Button
                variant="outline"
                icon={ArrowUpTrayIcon}
                onClick={() => setShowBulkImportModal(true)}
                className="hidden md:flex"
              >
                Import
              </Button>
            )}
            {canCreate('Students') && (
              <Button icon={PlusIcon} onClick={openModal}>
                Add Student
              </Button>
            )}
          </div>
        </div>

        {/* Quick Actions Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">📋 Available Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-700">
                <div>
                  <span className="font-medium text-blue-600">✓</span> <strong>ID Cards:</strong> Click "ID" button or select multiple students
                </div>
                <div>
                  <span className="font-medium text-green-600">✓</span> <strong>Documents:</strong> Upload birth certificates, photos, etc.
                </div>
                <div>
                  <span className="font-medium text-purple-600">✓</span> <strong>Bulk Import:</strong> Use export/import for bulk operations
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedStudents.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  icon={DocumentTextIcon}
                  onClick={handleBulkIDCards}
                >
                  Generate ID Cards ({selectedStudents.length})
                </Button>
                <button
                  onClick={() => setSelectedStudents([])}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters and List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0 max-w-md">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={clearSearch}
                placeholder="Search by ID, name, email..."
              />
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-4 flex space-x-3">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: 'All Status', value: 'all' },
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                  { label: 'Graduated', value: 'graduated' },
                  { label: 'Transferred', value: 'transferred' },
                ]}
              />
              <Select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                options={[
                  { label: '10 per page', value: 10 },
                  { label: '25 per page', value: 25 },
                  { label: '50 per page', value: 50 },
                ]}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-4">
                <TableSkeleton rows={10} cols={8} />
              </div>
            ) : (
              <Table
                columns={columns}
                data={paginatedData}
                loading={loading}
              />
            )}
          </div>
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

        {/* Add/Edit Student Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingStudent ? 'Edit Student' : 'Add New Student'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Student ID"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              placeholder="Auto-generated if empty"
              className="text-sm"
              disabled
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                className="text-sm"
                pattern={validationPatterns.name}
                title={validationMessages.name}
                required
              />
              <Input
                label="Last Name"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                className="text-sm"
                pattern={validationPatterns.name}
                title={validationMessages.name}
                required
              />
            </div>
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="student@example.com"
              className="text-sm"
              pattern={validationPatterns.email}
              title={validationMessages.email}
            />
            <Input
              label="Phone"
              name="phone"
              type="text"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="03331234567"
              className="text-sm"
              pattern={validationPatterns.phone}
              title={validationMessages.phone}
            />
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
            <Input
              label="Guardian Name"
              name="guardianName"
              type="text"
              value={formData.guardianName}
              onChange={handleInputChange}
              className="text-sm"
              pattern={validationPatterns.name}
              title={validationMessages.name}
              required
            />
            <Input
              label="Guardian Phone"
              name="guardianPhone"
              type="text"
              value={formData.guardianPhone}
              onChange={handleInputChange}
              placeholder="03331234567"
              className="text-sm"
              pattern={validationPatterns.phone}
              title={validationMessages.phone}
              required
            />
            <Select
              label="Class"
              name="classId"
              value={formData.classId}
              onChange={handleInputChange}
              options={[
                { value: '', label: 'Select Class' },
                ...classes.map((cls) => ({
                  value: cls._id,
                  label: `${cls.className} - ${cls.grade}`,
                })),
              ]}
            />
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingStudent ? 'Update' : 'Create'} Student
              </Button>
            </div>
          </form>
        </Modal>

        {/* QR Code Modal */}
        <Modal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          title="Student QR Code"
        >
          {selectedStudent && (
            <div className="text-center space-y-4">
              <div id="qr-canvas" className="p-6 bg-white rounded-lg">
                <QRCodeSVG
                  value={JSON.stringify({
                    studentId: selectedStudent.studentId,
                    name: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
                    class: selectedStudent.class?.className || '',
                  })}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div>
                <p className="font-semibold">{selectedStudent.firstName} {selectedStudent.lastName}</p>
                <p className="text-sm text-gray-600">{selectedStudent.studentId}</p>
                <p className="text-sm text-gray-600">{selectedStudent.class?.className || 'No Class'}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={downloadQR} icon={DocumentArrowDownIcon}>
                  Download QR Code
                </Button>
                <Button onClick={downloadIDCard} icon={DocumentArrowDownIcon} className="bg-blue-600 hover:bg-blue-700">
                  Download ID Card
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Documents Modal */}
        <Modal
          isOpen={showDocModal}
          onClose={() => setShowDocModal(false)}
          title="Student Documents"
        >
          {selectedStudent && (
            <div className="space-y-6">
              {/* Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Document
                </label>
                <Select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  options={[
                    { value: 'birth-certificate', label: 'Birth Certificate' },
                    { value: 'id-card', label: 'ID Card' },
                    { value: 'photo', label: 'Photo' },
                    { value: 'medical', label: 'Medical Record' },
                    { value: 'previous-school', label: 'Previous School Record' },
                    { value: 'other', label: 'Other' },
                  ]}
                  className="mb-3"
                />
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary-50 file:text-primary-700
                    hover:file:bg-primary-100"
                />
                <Button
                  onClick={handleUploadDocument}
                  className="mt-3"
                  icon={ArrowUpTrayIcon}
                >
                  Upload
                </Button>
              </div>

              {/* Documents List */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Uploaded Documents</h4>
                {selectedStudent.documents && selectedStudent.documents.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {selectedStudent.documents.map((doc) => (
                      <li key={doc._id} className="py-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <PaperClipIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.filename}</p>
                            <p className="text-xs text-gray-500 capitalize">
                              {doc.documentType.replace('-', ' ')} • {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <a
                            href={`${'https://ilm-possible-education.onrender.com'}${doc.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900 text-sm"
                          >
                            View
                          </a>
                          <button
                            onClick={() => handleDeleteDocument(doc._id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No documents uploaded yet</p>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Promote Modal */}
        <Modal
          isOpen={showPromoteModal}
          onClose={() => setShowPromoteModal(false)}
          title="Promote Student"
        >
          {selectedStudent && (
            <form onSubmit={handlePromoteSubmit} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-700">
                  <strong>Student:</strong> {selectedStudent.firstName} {selectedStudent.lastName}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Current Class:</strong> {selectedStudent.class?.className || 'N/A'}
                </p>
              </div>
              <Select
                label="Promote to Class"
                value={promoteData.toClassId}
                onChange={(e) => setPromoteData({ ...promoteData, toClassId: e.target.value })}
                options={[
                  { value: '', label: 'Select Target Class' },
                  ...classes.map((cls) => ({
                    value: cls._id,
                    label: `${cls.className} - ${cls.grade}`,
                  })),
                ]}
                required
              />
              <Input
                label="Academic Year"
                value={promoteData.academicYear}
                onChange={(e) => setPromoteData({ ...promoteData, academicYear: e.target.value })}
                placeholder="e.g., 2024-2025"
                required
              />
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="secondary" onClick={() => setShowPromoteModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" icon={ArrowPathIcon}>
                  Promote Student
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Transfer Modal */}
        <Modal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          title="Transfer Student"
        >
          {selectedStudent && (
            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-700">
                  <strong>Student:</strong> {selectedStudent.firstName} {selectedStudent.lastName}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Student ID:</strong> {selectedStudent.studentId}
                </p>
              </div>
              <Input
                label="Transfer To School"
                value={transferData.toSchool}
                onChange={(e) => setTransferData({ ...transferData, toSchool: e.target.value })}
                placeholder="Enter school name"
                required
              />
              <Input
                label="Reason for Transfer"
                value={transferData.reason}
                onChange={(e) => setTransferData({ ...transferData, reason: e.target.value })}
                placeholder="Enter reason"
              />
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> This will mark the student as "transferred" and change their status.
                </p>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="secondary" onClick={() => setShowTransferModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" icon={ArrowRightIcon}>
                  Transfer Student
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Bulk Import Modal */}
        <Modal
          isOpen={showBulkImportModal}
          onClose={cancelImport}
          title="Bulk Import Students"
          size="large"
        >
          <div className="space-y-6">
            {/* Step 1: Download Template */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Step 1: Download Template</h3>
              <p className="text-sm text-gray-700 mb-3">
                Download the Excel template, fill in student data, and upload it back.
              </p>
              <Button
                variant="secondary"
                icon={DocumentArrowDownIcon}
                onClick={handleDownloadTemplate}
              >
                Download Excel Template
              </Button>
            </div>

            {/* Step 2: Upload File */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Step 2: Upload File</h3>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportFileChange}
                disabled={importing}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100
                  disabled:opacity-50"
              />
              {importing && (
                <p className="mt-2 text-sm text-gray-600">Processing file...</p>
              )}
            </div>

            {/* Step 3: Preview & Errors */}
            {importPreview && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-green-900">Valid Students</p>
                    <p className="text-2xl font-bold text-green-600">{importPreview.validCount}</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-red-900">Errors</p>
                    <p className="text-2xl font-bold text-red-600">{importPreview.errorCount}</p>
                  </div>
                </div>

                {/* Error Details */}
                {importPreview.errorCount > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <h4 className="text-sm font-semibold text-red-900 mb-2">Errors Found:</h4>
                    <ul className="space-y-2">
                      {importPreview.errors.map((error, idx) => (
                        <li key={idx} className="text-sm text-red-800">
                          <strong>Row {error.row}:</strong> {error.errors.join(', ')}
                          <div className="text-xs text-red-600 ml-4">
                            {error.data.firstName} {error.data.lastName} ({error.data.email})
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Valid Students Preview */}
                {importPreview.validCount > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Valid Students ({importPreview.validCount}):
                    </h4>
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-1 text-left">Name</th>
                          <th className="px-2 py-1 text-left">Email</th>
                          <th className="px-2 py-1 text-left">Gender</th>
                          <th className="px-2 py-1 text-left">Guardian</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.students.slice(0, 10).map((student, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="px-2 py-1">{student.firstName} {student.lastName}</td>
                            <td className="px-2 py-1">{student.email}</td>
                            <td className="px-2 py-1">{student.gender}</td>
                            <td className="px-2 py-1">{student.guardianName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importPreview.students.length > 10 && (
                      <p className="text-xs text-gray-500 mt-2">
                        ... and {importPreview.students.length - 10} more
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="secondary" onClick={cancelImport}>
                Cancel
              </Button>
              {importPreview && importPreview.validCount > 0 && (
                <Button
                  onClick={handleConfirmImport}
                  disabled={importing}
                  icon={ArrowUpTrayIcon}
                >
                  {importing ? 'Importing...' : `Import ${importPreview.validCount} Students`}
                </Button>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Students;

