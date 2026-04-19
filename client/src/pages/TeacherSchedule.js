import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { timetableService } from '../services/timetableService';
import { teacherService } from '../services/teacherService';
import {
    CalendarIcon,
    ClockIcon,
    UserIcon,
    MapPinIcon,
    AcademicCapIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

const TeacherSchedule = () => {
    const { user, isTeacher, isAdmin } = useAuth();
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [allTeachers, setAllTeachers] = useState([]);
    const [currentDay, setCurrentDay] = useState('');

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const fetchTeacherProfile = useCallback(async () => {
        if (isTeacher) {
            try {
                const profile = await teacherService.getMyProfile();
                setSelectedTeacher(profile);
            } catch (error) {
                console.error('Error fetching teacher profile:', error);
            }
        }
    }, [isTeacher]);

    const fetchAllTeachers = useCallback(async () => {
        if (isAdmin) {
            try {
                const data = await teacherService.getAllTeachers();
                setAllTeachers(data || []);
            } catch (error) {
                console.error('Error fetching all teachers:', error);
            }
        }
    }, [isAdmin]);

    const fetchSchedule = useCallback(async (teacherId) => {
        if (!teacherId) return;
        try {
            setLoading(true);
            const response = await timetableService.getTeacherSchedule(teacherId);
            setSchedule(response.data || []);
        } catch (error) {
            console.error('Error fetching schedule:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Set current day of week
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        if (days.includes(today)) {
            setCurrentDay(today);
        } else {
            setCurrentDay('Monday'); // Default
        }

        if (isTeacher) {
            fetchTeacherProfile();
        } else if (isAdmin) {
            fetchAllTeachers();
        }
    }, [isTeacher, isAdmin, fetchTeacherProfile, fetchAllTeachers]);

    useEffect(() => {
        if (selectedTeacher) {
            fetchSchedule(selectedTeacher._id);
        }
    }, [selectedTeacher, fetchSchedule]);

    const filteredSchedule = schedule.filter(item => item.day === currentDay);

    const handleTeacherChange = (e) => {
        const teacher = allTeachers.find(t => t._id === e.target.value);
        setSelectedTeacher(teacher);
    };

    const nextDay = () => {
        const currentIndex = days.indexOf(currentDay);
        const nextIndex = (currentIndex + 1) % days.length;
        setCurrentDay(days[nextIndex]);
    };

    const prevDay = () => {
        const currentIndex = days.indexOf(currentDay);
        const prevIndex = (currentIndex - 1 + days.length) % days.length;
        setCurrentDay(days[prevIndex]);
    };

    return (
        <Layout>
            <div className="space-y-6 max-w-5xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <CalendarIcon className="h-7 w-7 text-primary-600" />
                            Daily Class Schedule
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            View and manage your daily teaching commitments
                        </p>
                    </div>

                    {isAdmin && (
                        <div className="w-full md:w-64">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Select Teacher</label>
                            <select
                                onChange={handleTeacherChange}
                                className="w-full p-2.5 bg-gray-50 dark:bg-dark-700 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-medium text-gray-700 dark:text-gray-200"
                                value={selectedTeacher?._id || ''}
                            >
                                <option value="">Select a teacher...</option>
                                {allTeachers.map(t => (
                                    <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Day Navigation */}
                <div className="flex items-center justify-between bg-primary-600 text-white p-4 rounded-2xl shadow-lg">
                    <button onClick={prevDay} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <div className="text-center">
                        <h2 className="text-xl font-bold uppercase tracking-widest">{currentDay}</h2>
                        <p className="text-xs text-primary-100 font-medium">Daily Schedule View</p>
                    </div>
                    <button onClick={nextDay} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <ChevronRightIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Schedule List */}
                <div className="space-y-4">
                    {loading && selectedTeacher ? (
                        <div className="flex flex-col items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                            <p className="mt-4 text-gray-500 font-medium">Loading your classes...</p>
                        </div>
                    ) : !selectedTeacher ? (
                        <div className="bg-white dark:bg-dark-800 p-12 text-center rounded-2xl border border-dashed border-gray-300 dark:border-dark-600">
                            <UserIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Teacher Profile Required</h3>
                            <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2">Please select a teacher or ensure your teacher profile is correctly configured.</p>
                        </div>
                    ) : filteredSchedule.length === 0 ? (
                        <div className="bg-white dark:bg-dark-800 p-12 text-center rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700">
                            <AcademicCapIcon className="h-16 w-16 mx-auto text-primary-100 mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Classes Scheduled</h3>
                            <p className="text-gray-500 text-sm mt-2">Enjoy your free time! You have no classes scheduled for {currentDay}.</p>
                        </div>
                    ) : (
                        filteredSchedule.map((item, idx) => (
                            <div key={item.id} className="group relative bg-white dark:bg-dark-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700 hover:shadow-md transition-all hover:border-primary-200">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl text-primary-700 dark:text-primary-400">
                                            <p className="text-xs font-black uppercase mb-1">Period</p>
                                            <p className="text-2xl font-black">{item.periodNumber}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                                {item.subject?.subjectName || 'Subject Not Set'}
                                            </h3>
                                            <div className="flex flex-wrap gap-3 mt-2">
                                                <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-dark-700 px-2.5 py-1 rounded-lg">
                                                    <AcademicCapIcon className="h-4 w-4" />
                                                    {item.class?.className} ({item.class?.grade})
                                                </span>
                                                <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-dark-700 px-2.5 py-1 rounded-lg">
                                                    <MapPinIcon className="h-4 w-4" />
                                                    Room: {item.roomNumber || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 bg-gray-50 dark:bg-dark-900/50 p-4 rounded-2xl border border-gray-100 dark:border-dark-700 self-start md:self-auto">
                                        <ClockIcon className="h-6 w-6 text-primary-500" />
                                        <div>
                                            <p className="text-lg font-black text-gray-900 dark:text-white">{item.startTime} - {item.endTime}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Class Duration</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default TeacherSchedule;
