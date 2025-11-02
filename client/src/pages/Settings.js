import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Input from '../components/Input';
import Button from '../components/Button';
import {
  BellIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';
const Settings = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [settings, setSettings] = useState({
    emailNotifications: true,
    assignmentAlerts: true,
    gradeAlerts: true,
    announcementAlerts: true,
    language: 'en',
    timezone: 'Asia/Karachi',
    theme: 'light',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: Save settings to backend
    toast.success('Settings saved successfully!');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your application preferences
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Notifications Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4">
                <BellIcon className="h-6 w-6 text-gray-400 mr-3" />
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Notifications
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700">
                      Email Notifications
                    </label>
                    <p className="text-sm text-gray-500">
                      Receive email updates about your account
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    name="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="assignmentAlerts" className="text-sm font-medium text-gray-700">
                      Assignment Alerts
                    </label>
                    <p className="text-sm text-gray-500">
                      Get notified when new assignments are posted
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="assignmentAlerts"
                    name="assignmentAlerts"
                    checked={settings.assignmentAlerts}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="gradeAlerts" className="text-sm font-medium text-gray-700">
                      Grade Alerts
                    </label>
                    <p className="text-sm text-gray-500">
                      Get notified when grades are posted
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="gradeAlerts"
                    name="gradeAlerts"
                    checked={settings.gradeAlerts}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="announcementAlerts" className="text-sm font-medium text-gray-700">
                      Announcement Alerts
                    </label>
                    <p className="text-sm text-gray-500">
                      Get notified about new announcements
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="announcementAlerts"
                    name="announcementAlerts"
                    checked={settings.announcementAlerts}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4">
                <GlobeAltIcon className="h-6 w-6 text-gray-400 mr-3" />
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Preferences
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={settings.language}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="en">English</option>
                    <option value="ur">Urdu</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={settings.timezone}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="Asia/Karachi">Pakistan Standard Time (PKT)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-gray-400 mr-3" />
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Security
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Coming Soon
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Login History</p>
                    <p className="text-sm text-gray-500">
                      View your recent login activity
                    </p>
                  </div>
                  <Button variant="outline" size="sm" type="button">
                    View History
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit">
              Save Preferences
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Settings;

