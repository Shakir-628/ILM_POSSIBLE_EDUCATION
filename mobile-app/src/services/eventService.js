// Event Service - Mobile App
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

  // Create event (admin)
  createEvent: async (data) => {
    const response = await api.post('/events', data);
    return response.data;
  },

  // Update event
  updateEvent: async (id, data) => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },

  // Delete event
  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  // Get events by type
  getEventsByType: async (eventType) => {
    const response = await api.get('/events', {
      params: { eventType },
    });
    return response.data;
  },

  // Get events by date range
  getEventsByDateRange: async (startDate, endDate) => {
    const response = await api.get('/events', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Get upcoming events
  getUpcomingEvents: async () => {
    const response = await api.get('/events/upcoming');
    return response.data;
  },
};

export default eventService;

