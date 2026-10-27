import axios from "axios";

const API_URL = 'https://ilm-possible-education.onrender.com/api'; //process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const parentService = {
  // Get all parents
  getAllParents: async () => {
    const response = await axios.get(`${API_URL}/parents`, getAuthHeader());
    return response.data;
  },

  // Get parent by ID
  getParentById: async (id) => {
    const response = await axios.get(`${API_URL}/parents/${id}`, getAuthHeader());
    return response.data;
  },

  // Create new parent
  createParent: async (parentData) => {
    const response = await axios.post(`${API_URL}/parents`, parentData, getAuthHeader());
    return response.data;
  },

  // Update parent
  updateParent: async (id, parentData) => {
    const response = await axios.put(`${API_URL}/parents/${id}`, parentData, getAuthHeader());
    return response.data;
  },

  // Delete parent
  deleteParent: async (id) => {
    const response = await axios.delete(`${API_URL}/parents/${id}`, getAuthHeader());
    return response.data;
  },

  // Link child to parent
  linkChild: async (parentId, studentId) => {
    const response = await axios.post(
      `${API_URL}/parents/${parentId}/link-child`,
      { studentId },
      getAuthHeader()
    );
    return response.data;
  },

  // Unlink child from parent
  unlinkChild: async (parentId, studentId) => {
    const response = await axios.post(
      `${API_URL}/parents/${parentId}/unlink-child`,
      { studentId },
      getAuthHeader()
    );
    return response.data;
  },
};

export default parentService;

