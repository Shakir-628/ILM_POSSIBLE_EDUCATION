import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Card from '../components/Card';
import {
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  ChartBarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { studentService } from '../services/studentService';
import { teacherService } from '../services/teacherService';
import { classService } from '../services/classService';
import { analyticsService } from '../services/analyticsService';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const Dashboard = () => {
  const { user, isAdmin, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    activeStudents: 0,
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isAdmin || isTeacher) {
          const [students, teachers, classes] = await Promise.all([
            studentService.getAllStudents(),
            teacherService.getAllTeachers(),
            classService.getAllClasses(),
          ]);

          setStats({
            totalStudents: students.length,
            totalTeachers: teachers.length,
            totalClasses: classes.length,
            activeStudents: students.filter(s => s.status === 'active').length,
          });

          const smartAlerts = await analyticsService.getSmartAlerts();
          setAlerts(smartAlerts);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin, isTeacher]);

  return (
    <Layout>
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-white dark:bg-dark-800 shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 animate-fade-in-up">
              {isAdmin && 'Admin Dashboard - Manage your institution'}
              {isTeacher && 'Teacher Dashboard - Manage your classes and students'}
              {isStudent && 'Student Dashboard - View your academic progress'}
            </p>
          </div>

          {/* Stats Cards for Admin and Teacher */}
          {(isAdmin || isTeacher) && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" style={{ animationDelay: '100ms' }}>
              <Card
                title="Total Students"
                value={stats.totalStudents}
                icon={AcademicCapIcon}
                color="blue"
                subtitle={`${stats.activeStudents} active`}
              />
              {isAdmin && (
                <Card
                  title="Total Teachers"
                  value={stats.totalTeachers}
                  icon={UserGroupIcon}
                  color="green"
                />
              )}
              <Card
                title="Total Classes"
                value={stats.totalClasses}
                icon={BookOpenIcon}
                color="purple"
              />
              <Card
                title="Attendance Rate"
                value="92%"
                icon={ChartBarIcon}
                color="yellow"
                subtitle="This month"
              />
              <Card
                title="AI Growth Insight"
                value="+12%"
                icon={SparklesIcon}
                color="indigo"
                subtitle="Student engagement is up"
                className="ring-2 ring-primary-500/20"
              />
            </div>
          )}

          {/* Smart Alerts Section */}
          {(isAdmin || isTeacher) && alerts.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6 animate-fade-in-up border-l-4 border-red-500">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
                <h2 className="text-lg font-bold text-gray-900">Smart Alerts: Attendance Drops</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {alerts.map((alert) => (
                  <div key={alert.studentId} className="bg-red-50 rounded-lg p-4 border border-red-100 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-bold text-red-900">{alert.name}</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          {alert.drop}% drop
                        </span>
                      </div>
                      <p className="text-xs text-red-700 mt-1">ID: {alert.studentRegistrationId}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <div className="text-red-800">
                        Prev: <span className="font-bold">{alert.prevRate}%</span>
                      </div>
                      <div className="text-red-800">
                        Curr: <span className="font-bold">{alert.currRate}%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/students', { state: { searchTerm: alert.studentRegistrationId } })}
                      className="mt-3 w-full inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Investigate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6 animate-fade-in-up hover-lift transition-all duration-300">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {isAdmin && (
                <>
                  <button
                    onClick={() => navigate('/students')}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md hover:scale-105 hover:border-blue-300"
                  >
                    <AcademicCapIcon className="h-5 w-5 mr-2 transition-transform duration-200 hover:rotate-12" />
                    Manage Students
                  </button>
                  <button
                    onClick={() => navigate('/teachers')}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md hover:scale-105 hover:border-green-300"
                  >
                    <UserGroupIcon className="h-5 w-5 mr-2 transition-transform duration-200 hover:rotate-12" />
                    Manage Teachers
                  </button>
                  <button
                    onClick={() => navigate('/classes')}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md hover:scale-105 hover:border-purple-300"
                  >
                    <BookOpenIcon className="h-5 w-5 mr-2 transition-transform duration-200 hover:rotate-12" />
                    Manage Classes
                  </button>
                </>
              )}
              {isTeacher && (
                <>
                  <button
                    onClick={() => navigate('/attendance')}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md hover:scale-105 hover:border-yellow-300"
                  >
                    Mark Attendance
                  </button>
                  <button
                    onClick={() => navigate('/grades')}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md hover:scale-105 hover:border-indigo-300"
                  >
                    Enter Grades
                  </button>
                  <button
                    onClick={() => navigate('/reports')}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md hover:scale-105 hover:border-red-300"
                  >
                    View Reports
                  </button>
                </>
              )}
              {isStudent && (
                <>
                  <button
                    onClick={() => navigate('/attendance')}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md hover:scale-105 hover:border-green-300"
                  >
                    View Attendance
                  </button>
                  <button
                    onClick={() => navigate('/grades')}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md hover:scale-105 hover:border-blue-300"
                  >
                    View Grades
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg p-6 animate-fade-in-up hover-lift transition-all duration-300">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            <div className="flow-root">
              <ul className="-mb-8">
                <li className="animate-fade-in-up">
                  <div className="relative pb-8">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white animate-scale-in">
                          <AcademicCapIcon className="h-5 w-5 text-white" />
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm text-gray-500">
                            System initialized successfully ✨
                          </p>
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-gray-500">
                          <time>Just now</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
