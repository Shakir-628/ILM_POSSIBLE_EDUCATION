// Fee Service - Mobile App
import api from './api';

export const feeService = {
  // Fee Structures
  getFeeStructures: async (classId = null, academicYear = null, status = null) => {
    const params = {};
    if (classId) params.classId = classId;
    if (academicYear) params.academicYear = academicYear;
    if (status) params.status = status;
    
    const response = await api.get('/fees/structures', { params });
    return response.data;
  },

  createFeeStructure: async (data) => {
    const response = await api.post('/fees/structures', data);
    return response.data;
  },

  updateFeeStructure: async (id, data) => {
    const response = await api.put(`/fees/structures/${id}`, data);
    return response.data;
  },

  deleteFeeStructure: async (id) => {
    const response = await api.delete(`/fees/structures/${id}`);
    return response.data;
  },

  // Fee Payments
  getFeePayments: async (studentId = null, paymentStatus = null, academicYear = null) => {
    const params = {};
    if (studentId) params.studentId = studentId;
    if (paymentStatus) params.paymentStatus = paymentStatus;
    if (academicYear) params.academicYear = academicYear;
    
    const response = await api.get('/fees/payments', { params });
    return response.data;
  },

  getStudentFees: async (studentId) => {
    const response = await api.get('/fees/payments', { params: { studentId } });
    return response.data;
  },

  createFeePayment: async (data) => {
    const response = await api.post('/fees/payments', data);
    return response.data;
  },

  processPayment: async (paymentId, data) => {
    const response = await api.post(`/fees/payments/${paymentId}/pay`, data);
    return response.data;
  },

  processOnlinePayment: async (paymentId) => {
    const response = await api.post(`/fees/payments/${paymentId}/pay-online`);
    return response.data;
  },

  verifyOnlinePayment: async (paymentId, data) => {
    const response = await api.post(`/fees/payments/${paymentId}/verify`, data);
    return response.data;
  },

  sendPaymentReminder: async (paymentId) => {
    const response = await api.post(`/fees/payments/${paymentId}/reminder`);
    return response.data;
  },

  // Reports & Statistics
  getOverduePayments: async () => {
    const response = await api.get('/fees/payments/overdue');
    return response.data;
  },

  getFeeStatistics: async () => {
    const response = await api.get('/fees/statistics');
    return response.data;
  },

  downloadInvoice: async (paymentId) => {
    const response = await api.get(`/fees/payments/${paymentId}/invoice`, {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadReceipt: async (paymentId) => {
    const response = await api.get(`/fees/payments/${paymentId}/receipt`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Legacy endpoints for backward compatibility
  getMyFees: async () => {
    const response = await api.get('/fees/me');
    return response.data;
  },

  getFeesByStudent: async (studentId) => {
    return feeService.getStudentFees(studentId);
  },

  payFee: async (data) => {
    const response = await api.post('/fees/payment', data);
    return response.data;
  },

  getPaymentHistory: async () => {
    const response = await api.get('/fees/payments/me');
    return response.data;
  },
};

