import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { BellIcon, CheckCircleIcon, TrashIcon, InformationCircleIcon, ExclamationTriangleIcon, AcademicCapIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import notificationService from '../services/notificationService';
import { useToast } from '../context/ToastContext';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { read: filter === 'read' } : {};
      const response = await notificationService.getNotifications(params);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      toast.success('Marked as read');
      fetchNotifications();
    } catch (error) {
      toast.error('Error marking notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (error) {
      toast.error('Error marking all as read');
    }
  };

  const getNotificationIcon = (type) => {
    const colors = {
      info: 'bg-blue-100 text-blue-600',
      success: 'bg-green-100 text-green-600',
      warning: 'bg-yellow-100 text-yellow-600',
      error: 'bg-red-100 text-red-600',
      announcement: 'bg-purple-100 text-purple-600',
    };

    const markAsRead = async (id) => {
        try {
            const response = await notificationService.markAsRead(id);
            if (response.success) {
                setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

        {/* Filters */}
        <div className="flex space-x-2">
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

    const getIcon = (type) => {
        switch (type) {
            case 'announcement': return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
            case 'grade': return <AcademicCapIcon className="h-6 w-6 text-green-500" />;
            case 'attendance': return <BellIcon className="h-6 w-6 text-orange-500" />;
            case 'fee': return <BanknotesIcon className="h-6 w-6 text-red-500" />;
            case 'warning': return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
            default: return <BellIcon className="h-6 w-6 text-gray-500" />;
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Stay updated with the latest school activities</p>
                    </div>
                    {notifications.some(n => !n.read) && (
                        <button
                            onClick={markAllAsRead}
                            className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                <div className="bg-white dark:bg-dark-800 shadow rounded-lg overflow-hidden border border-gray-100 dark:border-dark-700">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-12 text-center">
                            <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-dark-700">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 flex gap-4 transition-colors ${notification.read ? 'opacity-75' : 'bg-primary-50/30 dark:bg-primary-900/5'}`}
                                    onClick={() => !notification.read && markAsRead(notification._id)}
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className={`text-sm font-semibold ${notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                                {notification.title}
                                            </h3>
                                            <span className="text-xs text-gray-400">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {notification.message}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="flex-shrink-0 self-center">
                                            <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Notifications;
