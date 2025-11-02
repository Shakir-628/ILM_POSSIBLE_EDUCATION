import api from './api';

export const feeService = {
  // Fee Structures
  getFeeStructures: async (params = {}) => {
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
  getFeePayments: async (params = {}) => {
    const response = await api.get('/fees/payments', { params });
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

  initiateOnlinePayment: async (paymentId) => {
    const response = await api.post(`/fees/payments/${paymentId}/pay-online`);
    return response.data;
  },

  verifyOnlinePayment: async (paymentId, paymentIntentId) => {
    const response = await api.post(`/fees/payments/${paymentId}/verify`, {
      paymentIntentId,
    });
    return response.data;
  },

  getOverduePayments: async () => {
    const response = await api.get('/fees/payments/overdue');
    return response.data;
  },

  getFeeStatistics: async (params = {}) => {
    const response = await api.get('/fees/statistics', { params });
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

  sendPaymentReminder: async (paymentId) => {
    const response = await api.post(`/fees/payments/${paymentId}/reminder`);
    return response.data;
  },
};

// Accounting Service
export const accountingService = {
  getExpenses: async (params = {}) => {
    const response = await api.get('/accounting/expenses', { params });
    return response.data;
  },

  createExpense: async (data) => {
    const response = await api.post('/accounting/expenses', data);
    return response.data;
  },

  updateExpense: async (id, data) => {
    const response = await api.put(`/accounting/expenses/${id}`, data);
    return response.data;
  },

  deleteExpense: async (id) => {
    const response = await api.delete(`/accounting/expenses/${id}`);
    return response.data;
  },

  getIncome: async (params = {}) => {
    const response = await api.get('/accounting/income', { params });
    return response.data;
  },

  getFinancialSummary: async (params = {}) => {
    const response = await api.get('/accounting/summary', { params });
    return response.data;
  },
};

export default feeService;

