// Parent services for mobile app
import api from './api';

export const parentService = {
  // Admin: Get all parents
  getAllParents: async (params = {}) => {
    const response = await api.get('/parents', { params });
    return response.data;
  },

  // Admin: Get parent by ID
  getParentById: async (id) => {
    const response = await api.get(`/parents/${id}`);
    return response.data;
  },

  // Get parent's children
  getMyChildren: async () => {
    const response = await api.get('/parents/my-children');
    return response.data;
  },

  // Get specific child details
  getChildDetails: async (studentId) => {
    const response = await api.get(`/students/${studentId}`);
    return response.data;
  },

  // Get child's attendance
  getChildAttendance: async (studentId, params = {}) => {
    // Use /stats/:studentId for attendance statistics
    const response = await api.get(`/attendance/stats/${studentId}`, { params });
    return response.data;
  },

  // Get child's grades
  getChildGrades: async (studentId) => {
    const response = await api.get('/grades', { params: { studentId } });
    return response.data;
  },

  // Get child's assignments
  getChildAssignments: async (studentId) => {
    const response = await api.get('/assignments', { params: { studentId } });
    return response.data;
  },

  // Get child's fees
  getChildFees: async (studentId) => {
    const response = await api.get('/fees/payments', { params: { studentId } });
    return response.data;
  },

  // Get child's timetable
  getChildTimetable: async (studentId) => {
    const response = await api.get(`/timetable/student/${studentId}`);
    return response.data;
  },

  // Get parent's dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/parents/dashboard-stats');
    return response.data;
  },

  // Get combined children stats
  getChildrenStats: async () => {
    const response = await api.get('/parents/children-stats');
    return response.data;
  },

  // Pay fees for a child
  payFees: async (studentId, paymentData) => {
    const response = await api.post(`/fees/student/${studentId}/pay`, paymentData);
    return response.data;
  },
};

