import api from './api';

export const examScheduleService = {
  // Get all exam schedules
  getAllExamSchedules: async (params = {}) => {
    const response = await api.get('/exam-schedules', { params });
    return response.data;
  },

  // Get exam schedule by ID
  getExamScheduleById: async (id) => {
    const response = await api.get(`/exam-schedules/${id}`);
    return response.data;
  },

  // Get exam schedules by class
  getExamSchedulesByClass: async (classId, params = {}) => {
    const response = await api.get(`/exam-schedules/class/${classId}`, { params });
    return response.data;
  },

  // Create exam schedule
  createExamSchedule: async (scheduleData) => {
    const response = await api.post('/exam-schedules', scheduleData);
    return response.data;
  },

  // Update exam schedule
  updateExamSchedule: async (id, scheduleData) => {
    const response = await api.put(`/exam-schedules/${id}`, scheduleData);
    return response.data;
  },

  // Delete exam schedule
  deleteExamSchedule: async (id) => {
    const response = await api.delete(`/exam-schedules/${id}`);
    return response.data;
  },
};

export default examScheduleService;

