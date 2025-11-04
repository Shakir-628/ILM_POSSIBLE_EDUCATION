import api from './api';

export const studentService = {
  getAllStudents: async () => {
    const response = await api.get('/students');
    return response.data;
  },

  getStudentById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  createStudent: async (studentData) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  updateStudent: async (id, studentData) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },

  deleteStudent: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  getStudentsByClass: async (classId) => {
    const response = await api.get(`/students/class/${classId}`);
    return response.data;
  },

  // Upload document for student
  uploadDocument: async (studentId, formData) => {
    const response = await api.post(`/students/${studentId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete document
  deleteDocument: async (studentId, documentId) => {
    const response = await api.delete(`/students/${studentId}/documents/${documentId}`);
    return response.data;
  },

  // Promote student
  promoteStudent: async (studentId, data) => {
    const response = await api.post(`/students/${studentId}/promote`, data);
    return response.data;
  },

  // Transfer student
  transferStudent: async (studentId, data) => {
    const response = await api.post(`/students/${studentId}/transfer`, data);
    return response.data;
  },

  // Export students to Excel
  exportToExcel: async () => {
    const response = await api.get('/students/export/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Export students to PDF
  exportToPDF: async () => {
    const response = await api.get('/students/export/pdf', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Download single ID card
  downloadIDCard: async (id) => {
    const response = await api.get(`/students/${id}/id-card`, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `student_id_card_${id}_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  },

  // Download bulk ID cards
  downloadBulkIDCards: async (studentIds) => {
    const response = await api.post('/students/bulk-id-cards', 
      { studentIds },
      { responseType: 'blob' }
    );
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `student_id_cards_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  },

  // Generate ID card for single student (legacy - use downloadIDCard instead)
  generateIDCard: async (studentId) => {
    const response = await api.get(`/students/${studentId}/id-card`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Generate bulk ID cards (legacy - use downloadBulkIDCards instead)
  generateBulkIDCards: async (studentIds) => {
    const response = await api.post('/students/bulk-id-cards', 
      { studentIds },
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Download import template
  downloadImportTemplate: async () => {
    const response = await api.get('/students/import/template', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Upload file for bulk import (validation only)
  uploadBulkImportFile: async (formData) => {
    const response = await api.post('/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Confirm bulk import
  confirmBulkImport: async (students) => {
    const response = await api.post('/students/import/confirm', { students });
    return response.data;
  },
};

