import ChatbotConfig from '../models/ChatbotConfig.js';
import RolePermission from '../models/RolePermission.js';
import { getChatbotReply } from '../services/aiService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const trainingDataPath = path.join(__dirname, '../../CHATBOT_TRAINING_DATA.json');

/**
 * Call Free HuggingFace Instruct LLM to identify correct Q&A match
 */
const callFreeLLM = async (filteredQAs, message) => {
  try {
    if (!filteredQAs || filteredQAs.length === 0) return null;
    
    // Format allowed Q&A pairs as a simple text table
    const qaTableText = filteredQAs
      .slice(0, 20) // Limit to 20 QAs to fit prompt constraints
      .map((qa, idx) => `[ID: ${idx + 1}] Q: ${qa.question}\nA: ${qa.answer}`)
      .join('\n\n');

    const prompt = `<|im_start|>system
You are a helpful school assistant. You are given a user question and a table of allowed Questions (Q) and Answers (A).
Your task is to identify the correct Answer from the table that matches the user's question.
If a match is found, reply ONLY with the exact Answer text from the table. Do not add any conversational text or metadata.
If no question matches the user's question, reply: "I do not have access to information regarding that module or question."<|im_end|>
<|im_start|>user
Table:
${qaTableText}

User Question: ${message}<|im_end|>
<|im_start|>assistant
`;

    // Query HuggingFace serverless text generation API (keyless/free)
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct',
      { inputs: prompt },
      { timeout: 7000 }
    );

    if (response.data && Array.isArray(response.data) && response.data[0]?.generated_text) {
      const fullText = response.data[0].generated_text;
      const parts = fullText.split('<|im_start|>assistant');
      const lastPart = parts[parts.length - 1] || '';
      let replyText = lastPart.replace(/<\|im_end\|>/g, '').trim();
      
      if (replyText) {
        return `${replyText}\n\n*(Answer retrieved using Free Cloud LLM)*`;
      }
    }
    return null;
  } catch (error) {
    console.error("Free LLM call failed or timed out:", error.message);
    return null;
  }
};

// Default modules dictionary for fallback
const defaultModulesByRole = {
  superadmin: ['Dashboard', 'AI Exams', 'Students', 'Teachers', 'Parents', 'Classes', 'Academic', 'Attendance', 'Examinations', 'Fees', 'Events & Calendar', 'Communication', 'Inventory', 'Reports', 'Settings', 'Library', 'Transport', 'Hostel', 'Certificates'],
  admin: ['Dashboard', 'AI Exams', 'Students', 'Teachers', 'Parents', 'Classes', 'Academic', 'Attendance', 'Examinations', 'Fees', 'Events & Calendar', 'Communication', 'Inventory', 'Reports', 'Settings', 'Library', 'Transport', 'Hostel', 'Certificates'],
  teacher: ['Dashboard', 'Students', 'Classes', 'Academic', 'Attendance', 'Examinations', 'Communication', 'Inventory', 'Reports', 'Library', 'Certificates'],
  student: ['Dashboard', 'Academic', 'Attendance', 'Examinations', 'Fees', 'Events & Calendar', 'Communication', 'Library', 'Hostel', 'Transport'],
  parent: ['Dashboard', 'Students', 'Attendance', 'Examinations', 'Fees', 'Events & Calendar', 'Communication', 'Library', 'Hostel', 'Transport']
};

// Module to Training Category mapping
const moduleToCategoriesMap = {
  'Dashboard': ['Dashboard & Navigation', 'Analytics'],
  'AI Exams': ['Exams'],
  'Students': ['Parents', 'General', 'Admissions', 'ID Cards'],
  'Teachers': ['Teachers', 'ID Cards'],
  'Parents': ['Parents'],
  'Classes': ['Dashboard & Navigation'],
  'Academic': ['Timetable', 'Assignments', 'Online Classes & Resources'],
  'Attendance': ['Attendance'],
  'Examinations': ['Exams', 'Grades'],
  'Fees': ['Fees'],
  'Events & Calendar': ['Events'],
  'Communication': ['Announcements', 'Notifications'],
  'Inventory': ['Inventory'],
  'Reports': ['Reports'],
  'Settings': ['Account & Authentication', 'Admins', 'Settings'],
  'Library': ['Library'],
  'Transport': ['Transport'],
  'Hostel': ['Hostel'],
  'Certificates': ['Certificates'],
  'System Logs': ['Logs'],
  'Audit Logs': ['Logs'],
  'Analytics': ['Analytics'],
  'E-Portfolio': ['E-Portfolio'],
};

/**
 * @desc    Get Chatbot Configuration
 * @route   GET /api/chatbot/config
 * @access  Private
 */
export const getChatbotConfig = async (req, res) => {
  try {
    let config = await ChatbotConfig.findOne();
    if (!config) {
      config = await ChatbotConfig.create({});
    }
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Get Chatbot Config Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chatbot configuration'
    });
  }
};

/**
 * @desc    Update Chatbot Configuration
 * @route   PUT /api/chatbot/config
 * @access  Private (Admin, SuperAdmin)
 */
export const updateChatbotConfig = async (req, res) => {
  try {
    const { botName, welcomeMessage, systemInstruction, isEnabled, activeModules } = req.body;
    
    let config = await ChatbotConfig.findOne();
    if (!config) {
      config = new ChatbotConfig({});
    }

    if (botName !== undefined) config.botName = botName;
    if (welcomeMessage !== undefined) config.welcomeMessage = welcomeMessage;
    if (systemInstruction !== undefined) config.systemInstruction = systemInstruction;
    if (isEnabled !== undefined) config.isEnabled = isEnabled;
    if (activeModules !== undefined) config.activeModules = activeModules;

    await config.save();

    res.status(200).json({
      success: true,
      message: 'Chatbot configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Update Chatbot Config Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update chatbot configuration'
    });
  }
};

/**
 * @desc    Handle Chat Interaction
 * @route   POST /api/chatbot/chat
 * @access  Private
 */
export const handleChat = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // 1. Fetch Chatbot Settings
    let config = await ChatbotConfig.findOne();
    if (!config) {
      config = await ChatbotConfig.create({});
    }

    if (!config.isEnabled) {
      return res.status(400).json({
        success: false,
        message: 'The chatbot assistant has been disabled by the administrator.'
      });
    }

    // 2. Fetch User permissions to determine allowed modules
    const userRole = req.user.role;
    let allowedModules = [];

    if (userRole === 'superadmin' || userRole === 'admin') {
      allowedModules = defaultModulesByRole.admin;
    } else {
      const rolePerm = await RolePermission.findOne({ role: userRole });
      if (rolePerm && rolePerm.modules) {
        allowedModules = rolePerm.modules.filter(m => m.enabled).map(m => m.moduleName);
      } else {
        allowedModules = defaultModulesByRole[userRole] || ['Dashboard'];
      }
    }

    // 3. Intersect user allowed modules with chatbot active modules
    const finalAllowedModules = allowedModules.filter(mod => config.activeModules.includes(mod));

    // 4. Map allowed modules to training categories
    const safeCategories = ['General', 'Technical Support', 'Account & Authentication'];
    const targetCategories = new Set(safeCategories);
    
    finalAllowedModules.forEach(mod => {
      const categories = moduleToCategoriesMap[mod] || [];
      categories.forEach(cat => targetCategories.add(cat));
    });

    // 5. Read training data & filter Q&A
    let filteredQAs = [];
    if (fs.existsSync(trainingDataPath)) {
      try {
        const rawData = fs.readFileSync(trainingDataPath, 'utf8');
        const trainingData = JSON.parse(rawData);
        const qaPairs = trainingData.chatbot_training_data?.qa_pairs || [];
        filteredQAs = qaPairs.filter(qa => targetCategories.has(qa.category));
      } catch (err) {
        console.error('Error reading/parsing chatbot training data:', err);
      }
    }

    // 6. Format context data
    const faqsText = filteredQAs
      .map(qa => `Category: ${qa.category}\nQ: ${qa.question}\nA: ${qa.answer}`)
      .join('\n\n');

    // 7. Format conversation history
    let historyText = '';
    if (history && Array.isArray(history)) {
      // Keep only last 10 messages for token context efficiency
      const recentHistory = history.slice(-10);
      historyText = recentHistory
        .map(h => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`)
        .join('\n');
    }

    // 8. Build Prompt
    const prompt = `
${config.systemInstruction}

Important Security Rule:
You are assisting a user with the role of '${userRole}'.
You are configured to only answer questions about the following modules: ${finalAllowedModules.join(', ')}.
You must strictly refuse to answer questions about any modules not in this list. For instance, if 'Hostel' or 'Fees' is not listed above, and the user asks about hostel rules or fee status, politely decline to answer.

Here are the official Frequently Asked Questions (FAQs) you can use as reference context:
${faqsText}

Instructions for responding:
1. Provide accurate answers based on the context above.
2. If the question is outside the scope of the allowed modules, say: "I do not have access to information regarding that module. Please contact the administrator if you believe this is a mistake."
3. Keep the response friendly, clear, and concise.

${historyText ? `Conversation History:\n${historyText}\n` : ''}
User: ${message}
Assistant:
`;

    // 9. Call Gemini AI
    let reply = await getChatbotReply(prompt);
    
    if (!reply) {
      console.warn("Gemini API call failed or key is missing. Trying Free Cloud LLM...");
      
      // Attempt Free LLM call to identify the answer from the QA table
      reply = await callFreeLLM(filteredQAs, message);
      
      if (!reply) {
        console.warn("Free Cloud LLM failed. Using local keyword-matching search.");
        
        // Attempt local lookup in filtered Q&As
        const query = message.toLowerCase().trim();
        let bestMatch = null;
        let highestScore = 0;

        for (const qa of filteredQAs) {
          const question = qa.question.toLowerCase();
          
          const queryWords = query.split(/\s+/).filter(w => w.length > 2);
          let score = 0;
          
          if (question.includes(query)) {
            score += 10;
          }
          
          queryWords.forEach(word => {
            if (question.includes(word)) {
              score += 2;
            }
          });

          if (score > highestScore) {
            highestScore = score;
            bestMatch = qa;
          }
        }

        if (bestMatch && highestScore > 1) {
          reply = `${bestMatch.answer}\n\n*(Note: Displaying answer from offline module database)*`;
        } else {
          reply = "I'm sorry, I couldn't find an answer to that question in the knowledge base of your enabled modules. Please try rephrasing your question or check if the module is enabled.";
        }
      }
    }

    res.status(200).json({
      success: true,
      reply: reply.trim(),
      botName: config.botName
    });

  } catch (error) {
    console.error('Chatbot Chat Endpoint Error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while communicating with the chatbot assistant'
    });
  }
};
