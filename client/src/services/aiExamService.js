import api from './api';

export const aiExamService = {
    getAllAIExams: async (params) => {
        const response = await api.get('/ai-exams', { params });
        return response.data;
    },

    getAIExamById: async (id) => {
        const response = await api.get(`/ai-exams/${id}`);
        return response.data;
    },

    createAIExam: async (examData) => {
        const response = await api.post('/ai-exams', examData);
        return response.data;
    },

    updateAIExam: async (id, examData) => {
        const response = await api.put(`/ai-exams/${id}`, examData);
        return response.data;
    },

    deleteAIExam: async (id) => {
        const response = await api.delete(`/ai-exams/${id}`);
        return response.data;
    },

    startExamAttempt: async (examId) => {
        const response = await api.post(`/ai-exams/${examId}/start`, {});
        return response.data;
    },

    saveAnswer: async (attemptId, answerData) => {
        const response = await api.put(`/ai-exams/attempts/${attemptId}/answer`, answerData);
        return response.data;
    },

    submitAttempt: async (attemptId) => {
        const response = await api.post(`/ai-exams/attempts/${attemptId}/submit`, {});
        return response.data;
    },

    getAttemptById: async (attemptId) => {
        const response = await api.get(`/ai-exams/attempts/${attemptId}`);
        return response.data;
    },

    getAttemptAnalytics: async (attemptId) => {
        const response = await api.get(`/ai-exams/attempts/${attemptId}/analytics`);
        return response.data;
    },
};
