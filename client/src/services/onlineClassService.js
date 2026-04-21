import API from './api';

export const onlineClassService = {
  getClasses: async () => {
    const response = await API.get('/online-classes');
    return response.data;
  },

  scheduleClass: async (classData) => {
    const response = await API.post('/online-classes', classData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await API.patch(`/online-classes/${id}/status`, { status });
    return response.data;
  },

  deleteClass: async (id) => {
    const response = await API.delete(`/online-classes/${id}`);
    return response.data;
  },
};

export default onlineClassService;
