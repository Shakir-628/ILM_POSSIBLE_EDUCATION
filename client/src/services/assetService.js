import api from './api';

export const assetService = {
  // Get all assets
  getAllAssets: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/assets${queryString ? `?${queryString}` : ''}`);
    return response.data.data;
  },

  // Get asset by ID
  getAssetById: async (id) => {
    const response = await api.get(`/assets/${id}`);
    return response.data.data;
  },

  // Create asset
  createAsset: async (data) => {
    const response = await api.post('/assets', data);
    return response.data;
  },

  // Update asset
  updateAsset: async (id, data) => {
    const response = await api.put(`/assets/${id}`, data);
    return response.data;
  },

  // Delete asset
  deleteAsset: async (id) => {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  },

  // Get asset statistics
  getAssetStats: async () => {
    const response = await api.get('/assets/stats/overview');
    return response.data.data;
  },

  // Update maintenance date
  updateMaintenanceDate: async (id, data) => {
    const response = await api.patch(`/assets/${id}/maintenance`, data);
    return response.data;
  },

  // Export to Excel
  exportToExcel: async (filters) => {
    const response = await api.post('/assets/export/excel', filters, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'assets-report.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Export to PDF
  exportToPDF: async (filters) => {
    const response = await api.post('/assets/export/pdf', filters, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'assets-report.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default assetService;

