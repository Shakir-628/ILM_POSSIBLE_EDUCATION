import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import {
  PlusIcon,
  DocumentTextIcon,
  DocumentArrowDownIcon,
  AcademicCapIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { reportCardService } from '../services/reportCardService';
import { studentService } from '../services/studentService';
import { classService } from '../services/classService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ReportCards = () => {
  const toast = useToast();
  const { isAdmin, isTeacher, isStudent, user } = useAuth();
  const [reportCards, setReportCards] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReportCard, setSelectedReportCard] = useState(null);

  const [formData, setFormData] = useState({
    studentId: '',
    classId: '',
    academicYear: new Date().getFullYear().toString(),
    term: '1st',
  });

  useEffect(() => {
    fetchReportCards();
    fetchClasses();
    if (isAdmin || isTeacher) {
      fetchStudents();
    }
  }, []);

  const fetchReportCards = async () => {
    try {
      const params = isStudent ? { studentId: user.studentId } : {};
      const response = await reportCardService.getAllReportCards(params);
      setReportCards(response.data);
    } catch (error) {
      console.error('Error fetching report cards:', error);
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

  const fetchClasses = async () => {
    try {
      const data = await classService.getAllClasses();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await reportCardService.generateReportCard(formData);
      toast.success('Report card generated successfully');
      fetchReportCards();
      closeModal();
    } catch (error) {
      console.error('Error generating report card:', error);
      toast.error(error.response?.data?.message || 'Error generating report card');
    }
  };

  const handleDownload = async (reportCard) => {
    try {
      const blob = await reportCardService.downloadReportCard(reportCard._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_card_${reportCard.student.studentId}_${reportCard.term}.pdf`;
      a.click();
    } catch (error) {
      console.error('Error downloading report card:', error);
      toast.error('Error downloading report card');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      studentId: '',
      classId: '',
      academicYear: new Date().getFullYear().toString(),
      term: '1st',
    });
  };

  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'text-green-600';
    if (grade === 'B+' || grade === 'B') return 'text-blue-600';
    if (grade === 'C+' || grade === 'C') return 'text-yellow-600';
    if (grade === 'D') return 'text-orange-600';
    return 'text-red-600';
  };

  const columns = [
    {
      header: 'Student',
      accessor: 'student',
      render: (row) =>
        row.student ? `${row.student.firstName} ${row.student.lastName}` : 'N/A',
    },
    {
      header: 'Student ID',
      accessor: 'studentId',
      render: (row) => row.student?.studentId || 'N/A',
    },
    {
      header: 'Class',
      accessor: 'class',
      render: (row) => row.class ? `${row.class.className}` : 'N/A',
    },
    { header: 'Term', accessor: 'term' },
    { header: 'Year', accessor: 'academicYear' },
    {
      header: 'Percentage',
      accessor: 'percentage',
      render: (row) => `${row.percentage?.toFixed(2)}%`,
    },
    {
      header: 'Grade',
      accessor: 'overallGrade',
      render: (row) => (
        <span className={`font-bold text-lg ${getGradeColor(row.overallGrade)}`}>
          {row.overallGrade}
        </span>
      ),
    },
    {
      header: 'GPA',
      accessor: 'gpa',
      render: (row) => `${row.gpa}/4.0`,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedReportCard(row);
              setIsDetailModalOpen(true);
            }}
            className="text-indigo-600 hover:text-indigo-900 text-sm"
          >
            View
          </button>
          <button
            onClick={() => handleDownload(row)}
            className="text-green-600 hover:text-green-900 text-sm"
          >
            Download
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
            <h1 className="text-2xl font-bold text-gray-900">Report Cards</h1>
            <p className="mt-1 text-sm text-gray-500">
              Generate and download student report cards
            </p>
          </div>
          {(isAdmin || isTeacher) && (
            <Button icon={PlusIcon} onClick={() => setIsModalOpen(true)}>
              Generate Report Card
            </Button>
          )}
        </div>

        {/* Report Cards Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Table columns={columns} data={reportCards} loading={loading} />
        </div>

        {/* Generate Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Generate Report Card"
        >
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Report card will be automatically generated from existing grades for the selected student, class, and term.
              </p>
            </div>

            <Select
              label="Student"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              options={[
                { value: '', label: 'Select Student' },
                ...students.map((student) => ({
                  value: student._id,
                  label: `${student.firstName} ${student.lastName} (${student.studentId})`,
                })),
              ]}
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
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Academic Year"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                required
              />
              <Select
                label="Term"
                name="term"
                value={formData.term}
                onChange={handleInputChange}
                options={[
                  { value: '1st', label: '1st Term' },
                  { value: '2nd', label: '2nd Term' },
                  { value: '3rd', label: '3rd Term' },
                  { value: 'annual', label: 'Annual' },
                ]}
                required
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">Generate Report Card</Button>
            </div>
          </form>
        </Modal>

        {/* Detail Modal */}
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Report Card Details"
          size="large"
        >
          {selectedReportCard && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Student:</strong> {selectedReportCard.student.firstName}{' '}
                    {selectedReportCard.student.lastName}
                  </div>
                  <div>
                    <strong>Student ID:</strong> {selectedReportCard.student.studentId}
                  </div>
                  <div>
                    <strong>Class:</strong> {selectedReportCard.class?.className}
                  </div>
                  <div>
                    <strong>Term:</strong> {selectedReportCard.term}
                  </div>
                </div>
              </div>

              {/* Subject-wise Marks */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Subject-wise Performance</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Subject</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Obtained</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">%</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedReportCard.subjectGrades.map((sg, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-sm">{sg.subject.subjectName}</td>
                        <td className="px-4 py-2 text-sm">{sg.totalMarks}</td>
                        <td className="px-4 py-2 text-sm">{sg.obtainedMarks}</td>
                        <td className="px-4 py-2 text-sm">{sg.percentage}%</td>
                        <td className="px-4 py-2 text-sm font-bold">{sg.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Overall Performance */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-md text-center">
                  <p className="text-sm text-gray-700">Percentage</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedReportCard.percentage?.toFixed(2)}%
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-md text-center">
                  <p className="text-sm text-gray-700">Overall Grade</p>
                  <p className={`text-2xl font-bold ${getGradeColor(selectedReportCard.overallGrade)}`}>
                    {selectedReportCard.overallGrade}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-md text-center">
                  <p className="text-sm text-gray-700">GPA</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedReportCard.gpa}/4.0
                  </p>
                </div>
              </div>

              {/* Attendance */}
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Attendance</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Total Days:</strong> {selectedReportCard.totalWorkingDays || 0}
                  </div>
                  <div>
                    <strong>Present:</strong> {selectedReportCard.presentDays || 0}
                  </div>
                  <div>
                    <strong>Percentage:</strong> {selectedReportCard.attendancePercentage?.toFixed(2) || 0}%
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <div className="flex justify-center">
                <Button
                  onClick={() => handleDownload(selectedReportCard)}
                  icon={DocumentArrowDownIcon}
                >
                  Download Report Card PDF
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default ReportCards;

