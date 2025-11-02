import React, { useState } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import { PaperAirplaneIcon, EnvelopeIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { notificationService } from '../services/notificationService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const BulkCommunication = () => {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [type, setType] = useState('notification'); // 'notification', 'email', 'sms'
  const [formData, setFormData] = useState({
    targetAudience: 'all',
    title: '',
    message: '',
    notificationType: 'info',
  });

  const handleSend = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Only admins can send bulk communications');
      return;
    }

    try {
      // For now, we're only implementing notifications
      // Email and SMS can be added later
      if (type === 'notification') {
        // This would need to fetch all users matching targetAudience
        toast.info('Sending notifications...');
        // await notificationService.createBulkNotifications(formData);
        toast.success('Notifications sent successfully!');
      } else {
        toast.warning(`${type.toUpperCase()} functionality coming soon!`);
      }
      setFormData({ targetAudience: 'all', title: '', message: '', notificationType: 'info' });
    } catch (error) {
      console.error('Error sending:', error);
      toast.error(error.response?.data?.message || 'Error sending communication');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Communication</h1>
          <p className="mt-1 text-sm text-gray-500">
            Send messages to multiple users at once
          </p>
        </div>

        {/* Communication Type Selection */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Card
            title="Push Notifications"
            value="In-App"
            icon={PaperAirplaneIcon}
            color="blue"
            onClick={() => setType('notification')}
            className={`cursor-pointer ${type === 'notification' ? 'ring-2 ring-primary-500' : ''}`}
          />
          <Card
            title="Email"
            value="Coming Soon"
            icon={EnvelopeIcon}
            color="green"
            onClick={() => setType('email')}
            className={`cursor-pointer ${type === 'email' ? 'ring-2 ring-primary-500' : ''}`}
          />
          <Card
            title="SMS"
            value="Coming Soon"
            icon={DevicePhoneMobileIcon}
            color="purple"
            onClick={() => setType('sms')}
            className={`cursor-pointer ${type === 'sms' ? 'ring-2 ring-primary-500' : ''}`}
          />
        </div>

        {/* Message Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {type === 'notification' ? 'Send Push Notification' :
             type === 'email' ? 'Send Email' : 'Send SMS'}
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

            {type === 'notification' && (
              <Select
                label="Notification Type"
                value={formData.notificationType}
                onChange={(e) => setFormData({ ...formData, notificationType: e.target.value })}
                options={[
                  { value: 'info', label: 'Information' },
                  { value: 'success', label: 'Success' },
                  { value: 'warning', label: 'Warning' },
                  { value: 'error', label: 'Alert' },
                  { value: 'announcement', label: 'Announcement' },
                ]}
                required
              />
            )}

            <Input
              label={type === 'email' ? 'Email Subject' : 'Title'}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows="6"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" icon={PaperAirplaneIcon}>
                Send {type === 'notification' ? 'Notification' : type === 'email' ? 'Email' : 'SMS'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default BulkCommunication;

