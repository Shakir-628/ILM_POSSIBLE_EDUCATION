import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Select from '../components/Select';
import Modal from '../components/Modal';
import {
  IdentificationIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  QrCodeIcon,
  CheckCircleIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { studentService } from '../services/studentService';
import { useToast } from '../context/ToastContext';

const StudentIDCards = () => {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [previewStudent, setPreviewStudent] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, gradeFilter, sectionFilter, students]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await studentService.getAllStudents();
      console.log('Students response:', response); // Debug log

      // Handle different response structures
      const studentsData = response.data || response || [];
      console.log('Students data:', studentsData); // Debug log

      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setFilteredStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!Array.isArray(students) || students.length === 0) {
      setFilteredStudents([]);
      return;
    }

    let filtered = [...students];

    if (searchTerm && searchTerm.trim()) {
      filtered = filtered.filter(student => {
        const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
        const studentId = (student.studentId || '').toLowerCase();
        const rollNumber = (student.rollNumber || '').toLowerCase();
        const email = (student.email || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase().trim();

        return fullName.includes(searchLower) ||
          studentId.includes(searchLower) ||
          rollNumber.includes(searchLower) ||
          email.includes(searchLower);
      });
    }

    if (gradeFilter && gradeFilter.trim()) {
      filtered = filtered.filter(student => student.grade === gradeFilter);
    }

    if (sectionFilter && sectionFilter.trim()) {
      filtered = filtered.filter(student => student.section === sectionFilter);
    }

    console.log('Filtered students:', filtered.length); // Debug log
    setFilteredStudents(filtered);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(filteredStudents.map(s => s._id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handlePreview = (student) => {
    setPreviewStudent(student);
    setIsPreviewOpen(true);
  };

  const handlePrintAll = () => {
    const studentsToShow = selectedStudents.length > 0
      ? filteredStudents.filter(s => selectedStudents.includes(s._id))
      : filteredStudents;

    if (studentsToShow.length === 0) {
      toast.warning('No students to print');
      return;
    }

    window.print();
  };

  const handleDownloadSingle = async (student) => {
    try {
      toast.info('Generating ID card...');
      await studentService.downloadIDCard(student._id);
      toast.success('ID card downloaded successfully!');
    } catch (error) {
      console.error('Error downloading ID card:', error);
      toast.error('Failed to download ID card');
    }
  };

  const handleDownloadAll = async () => {
    const studentsToDownload = selectedStudents.length > 0
      ? selectedStudents
      : filteredStudents.map(s => s._id);

    if (studentsToDownload.length === 0) {
      toast.warning('No students to download');
      return;
    }

    try {
      toast.info(`Generating ${studentsToDownload.length} ID cards...`);
      await studentService.downloadBulkIDCards(studentsToDownload);
      toast.success(`${studentsToDownload.length} ID cards downloaded successfully!`);
    } catch (error) {
      console.error('Error downloading ID cards:', error);
      toast.error('Failed to download ID cards');
    }
  };

  const grades = Array.isArray(students)
    ? [...new Set(students.map(s => s.grade).filter(Boolean))]
    : [];

  const sections = Array.isArray(students)
    ? [...new Set(students.map(s => s.section).filter(Boolean))]
    : [];

  // ID Card Component
  const IDCardPreview = ({ student }) => {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200"
        style={{ width: '320px', height: '200px' }}>
        {/* Card Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/logos/Logo_IP.png" alt="Logo" style={{ height: '7.5rem' }} className="w-auto brightness-0 invert" />
            </div>
            <span className="text-xs font-semibold">STUDENT ID</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="flex p-3 space-x-3">
          {/* Photo Section */}
          <div className="flex-shrink-0">
            <div className="w-20 h-24 bg-gray-200 rounded border-2 border-gray-300 overflow-hidden">
              {student.photo ? (
                <img
                  src={student.photo}
                  alt={student.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                  <UserGroupIcon className="h-10 w-10 text-blue-600" />
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm leading-tight">
                {student.firstName} {student.lastName}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {student.grade}{student.section ? ` - Section ${student.section}` : ''}
              </p>

              <div className="mt-2 space-y-1">
                <div className="flex items-start">
                  <span className="text-xs font-semibold text-gray-500 w-12">ID:</span>
                  <span className="text-xs text-gray-900 font-mono">{student.studentId}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-xs font-semibold text-gray-500 w-12">Roll:</span>
                  <span className="text-xs text-gray-900">{student.rollNumber || 'N/A'}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-xs font-semibold text-gray-500 w-12">DOB:</span>
                  <span className="text-xs text-gray-900">
                    {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="text-xs font-semibold text-gray-500 w-12">Blood:</span>
                  <span className="text-xs text-gray-900">{student.bloodGroup || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-xs text-gray-500">Valid: {new Date().getFullYear()}</span>
              {student.studentId && (
                <div className="bg-white p-0.5 border border-gray-300 rounded">
                  <div className="w-10 h-10 bg-gray-100 flex items-center justify-center">
                    <QrCodeIcon className="h-8 w-8 text-gray-600" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Footer - School Info */}
        <div className="bg-gray-100 px-3 py-1 border-t border-gray-200">
          <p className="text-xs text-center text-gray-600">
            📞 Emergency: {student.emergencyContact || '+92-XXX-XXXXXXX'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <IdentificationIcon className="h-8 w-8 mr-2 text-blue-600" />
              Student ID Cards
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Generate, preview, and print professional ID cards for students
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handlePrintAll}
              icon={PrinterIcon}
              variant="outline"
            >
              {selectedStudents.length > 0
                ? `Print Selected (${selectedStudents.length})`
                : `Print All (${filteredStudents.length})`}
            </Button>
            <Button
              onClick={handleDownloadAll}
              icon={ArrowDownTrayIcon}
              variant="primary"
            >
              {selectedStudents.length > 0
                ? `Download Selected (${selectedStudents.length})`
                : `Download All (${filteredStudents.length})`}
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Students</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{students.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Selected</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{selectedStudents.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Filtered</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">{filteredStudents.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <IdentificationIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Students
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID, or roll..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            <Select
              label="Filter by Grade"
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              options={[
                { value: '', label: 'All Grades' },
                ...grades.map(grade => ({ value: grade, label: grade })),
              ]}
            />

            <Select
              label="Filter by Section"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              options={[
                { value: '', label: 'All Sections' },
                ...sections.map(section => ({ value: section, label: `Section ${section}` })),
              ]}
            />

            <div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setGradeFilter('');
                  setSectionFilter('');
                  setSelectedStudents([]);
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* ID Cards Display */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">ID Cards Preview</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="selectAll" className="text-sm text-gray-700 cursor-pointer font-medium">
                  Select All ({filteredStudents.length})
                </label>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <AcademicCapIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No students in database</p>
              <p className="text-sm text-gray-600 mb-4">Please add students first to generate ID cards</p>
              <Button
                onClick={() => window.location.href = '/students'}
                variant="primary"
              >
                Go to Students Page
              </Button>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No students match your filters</p>
              <p className="text-sm text-gray-600 mb-4">
                Found {students.length} total students, but none match your current filters
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setGradeFilter('');
                  setSectionFilter('');
                }}
                variant="outline"
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 print-grid">
              {filteredStudents.map((student) => {
                const isSelected = selectedStudents.includes(student._id);
                const shouldPrint = selectedStudents.length === 0 || isSelected;

                return (
                  <div
                    key={student._id}
                    className={`relative print-card-container transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 rounded-lg' : ''
                      } ${!shouldPrint ? 'print-hide-card' : ''}`}
                  >
                    {/* Selection Checkbox */}
                    <div className="absolute -top-2 -left-2 z-10 print-hide">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectStudent(student._id)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer shadow-md bg-white"
                      />
                    </div>

                    {/* ID Card */}
                    <div className="transform hover:scale-105 transition-transform duration-200">
                      <IDCardPreview student={student} />
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3 flex space-x-2 print-hide">
                      <button
                        onClick={() => handleDownloadSingle(student)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 inline mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Preview Modal */}
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title="ID Card Preview"
        >
          {previewStudent && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <IDCardPreview student={previewStudent} />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Print Instructions:</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Use CR80 size card (85.6mm x 54mm / 3.375" x 2.125")</li>
                  <li>Print in landscape orientation</li>
                  <li>Use high-quality card printer or lamination</li>
                  <li>Recommended paper: 300gsm card stock</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handlePrintAll}
                  icon={PrinterIcon}
                  variant="outline"
                  className="flex-1"
                >
                  Print
                </Button>
                <Button
                  onClick={() => handleDownloadSingle(previewStudent)}
                  icon={ArrowDownTrayIcon}
                  className="flex-1"
                >
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          /* Hide everything except cards */
          body * {
            visibility: hidden;
          }
          
          /* Show only the card grid and cards */
          .print-grid,
          .print-grid * {
            visibility: visible;
          }
          
          /* Hide non-printable elements */
          .print-hide,
          .print-hide *,
          .print-hide-card,
          .print-hide-card * {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Position the grid for printing */
          .print-grid {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
          }
          
          /* Card layout for printing - 2 cards per row */
          .print-card-container {
            page-break-inside: avoid;
            break-inside: avoid;
            display: inline-block !important;
            width: 48% !important;
            margin: 1% !important;
            vertical-align: top;
          }
          
          /* Page breaks every 8 cards (4 rows of 2) */
          .print-card-container:nth-child(8n) {
            page-break-after: always;
          }
          
          /* Remove hover effects in print */
          .print-card-container > div {
            transform: none !important;
            box-shadow: none !important;
          }
          
          /* Remove selection rings */
          .print-card-container {
            outline: none !important;
            box-shadow: none !important;
          }
          
          /* Ensure cards are visible */
          .print-card-container:not(.print-hide-card) {
            display: inline-block !important;
            visibility: visible !important;
          }
        }
        
        @page {
          size: A4;
          margin: 10mm;
        }
      `}</style>
    </Layout>
  );
};

export default StudentIDCards;

