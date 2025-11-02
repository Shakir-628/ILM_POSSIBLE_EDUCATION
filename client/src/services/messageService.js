import api from './api';

export const messageService = {
  // Get inbox messages
  getInbox: async () => {
    const response = await api.get('/messages/inbox');
    return response.data;
  },

  // Get sent messages
  getSentMessages: async () => {
    const response = await api.get('/messages/sent');
    return response.data;
  },

  // Get message by ID
  getMessageById: async (id) => {
    const response = await api.get(`/messages/${id}`);
    return response.data;
  },

  // Send message
  sendMessage: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  // Delete message
  deleteMessage: async (id) => {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get('/messages/unread/count');
    return response.data;
  },
};

export default messageService;

