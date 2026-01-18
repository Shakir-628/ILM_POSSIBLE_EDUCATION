// Reused from web app
import api from './api';
import EncryptionService from './encryptionService';

export const authService = {
  login: async (email, password) => {
    // Encrypt password before sending
    const { encryptedPassword, timestamp } = EncryptionService.encryptPassword(password);

    const response = await api.post('/auth/login', {
      email,
      password: encryptedPassword,
      encrypted: true, // Flag to indicate password is encrypted
      timestamp,
    });
    return response.data;
  },

  register: async (userData) => {
    // Encrypt password if present
    const dataToSend = { ...userData };
    if (dataToSend.password) {
      const { encryptedPassword, timestamp } = EncryptionService.encryptPassword(dataToSend.password);
      dataToSend.password = encryptedPassword;
      dataToSend.encrypted = true;
      dataToSend.timestamp = timestamp;
    }

    const response = await api.post('/auth/register', dataToSend);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  verifyOTP: async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  resetPassword: async (email, otp, password) => {
    // Encrypt new password
    const { encryptedPassword, timestamp } = EncryptionService.encryptPassword(password);

    const response = await api.post('/auth/reset-password', {
      email,
      otp,
      password: encryptedPassword,
      encrypted: true,
      timestamp,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    // Encrypt both passwords
    const { encryptedPassword: encryptedCurrent, timestamp: timestamp1 } = EncryptionService.encryptPassword(currentPassword);
    const { encryptedPassword: encryptedNew, timestamp: timestamp2 } = EncryptionService.encryptPassword(newPassword);

    const response = await api.put('/auth/change-password', {
      currentPassword: encryptedCurrent,
      newPassword: encryptedNew,
      encrypted: true,
      timestamp: timestamp1, // Use current password timestamp for verification
    });
    return response.data;
  },
};


