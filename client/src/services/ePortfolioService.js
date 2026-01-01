import api from './api';

const API_URL = '/e-portfolio';

const getStudentPortfolio = async (studentId) => {
    const response = await api.get(`${API_URL}/student/${studentId}`);
    return response.data;
};

const addPortfolioItem = async (data) => {
    const response = await api.post(API_URL, data);
    return response.data;
};

const uploadAttachments = async (itemId, files) => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('attachments', file);
    });

    const response = await api.post(`${API_URL}/${itemId}/attachments`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

const updatePortfolioItem = async (itemId, data) => {
    const response = await api.put(`${API_URL}/${itemId}`, data);
    return response.data;
};

const deletePortfolioItem = async (itemId) => {
    const response = await api.delete(`${API_URL}/${itemId}`);
    return response.data;
};

const ePortfolioService = {
    getStudentPortfolio,
    addPortfolioItem,
    uploadAttachments,
    updatePortfolioItem,
    deletePortfolioItem
};

export default ePortfolioService;
