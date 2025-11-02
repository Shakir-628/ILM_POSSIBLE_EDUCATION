import api from './api';

export const eventService = {
  // Get all events
  getAllEvents: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  // Get event by ID
  getEventById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // Get upcoming events
  getUpcomingEvents: async () => {
    const response = await api.get('/events/upcoming');
    return response.data;
  },

  // Get event statistics
  getEventStats: async (year) => {
    const response = await api.get('/events/stats', { params: { year } });
    return response.data;
  },

  // Create event
  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  // Update event
  updateEvent: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },

  // Delete event
  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  // Register for event
  registerForEvent: async (id) => {
    const response = await api.post(`/events/${id}/register`);
    return response.data;
  },

  // Unregister from event
  unregisterFromEvent: async (id) => {
    const response = await api.post(`/events/${id}/unregister`);
    return response.data;
  },
};

export default eventService;

