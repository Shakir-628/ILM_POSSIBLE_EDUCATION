import api from './api';

// Get all certificates
export const getCertificates = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.certificateType) params.append('certificateType', filters.certificateType);
  if (filters.status) params.append('status', filters.status);
  if (filters.studentId) params.append('studentId', filters.studentId);
  
  const response = await api.get(`/certificates?${params.toString()}`);
  return response.data;
};

// Get certificate by ID
export const getCertificateById = async (id) => {
  const response = await api.get(`/certificates/${id}`);
  return response.data;
};

// Get certificates by student
export const getCertificatesByStudent = async (studentId) => {
  const response = await api.get(`/certificates/student/${studentId}`);
  return response.data;
};

// Create new certificate
export const createCertificate = async (certificateData) => {
  const response = await api.post('/certificates', certificateData);
  return response.data;
};

// Update certificate
export const updateCertificate = async (id, certificateData) => {
  const response = await api.put(`/certificates/${id}`, certificateData);
  return response.data;
};

// Generate certificate PDF
export const generateCertificate = async (id) => {
  const response = await api.post(`/certificates/${id}/generate`);
  return response.data;
};

// Download certificate
export const downloadCertificate = async (id) => {
  const response = await api.get(`/certificates/${id}/download`);
  return response.data;
};

// Cancel certificate
export const cancelCertificate = async (id, reason) => {
  const response = await api.put(`/certificates/${id}/cancel`, { reason });
  return response.data;
};

// Verify certificate
export const verifyCertificate = async (verificationCode) => {
  const response = await api.get(`/certificates/verify/${verificationCode}`);
  return response.data;
};

// Delete certificate
export const deleteCertificate = async (id) => {
  const response = await api.delete(`/certificates/${id}`);
  return response.data;
};

// Get certificate statistics
export const getCertificateStats = async () => {
  const response = await api.get('/certificates/stats');
  return response.data;
};

export default {
  getCertificates,
  getCertificateById,
  getCertificatesByStudent,
  createCertificate,
  updateCertificate,
  generateCertificate,
  downloadCertificate,
  cancelCertificate,
  verifyCertificate,
  deleteCertificate,
  getCertificateStats,
};

