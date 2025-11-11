// Grade Service - Mobile App
import api from './api';

export const gradeService = {
  // Get my grades (for students)
  getMyGrades: async () => {
    try {
      // First get the student profile to get studentId
      const profileResponse = await api.get('/students/me');
      const studentId = profileResponse.data._id;
      
      // Then get grades using the studentId
      const response = await api.get('/grades', {
        params: { studentId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching my grades:', error);
      throw error;
    }
  },

  // Get grades by student ID (for parents/admin)
  getStudentGrades: async (studentId) => {
    const response = await api.get('/grades', {
      params: { studentId }
    });
    return response.data;
  },

  // Get all grades (for admin/teachers)
  getAllGrades: async (params = {}) => {
    const response = await api.get('/grades', { params });
    return response.data;
  },

  // Create grade (for teachers)
  createGrade: async (gradeData) => {
    const response = await api.post('/grades', gradeData);
    return response.data;
  },

  // Update grade (for teachers)
  updateGrade: async (gradeId, gradeData) => {
    const response = await api.put(`/grades/${gradeId}`, gradeData);
    return response.data;
  },

  // Delete grade (for teachers/admin)
  deleteGrade: async (gradeId) => {
    const response = await api.delete(`/grades/${gradeId}`);
    return response.data;
  },

  // Get report card
  getReportCard: async (studentId, term) => {
    const response = await api.get(`/grades/report/${studentId}`, {
      params: { term },
    });
    return response.data;
  },

  // Download report card PDF (if backend supports it)
  downloadReportCard: async (studentId, term) => {
    const response = await api.get(`/grades/report/${studentId}`, {
      params: { term, download: true },
      responseType: 'blob',
    });
    return response.data;
  },

  // Get class grade statistics
  getClassGradeStats: async (classId) => {
    const response = await api.get(`/grades/class-stats/${classId}`);
    return response.data;
  },
};

export default gradeService;
