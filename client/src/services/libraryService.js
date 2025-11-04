import api from './api';

export const libraryService = {
  // Books
  getAllBooks: async (params = {}) => {
    const response = await api.get('/library/books', { params });
    return response.data;
  },

  getBookById: async (id) => {
    const response = await api.get(`/library/books/${id}`);
    return response.data;
  },

  createBook: async (data) => {
    const response = await api.post('/library/books', data);
    return response.data;
  },

  updateBook: async (id, data) => {
    const response = await api.put(`/library/books/${id}`, data);
    return response.data;
  },

  deleteBook: async (id) => {
    const response = await api.delete(`/library/books/${id}`);
    return response.data;
  },

  searchBooks: async (query) => {
    const response = await api.get(`/library/books/search`, { params: { q: query } });
    return response.data;
  },

  getBookHistory: async (bookId) => {
    const response = await api.get(`/library/books/${bookId}/history`);
    return response.data;
  },

  // Book Issues
  getAllIssues: async (params = {}) => {
    const response = await api.get('/library/issues', { params });
    return response.data;
  },

  issueBook: async (data) => {
    const response = await api.post('/library/issues', data);
    return response.data;
  },

  returnBook: async (issueId, data) => {
    const response = await api.put(`/library/issues/${issueId}/return`, data);
    return response.data;
  },

  renewBook: async (issueId, data) => {
    const response = await api.put(`/library/issues/${issueId}/renew`, data);
    return response.data;
  },

  payFine: async (issueId) => {
    const response = await api.put(`/library/issues/${issueId}/pay-fine`);
    return response.data;
  },

  // Student specific
  getStudentBooks: async (studentId) => {
    const response = await api.get(`/library/students/${studentId}/books`);
    return response.data;
  },

  // Overdue
  getOverdueBooks: async () => {
    const response = await api.get('/library/overdue');
    return response.data;
  },

  // Statistics
  getLibraryStats: async () => {
    const response = await api.get('/library/stats');
    return response.data;
  },
};

