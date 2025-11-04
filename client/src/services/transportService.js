import api from './api';

export const transportService = {
  // Routes
  getAllRoutes: async () => {
    const response = await api.get('/transport/routes');
    return response.data;
  },

  createRoute: async (data) => {
    const response = await api.post('/transport/routes', data);
    return response.data;
  },

  updateRoute: async (id, data) => {
    const response = await api.put(`/transport/routes/${id}`, data);
    return response.data;
  },

  deleteRoute: async (id) => {
    const response = await api.delete(`/transport/routes/${id}`);
    return response.data;
  },

  // Vehicles
  getAllVehicles: async () => {
    const response = await api.get('/transport/vehicles');
    return response.data;
  },

  createVehicle: async (data) => {
    const response = await api.post('/transport/vehicles', data);
    return response.data;
  },

  updateVehicle: async (id, data) => {
    const response = await api.put(`/transport/vehicles/${id}`, data);
    return response.data;
  },

  deleteVehicle: async (id) => {
    const response = await api.delete(`/transport/vehicles/${id}`);
    return response.data;
  },

  // Drivers
  getAllDrivers: async () => {
    const response = await api.get('/transport/drivers');
    return response.data;
  },

  createDriver: async (data) => {
    const response = await api.post('/transport/drivers', data);
    return response.data;
  },

  updateDriver: async (id, data) => {
    const response = await api.put(`/transport/drivers/${id}`, data);
    return response.data;
  },

  deleteDriver: async (id) => {
    const response = await api.delete(`/transport/drivers/${id}`);
    return response.data;
  },

  // Student assignment
  assignStudentToRoute: async (data) => {
    const response = await api.post('/transport/routes/assign-student', data);
    return response.data;
  },

  removeStudentFromRoute: async (routeId, studentId) => {
    const response = await api.delete(`/transport/routes/${routeId}/students/${studentId}`);
    return response.data;
  },

  // Statistics
  getTransportStats: async () => {
    const response = await api.get('/transport/stats');
    return response.data;
  },
};

