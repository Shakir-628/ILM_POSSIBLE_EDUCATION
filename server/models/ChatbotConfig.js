import mongoose from 'mongoose';

const chatbotConfigSchema = new mongoose.Schema(
  {
    botName: {
      type: String,
      required: true,
      default: 'ILM Possible Bot',
    },
    welcomeMessage: {
      type: String,
      required: true,
      default: 'Hi there! I am the ILM Possible AI Chatbot. How can I help you today?',
    },
    systemInstruction: {
      type: String,
      required: true,
      default: 'You are an AI Assistant for the ILM Possible Education portal (a comprehensive School Management System). Your task is to answer user queries politely and concisely. You must ONLY answer questions based on the modules the user has access to. If the user asks about a module they do not have access to, decline to answer politely.',
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    activeModules: {
      type: [String],
      default: [
        'Dashboard',
        'AI Exams',
        'Students',
        'Teachers',
        'Parents',
        'Classes',
        'Academic',
        'Attendance',
        'Examinations',
        'Fees',
        'Events & Calendar',
        'Communication',
        'Inventory',
        'Reports',
        'Settings',
        'Library',
        'Transport',
        'Hostel',
        'Certificates'
      ],
    },
  },
  {
    timestamps: true,
  }
);

const ChatbotConfig = mongoose.model('ChatbotConfig', chatbotConfigSchema);

export default ChatbotConfig;
