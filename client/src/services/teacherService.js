import api from './api';

export const teacherService = {
  getAllTeachers: async () => {
    const response = await api.get('/teachers');
    return response.data;
  },

  getTeacherById: async (id) => {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  createTeacher: async (teacherData) => {
    const response = await api.post('/teachers', teacherData);
    return response.data;
  },

  updateTeacher: async (id, teacherData) => {
    const response = await api.put(`/teachers/${id}`, teacherData);
    return response.data;
  },

  deleteTeacher: async (id) => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  },

  // Download single ID card
  downloadIDCard: async (id) => {
    const response = await api.get(`/teachers/${id}/id-card`, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `teacher_id_card_${id}_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response.data;
  },

  // Download bulk ID cards
  downloadBulkIDCards: async (teacherIds) => {
    const response = await api.post('/teachers/bulk-id-cards',
      { teacherIds },
      { responseType: 'blob' }
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `teacher_id_cards_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response.data;
  },

  getMyProfile: async () => {
    const response = await api.get('/teachers/me');
    return response.data;
  },
};

