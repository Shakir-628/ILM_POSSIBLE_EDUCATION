import api from './api';

// Get all certificate templates
export const getCertificateTemplates = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.certificateType) params.append('certificateType', filters.certificateType);
  if (filters.isActive !== undefined) params.append('isActive', filters.isActive);

  const response = await api.get(`/certificate-templates?${params.toString()}`);
  return response.data;
};

// Get certificate template by ID
export const getCertificateTemplateById = async (id) => {
  const response = await api.get(`/certificate-templates/${id}`);
  return response.data;
};

// Create new certificate template
export const createCertificateTemplate = async (templateData) => {
  const response = await api.post('/certificate-templates', templateData);
  return response.data;
};

// Update certificate template
export const updateCertificateTemplate = async (id, templateData) => {
  const response = await api.put(`/certificate-templates/${id}`, templateData);
  return response.data;
};

// Set template as default
export const setTemplateAsDefault = async (id) => {
  const response = await api.put(`/certificate-templates/${id}/set-default`);
  return response.data;
};

// Delete certificate template
export const deleteCertificateTemplate = async (id) => {
  const response = await api.delete(`/certificate-templates/${id}`);
  return response.data;
};

// Duplicate template
export const duplicateCertificateTemplate = async (id) => {
  const response = await api.post(`/certificate-templates/${id}/duplicate`);
  return response.data;
};

// Get templates by certificate type
export const getTemplatesByCertificateType = async (certificateType) => {
  const response = await api.get(`/certificate-templates/type/${certificateType}`);
  return response.data;
};

// Get available placeholders
export const getAvailablePlaceholders = async (certificateType) => {
  const response = await api.get(`/certificate-templates/placeholders/${certificateType}`);
  return response.data;
};

const certificateTemplateService = {
  getCertificateTemplates,
  getCertificateTemplateById,
  createCertificateTemplate,
  updateCertificateTemplate,
  setTemplateAsDefault,
  deleteCertificateTemplate,
  duplicateCertificateTemplate,
  getTemplatesByCertificateType,
  getAvailablePlaceholders,
};

export default certificateTemplateService;

