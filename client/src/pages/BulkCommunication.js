import React, { useState } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import { PaperAirplaneIcon, EnvelopeIcon, DevicePhoneMobileIcon, SparklesIcon, BellIcon } from '@heroicons/react/24/outline';

import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import aiService from '../services/aiService';
import notificationService from '../services/notificationService';
import communicationService from '../services/communicationService';

const BulkCommunication = () => {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [type, setType] = useState('notification'); // 'notification', 'email', 'whatsapp'
  const [formData, setFormData] = useState({
    targetAudience: 'all',
    title: '',
    message: '',
    notificationType: 'info',
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAIDraft = async () => {
    if (!formData.title) {
      toast.warning('Please enter a title or purpose first');
      return;
    }

    try {
      setAiLoading(true);
      const response = await aiService.draftCommunication(formData.title, formData.message);
      if (response.success) {
        setFormData({ ...formData, message: response.data });
        toast.success('AI draft generated!');
      }
    } catch (error) {
      console.error('AI Draft Error:', error);
      toast.error('Failed to generate AI draft');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Only admins can send bulk communications');
      return;
    }

    try {
      setLoading(true);
      if (type === 'notification') {
        const response = await notificationService.createBulkNotifications({
          targetAudience: formData.targetAudience,
          title: formData.title,
          message: formData.message,
          type: 'announcement'
        });

        if (response.success) {
          toast.success(`Notification sent to ${response.count} users!`);
          setFormData({ targetAudience: 'all', title: '', message: '', notificationType: 'info' });
        }
      } else if (type === 'email') {
        const response = await communicationService.sendBulkEmail({
          targetAudience: formData.targetAudience,
          title: formData.title,
          message: formData.message
        });

        if (response.success) {
          toast.success(response.message);
          setFormData({ targetAudience: 'all', title: '', message: '', notificationType: 'info' });
        }
      } else if (type === 'whatsapp') {
        const response = await communicationService.sendBulkWhatsApp({
          targetAudience: formData.targetAudience,
          title: formData.title,
          message: formData.message
        });

        if (response.success) {
          toast.success(response.message);
          setFormData({ targetAudience: 'all', title: '', message: '', notificationType: 'info' });
        }
      } else {
        toast.warning(`${type.toUpperCase()} functionality coming soon!`);
      }
    } catch (error) {
      console.error('Error sending:', error);
      toast.error(error.response?.data?.message || 'Error sending communication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Bulk Communication</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Send messages to multiple users at once
          </p>
        </div>

        {/* Communication Type Selection */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Card
            title="Notification"
            value="Web Push"
            icon={BellIcon}
            color="blue"
            onClick={() => setType('notification')}
            className={`cursor-pointer ${type === 'notification' ? 'ring-2 ring-primary-500' : ''}`}
          />
          <Card
            title="Email"
            value="SMTP Ready"
            icon={EnvelopeIcon}
            color="green"
            onClick={() => setType('email')}
            className={`cursor-pointer ${type === 'email' ? 'ring-2 ring-primary-500' : ''}`}
          />
          <Card
            title="WhatsApp"
            value="Active"
            icon={DevicePhoneMobileIcon}
            color="green"
            onClick={() => setType('whatsapp')}
            className={`cursor-pointer ${type === 'whatsapp' ? 'ring-2 ring-primary-500' : ''}`}
          />
        </div>

        {/* Message Form */}
        <div className="bg-white dark:bg-dark-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {type === 'notification' ? 'Send Push Notification' :
              type === 'email' ? 'Send Email' : 'Send WhatsApp Message'}
          </h2>

          <form onSubmit={handleSend} className="space-y-4">
            <Select
              label="Target Audience"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              options={[
                { value: 'all', label: 'Everyone' },
                { value: 'students', label: 'All Students' },
                { value: 'teachers', label: 'All Teachers' },
                { value: 'parents', label: 'All Parents' },
                { value: 'staff', label: 'Staff Only' },
              ]}
              required
            />



            <Input
              label={type === 'email' ? 'Email Subject' : 'Title'}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                <button
                  type="button"
                  onClick={handleAIDraft}
                  disabled={aiLoading}
                  className="flex items-center text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-lg transition-colors"
                >
                  <SparklesIcon className={`h-3 w-3 mr-1 ${aiLoading ? 'animate-spin' : ''}`} />
                  {aiLoading ? 'Drafting...' : 'AI Assistant'}
                </button>
              </div>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows="6"
                className="w-full border-gray-300 dark:border-dark-600 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-dark-700 dark:text-white"
                required
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" icon={PaperAirplaneIcon} disabled={loading}>
                {loading ? 'Sending...' : `Send ${type === 'notification' ? 'Notification' : type === 'email' ? 'Email' : 'WhatsApp'}`}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default BulkCommunication;

