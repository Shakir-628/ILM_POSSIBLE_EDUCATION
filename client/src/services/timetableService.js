import api from './api';

export const timetableService = {
  // Get all timetables
  getAllTimetables: async (params = {}) => {
    const response = await api.get('/timetables', { params });
    return response.data;
  },

  // Get timetable by ID
  getTimetableById: async (id) => {
    const response = await api.get(`/timetables/${id}`);
    return response.data;
  },

  // Get timetable by class
  getTimetableByClass: async (classId, params = {}) => {
    const response = await api.get(`/timetables/class/${classId}`, { params });
    return response.data;
  },

  // Create timetable
  createTimetable: async (timetableData) => {
    const response = await api.post('/timetables', timetableData);
    return response.data;
  },

  // Update timetable
  updateTimetable: async (id, timetableData) => {
    const response = await api.put(`/timetables/${id}`, timetableData);
    return response.data;
  },

  // Delete timetable
  deleteTimetable: async (id) => {
    const response = await api.delete(`/timetables/${id}`);
    return response.data;
  },

  // Check for conflicts
  checkConflicts: async (conflictData) => {
    const response = await api.post('/timetables/check-conflicts', conflictData);
    return response.data;
  },
};

export default timetableService;

