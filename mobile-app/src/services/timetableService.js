// Reused from web app
import api from './api';

export const timetableService = {
  getAllTimetables: async () => {
    const response = await api.get('/timetables');
    return response.data;
  },

  getTimetableByClass: async (classId) => {
    const response = await api.get(`/timetables/class/${classId}`);
    return response.data;
  },

  getMyTimetable: async () => {
    // Get student's own profile first to get class info
    try {
      const studentProfile = await api.get('/students/me');
      const classId = studentProfile.data?.class?._id || studentProfile.data?.class;
      
      if (!classId) {
        console.warn('No class assigned to student');
        return { data: null };
      }
      
      // Get timetable by class
      const response = await api.get(`/timetables/class/${classId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching timetable:', error);
      throw error;
    }
  },

  getTodayClasses: async () => {
    const response = await api.get('/timetables/today');
    return response.data;
  },
};

