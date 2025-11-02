import api from './api';

export const payrollService = {
  // Get all payroll records
  getAllPayroll: async (params = {}) => {
    const response = await api.get('/payroll', { params });
    return response.data;
  },

  // Get payroll by ID
  getPayrollById: async (id) => {
    const response = await api.get(`/payroll/${id}`);
    return response.data;
  },

  // Create payroll
  createPayroll: async (payrollData) => {
    const response = await api.post('/payroll', payrollData);
    return response.data;
  },

  // Update payroll
  updatePayroll: async (id, payrollData) => {
    const response = await api.put(`/payroll/${id}`, payrollData);
    return response.data;
  },

  // Approve payroll
  approvePayroll: async (id) => {
    const response = await api.post(`/payroll/${id}/approve`);
    return response.data;
  },

  // Mark as paid
  markAsPaid: async (id, paymentData) => {
    const response = await api.post(`/payroll/${id}/mark-paid`, paymentData);
    return response.data;
  },

  // Download payslip
  downloadPayslip: async (id) => {
    const response = await api.get(`/payroll/${id}/payslip`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get statistics
  getPayrollStats: async (params = {}) => {
    const response = await api.get('/payroll/stats', { params });
    return response.data;
  },
};

export default payrollService;

