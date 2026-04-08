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
} from '@heroicons/react/24/outline';
import { teacherService } from '../services/teacherService';
import { useToast } from '../context/ToastContext';

const TeacherIDCards = () => {
  const toast = useToast();
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [previewTeacher, setPreviewTeacher] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'
  const cardRef = useRef(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    filterTeachers();
  }, [searchTerm, departmentFilter, teachers]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await teacherService.getAllTeachers();
      console.log('Teachers response:', response); // Debug log

      // Handle different response structures
      const teachersData = response.data || response || [];
      console.log('Teachers data:', teachersData); // Debug log

      setTeachers(Array.isArray(teachersData) ? teachersData : []);
      setFilteredTeachers(Array.isArray(teachersData) ? teachersData : []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to fetch teachers');
      setTeachers([]);
      setFilteredTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTeachers = () => {
    if (!Array.isArray(teachers) || teachers.length === 0) {
      setFilteredTeachers([]);
      return;
    }

    let filtered = [...teachers];

    if (searchTerm && searchTerm.trim()) {
      filtered = filtered.filter(teacher => {
        const fullName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.toLowerCase();
        const teacherId = (teacher.teacherId || '').toLowerCase();
        const email = (teacher.email || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase().trim();

        return fullName.includes(searchLower) ||
          teacherId.includes(searchLower) ||
          email.includes(searchLower);
      });
    }

    if (departmentFilter && departmentFilter.trim()) {
      filtered = filtered.filter(teacher => teacher.department === departmentFilter);
    }

    console.log('Filtered teachers:', filtered.length); // Debug log
    setFilteredTeachers(filtered);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTeachers(filteredTeachers.map(t => t._id));
    } else {
      setSelectedTeachers([]);
    }
  };

  const handleSelectTeacher = (teacherId) => {
    if (selectedTeachers.includes(teacherId)) {
      setSelectedTeachers(selectedTeachers.filter(id => id !== teacherId));
    } else {
      setSelectedTeachers([...selectedTeachers, teacherId]);
    }
  };

  const handlePreview = (teacher) => {
    setPreviewTeacher(teacher);
    setIsPreviewOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePrintAll = () => {
    // Set all filtered teachers as selected for printing
    const teachersToShow = selectedTeachers.length > 0
      ? filteredTeachers.filter(t => selectedTeachers.includes(t._id))
      : filteredTeachers;

    if (teachersToShow.length === 0) {
      toast.warning('No teachers to print');
      return;
    }

    window.print();
  };

  const handleDownloadSingle = async (teacher) => {
    try {
      toast.info('Generating ID card...');
      await teacherService.downloadIDCard(teacher._id);
      toast.success('ID card downloaded successfully!');
    } catch (error) {
      console.error('Error downloading ID card:', error);
      toast.error('Failed to download ID card');
    }
  };

  const handleDownloadAll = async () => {
    const teachersToDownload = selectedTeachers.length > 0
      ? selectedTeachers
      : filteredTeachers.map(t => t._id);

    if (teachersToDownload.length === 0) {
      toast.warning('No teachers to download');
      return;
    }

    try {
      toast.info(`Generating ${teachersToDownload.length} ID cards...`);
      await teacherService.downloadBulkIDCards(teachersToDownload);
      toast.success(`${teachersToDownload.length} ID cards downloaded successfully!`);
    } catch (error) {
      console.error('Error downloading ID cards:', error);
      toast.error('Failed to download ID cards');
    }
  };

  const handleBulkDownload = async () => {
    if (selectedTeachers.length === 0) {
      toast.warning('Please select at least one teacher');
      return;
    }

    try {
      toast.info(`Generating ${selectedTeachers.length} ID cards...`);
      await teacherService.downloadBulkIDCards(selectedTeachers);
      toast.success(`${selectedTeachers.length} ID cards downloaded successfully!`);
    } catch (error) {
      console.error('Error downloading bulk ID cards:', error);
      toast.error('Failed to download ID cards');
    }
  };

  const departments = Array.isArray(teachers)
    ? [...new Set(teachers.map(t => t.department).filter(Boolean))]
    : [];

  // ID Card Component
  const IDCardPreview = ({ teacher, isPrint = false }) => {
    return (
      <div className={`${isPrint ? 'print-card' : ''} bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200`}
        style={{ width: '320px', height: '200px' }}>
        {/* Card Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/logos/Logo_IP.png" alt="Logo" style={{ height: '7.5rem' }} className="w-auto brightness-0 invert" />
            </div>
            <span className="text-xs font-semibold">TEACHER ID</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="flex p-3 space-x-3">
          {/* Photo Section */}
          <div className="flex-shrink-0">
            <div className="w-20 h-24 bg-gray-200 rounded border-2 border-gray-300 overflow-hidden">
              {teacher.photo ? (
                <img
                  src={teacher.photo}
                  alt={teacher.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100">
                  <UserGroupIcon className="h-10 w-10 text-primary-600" />
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm leading-tight">
                {teacher.firstName} {teacher.lastName}
              </h3>
              <p className="text-xs text-gray-600 mt-1">{teacher.qualification || 'Teacher'}</p>

              <div className="mt-2 space-y-1">
                <div className="flex items-start">
                  <span className="text-xs font-semibold text-gray-500 w-12">ID:</span>
                  <span className="text-xs text-gray-900 font-mono">{teacher.teacherId}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-xs font-semibold text-gray-500 w-12">Dept:</span>
                  <span className="text-xs text-gray-900">{teacher.department || 'N/A'}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-xs font-semibold text-gray-500 w-12">Phone:</span>
                  <span className="text-xs text-gray-900">{teacher.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-xs text-gray-500">Valid: {new Date().getFullYear()}</span>
              {teacher.teacherId && (
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
            📞 Contact: +92-XXX-XXXXXXX | 🌐 www.ilmpossible.edu.pk
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
              <IdentificationIcon className="h-8 w-8 mr-2 text-primary-600" />
              Teacher ID Cards
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Generate, preview, and print professional ID cards for teachers
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handlePrintAll}
              icon={PrinterIcon}
              variant="outline"
            >
              {selectedTeachers.length > 0
                ? `Print Selected (${selectedTeachers.length})`
                : `Print All (${filteredTeachers.length})`}
            </Button>
            <Button
              onClick={handleDownloadAll}
              icon={ArrowDownTrayIcon}
              variant="primary"
            >
              {selectedTeachers.length > 0
                ? `Download Selected (${selectedTeachers.length})`
                : `Download All (${filteredTeachers.length})`}
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Teachers</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{teachers.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Selected</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{selectedTeachers.length}</p>
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
                <p className="text-3xl font-bold text-purple-900 mt-2">{filteredTeachers.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <IdentificationIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Teachers
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID, or email..."
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
              label="Filter by Department"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              options={[
                { value: '', label: 'All Departments' },
                ...departments.map(dept => ({ value: dept, label: dept })),
              ]}
            />

            <div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setDepartmentFilter('');
                  setSelectedTeachers([]);
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
                  checked={selectedTeachers.length === filteredTeachers.length && filteredTeachers.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="selectAll" className="text-sm text-gray-700 cursor-pointer font-medium">
                  Select All ({filteredTeachers.length})
                </label>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading teachers...</p>
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No teachers in database</p>
              <p className="text-sm text-gray-600 mb-4">Please add teachers first to generate ID cards</p>
              <Button
                onClick={() => window.location.href = '/teachers'}
                variant="primary"
              >
                Go to Teachers Page
              </Button>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No teachers match your filters</p>
              <p className="text-sm text-gray-600 mb-4">
                Found {teachers.length} total teachers, but none match your current filters
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setDepartmentFilter('');
                }}
                variant="outline"
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 print-grid">
              {filteredTeachers.map((teacher) => {
                const isSelected = selectedTeachers.includes(teacher._id);
                const shouldPrint = selectedTeachers.length === 0 || isSelected;

                return (
                  <div
                    key={teacher._id}
                    className={`relative print-card-container transition-all duration-200 ${isSelected ? 'ring-2 ring-primary-500 rounded-lg' : ''
                      } ${!shouldPrint ? 'print-hide-card' : ''}`}
                  >
                    {/* Selection Checkbox */}
                    <div className="absolute -top-2 -left-2 z-10 print-hide">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectTeacher(teacher._id)}
                        className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer shadow-md bg-white"
                      />
                    </div>

                    {/* ID Card */}
                    <div className="transform hover:scale-105 transition-transform duration-200">
                      <IDCardPreview teacher={teacher} />
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3 flex space-x-2 print-hide">
                      <button
                        onClick={() => handleDownloadSingle(teacher)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all shadow-sm hover:shadow-md"
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
          {previewTeacher && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <IDCardPreview teacher={previewTeacher} />
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
                  onClick={handlePrint}
                  icon={PrinterIcon}
                  variant="outline"
                  className="flex-1"
                >
                  Print
                </Button>
                <Button
                  onClick={() => handleDownloadSingle(previewTeacher)}
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

export default TeacherIDCards;

