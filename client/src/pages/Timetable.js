import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Select from '../components/Select';
import Modal from '../components/Modal';
import Input from '../components/Input';
import {
  PlusIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
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
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  // loading indicates when the timetable fetch is in progress.
  // Default to false so the page doesn't show a perpetual spinner before a class is selected.
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [currentTimetable, setCurrentTimetable] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    { label: '08:00 - 08:45', value: '08:00' },
    { label: '08:45 - 09:30', value: '08:45' },
    { label: '09:30 - 10:15', value: '09:30' },
    { label: '10:15 - 10:30', value: 'break', isBreak: true },
    { label: '10:30 - 11:15', value: '10:30' },
    { label: '11:15 - 12:00', value: '11:15' },
    { label: '12:00 - 12:45', value: '12:00' },
    { label: '12:45 - 13:00', value: 'lunch', isBreak: true },
    { label: '13:00 - 13:45', value: '13:00' },
    { label: '13:45 - 14:30', value: '13:45' },
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
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const data = await classService.getAllClasses();
      setClasses(data);
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
    if (!selectedClass) return;
    
    setLoading(true);
    try {
      const response = await timetableService.getTimetableByClass(selectedClass);
      if (response.data) {
        setCurrentTimetable(response.data);
      } else {
        setCurrentTimetable(null);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setCurrentTimetable(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTimetable = async () => {
    if (!selectedClass) {
      toast.warning('Please select a class first');
      return;
    }

    try {
      // Define time slots with start and end times
      const actualTimeSlots = [
        { start: '08:00', end: '08:45' },
        { start: '08:45', end: '09:30' },
        { start: '09:30', end: '10:15' },
        { start: '10:30', end: '11:15' },
        { start: '11:15', end: '12:00' },
        { start: '12:00', end: '12:45' },
        { start: '13:00', end: '13:45' },
        { start: '13:45', end: '14:30' },
      ];

      const emptySchedule = daysOfWeek.map((day) => ({
        day,
        periods: actualTimeSlots.map((slot, index) => ({
          periodNumber: index + 1,
          startTime: slot.start,
          endTime: slot.end,
          subject: null,
          teacher: null,
          roomNumber: '',
          periodType: 'lecture',
        })),
      }));

      const emptyTimetable = {
        class: selectedClass,
        academicYear: new Date().getFullYear().toString(),
        term: '1st',
        schedule: emptySchedule,
        breaks: [
          {
            name: 'Short Break',
            startTime: '10:15',
            endTime: '10:30',
            duration: 15,
          },
          {
            name: 'Lunch Break',
            startTime: '12:45',
            endTime: '13:00',
            duration: 15,
          },
        ],
      };

      const response = await timetableService.createTimetable(emptyTimetable);
      setCurrentTimetable(response.data);
      toast.success('Timetable created successfully');
    } catch (error) {
      console.error('Error creating timetable:', error);
      toast.error(error.response?.data?.message || 'Error creating timetable');
    }
  };

  const handleSaveTimetable = async () => {
    if (!currentTimetable) return;

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
    /* eslint-disable-next-line */
    if (typeof globalThis !== 'undefined' && globalThis.confirm('Are you sure you want to delete this timetable?')) {
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

  const handlePeriodClick = (dayIndex, periodIndex) => {
    if (!isAdmin) return;
    
    const period = currentTimetable.schedule[dayIndex].periods[periodIndex];
    setEditingPeriod({
      dayIndex,
      periodIndex,
      ...period,
    });
    setIsEditModalOpen(true);
  };

  const handleSavePeriod = () => {
    if (!editingPeriod) return;

    const updatedSchedule = [...currentTimetable.schedule];
    const currentPeriod = updatedSchedule[editingPeriod.dayIndex].periods[editingPeriod.periodIndex];
    
    // Update period while maintaining required fields
    updatedSchedule[editingPeriod.dayIndex].periods[editingPeriod.periodIndex] = {
      ...currentPeriod,
      subject: editingPeriod.subject || null,
      teacher: editingPeriod.teacher || null,
      roomNumber: editingPeriod.roomNumber || editingPeriod.room || '',
      periodType: 'lecture',
    };

    setCurrentTimetable({
      ...currentTimetable,
      schedule: updatedSchedule,
    });

    setIsEditModalOpen(false);
    setEditingPeriod(null);
  };

  const getPeriodColor = (period) => {
    if (!period.subject) return 'bg-gray-50 border-gray-200';
    
    const colors = [
      'bg-blue-50 border-blue-300',
      'bg-green-50 border-green-300',
      'bg-purple-50 border-purple-300',
      'bg-pink-50 border-pink-300',
      'bg-yellow-50 border-yellow-300',
      'bg-indigo-50 border-indigo-300',
    ];
    
    // Get subject ID whether it's an object or string
    const subjectId = typeof period.subject === 'object' ? period.subject._id : period.subject;
    
    // Simple hash to get consistent color for same subject
    const hash = subjectId ? subjectId.toString().codePointAt(0) % colors.length : 0;
    return colors[hash];
  };

  const getSubjectName = (subjectData) => {
    // Handle both cases: when subject is an object (from backend) or just an ID (from local state)
    if (!subjectData) return '';
    
    // If it's already an object with subjectName, return it
    if (typeof subjectData === 'object' && subjectData.subjectName) {
      return subjectData.subjectName;
    }
    
    // Otherwise, look it up by ID
    const subjectId = typeof subjectData === 'object' ? subjectData._id : subjectData;
    const subject = subjects.find(s => s._id === subjectId);
    return subject ? subject.subjectName : '';
  };

  const getTeacherName = (teacherData) => {
    // Handle both cases: when teacher is an object (from backend) or just an ID (from local state)
    if (!teacherData) return '';
    
    // If it's already an object with firstName, return the full name
    if (typeof teacherData === 'object' && teacherData.firstName) {
      return `${teacherData.firstName} ${teacherData.lastName}`;
    }
    
    // Otherwise, look it up by ID
    const teacherId = typeof teacherData === 'object' ? teacherData._id : teacherData;
    const teacher = teachers.find(t => t._id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : '';
  };

  const handleExportExcel = async () => {
    if (!currentTimetable?._id) {
      toast.warning('No timetable to export');
      return;
    }

    try {
      toast.info('Generating Excel file...');
      await timetableService.exportToExcel(currentTimetable._id);
      toast.success('Timetable exported to Excel successfully!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export timetable to Excel');
    }
  };

  const handleExportPDF = async () => {
    if (!currentTimetable?._id) {
      toast.warning('No timetable to export');
      return;
    }

    try {
      toast.info('Generating PDF file...');
      await timetableService.exportToPDF(currentTimetable._id);
      toast.success('Timetable exported to PDF successfully!');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export timetable to PDF');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <CalendarDaysIcon className="h-8 w-8 mr-2 text-primary-600" />
              Weekly Timetable
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage class schedules with visual weekly grid
            </p>
          </div>
          {currentTimetable && (
            <div className="flex space-x-2">
              {/* Export Buttons */}
              <Button 
                onClick={handleExportExcel} 
                variant="outline"
                icon={ArrowDownTrayIcon}
                className="shadow-sm hover:shadow-md"
              >
                Export Excel
              </Button>
              <Button 
                onClick={handleExportPDF} 
                variant="primary"
                icon={DocumentTextIcon}
                className="shadow-sm"
              >
                Export PDF
              </Button>
              
              {/* Admin Actions */}
              {isAdmin && (
                <>
                  <Button onClick={handleSaveTimetable} icon={ClockIcon}>
                    Save Changes
                  </Button>
                  <Button onClick={handleDeleteTimetable} variant="outline">
                    Delete
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Class Selection */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <Select
              label="Select Class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              options={[
                { value: '', label: 'Choose a class...' },
                ...classes.map((cls) => ({
                  value: cls._id,
                  label: `${cls.className} - ${cls.grade} (${cls.section || ''})`,
                })),
              ]}
            />
            {isAdmin && selectedClass && !currentTimetable && (
              <Button onClick={handleCreateTimetable} icon={PlusIcon}>
                Create Timetable
              </Button>
            )}
          </div>
        </div>

        {/* Timetable Grid */}
        {loading && (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading timetable...</p>
          </div>
        )}

        {!loading && currentTimetable && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Legend */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-4 text-white">
              <h2 className="text-lg font-semibold flex items-center">
                <CalendarDaysIcon className="h-6 w-6 mr-2" />
                {classes.find(c => c._id === selectedClass)?.className || 'Class'} - Weekly Schedule
              </h2>
              <p className="text-sm text-primary-100 mt-1">Click on any period to edit</p>
            </div>

            {/* Timetable Grid */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-32">
                      Time
                    </th>
                    {daysOfWeek.map((day) => (
                      <th key={day} className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot, slotIndex) => {
                    if (timeSlot.isBreak) {
                      return (
                        <tr key={`${timeSlot.value ?? 'break'}-${slotIndex}`} className="bg-yellow-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-700 border-r">
                            {timeSlot.label}
                          </td>
                          <td colSpan={6} className="px-4 py-3 text-center text-sm font-medium text-yellow-800">
                            {timeSlot.value === 'break' ? '☕ BREAK' : '🍽️ LUNCH BREAK'}
                          </td>
                        </tr>
                      );
                    }

                    const actualPeriodIndex = timeSlots.slice(0, slotIndex).filter(ts => !ts.isBreak).length;

                    return (
                      <tr key={`${timeSlot.value ?? 'slot'}-${slotIndex}`} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-sm font-medium text-gray-700 border-r bg-gray-50">
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
                            {timeSlot.label}
                          </div>
                        </td>
                        {daysOfWeek.map((day, dayIndex) => {
                          const period = currentTimetable.schedule[dayIndex]?.periods[actualPeriodIndex];
                          
                          return (
                            <td
                              key={day}
                              onClick={() => isAdmin && handlePeriodClick(dayIndex, actualPeriodIndex)}
                              className={`px-3 py-4 text-sm border-r cursor-pointer transition-all duration-200 hover:shadow-inner ${
                                period?.subject ? getPeriodColor(period) : 'bg-white hover:bg-gray-50'
                              } ${isAdmin ? 'hover:scale-105' : ''}`}
                            >
                              {period?.subject ? (
                                <div className="text-center">
                                  <div className="font-semibold text-gray-900 mb-1">
                                    {getSubjectName(period.subject)}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {getTeacherName(period.teacher)}
                                  </div>
                                  {(period.roomNumber || period.room) && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      📍 Room {period.roomNumber || period.room}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center text-gray-400 text-xs">
                                  {isAdmin ? '+ Add' : '-'}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 text-sm text-gray-600 flex justify-between items-center">
              <div className="flex space-x-4">
                <span className="flex items-center">
                  <span className="w-3 h-3 bg-blue-200 rounded mr-2" />
                  <span>Lecture Period</span>
                </span>
                <span className="flex items-center">
                  <span className="w-3 h-3 bg-yellow-200 rounded mr-2" />
                  <span>Break</span>
                </span>
              </div>
              <div className="text-xs">
                Academic Year: {currentTimetable.academicYear}
              </div>
            </div>
          </div>
        )}

        {!loading && !currentTimetable && selectedClass && (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <CalendarDaysIcon className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Timetable Found</h3>
            <p className="text-gray-500 mb-6">Create a timetable for this class to get started</p>
            {isAdmin && (
              <Button onClick={handleCreateTimetable} icon={PlusIcon}>
                Create Timetable
              </Button>
            )}
          </div>
        )}

        {!loading && !currentTimetable && !selectedClass && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 shadow rounded-lg p-12 text-center">
            <CalendarDaysIcon className="h-24 w-24 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Timetable Management</h3>
            <p className="text-gray-600 mb-4">Select a class above to view or create its weekly schedule</p>
          </div>
        )}

        {/* Edit Period Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingPeriod(null);
          }}
          title="Edit Period"
        >
          {editingPeriod && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>{daysOfWeek[editingPeriod.dayIndex]}</strong> - Period {editingPeriod.periodIndex + 1}
                </p>
              </div>

              <Select
                label="Subject"
                value={editingPeriod.subject || ''}
                onChange={(e) => setEditingPeriod({ ...editingPeriod, subject: e.target.value || null })}
                options={[
                  { value: '', label: 'No Subject (Free Period)' },
                  ...subjects.map((subj) => ({
                    value: subj._id,
                    label: `${subj.subjectName} (${subj.subjectCode})`,
                  })),
                ]}
              />

              {editingPeriod.subject && (
                <>
                  <Select
                    label="Teacher"
                    value={editingPeriod.teacher || ''}
                    onChange={(e) => setEditingPeriod({ ...editingPeriod, teacher: e.target.value || null })}
                    options={[
                      { value: '', label: 'Select Teacher' },
                      ...teachers.map((teacher) => ({
                        value: teacher._id,
                        label: `${teacher.firstName} ${teacher.lastName}`,
                      })),
                    ]}
                  />

                  <Input
                    label="Room Number (Optional)"
                    value={editingPeriod.roomNumber || editingPeriod.room || ''}
                    onChange={(e) => setEditingPeriod({ ...editingPeriod, roomNumber: e.target.value })}
                    placeholder="e.g., A-101"
                  />
                </>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePeriod}>
                  Save Period
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default Timetable;
