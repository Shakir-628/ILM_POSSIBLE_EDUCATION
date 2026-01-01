/**
 * Notification emission utilities for Socket.IO
 * Used to emit notifications to admin users in real-time
 */

import Notification from '../models/Notification.js';
import { getIO, emitToUser, emitToRole } from '../config/socket.js';

/**
 * Emit a new notification to a specific user
 */
export const emitNotificationToUser = async (userId, notification) => {
  try {
    const io = getIO();
    
    // Emit to user's specific room
    emitToUser(userId, 'notification:new', {
      _id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      createdAt: notification.createdAt,
    });

    console.log(`✉️ Notification emitted to user ${userId}`);
  } catch (error) {
    console.error('Error emitting notification to user:', error);
  }
};

/**
 * Emit notification to all admins
 */
export const emitNotificationToAdmins = async (notification) => {
  try {
    const io = getIO();
    
    // Emit to admin role room
    emitToRole('admin', 'notification:new', {
      _id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      createdAt: notification.createdAt,
    });

    // Also emit to superadmins
    emitToRole('superadmin', 'notification:new', {
      _id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      createdAt: notification.createdAt,
    });

    console.log(`✉️ Notification emitted to all admins`);
  } catch (error) {
    console.error('Error emitting notification to admins:', error);
  }
};

/**
 * Create a notification and emit it via Socket.IO
 */
export const createAndEmitNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    
    // Emit to recipient
    await emitNotificationToUser(notificationData.recipient, notification);
    
    return notification;
  } catch (error) {
    console.error('Error creating and emitting notification:', error);
    throw error;
  }
};

/**
 * Create bulk notifications and emit them
 */
export const createAndEmitBulkNotifications = async (recipients, notificationData) => {
  try {
    const notifications = [];

    for (const recipientId of recipients) {
      const notification = await Notification.create({
        ...notificationData,
        recipient: recipientId,
      });

      notifications.push(notification);
      
      // Emit to each recipient
      await emitNotificationToUser(recipientId, notification);
    }

    return notifications;
  } catch (error) {
    console.error('Error creating and emitting bulk notifications:', error);
    throw error;
  }
};

/**
 * Broadcast notification update to all clients
 */
export const broadcastNotificationUpdate = () => {
  try {
    const io = getIO();
    io.emit('notification:updated', {
      timestamp: new Date(),
      message: 'Notifications have been updated'
    });

    console.log(`📡 Notification update broadcast sent`);
  } catch (error) {
    console.error('Error broadcasting notification update:', error);
  }
};
