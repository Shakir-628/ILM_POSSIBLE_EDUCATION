import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import { CogIcon } from '@heroicons/react/24/outline';
import { settingsService } from '../../services/settingsService';
import { useToast } from '../../context/ToastContext';

const SystemSettings = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12-hour',
    currency: 'PKR',
    language: 'en',
    timezone: 'Asia/Karachi',
    
    enableAttendance: true,
    enableFees: true,
    enableSMS: false,
    enableEmail: true,
    // Optional modules (hidden):
    // enableLibrary: true,
    // enableTransport: true,
    // enableHostel: true,
    
    sessionTimeout: 30,
    passwordMinLength: 6,
    passwordRequireSpecialChar: false,
    enableTwoFactor: false,
    maxLoginAttempts: 5,
    
    autoBackup: false,
    backupFrequency: 'daily',
    backupTime: '02:00',
  });

  const [schoolTimings, setSchoolTimings] = useState({
    startTime: '08:00',
    endTime: '14:00',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  });

  const [academicYear, setAcademicYear] = useState({
    current: new Date().getFullYear().toString(),
    startMonth: 4,
    endMonth: 3,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Fetch system settings
      const settingsResponse = await settingsService.getSystemSettings();
      if (settingsResponse.data) {
        setSettings({ ...settings, ...settingsResponse.data });
      }
      
      // Fetch school profile for timings and academic year
      const profileResponse = await settingsService.getSchoolProfile();
      const data = profileResponse.data;
      
      if (data.schoolTimings) {
        setSchoolTimings(data.schoolTimings);
      }
      if (data.academicYear) {
        setAcademicYear(data.academicYear);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleWorkingDayToggle = (day) => {
    setSchoolTimings((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Update system settings
      await settingsService.updateSystemSettings(settings);
      
      // Update school profile (timings and academic year)
      await settingsService.updateSchoolProfile({
        schoolTimings,
        academicYear,
      });
      
      toast.success('System settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
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
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure system-wide settings and preferences
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CogIcon className="h-5 w-5 mr-2" />
              General Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Date Format"
                name="dateFormat"
                value={settings.dateFormat}
                onChange={handleInputChange}
                options={[
                  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                ]}
              />
              <Select
                label="Time Format"
                name="timeFormat"
                value={settings.timeFormat}
                onChange={handleInputChange}
                options={[
                  { value: '12-hour', label: '12-hour (AM/PM)' },
                  { value: '24-hour', label: '24-hour' },
                ]}
              />
              <Input
                label="Currency"
                name="currency"
                value={settings.currency}
                onChange={handleInputChange}
              />
              <Select
                label="Timezone"
                name="timezone"
                value={settings.timezone}
                onChange={handleInputChange}
                options={[
                  { value: 'Asia/Karachi', label: 'Pakistan (Asia/Karachi)' },
                  { value: 'Asia/Dubai', label: 'UAE (Asia/Dubai)' },
                  { value: 'Asia/Kolkata', label: 'India (Asia/Kolkata)' },
                ]}
              />
            </div>
          </div>

          {/* School Timings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">School Timings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="Start Time"
                type="time"
                value={schoolTimings.startTime}
                onChange={(e) => setSchoolTimings({ ...schoolTimings, startTime: e.target.value })}
              />
              <Input
                label="End Time"
                type="time"
                value={schoolTimings.endTime}
                onChange={(e) => setSchoolTimings({ ...schoolTimings, endTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Working Days
              </label>
              <div className="flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <label key={day} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={schoolTimings.workingDays.includes(day)}
                      onChange={() => handleWorkingDayToggle(day)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Academic Year */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Year</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Current Academic Year"
                value={academicYear.current}
                onChange={(e) => setAcademicYear({ ...academicYear, current: e.target.value })}
                placeholder="2024-2025"
              />
              <Select
                label="Start Month"
                value={academicYear.startMonth}
                onChange={(e) => setAcademicYear({ ...academicYear, startMonth: parseInt(e.target.value) })}
                options={[
                  { value: 1, label: 'January' },
                  { value: 2, label: 'February' },
                  { value: 3, label: 'March' },
                  { value: 4, label: 'April' },
                  { value: 5, label: 'May' },
                  { value: 6, label: 'June' },
                  { value: 7, label: 'July' },
                  { value: 8, label: 'August' },
                  { value: 9, label: 'September' },
                  { value: 10, label: 'October' },
                  { value: 11, label: 'November' },
                  { value: 12, label: 'December' },
                ]}
              />
              <Select
                label="End Month"
                value={academicYear.endMonth}
                onChange={(e) => setAcademicYear({ ...academicYear, endMonth: parseInt(e.target.value) })}
                options={[
                  { value: 1, label: 'January' },
                  { value: 2, label: 'February' },
                  { value: 3, label: 'March' },
                  { value: 4, label: 'April' },
                  { value: 5, label: 'May' },
                  { value: 6, label: 'June' },
                  { value: 7, label: 'July' },
                  { value: 8, label: 'August' },
                  { value: 9, label: 'September' },
                  { value: 10, label: 'October' },
                  { value: 11, label: 'November' },
                  { value: 12, label: 'December' },
                ]}
              />
            </div>
          </div>

          {/* Feature Modules */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Enable/Disable Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'enableAttendance', label: 'Attendance Module' },
                { name: 'enableFees', label: 'Fee Management' },
                { name: 'enableSMS', label: 'SMS Notifications' },
                { name: 'enableEmail', label: 'Email Notifications' },
                // Temporarily hidden - Optional modules:
                // { name: 'enableLibrary', label: 'Library Module' },
                // { name: 'enableTransport', label: 'Transport Module' },
                // { name: 'enableHostel', label: 'Hostel Module' },
              ].map((module) => (
                <label key={module.name} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name={module.name}
                    checked={settings[module.name]}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{module.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Session Timeout (minutes)"
                name="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={handleInputChange}
                min="5"
                max="120"
              />
              <Input
                label="Password Min Length"
                name="passwordMinLength"
                type="number"
                value={settings.passwordMinLength}
                onChange={handleInputChange}
                min="6"
                max="20"
              />
              <Input
                label="Max Login Attempts"
                name="maxLoginAttempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={handleInputChange}
                min="3"
                max="10"
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="passwordRequireSpecialChar"
                  checked={settings.passwordRequireSpecialChar}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Require Special Characters in Password
                </label>
              </div>
            </div>
          </div>

          {/* Backup Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Automatic Backup</h2>
            <div className="space-y-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="autoBackup"
                  checked={settings.autoBackup}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable Automatic Backups</span>
              </label>

              {settings.autoBackup && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Backup Frequency"
                    name="backupFrequency"
                    value={settings.backupFrequency}
                    onChange={handleInputChange}
                    options={[
                      { value: 'daily', label: 'Daily' },
                      { value: 'weekly', label: 'Weekly' },
                      { value: 'monthly', label: 'Monthly' },
                    ]}
                  />
                  <Input
                    label="Backup Time"
                    name="backupTime"
                    type="time"
                    value={settings.backupTime}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save All Settings'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default SystemSettings;

