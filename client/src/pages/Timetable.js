import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import Card from '../components/Card';
import {
  PlusIcon,
  ClockIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { timetableService } from '../services/timetableService';
import { classService } from '../services/classService';
import { subjectService } from '../services/subjectService';
import { teacherService } from '../services/teacherService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Timetable = () => {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [timetables, setTimetables] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('');
  const [currentTimetable, setCurrentTimetable] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];
  const defaultTimes = [
    { start: '08:00', end: '08:45' },
    { start: '08:45', end: '09:30' },
    { start: '09:30', end: '10:15' },
    { start: '10:15', end: '11:00' },
    { start: '11:00', end: '11:45' },
    { start: '11:45', end: '12:30' },
    { start: '12:30', end: '01:15' },
    { start: '01:15', end: '02:00' },
  ];

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchTimetable();
    }
  }, [selectedClass, academicYear]);

  const fetchClasses = async () => {
    try {
      const data = await classService.getAllClasses();
      setClasses(data);
      if (data.length > 0 && !selectedClass) {
        setSelectedClass(data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await subjectService.getAllSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const data = await teacherService.getAllTeachers();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const response = await timetableService.getTimetableByClass(selectedClass, {
        academicYear,
      });
      setCurrentTimetable(response.data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setCurrentTimetable(null);
    } finally {
      setLoading(false);
    }
  };

  const initializeEmptyTimetable = () => {
    const schedule = days.map((day) => ({
      day,
      periods: periods.map((periodNum, idx) => ({
        periodNumber: periodNum,
        startTime: defaultTimes[idx]?.start || '',
        endTime: defaultTimes[idx]?.end || '',
        subject: null,
        teacher: null,
        roomNumber: '',
        periodType: 'lecture',
      })),
    }));

    return {
      class: selectedClass,
      academicYear,
      term: '1st',
      schedule,
      breaks: [
        { name: 'Short Break', startTime: '10:15', endTime: '10:30', duration: 15 },
        { name: 'Lunch Break', startTime: '12:30', endTime: '01:00', duration: 30 },
      ],
    };
  };

  const handleCreateTimetable = async () => {
    try {
      const emptyTimetable = initializeEmptyTimetable();
      const response = await timetableService.createTimetable(emptyTimetable);
      setCurrentTimetable(response.data);
      toast.success('Timetable created successfully');
    } catch (error) {
      console.error('Error creating timetable:', error);
      toast.error(error.response?.data?.message || 'Error creating timetable');
    }
  };

  const handlePeriodChange = (dayIndex, periodIndex, field, value) => {
    const updated = { ...currentTimetable };
    // Convert empty strings to null for ObjectId fields
    const finalValue = (field === 'subject' || field === 'teacher') && value === '' ? null : value;
    updated.schedule[dayIndex].periods[periodIndex][field] = finalValue;
    setCurrentTimetable(updated);
  };

  const handleSaveTimetable = async () => {
    try {
      await timetableService.updateTimetable(currentTimetable._id, currentTimetable);
      toast.success('Timetable updated successfully');
      fetchTimetable();
    } catch (error) {
      console.error('Error saving timetable:', error);
      toast.error('Error saving timetable');
    }
  };

  const handleDeleteTimetable = async () => {
    if (window.confirm('Are you sure you want to delete this timetable?')) {
      try {
        await timetableService.deleteTimetable(currentTimetable._id);
        toast.success('Timetable deleted successfully');
        setCurrentTimetable(null);
      } catch (error) {
        console.error('Error deleting timetable:', error);
        toast.error('Error deleting timetable');
      }
    }
  };

  const getPeriodColor = (periodType) => {
    switch (periodType) {
      case 'lecture': return 'bg-blue-50 border-blue-200';
      case 'lab': return 'bg-purple-50 border-purple-200';
      case 'break': return 'bg-yellow-50 border-yellow-200';
      case 'sports': return 'bg-green-50 border-green-200';
      case 'library': return 'bg-indigo-50 border-indigo-200';
      case 'assembly': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading timetable...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Timetable Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage class timetables with automated conflict detection
            </p>
          </div>
          {isAdmin && currentTimetable && (
            <div className="flex space-x-3">
              <Button variant="secondary" onClick={handleDeleteTimetable}>
                Delete Timetable
              </Button>
              <Button onClick={handleSaveTimetable}>
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Select Class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              options={[
                { value: '', label: 'Select Class' },
                ...classes.map((cls) => ({
                  value: cls._id,
                  label: `${cls.className} - ${cls.grade}`,
                })),
              ]}
            />
            <Input
              label="Academic Year"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            />
            {isAdmin && !currentTimetable && selectedClass && (
              <div className="flex items-end">
                <Button icon={PlusIcon} onClick={handleCreateTimetable}>
                  Create Timetable
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Timetable Grid */}
        {currentTimetable ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900">
                        Day / Period
                      </th>
                      {periods.map((period) => (
                        <th
                          key={period}
                          className="border border-gray-300 px-2 py-2 text-xs font-semibold text-gray-900"
                        >
                          Period {period}
                          {currentTimetable.schedule[0]?.periods[period - 1] && (
                            <div className="text-xs font-normal text-gray-600">
                              {currentTimetable.schedule[0].periods[period - 1].startTime} -
                              {currentTimetable.schedule[0].periods[period - 1].endTime}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentTimetable.schedule.map((daySchedule, dayIndex) => (
                      <tr key={daySchedule.day}>
                        <td className="border border-gray-300 px-4 py-2 font-semibold text-sm bg-gray-50">
                          {daySchedule.day}
                        </td>
                        {daySchedule.periods.map((period, periodIndex) => (
                          <td
                            key={periodIndex}
                            className={`border border-gray-300 p-2 ${getPeriodColor(period.periodType)}`}
                          >
                            {isAdmin ? (
                              <div className="space-y-1">
                                <select
                                  value={period.subject?._id || period.subject || ''}
                                  onChange={(e) =>
                                    handlePeriodChange(dayIndex, periodIndex, 'subject', e.target.value)
                                  }
                                  className="w-full text-xs border-gray-300 rounded-md"
                                >
                                  <option value="">Select Subject</option>
                                  {subjects.map((subj) => (
                                    <option key={subj._id} value={subj._id}>
                                      {subj.subjectName}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={period.teacher?._id || period.teacher || ''}
                                  onChange={(e) =>
                                    handlePeriodChange(dayIndex, periodIndex, 'teacher', e.target.value)
                                  }
                                  className="w-full text-xs border-gray-300 rounded-md"
                                >
                                  <option value="">Select Teacher</option>
                                  {teachers.map((teacher) => (
                                    <option key={teacher._id} value={teacher._id}>
                                      {teacher.firstName} {teacher.lastName}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={period.roomNumber || ''}
                                  onChange={(e) =>
                                    handlePeriodChange(dayIndex, periodIndex, 'roomNumber', e.target.value)
                                  }
                                  placeholder="Room"
                                  className="w-full text-xs border-gray-300 rounded-md"
                                />
                              </div>
                            ) : (
                              <div className="text-xs space-y-1">
                                <div className="font-semibold text-gray-900">
                                  {period.subject?.subjectName || 'N/A'}
                                </div>
                                <div className="text-gray-600">
                                  {period.teacher
                                    ? `${period.teacher.firstName} ${period.teacher.lastName}`
                                    : 'N/A'}
                                </div>
                                {period.roomNumber && (
                                  <div className="text-gray-500">Room: {period.roomNumber}</div>
                                )}
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="mt-6 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-50 border border-blue-200 mr-2"></div>
                  <span>Lecture</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-50 border border-purple-200 mr-2"></div>
                  <span>Lab</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 mr-2"></div>
                  <span>Break</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-50 border border-green-200 mr-2"></div>
                  <span>Sports</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <CalendarIcon className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Timetable Found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {selectedClass
                ? 'Create a timetable for this class to get started.'
                : 'Please select a class to view or create a timetable.'}
            </p>
            {isAdmin && selectedClass && (
              <Button icon={PlusIcon} onClick={handleCreateTimetable} className="mt-6">
                Create Timetable
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Timetable;

