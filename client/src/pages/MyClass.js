import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import {
  UserIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  VideoCameraIcon,
  BellIcon,
  InformationCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { studentService } from '../services/studentService';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MyClass = () => {
  const { isStudent } = useAuth();
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isStudent) {
      fetchClassInfo();
    }
  }, [isStudent]);

  const fetchClassInfo = async () => {
    try {
      setLoading(true);
      const response = await studentService.getMyClassInfo();
      setClassInfo(response.data);
    } catch (err) {
      console.error('Error fetching class info:', err);
      setError('Failed to load class information. Please ensure you are enrolled in a class.');
    } finally {
      setLoading(false);
    }
  };

  if (!isStudent) {
    return (
      <Layout>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <InformationCircleIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                This page is only accessible to students.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold">My Class Matrix</h1>
            {classInfo ? (
              <p className="mt-2 text-primary-100 flex items-center">
                <AcademicCapIcon className="h-5 w-5 mr-2" />
                {classInfo.className} - {classInfo.grade} {classInfo.section || ''}
              </p>
            ) : (
              <p className="mt-2 text-primary-100">Your personalized class information</p>
            )}
          </div>
          <div className="absolute top-0 right-0 -mt-8 -mr-8 opacity-10">
            <AcademicCapIcon className="h-64 w-64" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 text-center">
            <InformationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Oops!</h3>
            <p className="text-gray-500 mt-2">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Quick Links & Class Teacher */}
            <div className="space-y-6">
              {/* Quick Modules Matrix */}
              <Card title="Module Matrix" icon={BookOpenIcon}>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Link
                    to="/timetable"
                    className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
                  >
                    <CalendarDaysIcon className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-blue-800 mt-2">Timetable</span>
                  </Link>
                  <Link
                    to="/online-classes"
                    className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
                  >
                    <VideoCameraIcon className="h-8 w-8 text-green-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-green-800 mt-2">Virtual Class</span>
                  </Link>
                  <Link
                    to="/assignments"
                    className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
                  >
                    <DocumentTextIcon className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-purple-800 mt-2">Assignments</span>
                  </Link>
                  <Link
                    to="/notifications"
                    className="flex flex-col items-center justify-center p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors group"
                  >
                    <BellIcon className="h-8 w-8 text-yellow-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-yellow-800 mt-2">Notifications</span>
                  </Link>
                </div>
              </Card>

              {/* Class Teacher */}
              {classInfo.classTeacher && (
                <Card title="Class Teacher" icon={UserIcon}>
                  <div className="flex items-center mt-4">
                    <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xl font-bold uppercase overflow-hidden">
                      {classInfo.classTeacher.profileImage ? (
                        <img src={classInfo.classTeacher.profileImage} alt="Teacher" className="h-full w-full object-cover" />
                      ) : (
                        `${classInfo.classTeacher.firstName[0]}${classInfo.classTeacher.lastName[0]}`
                      )}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900">{classInfo.classTeacher.firstName} {classInfo.classTeacher.lastName}</h4>
                      <p className="text-sm text-gray-500">Managing {classInfo.className}</p>
                      <p className="text-xs text-primary-600 mt-1">{classInfo.classTeacher.email}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Class Info */}
              <Card title="Class Details" icon={InformationCircleIcon}>
                <div className="space-y-3 mt-4 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Grade:</span>
                    <span className="font-semibold">{classInfo.grade}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Room:</span>
                    <span className="font-semibold">{classInfo.room || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Academic Year:</span>
                    <span className="font-semibold">{classInfo.academicYear || 'Current'}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-gray-500">Total Subjects:</span>
                    <span className="font-semibold">{classInfo.subjects?.length || 0}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column: Subject Teachers Matrix */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <BookOpenIcon className="h-6 w-6 mr-2 text-primary-600" />
                    Subject Teachers Matrix
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Teachers assigned to your specific class subjects</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {classInfo.subjects && classInfo.subjects.length > 0 ? (
                    classInfo.subjects.map((subject, index) => (
                      <div key={subject._id || index} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between">
                        <div className="flex items-center mb-4 sm:mb-0">
                          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                            {subject.subjectCode || 'SUB'}
                          </div>
                          <div className="ml-4">
                            <h4 className="font-bold text-gray-900">{subject.subjectName}</h4>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">{subject.type || 'Lecture'}</p>
                          </div>
                        </div>

                        <div className="flex items-center bg-white p-3 rounded-xl border border-gray-100 sm:w-64">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-semibold text-xs overflow-hidden">
                            {subject.teacher?.profileImage ? (
                              <img src={subject.teacher.profileImage} alt="T" className="h-full w-full object-cover" />
                            ) : (
                              subject.teacher ? `${subject.teacher.firstName[0]}${subject.teacher.lastName[0]}` : '?'
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-semibold text-gray-900">
                              {subject.teacher ? `${subject.teacher.firstName} ${subject.teacher.lastName}` : 'Not Assigned'}
                            </p>
                            <p className="text-xs text-gray-500">{subject.teacher?.specialization || 'Academic Teacher'}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-gray-500 italic">
                      No subjects are currently listed for your class.
                    </div>
                  )}
                </div>
              </div>

              {/* Weekly Highlights / Notice Board */}
              <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-6 border border-indigo-100 shadow-inner">
                <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
                  <BellIcon className="h-6 w-6 mr-2 text-indigo-600" />
                  Class Notice Board
                </h3>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border-l-4 border-indigo-500 shadow-sm">
                    <p className="text-xs text-indigo-500 font-bold mb-1 uppercase">Today's Focus</p>
                    <p className="text-sm text-gray-800 font-medium">Please review the new assignments posted in your Dashboard Matrix.</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border-l-4 border-primary-500 shadow-sm">
                    <p className="text-xs text-primary-500 font-bold mb-1 uppercase">Upcoming</p>
                    <p className="text-sm text-gray-800 font-medium">Virtual Class scheduled for tomorrow at 10:00 AM.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyClass;
