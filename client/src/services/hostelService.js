import api from './api';

export const hostelService = {
  // Rooms
  getAllRooms: async (params = {}) => {
    const response = await api.get('/hostel/rooms', { params });
    return response.data;
  },

  createRoom: async (data) => {
    const response = await api.post('/hostel/rooms', data);
    return response.data;
  },

  updateRoom: async (id, data) => {
    const response = await api.put(`/hostel/rooms/${id}`, data);
    return response.data;
  },

  deleteRoom: async (id) => {
    const response = await api.delete(`/hostel/rooms/${id}`);
    return response.data;
  },

  // Allocations
  getAllAllocations: async (params = {}) => {
    const response = await api.get('/hostel/allocations', { params });
    return response.data;
  },

  allocateRoom: async (data) => {
    const response = await api.post('/hostel/allocations', data);
    return response.data;
  },

  vacateRoom: async (id) => {
    const response = await api.put(`/hostel/allocations/${id}/vacate`);
    return response.data;
  },

  // Statistics
  getHostelStats: async () => {
    const response = await api.get('/hostel/stats');
    return response.data;
  },
};

