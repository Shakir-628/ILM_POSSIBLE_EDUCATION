import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Select from '../components/Select';
import {
  TrophyIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { examAnalyticsService } from '../services/examAnalyticsService';
import { classService } from '../services/classService';
import { useToast } from '../context/ToastContext';

const ExamAnalytics = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [classPerformance, setClassPerformance] = useState([]);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [trends, setTrends] = useState([]);
  const [classes, setClasses] = useState([]);
  
  const [filters, setFilters] = useState({
    academicYear: new Date().getFullYear().toString(),
    term: '',
  });

  useEffect(() => {
    fetchAllAnalytics();
    fetchClasses();
  }, [filters]);

  const fetchClasses = async () => {
    try {
      const data = await classService.getAllClasses();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      const [dashboard, classPerf, subjectPerf, top, examTrends] = await Promise.all([
        examAnalyticsService.getExamDashboard(filters),
        examAnalyticsService.getClassExamPerformance(filters),
        examAnalyticsService.getSubjectExamPerformance(filters),
        examAnalyticsService.getTopPerformers({ ...filters, limit: 10 }),
        examAnalyticsService.getExamTrends(filters),
      ]);

      setDashboardStats(dashboard.data);
      setClassPerformance(classPerf.data);
      setSubjectPerformance(subjectPerf.data);
      setTopPerformers(top.data);
      setTrends(examTrends.data);
    } catch (error) {
      console.error('Error fetching exam analytics:', error);
      toast.error('Failed to fetch exam analytics');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'text-green-600 bg-green-100',
      'A': 'text-green-600 bg-green-100',
      'B+': 'text-blue-600 bg-blue-100',
      'B': 'text-blue-600 bg-blue-100',
      'C+': 'text-yellow-600 bg-yellow-100',
      'C': 'text-yellow-600 bg-yellow-100',
      'D': 'text-orange-600 bg-orange-100',
      'F': 'text-red-600 bg-red-100',
    };
    return colors[grade] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading exam analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 Exam Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive examination performance insights
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Academic Year"
              value={filters.academicYear}
              onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
              options={[
                { value: '2024', label: '2024' },
                { value: '2023', label: '2023' },
                { value: '2022', label: '2022' },
              ]}
            />
            <Select
              label="Term"
              value={filters.term}
              onChange={(e) => setFilters({ ...filters, term: e.target.value })}
              options={[
                { value: '', label: 'All Terms' },
                { value: '1st', label: '1st Term' },
                { value: '2nd', label: '2nd Term' },
                { value: '3rd', label: '3rd Term' },
                { value: 'annual', label: 'Annual' },
              ]}
            />
          </div>
        </div>

        {/* Dashboard Stats */}
        {dashboardStats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <Card
              title="Total Exams"
              value={dashboardStats.totalExams}
              icon={ClipboardDocumentCheckIcon}
              color="blue"
            />
            <Card
              title="Report Cards"
              value={dashboardStats.totalReportCards}
              icon={AcademicCapIcon}
              color="purple"
            />
            <Card
              title="Average Percentage"
              value={`${dashboardStats.averagePercentage}%`}
              icon={ChartBarIcon}
              color="green"
            />
            <Card
              title="Pass Rate"
              value={`${dashboardStats.passRate}%`}
              icon={CheckCircleIcon}
              color="yellow"
            />
          </div>
        )}

        {/* Grade Distribution */}
        {dashboardStats?.gradeDistribution && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h2>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {dashboardStats.gradeDistribution.map((item) => (
                <div
                  key={item.grade}
                  className={`text-center p-4 rounded-lg ${getGradeColor(item.grade)}`}
                >
                  <div className="text-2xl font-bold">{item.grade}</div>
                  <div className="text-sm font-medium mt-1">{item.count} students</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Performers */}
        {topPerformers.length > 0 && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrophyIcon className="h-6 w-6 mr-2 text-yellow-600" />
              🏆 Top 10 Performers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topPerformers.map((report, index) => (
                <div
                  key={report._id}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border-l-4 border-yellow-500"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' :
                        'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {report.student?.firstName} {report.student?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {report.class?.className} | {report.student?.studentId}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {report.percentage?.toFixed(2)}%
                      </div>
                      <div className={`text-sm font-semibold ${getGradeColor(report.overallGrade)} px-2 py-1 rounded`}>
                        {report.overallGrade} | {report.gpa}/4.0
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Class Performance */}
        {classPerformance.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Class-wise Performance</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg GPA</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pass Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classPerformance.map((cls) => (
                    <tr key={cls._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cls.className} - {cls.grade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cls.totalStudents}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {cls.averagePercentage}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cls.averageGPA}/4.0
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cls.passed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2 max-w-[100px]">
                            <div
                              className={`h-2 rounded-full ${
                                cls.passRate >= 80 ? 'bg-green-600' :
                                cls.passRate >= 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${cls.passRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {cls.passRate?.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subject Performance */}
        {subjectPerformance.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjectPerformance.map((subject) => (
                <div
                  key={subject._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{subject.subjectName}</h3>
                      <p className="text-xs text-gray-500">{subject.subjectCode}</p>
                    </div>
                    <div className={`text-2xl font-bold ${
                      subject.averagePercentage >= 75 ? 'text-green-600' :
                      subject.averagePercentage >= 50 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {subject.averagePercentage}%
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">{subject.totalStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Marks:</span>
                      <span className="font-medium">{subject.averageMarks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Highest:</span>
                      <span className="font-medium text-green-600">{subject.highestMarks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lowest:</span>
                      <span className="font-medium text-red-600">{subject.lowestMarks}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          subject.averagePercentage >= 75 ? 'bg-green-600' :
                          subject.averagePercentage >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${subject.averagePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exam Trends */}
        {trends.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends by Term</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {trends.map((trend) => (
                <div
                  key={trend.term}
                  className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 text-center"
                >
                  <div className="text-sm font-medium text-gray-600 uppercase mb-2">
                    {trend.term} Term
                  </div>
                  <div className="text-3xl font-bold text-indigo-600 mb-1">
                    {trend.averagePercentage}%
                  </div>
                  <div className="text-sm text-gray-600">
                    GPA: {trend.averageGPA}/4.0
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {trend.totalStudents} students
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grade Distribution Chart */}
        {dashboardStats?.gradeDistribution && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution Overview</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {dashboardStats.gradeDistribution.map((item) => (
                <div
                  key={item.grade}
                  className={`flex flex-col items-center justify-center w-24 h-24 rounded-lg ${getGradeColor(item.grade)}`}
                >
                  <div className="text-3xl font-bold">{item.grade}</div>
                  <div className="text-sm font-medium mt-1">{item.count}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && (!dashboardStats || dashboardStats.totalReportCards === 0) && (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Exam Data Available</h3>
            <p className="text-gray-500">
              Generate report cards for students to see exam analytics
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExamAnalytics;

