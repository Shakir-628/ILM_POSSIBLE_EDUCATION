import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Select from '../components/Select';
import Button from '../components/Button';
import {
  ChartBarIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { studentService } from '../services/studentService';
import { gradeService } from '../services/gradeService';
import { attendanceService } from '../services/attendanceService';
import { useToast } from '../context/ToastContext';
const Reports = () => {
  const toast = useToast();
  const [reportType, setReportType] = useState('overview');
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageGrade: 0,
    attendanceRate: 0,
    totalExams: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const students = await studentService.getAllStudents();
      const grades = await gradeService.getAllGrades();

      const averagePercentage = grades.length > 0
        ? grades.reduce((sum, grade) => sum + (grade.percentage || 0), 0) / grades.length
        : 0;

      setStats({
        totalStudents: students.length,
        averageGrade: averagePercentage.toFixed(2),
        attendanceRate: '92', // This would come from actual attendance calculation
        totalExams: grades.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    toast.info('Report generation feature coming soon!');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <Button onClick={generateReport}>Generate Report</Button>
        </div>

        {/* Report Type Selection */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={[
                { value: 'overview', label: 'Overview' },
                { value: 'academic', label: 'Academic Performance' },
                { value: 'attendance', label: 'Attendance Report' },
                { value: 'grade-distribution', label: 'Grade Distribution' },
              ]}
            />
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Card
              title="Total Students"
              value={stats.totalStudents}
              icon={AcademicCapIcon}
              color="blue"
            />
            <Card
              title="Average Grade"
              value={`${stats.averageGrade}%`}
              icon={ClipboardDocumentCheckIcon}
              color="green"
            />
            <Card
              title="Attendance Rate"
              value={`${stats.attendanceRate}%`}
              icon={ChartBarIcon}
              color="purple"
            />
            <Card
              title="Total Exams"
              value={stats.totalExams}
              icon={UserGroupIcon}
              color="yellow"
            />
          </div>
        )}

        {/* Report Content */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {reportType === 'overview' && 'System Overview'}
            {reportType === 'academic' && 'Academic Performance Report'}
            {reportType === 'attendance' && 'Attendance Report'}
            {reportType === 'grade-distribution' && 'Grade Distribution'}
          </h2>

          {reportType === 'overview' && (
            <div className="space-y-4">
              <p className="text-gray-600">
                This section provides an overview of the entire system performance,
                including student enrollment, attendance trends, and academic results.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Enrollment Trends</h3>
                  <p className="text-sm text-gray-600">
                    Total active students: {stats.totalStudents}
                  </p>
                  <p className="text-sm text-gray-600">Growth rate: +12% this year</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Academic Performance</h3>
                  <p className="text-sm text-gray-600">
                    Average percentage: {stats.averageGrade}%
                  </p>
                  <p className="text-sm text-gray-600">
                    Students above 80%: {Math.floor(stats.totalStudents * 0.35)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {reportType === 'academic' && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Academic performance analysis including grade distribution, subject-wise
                performance, and top performers.
              </p>
              <div className="text-sm text-gray-500">
                Detailed academic reports will be displayed here with charts and graphs.
              </div>
            </div>
          )}

          {reportType === 'attendance' && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Attendance statistics and trends for all students and classes.
              </p>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Overall Attendance</h3>
                <p className="text-sm text-gray-600">
                  Current attendance rate: {stats.attendanceRate}%
                </p>
                <p className="text-sm text-gray-600">
                  Students with perfect attendance: {Math.floor(stats.totalStudents * 0.15)}
                </p>
              </div>
            </div>
          )}

          {reportType === 'grade-distribution' && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Distribution of grades across all students and classes.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['A+/A', 'B+/B', 'C+/C', 'D/F'].map((grade, index) => (
                  <div key={grade} className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {[35, 28, 22, 15][index]}%
                    </div>
                    <div className="text-sm text-gray-600">{grade}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Reports;

