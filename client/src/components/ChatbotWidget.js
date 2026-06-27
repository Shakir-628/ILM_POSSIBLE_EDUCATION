import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import chatbotService from '../services/chatbotService';
import {
  ChatBubbleOvalLeftEllipsisIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const ChatbotWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [botName, setBotName] = useState('ILM Assistant');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch configuration on mount to check if chatbot is enabled
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await chatbotService.getConfig();
        if (response.success && response.data) {
          setIsEnabled(response.data.isEnabled);
          setBotName(response.data.botName);
          setWelcomeMessage(response.data.welcomeMessage);
          
          // Seed the welcome message
          setMessages([
            {
              id: 'welcome',
              sender: 'bot',
              text: response.data.welcomeMessage,
              timestamp: new Date(),
            },
          ]);
        }
      } catch (error) {
        console.error('Failed to load chatbot configuration:', error);
      }
    };

    if (user) {
      fetchConfig();
    }
  }, [user]);

  // Scroll to bottom whenever messages list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!user || !isEnabled) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');

    // Add user message to UI
    const userMsgId = `user-${Date.now()}`;
    const newMessages = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        text: userText,
        timestamp: new Date(),
      },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Map messages history to format expected by backend (excluding welcome)
      const chatHistory = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          sender: m.sender,
          text: m.text,
        }));

      const response = await chatbotService.sendMessage(userText, chatHistory);

      if (response.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: response.reply,
            timestamp: new Date(),
          },
        ]);
        if (response.botName) {
          setBotName(response.botName);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'bot',
          text: error.response?.data?.message || 'Sorry, I am having trouble connecting right now. Please try again later.',
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-96 max-w-[calc(100vw-2rem)] h-[500px] flex flex-col bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-700 overflow-hidden transition-all duration-300 ease-in-out animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wide">{botName}</h3>
                <span className="text-[10px] text-primary-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-ping"></span>
                  Active AI Assistant
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/10 p-1.5 rounded-full transition-colors focus:outline-none"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-dark-900/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Bot Avatar */}
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center flex-shrink-0 border border-primary-200 dark:border-primary-800">
                    <SparklesIcon className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-none'
                      : msg.isError
                      ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900 rounded-tl-none'
                      : 'bg-white dark:bg-dark-700 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-dark-600 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === 'user'
                        ? 'text-primary-200'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* User Avatar */}
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center flex-shrink-0 border border-indigo-200 dark:border-indigo-800">
                    <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 capitalize">
                      {user?.name?.substring(0, 2)}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* AI Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center flex-shrink-0 border border-primary-200 dark:border-primary-800">
                  <SparklesIcon className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="bg-white dark:bg-dark-700 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-dark-600 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form / Input */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white dark:bg-dark-800 border-t border-gray-100 dark:border-dark-700 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me about grades, fees, attendance..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-dark-900 border-0 focus:ring-2 focus:ring-primary-500 rounded-full text-sm dark:text-gray-200 placeholder-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-all duration-200 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md hover:shadow-primary-500/25 active:scale-95"
            >
              <PaperAirplaneIcon className="h-4.5 w-4.5 transform rotate-0" />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:shadow-primary-500/20 hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6 transform rotate-90 transition-transform duration-300" />
        ) : (
          <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6 transition-transform duration-300 hover:rotate-6" />
        )}
      </button>
    </div>
  );
};

export default ChatbotWidget;
