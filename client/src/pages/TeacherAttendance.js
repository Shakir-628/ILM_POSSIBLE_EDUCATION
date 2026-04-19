import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import SearchBar from '../components/SearchBar';
import { teacherService } from '../services/teacherService';
import { teacherAttendanceService } from '../services/teacherAttendanceService';
import { useToast } from '../context/ToastContext';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  CalendarIcon,
  UserGroupIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const TeacherAttendance = () => {
    const toast = useToast();
    const [teachers, setTeachers] = useState([]);
    const [attendanceDate, setAttendanceDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const data = await teacherService.getAllTeachers();
            setTeachers(data || []);
        } catch (error) {
            console.error('Error fetching teachers:', error);
            toast.error('Failed to load teachers');
        } finally {
            setLoading(false);
        }
    };

    const fetchExistingAttendance = useCallback(async () => {
        if (!attendanceDate) return;
        try {
            setLoading(true);
            const response = await teacherAttendanceService.getAttendance({ date: attendanceDate });
            
            const attendanceMap = new Map();
            if (response && response.length > 0) {
                response.forEach((record) => {
                    const tId = record.teacher?._id || record.teacher;
                    if (tId) attendanceMap.set(tId.toString(), record);
                });
            }

            const rebuilt = teachers.map((teacher) => {
                const teacherIdStr = teacher._id.toString();
                const existingRecord = attendanceMap.get(teacherIdStr);

                if (existingRecord) {
                    return {
                        teacherId: teacher._id,
                        name: `${teacher.firstName} ${teacher.lastName}`,
                        employeeId: teacher.teacherId,
                        status: existingRecord.status,
                        checkIn: existingRecord.checkIn || '',
                        checkOut: existingRecord.checkOut || '',
                        remarks: existingRecord.remarks || '',
                        isMarked: true,
                        attendanceId: existingRecord._id
                    };
                }

                return {
                    teacherId: teacher._id,
                    name: `${teacher.firstName} ${teacher.lastName}`,
                    employeeId: teacher.teacherId,
                    status: 'present',
                    checkIn: '08:00',
                    checkOut: '14:30',
                    remarks: '',
                    isMarked: false,
                };
            });

            setAttendanceData(rebuilt);
        } catch (error) {
            console.error('Error fetching existing attendance:', error);
        } finally {
            setLoading(false);
        }
    }, [attendanceDate, teachers, toast]);

    useEffect(() => {
        fetchTeachers();
    }, []);

    useEffect(() => {
        if (teachers.length > 0) {
            fetchExistingAttendance();
        }
    }, [teachers, attendanceDate, fetchExistingAttendance]);

    const handleStatusChange = (teacherId, status) => {
        setAttendanceData((prev) =>
            prev.map((item) =>
                item.teacherId === teacherId ? { ...item, status } : item
            )
        );
    };

    const handleInputChange = (teacherId, field, value) => {
        setAttendanceData((prev) =>
            prev.map((item) =>
                item.teacherId === teacherId ? { ...item, [field]: value } : item
            )
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const payload = {
                date: attendanceDate,
                attendanceRecords: attendanceData.map(item => ({
                    teacherId: item.teacherId,
                    status: item.status,
                    checkIn: item.checkIn,
                    checkOut: item.checkOut,
                    remarks: item.remarks
                }))
            };

            await teacherAttendanceService.markAttendance(payload);
            toast.success('Attendance saved successfully');
            fetchExistingAttendance();
        } catch (error) {
            console.error('Error saving attendance:', error);
            toast.error(error.response?.data?.message || 'Failed to save attendance');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                            Teacher Attendance
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
                            Daily staff attendance management and tracking
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                         <div className="relative">
                            <CalendarIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                value={attendanceDate}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-700 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-semibold text-gray-700 dark:text-gray-200"
                            />
                         </div>
                         <Button onClick={handleSubmit} loading={isSaving}>
                             Save All Records
                         </Button>
                    </div>
                </div>

                {/* Search and Filters Bar */}
                <div className="bg-white dark:bg-dark-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700">
                    <div className="max-w-md">
                        <SearchBar 
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onClear={() => setSearchTerm('')}
                            placeholder="Search teacher by name or ID..."
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-gray-100 dark:border-dark-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
                            <thead className="bg-gray-50 dark:bg-dark-900">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Teacher</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Check In/Out</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-100 dark:divide-dark-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-4"></div>
                                                <span className="font-medium">Loading teacher records...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : attendanceData.filter(item => 
                                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    item.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
                                ).length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            <MagnifyingGlassIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                            <p className="font-medium text-lg text-gray-400">No results matching "{searchTerm}"</p>
                                        </td>
                                    </tr>
                                ) : (
                                    attendanceData
                                        .filter(item => 
                                            item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                            item.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map((item) => (
                                        <tr key={item.teacherId} className="hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold">
                                                        {item.name.charAt(0)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</div>
                                                        <div className="text-xs text-gray-500 font-medium">ID: {item.employeeId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center space-x-2">
                                                    {[
                                                        { val: 'present', icon: CheckCircleIcon, color: 'text-green-500', bg: 'bg-green-50' },
                                                        { val: 'absent', icon: XCircleIcon, color: 'text-red-500', bg: 'bg-red-50' },
                                                        { val: 'late', icon: ClockIcon, color: 'text-yellow-500', bg: 'bg-yellow-50' },
                                                        { val: 'on-leave', icon: CalendarIcon, color: 'text-blue-500', bg: 'bg-blue-50' }
                                                    ].map((btn) => (
                                                        <button
                                                            key={btn.val}
                                                            onClick={() => handleStatusChange(item.teacherId, btn.val)}
                                                            className={`p-2 rounded-xl border transition-all duration-200 flex flex-col items-center min-w-[64px] ${
                                                                item.status === btn.val 
                                                                ? `${btn.bg} border-${btn.color.split('-')[1]}-500 shadow-sm scale-105` 
                                                                : 'bg-white dark:bg-dark-700 border-gray-200 dark:border-dark-600 opacity-60 hover:opacity-100'
                                                            }`}
                                                            title={btn.val.charAt(0).toUpperCase() + btn.val.slice(1)}
                                                        >
                                                            <btn.icon className={`h-5 w-5 ${item.status === btn.val ? btn.color : 'text-gray-400'}`} />
                                                            <span className={`text-[10px] mt-1 font-bold uppercase ${item.status === btn.val ? btn.color : 'text-gray-400'}`}>
                                                                {btn.val.split('-')[0]}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-center space-y-2">
                                                    <div className="flex items-center space-x-1">
                                                        <span className="text-[10px] uppercase font-bold text-gray-400 w-8">In:</span>
                                                        <input
                                                            type="time"
                                                            value={item.checkIn}
                                                            onChange={(e) => handleInputChange(item.teacherId, 'checkIn', e.target.value)}
                                                            className="text-xs p-1 border border-gray-200 dark:border-dark-600 rounded bg-gray-50 dark:bg-dark-700 dark:text-white"
                                                            disabled={item.status === 'absent'}
                                                        />
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <span className="text-[10px] uppercase font-bold text-gray-400 w-8">Out:</span>
                                                        <input
                                                            type="time"
                                                            value={item.checkOut}
                                                            onChange={(e) => handleInputChange(item.teacherId, 'checkOut', e.target.value)}
                                                            className="text-xs p-1 border border-gray-200 dark:border-dark-600 rounded bg-gray-50 dark:bg-dark-700 dark:text-white"
                                                            disabled={item.status === 'absent'}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <textarea
                                                    value={item.remarks}
                                                    onChange={(e) => handleInputChange(item.teacherId, 'remarks', e.target.value)}
                                                    className="w-full text-xs p-2 border border-gray-200 dark:border-dark-600 rounded-xl bg-gray-50 dark:bg-dark-700 dark:text-white h-12 focus:ring-1 focus:ring-primary-500"
                                                    placeholder="Add remarks..."
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Stats Summary */}
                    <div className="bg-gray-50 dark:bg-dark-900/50 p-6 flex flex-wrap gap-6 justify-center md:justify-end border-t border-gray-100 dark:border-dark-700">
                         <div className="flex items-center space-x-2">
                             <div className="h-3 w-3 rounded-full bg-green-500"></div>
                             <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Present (Full): {attendanceData.filter(i => i.status === 'present').length}</span>
                         </div>
                         <div className="flex items-center space-x-2">
                             <div className="h-3 w-3 rounded-full bg-red-500"></div>
                             <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Absent: {attendanceData.filter(i => i.status === 'absent').length}</span>
                         </div>
                         <div className="flex items-center space-x-2">
                             <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                             <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Late: {attendanceData.filter(i => i.status === 'late').length}</span>
                         </div>
                         <div className="flex items-center space-x-2">
                             <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                             <span className="text-sm font-bold text-gray-600 dark:text-gray-400">On Leave: {attendanceData.filter(i => i.status === 'on-leave').length}</span>
                         </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default TeacherAttendance;
