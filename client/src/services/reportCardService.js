import api from './api';

export const reportCardService = {
  // Get all report cards
  getAllReportCards: async (params = {}) => {
    const response = await api.get('/report-cards', { params });
    return response.data;
  },

  // Get report card by ID
  getReportCardById: async (id) => {
    const response = await api.get(`/report-cards/${id}`);
    return response.data;
  },

  // Generate report card from grades
  generateReportCard: async (data) => {
    const response = await api.post('/report-cards/generate', data);
    return response.data;
  },

  // Update report card
  updateReportCard: async (id, data) => {
    const response = await api.put(`/report-cards/${id}`, data);
    return response.data;
  },

  // Download report card PDF
  downloadReportCard: async (id) => {
    const response = await api.get(`/report-cards/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default reportCardService;

