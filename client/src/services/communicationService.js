import api from './api';

export const communicationService = {
    sendBulkEmail: async (data) => {
        const response = await api.post('/communication/email/bulk', data);
        return response.data;
    },
};

export default communicationService;
