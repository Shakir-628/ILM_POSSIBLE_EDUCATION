import api from './api';

export const examService = {
    getExamSchedulesByClass: async (classId) => {
        const response = await api.get(`/exam-schedules/class/${classId}`);
        return response.data;
    },

    getAllExamSchedules: async (params = {}) => {
        const response = await api.get('/exam-schedules', { params });
        return response.data;
    },

    getExamScheduleById: async (id) => {
        const response = await api.get(`/exam-schedules/${id}`);
        return response.data;
    },
};

export default examService;
