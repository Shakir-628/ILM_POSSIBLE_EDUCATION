import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { BellIcon, InformationCircleIcon, ExclamationTriangleIcon, AcademicCapIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import notificationService from '../services/notificationService';
import { useToast } from '../context/ToastContext';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
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
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (error) {
            toast.error('Error marking notification as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            toast.success('All notifications marked as read');
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            toast.error('Error marking all as read');
        }
    };

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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-display">Notifications</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Stay updated with the latest school activities</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {notifications.some(n => !n.read) && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex space-x-2">
                    {['all', 'unread', 'read'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === f
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="bg-white dark:bg-dark-800 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-700">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mb-4"></div>
                            <p className="text-gray-500">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="bg-gray-100 dark:bg-dark-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                                <BellIcon className="h-10 w-10 text-gray-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No notifications yet</p>
                            <p className="text-sm text-gray-400 mt-2">We'll notify you when something important happens.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-dark-700">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-5 flex gap-5 transition-all hover:bg-gray-50 dark:hover:bg-dark-700/50 cursor-pointer ${notification.read ? 'opacity-70' : 'bg-primary-50/20 shadow-inner-white'}`}
                                    onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="bg-white dark:bg-dark-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-dark-600">
                                            {getIcon(notification.type)}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className={`text-[15px] font-bold ${notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                                {notification.title}
                                            </h3>
                                            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-[14px] leading-relaxed text-gray-600 dark:text-gray-400 mt-1.5">
                                            {notification.message}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="flex-shrink-0 self-center">
                                            <div className="h-2.5 w-2.5 bg-primary-500 rounded-full shadow-glow-primary"></div>
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
