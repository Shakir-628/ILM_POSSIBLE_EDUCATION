import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Select from '../components/Select';
import { attendanceService } from '../services/attendanceService';
import { useToast } from '../context/ToastContext';
import { studentService } from '../services/studentService';
import { classService } from '../services/classService';

const Attendance = () => {
  const toast = useToast();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editingStatus, setEditingStatus] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const data = await classService.getAllClasses();
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await studentService.getStudentsByClass(selectedClass);
      setStudents(data || []);

      const initialAttendance = (data || []).map((student) => ({
        studentId: student._id,
        name: `${student.firstName} ${student.lastName}`,
        status: 'present',
        isMarked: false,
      }));

      if (attendanceDate) {
        try {
          const existingAttendance = await attendanceService.getAllAttendance({
            classId: selectedClass,
            date: attendanceDate,
          });

          console.log('Raw API response:', existingAttendance);

          const attendanceMap = new Map();
          if (existingAttendance && existingAttendance.length > 0) {
            existingAttendance.forEach((record) => {
              console.log('Processing record:', record);
              // Try different field names for student ID
              const studentId = record.studentId || record.student?._id || record.student?.id || record.student;
              console.log('Extracted studentId:', studentId);
              if (studentId) {
                attendanceMap.set(studentId, record);
              }
            });
          }

          console.log('Attendance map:', Array.from(attendanceMap.entries()));

          const merged = initialAttendance.map((item) => {
            const existing = attendanceMap.get(item.studentId);
            if (existing) {
              console.log('Found existing attendance for:', item.name, existing);
              return {
                ...item,
                status: existing.status,
                isMarked: true,
                attendanceId: existing._id || existing.id,
                updatedAt: existing.updatedAt,
              };
            }
            return item;
          });

          console.log('Final merged attendance:', merged);
          setAttendanceData(merged);
        } catch (err) {
          console.error('Error checking existing attendance (fetchStudents):', err);
          setAttendanceData(initialAttendance);
        }
      } else {
        setAttendanceData(initialAttendance);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const checkExistingAttendance = async () => {
    if (!selectedClass || !attendanceDate) return;

    try {
      const existingAttendance = await attendanceService.getAllAttendance({
        classId: selectedClass,
        date: attendanceDate,
      });

      const attendanceMap = new Map();
      if (existingAttendance && existingAttendance.length > 0) {
        console.log('checkExistingAttendance - Found records:', existingAttendance);
        existingAttendance.forEach((record) => {
          attendanceMap.set(record.studentId, record);
        });
      }

      const rebuilt = (students || []).map((student) => {
        const existingRecord = attendanceMap.get(student._id);
        if (existingRecord) {
          return {
            studentId: student._id,
            name: `${student.firstName} ${student.lastName}`,
            status: existingRecord.status,
            isMarked: true,
            attendanceId: existingRecord._id || existingRecord.id,
            updatedAt: existingRecord.updatedAt,
          };
        }

        return {
          studentId: student._id,
          name: `${student.firstName} ${student.lastName}`,
          status: 'present',
          isMarked: false,
        };
      });

      setAttendanceData(rebuilt);
    } catch (error) {
      console.error('Error checking existing attendance:', error);
    }
  };
  
  // Check for existing attendance when date or class changes
  useEffect(() => {
    if (selectedClass && attendanceDate) {
      checkExistingAttendance();
    }
  }, [selectedClass, attendanceDate, students]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceData((prev) =>
      prev.map((item) =>
        item.studentId === studentId ? { ...item, status } : item
      )
    );
  };

  const handleStartEdit = (item) => {
    setEditingStudentId(item.studentId);
    setEditingStatus(item.status);
  };

  const handleCancelEdit = () => {
    setEditingStudentId(null);
    setEditingStatus('');
    // Revert any local changes by reloading existing attendance
    checkExistingAttendance();
  };

  const handleSaveEdit = async (item) => {
    if (!item.attendanceId) {
      // No attendanceId means record doesn't exist on server; fallback to marking normally
      setAttendanceData((prev) => prev.map(it => it.studentId === item.studentId ? { ...it, status: editingStatus, isMarked: false } : it));
      setEditingStudentId(null);
      setEditingStatus('');
      return;
    }

    try {
      setIsMarking(true);
      console.log('Saving attendance update:', item.attendanceId, editingStatus);
      await attendanceService.updateAttendance(item.attendanceId, { status: editingStatus });
      
      // Directly update the state with the new status
      setAttendanceData((prev) =>
        prev.map((record) => {
          if (record.studentId === item.studentId) {
            console.log('Updated attendance for:', item.name, 'New status:', editingStatus);
            return {
              ...record,
              status: editingStatus,
              isMarked: true,
              updatedAt: new Date().toISOString(),
            };
          }
          return record;
        })
      );
      
      toast.success('Attendance updated');
    } catch (err) {
      console.error('Error updating attendance:', err);
      toast.error('Failed to update attendance');
    } finally {
      setIsMarking(false);
      setEditingStudentId(null);
      setEditingStatus('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsMarking(true);

    try {
      const bulkData = {
        classId: selectedClass,
        date: attendanceDate,
        attendanceRecords: attendanceData
          .filter(item => !item.isMarked) // Only include unmarked records
          .map((item) => ({
            studentId: item.studentId,
            status: item.status,
          })),
      };

      if (bulkData.attendanceRecords.length === 0) {
        toast.info('Attendance already marked for all students');
        return;
      }

      // Submit the attendance
      await attendanceService.bulkMarkAttendance(bulkData);
      toast.success('Attendance marked successfully!');
      
      // Refresh the attendance data from the database to get the latest status
      await checkExistingAttendance();
      
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error(error.response?.data?.message || 'Error marking attendance');
    } finally {
      setLoading(false);
      setIsMarking(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Select Class"
                name="classId"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                required
                options={classes.map((cls) => ({
                  value: cls._id,
                  label: cls.className,
                }))}
              />

              <div>
                <label htmlFor="attendanceDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="attendanceDate"
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            {students.length > 0 && (
              <>
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Mark Attendance ({students.length} students)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {attendanceData.map((item) => (
                          <tr key={item.studentId}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.isMarked && item.updatedAt && (
                                <div className="text-xs text-gray-500 mb-1">
                                  Last updated: {new Date(item.updatedAt).toLocaleString()}
                                </div>
                              )}
                              <div className="flex space-x-4">
                                {['present', 'absent', 'late', 'excused'].map((status) => {
                                  const currentStatus = editingStudentId === item.studentId ? editingStatus : item.status;
                                  const isCurrentStatus = currentStatus === status;
                                  const isMarked = item.isMarked && isCurrentStatus && editingStudentId !== item.studentId;
                                  const disabledInput = item.isMarked && editingStudentId !== item.studentId;
                                  
                                  return (
                                    <label 
                                      key={status} 
                                      className={`inline-flex items-center ${isMarked ? 'opacity-100' : ''} ${!isMarked && item.isMarked ? 'opacity-50' : ''}`}
                                    >
                                      <input
                                        type="radio"
                                        name={`status-${item.studentId}`}
                                        value={status}
                                        checked={isCurrentStatus}
                                        onChange={() => {
                                          if (editingStudentId === item.studentId) setEditingStatus(status);
                                          else handleStatusChange(item.studentId, status);
                                        }}
                                        disabled={disabledInput}
                                        className={`h-4 w-4 ${isMarked ? 'text-green-500' : 'text-primary-600'} focus:ring-primary-500 border-gray-300`}
                                      />
                                      <span className={`ml-2 text-sm ${isMarked ? 'text-green-700 font-medium' : 'text-gray-700'} capitalize`}>
                                        {status} {isMarked && '(Marked)'}
                                      </span>
                                    </label>
                                  );
                                })}
                                {/* Edit controls for marked attendance */}
                                {item.isMarked && editingStudentId !== item.studentId && (
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(item)}
                                    className="ml-2 text-xs text-blue-600 hover:underline"
                                  >
                                    Edit
                                  </button>
                                )}
                                {editingStudentId === item.studentId && (
                                  <div className="ml-2 flex items-center space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEdit(item)}
                                      className="text-xs text-green-600 hover:underline"
                                    >
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleCancelEdit}
                                      className="text-xs text-gray-600 hover:underline"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="flex items-center space-x-4">
                    {isMarking && (
                      <span className="text-sm text-green-600">Saving changes...</span>
                    )}
                    <Button 
                      type="submit" 
                      disabled={loading || attendanceData.every(item => item.isMarked)}
                    >
                      {loading ? 'Submitting...' : 'Mark Attendance'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Attendance Statistics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Attendance Statistics
          </h3>
          <p className="text-sm text-gray-500">
            Select a class and date to view attendance statistics.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Attendance;

