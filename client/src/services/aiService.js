import api from './api';

export const aiService = {
    draftCommunication: async (purpose, details) => {
        const response = await api.post('/ai/draft-communication', { purpose, details });
        return response.data;
    },
};

export default aiService;
