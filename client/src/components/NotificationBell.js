import React, { useState, useEffect, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import io from 'socket.io-client';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const { addToast } = useToast();
  const { user, token } = useAuth();

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!user || !token) return;

    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    const socketUrl = baseUrl.replace(/\/api\/?$/, '');

    const newSocket = io(socketUrl, {
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to notification server');
    });

    // Listen for new notifications
    newSocket.on('notification:new', (data) => {
      console.log('New notification received:', data);
      setUnreadCount((prev) => prev + 1);
      // Refresh notifications list
      fetchNotifications();
      addToast(data.title || 'New notification', 'success');
    });

    // Listen for notification updates
    newSocket.on('notification:updated', () => {
      console.log('Notifications updated');
      fetchNotifications();
    });

    // Listen for connection errors
    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, token, addToast]);

  // Fetch unread count on mount
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchNotifications();
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications({ limit: 10 });
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await notificationService.markAsRead(notificationId);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      addToast('Notification marked as read', 'success');
    } catch (error) {
      console.error('Error marking as read:', error);
      addToast('Failed to mark notification as read', 'error');
    }
  };

  const handleDeleteNotification = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));
      addToast('Notification deleted', 'success');
    } catch (error) {
      console.error('Error deleting notification:', error);
      addToast('Failed to delete notification', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      addToast('All notifications marked as read', 'success');
    } catch (error) {
      console.error('Error marking all as read:', error);
      addToast('Failed to mark all as read', 'error');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      fee: '💰',
      exam: '📝',
      event: '📅',
      assignment: '📋',
      message: '💬',
      warning: '⚠️',
      success: '✅',
      error: '❌',
      announcement: '📢',
      attendance: '📍',
      info: 'ℹ️',
    };

    return icons[type] || icons.info;
  };

  const getTypeColor = (type) => {
    const colors = {
      fee: 'bg-yellow-50 border-yellow-200',
      exam: 'bg-blue-50 border-blue-200',
      event: 'bg-purple-50 border-purple-200',
      assignment: 'bg-green-50 border-green-200',
      message: 'bg-indigo-50 border-indigo-200',
      warning: 'bg-orange-50 border-orange-200',
      error: 'bg-red-50 border-red-200',
      success: 'bg-green-50 border-green-200',
      announcement: 'bg-pink-50 border-pink-200',
      default: 'bg-gray-50 border-gray-200',
    };

    return colors[type] || colors.default;
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative text-gray-600 hover:text-primary-600 hover:bg-primary-50 p-2.5 rounded-xl transition-all duration-200 hover:scale-110 group">
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-danger-500 border-2 border-white rounded-full animate-pulse"></span>
            <span className="absolute -top-1 -right-1 bg-gradient-to-br from-danger-500 to-danger-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-96 origin-top-right bg-white rounded-xl shadow-2xl border border-gray-100 focus:outline-none overflow-hidden max-h-96 flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-gray-100 sticky top-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Notifications</p>
                <p className="text-xs text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading && notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin h-5 w-5 rounded-full border-b-2 border-primary-500 mx-auto mb-2"></div>
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BellIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <Menu.Item key={notification._id}>
                    {({ active }) => (
                      <div
                        className={`px-4 py-3 cursor-pointer transition-colors ${active ? 'bg-gray-50' : ''
                          } ${notification.read ? 'opacity-60' : 'bg-primary-50/30'}`}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 text-lg pt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'
                              }`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex-shrink-0 flex gap-1">
                            {!notification.read && (
                              <button
                                onClick={(e) => handleMarkAsRead(notification._id, e)}
                                className="p-1 hover:bg-primary-100 rounded transition-colors"
                                title="Mark as read"
                              >
                                <CheckIcon className="h-4 w-4 text-primary-600" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDeleteNotification(notification._id, e)}
                              className="p-1 hover:bg-red-100 rounded transition-colors"
                              title="Delete"
                            >
                              <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Menu.Item>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 sticky bottom-0">
              <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-1 transition-colors">
                View All Notifications →
              </button>
            </div>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default NotificationBell;
