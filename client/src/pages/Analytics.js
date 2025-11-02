import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import AttendanceChart from '../components/charts/AttendanceChart';
import GradeDistributionChart from '../components/charts/GradeDistributionChart';
import ClassPerformanceChart from '../components/charts/ClassPerformanceChart';
import SubjectPerformanceChart from '../components/charts/SubjectPerformanceChart';
import {
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import analyticsService from '../services/analyticsService';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [attendanceTrends, setAttendanceTrends] = useState([]);
  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [classPerformance, setClassPerformance] = useState([]);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [attendanceByClass, setAttendanceByClass] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch all analytics data in parallel
      const [
        dashboardStats,
        trends,
        grades,
        classPerf,
        subjectPerf,
        attendanceClass,
      ] = await Promise.all([
        analyticsService.getDashboardStats().catch(() => null),
        analyticsService.getAttendanceTrends(30).catch(() => []),
        analyticsService.getGradeDistribution().catch(() => []),
        analyticsService.getClassPerformance().catch(() => []),
        analyticsService.getSubjectPerformance().catch(() => []),
        analyticsService.getAttendanceByClass().catch(() => []),
      ]);

      setStats(dashboardStats);
      setAttendanceTrends(trends);
      setGradeDistribution(grades);
      setClassPerformance(classPerf);
      setSubjectPerformance(subjectPerf);
      setAttendanceByClass(attendanceClass);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive insights and performance metrics
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            title="Total Students"
            value={stats?.totalStudents || 0}
            icon={AcademicCapIcon}
            color="blue"
            subtitle={`${stats?.activeStudents || 0} active`}
          />
          <Card
            title="Total Teachers"
            value={stats?.totalTeachers || 0}
            icon={UserGroupIcon}
            color="green"
          />
          <Card
            title="Total Classes"
            value={stats?.totalClasses || 0}
            icon={BookOpenIcon}
            color="purple"
          />
          <Card
            title="Attendance Today"
            value={`${stats?.todayAttendance?.rate || 0}%`}
            icon={CalendarDaysIcon}
            color="yellow"
            subtitle={`${stats?.todayAttendance?.present || 0} / ${stats?.todayAttendance?.total || 0}`}
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Card
            title="Total Assignments"
            value={stats?.totalAssignments || 0}
            icon={ClipboardDocumentCheckIcon}
            color="indigo"
          />
          <Card
            title="Pending Submissions"
            value={stats?.pendingSubmissions || 0}
            icon={ChartBarIcon}
            color="red"
            subtitle="Awaiting grading"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Trends */}
          {attendanceTrends.length > 0 && (
            <div className="lg:col-span-2">
              <AttendanceChart data={attendanceTrends} />
            </div>
          )}

          {/* Grade Distribution */}
          {gradeDistribution.length > 0 && (
            <GradeDistributionChart data={gradeDistribution} />
          )}

          {/* Class Performance */}
          {classPerformance.length > 0 && (
            <ClassPerformanceChart data={classPerformance} />
          )}
        </div>

        {/* Subject Performance - Full Width */}
        {subjectPerformance.length > 0 && (
          <div className="grid grid-cols-1">
            <SubjectPerformanceChart data={subjectPerformance} />
          </div>
        )}

        {/* Attendance by Class Table */}
        {attendanceByClass.length > 0 && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Attendance Rate by Class
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-3">
                {attendanceByClass.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {item.className}
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className="w-48 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            item.attendanceRate >= 90
                              ? 'bg-green-600'
                              : item.attendanceRate >= 75
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${item.attendanceRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-16 text-right">
                        {item.attendanceRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Performance Insights */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Performance Insights
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Best Performing Class */}
              {classPerformance.length > 0 && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Best Performing Class</p>
                  <p className="mt-2 text-2xl font-bold text-green-600">
                    {classPerformance[0]?.className}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {classPerformance[0]?.averagePercentage}% average
                  </p>
                </div>
              )}

              {/* Highest Attendance */}
              {attendanceByClass.length > 0 && (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Highest Attendance</p>
                  <p className="mt-2 text-2xl font-bold text-blue-600">
                    {attendanceByClass[0]?.className}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {attendanceByClass[0]?.attendanceRate.toFixed(1)}% rate
                  </p>
                </div>
              )}

              {/* Top Subject */}
              {subjectPerformance.length > 0 && (
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Top Performing Subject</p>
                  <p className="mt-2 text-2xl font-bold text-purple-600">
                    {subjectPerformance[0]?.subject}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {subjectPerformance[0]?.averageScore.toFixed(1)}% average
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;

