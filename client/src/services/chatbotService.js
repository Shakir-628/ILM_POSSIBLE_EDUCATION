import api from "./api";

const chatbotService = {
  getConfig: async () => {
    const response = await api.get("/chatbot/config");
    return response.data;
  },

  updateConfig: async (configData) => {
    const response = await api.put("/chatbot/config", configData);
    return response.data;
  },

  sendMessage: async (message, history) => {
    const response = await api.post("/chatbot/chat", { message, history });
    return response.data;
  },
};

export default chatbotService;
