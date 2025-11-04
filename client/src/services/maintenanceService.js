import api from './api';

export const maintenanceService = {
  // Get all maintenance records
  getAllMaintenance: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/maintenance${queryString ? `?${queryString}` : ''}`);
    return response.data.data;
  },

  // Get maintenance by ID
  getMaintenanceById: async (id) => {
    const response = await api.get(`/maintenance/${id}`);
    return response.data.data;
  },

  // Create maintenance record
  createMaintenance: async (data) => {
    const response = await api.post('/maintenance', data);
    return response.data;
  },

  // Update maintenance record
  updateMaintenance: async (id, data) => {
    const response = await api.put(`/maintenance/${id}`, data);
    return response.data;
  },

  // Delete maintenance record
  deleteMaintenance: async (id) => {
    const response = await api.delete(`/maintenance/${id}`);
    return response.data;
  },

  // Get maintenance statistics
  getMaintenanceStats: async () => {
    const response = await api.get('/maintenance/stats/overview');
    return response.data.data;
  },

  // Get asset maintenance history
  getAssetMaintenanceHistory: async (assetId) => {
    const response = await api.get(`/maintenance/asset/${assetId}`);
    return response.data.data;
  },

  // Export to Excel
  exportToExcel: async (filters) => {
    const response = await api.post('/maintenance/export/excel', filters, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'maintenance-report.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Export to PDF
  exportToPDF: async (filters) => {
    const response = await api.post('/maintenance/export/pdf', filters, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'maintenance-report.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default maintenanceService;

