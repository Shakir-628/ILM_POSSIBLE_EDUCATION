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

  // Smart generate timetable
  smartGenerate: async (generateData) => {
    const response = await api.post('/timetables/smart-generate', generateData);
    return response.data;
  },

  // Export to Excel
  exportToExcel: async (timetableId) => {
    const response = await api.get(`/timetables/${timetableId}/export/excel`, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `timetable_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response.data;
  },

  // Export to PDF
  exportToPDF: async (timetableId) => {
    const response = await api.get(`/timetables/${timetableId}/export/pdf`, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `timetable_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response.data;
  },
  // Get timetable for a teacher
  getTeacherSchedule: async (teacherId, params = {}) => {
    const response = await api.get(`/timetables/teacher/${teacherId}`, { params });
    return response.data;
  },
};

export default timetableService;

