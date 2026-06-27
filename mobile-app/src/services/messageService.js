import api from './api';

export const messageService = {
  getInbox: async () => {
    const response = await api.get('/messages/inbox');
    return response.data;
  },

  getSentMessages: async () => {
    const response = await api.get('/messages/sent');
    return response.data;
  },

  getMessageById: async (id) => {
    const response = await api.get(`/messages/${id}`);
    return response.data;
  },

  sendMessage: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  deleteMessage: async (id) => {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/messages/unread/count');
    return response.data;
  },
};

export default messageService;
