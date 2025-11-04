import api from './api';

export const reportService = {
  // Generate attendance report
  generateAttendanceReport: async (data) => {
    const response = await api.post('/reports/attendance', data);
    return response.data;
  },

  // Generate financial report
  generateFinancialReport: async (data) => {
    const response = await api.post('/reports/financial', data);
    return response.data;
  },

  // Generate custom report
  generateCustomReport: async (data) => {
    const response = await api.post('/reports/custom', data);
    return response.data;
  },

  // Download report (Excel/PDF)
  downloadReport: async (endpoint, data, filename) => {
    const response = await api.post(endpoint, data, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default reportService;

