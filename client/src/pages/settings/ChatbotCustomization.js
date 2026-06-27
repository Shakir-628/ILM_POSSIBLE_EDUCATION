import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import chatbotService from '../../services/chatbotService';
import { useToast } from '../../context/ToastContext';
import { SparklesIcon } from '@heroicons/react/24/outline';

const ALL_MODULES = [
  'Dashboard', 'AI Exams', 'Students', 'Teachers', 'Parents', 'Classes', 
  'Academic', 'Attendance', 'Examinations', 'Fees', 'Events & Calendar', 
  'Communication', 'Inventory', 'Reports', 'Settings', 'Library', 
  'Transport', 'Hostel', 'Certificates'
];

const ChatbotCustomization = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    botName: 'ILM Possible Bot',
    welcomeMessage: 'Hi there! I am the ILM Possible AI Chatbot. How can I help you today?',
    systemInstruction: '',
    isEnabled: true,
    activeModules: [],
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await chatbotService.getConfig();
      if (response.success && response.data) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error('Error fetching chatbot config:', error);
      toast.error('Error loading chatbot settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig({
      ...config,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleModuleToggle = (moduleName) => {
    setConfig((prev) => {
      const activeModules = prev.activeModules.includes(moduleName)
        ? prev.activeModules.filter((m) => m !== moduleName)
        : [...prev.activeModules, moduleName];
      return { ...prev, activeModules };
    });
  };

  const handleSelectAllToggle = () => {
    setConfig((prev) => {
      const allSelected = prev.activeModules.length === ALL_MODULES.length;
      return {
        ...prev,
        activeModules: allSelected ? [] : [...ALL_MODULES],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await chatbotService.updateConfig(config);
      toast.success('Chatbot configuration updated successfully!');
    } catch (error) {
      console.error('Error updating chatbot config:', error);
      toast.error(error.response?.data?.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Chatbot Customization</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure the AI assistant's name, system prompt, active modules, and greeting.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Chatbot Config */}
          <div className="bg-white dark:bg-dark-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <SparklesIcon className="h-5 w-5 mr-2 text-primary-500" />
              General AI Assistant Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="isEnabled"
                  name="isEnabled"
                  checked={config.isEnabled}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                />
                <label htmlFor="isEnabled" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Chatbot globally for all users
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Bot Name"
                  name="botName"
                  value={config.botName}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Welcome / Greeting Message"
                  name="welcomeMessage"
                  value={config.welcomeMessage}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  System Instructions (Context Prompt)
                </label>
                <textarea
                  name="systemInstruction"
                  value={config.systemInstruction}
                  onChange={handleInputChange}
                  rows={6}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-dark-900 dark:border-dark-700 dark:text-gray-300"
                  placeholder="Instructions that outline the bot's behavior, tone, constraints, and instructions..."
                />
                <p className="mt-1 text-xs text-gray-400">
                  This prompt controls the chatbot's behavior and personality.
                </p>
              </div>
            </div>
          </div>

          {/* Active Modules for Chatbot */}
          <div className="bg-white dark:bg-dark-800 shadow rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Chatbot Knowledge Base Modules
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Select which modules the AI chatbot is allowed to access. (Users must also have role permission for the module to receive answers).
                </p>
              </div>
              <button
                type="button"
                onClick={handleSelectAllToggle}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-md shadow-sm text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-700 hover:bg-gray-50 dark:hover:bg-dark-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 self-start sm:self-center transition-colors duration-200"
              >
                {config.activeModules.length === ALL_MODULES.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {ALL_MODULES.map((module) => (
                <label
                  key={module}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 select-none ${
                    config.activeModules.includes(module)
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
                      : 'border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={config.activeModules.includes(module)}
                    onChange={() => handleModuleToggle(module)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {module}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ChatbotCustomization;
