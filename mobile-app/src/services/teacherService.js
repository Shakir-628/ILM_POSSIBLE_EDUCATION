// Teacher services for mobile app
import api from './api';

export const teacherService = {
  // Admin: Get all teachers
  getAllTeachers: async (params = {}) => {
    const response = await api.get('/teachers', { params });
    return response.data;
  },

  // Admin: Get teacher by ID
  getTeacherById: async (id) => {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  // Get teacher dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/teacher/dashboard-stats');
    return response.data;
  },

  // Get teacher's classes
  getMyClasses: async () => {
    const response = await api.get('/teacher/my-classes');
    return response.data;
  },

  // Get today's schedule
  getTodaySchedule: async () => {
    const response = await api.get('/teacher/today-schedule');
    return response.data;
  },

  // Get students in a class
  getClassStudents: async (classId) => {
    const response = await api.get(`/teacher/class/${classId}/students`);
    return response.data;
  },

  // Mark attendance
  markAttendance: async (attendanceData) => {
    const response = await api.post('/attendance', attendanceData);
    return response.data;
  },

  // Get pending assignments to grade
  getPendingGrading: async () => {
    const response = await api.get('/teacher/pending-grading');
    return response.data;
  },

  // Submit grades
  submitGrade: async (gradeData) => {
    const response = await api.post('/grades', gradeData);
    return response.data;
  },
};

