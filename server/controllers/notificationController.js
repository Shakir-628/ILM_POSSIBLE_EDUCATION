import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Parent from "../models/Parent.js";
import Student from "../models/Student.js";
import {
  createAdminNotifications,
  refreshAdminNotifications,
  getLateFees,
  getUpcomingEvents,
  getUpcomingExams,
} from "../services/adminNotificationService.js";
import {
  createAndEmitNotification,
  createAndEmitBulkNotifications,
  broadcastNotificationUpdate,
} from "../utils/notificationEmitter.js";

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const { read, type, limit = 50 } = req.query;
    const filter = { recipient: req.user._id };

    if (read !== undefined) filter.read = read === "true";
    if (type) filter.type = type;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread/count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Check if user is recipient
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Check if user is recipient
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create notification (Admin/System use)
// @route   POST /api/notifications
// @access  Private (Admin)
export const createNotification = async (req, res) => {
  try {
    const notification = await createAndEmitNotification(req.body);

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Create notification error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create bulk notifications
// @route   POST /api/notifications/bulk
// @access  Private (Admin)
export const createBulkNotifications = async (req, res) => {
  try {
    const { recipients, targetAudience, title, message, type, link } = req.body;

    let finalRecipients = recipients || [];

    // If targetAudience is provided, fetch user IDs based on audience
    if (targetAudience && targetAudience !== 'custom') {
      let query = { isActive: true };

      if (targetAudience === 'students') query.role = 'student';
      else if (targetAudience === 'teachers') query.role = 'teacher';
      else if (targetAudience === 'staff') query.role = { $in: ['admin', 'superadmin', 'teacher'] };
      else if (targetAudience === 'parents') {
        const parents = await Parent.find({ isActive: true }).select('user');
        const parentUserIds = parents.map(p => p.user);
        query = { _id: { $in: parentUserIds } };
      }
      else if (targetAudience === 'class' && req.body.classId) {
        const studentsInClass = await Student.find({ class: req.body.classId }).select('user');
        const studentUserIds = studentsInClass.map(s => s.user);
        query = { _id: { $in: studentUserIds } };
      }
      // 'all' includes everyone
      else if (targetAudience === 'all') {
        // No additional query param needed
      }

      const users = await User.find(query).select('_id');
      finalRecipients = users.map(u => u._id);
    }

    if (!finalRecipients || finalRecipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No recipients found for the selected audience",
      });
    }

    const notifications = await createAndEmitBulkNotifications(
      finalRecipients,
      { title, message, type, link }
    );

    res.status(201).json({
      success: true,
      message: `${notifications.length} notifications created successfully`,
      count: notifications.length,
    });
  } catch (error) {
    console.error("Create bulk notifications error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Refresh admin notifications (late fees, upcoming events, exams)
// @route   POST /api/notifications/admin/refresh
// @access  Private (Admin/Superadmin)
export const refreshAdminNotificationsHandler = async (req, res) => {
  try {
    const results = await refreshAdminNotifications();

    res.status(200).json({
      success: true,
      message: "Admin notifications refreshed successfully",
      data: results,
    });
  } catch (error) {
    console.error("Refresh admin notifications error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get admin notification summary (late fees count, upcoming events, exams)
// @route   GET /api/notifications/admin/summary
// @access  Private (Admin/Superadmin)
export const getAdminNotificationSummary = async (req, res) => {
  try {
    const lateFees = await getLateFees();
    const upcomingEvents = await getUpcomingEvents(7);
    const upcomingExams = await getUpcomingExams(7);

    const summary = {
      lateFees: {
        count: lateFees.length,
        totalAmount: lateFees.reduce((sum, payment) => sum + payment.balance, 0),
        details: lateFees,
      },
      upcomingEvents: {
        count: upcomingEvents.length,
        details: upcomingEvents,
      },
      upcomingExams: {
        count: upcomingExams.length,
        details: upcomingExams,
      },
    };

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Get admin notification summary error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


