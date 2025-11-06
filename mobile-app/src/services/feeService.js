// Reused from web app
import api from './api';

export const feeService = {
  getMyFees: async () => {
    const response = await api.get('/fees/me');
    return response.data;
  },

  getFeesByStudent: async (studentId) => {
    const response = await api.get(`/fees/student/${studentId}`);
    return response.data;
  },

  payFee: async (data) => {
    const response = await api.post('/fees/payment', data);
    return response.data;
  },

  getPaymentHistory: async () => {
    const response = await api.get('/fees/payments/me');
    return response.data;
  },

  downloadReceipt: async (paymentId) => {
    const response = await api.get(`/fees/receipt/${paymentId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

