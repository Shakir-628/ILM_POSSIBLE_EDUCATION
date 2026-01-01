import FeePayment from '../models/FeePayment.js';
import Event from '../models/Event.js';
import ExamSchedule from '../models/ExamSchedule.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

/**
 * Fetch late fees for students
 * Returns students with unpaid or overdue fees
 */
export const getLateFees = async () => {
  try {
    const now = new Date();
    
    // Find fee payments that are overdue (dueDate passed and balance > 0)
    const latePayments = await FeePayment.find({
      dueDate: { $lt: now },
      balance: { $gt: 0 },
      status: { $ne: 'paid' }
    })
      .populate('student', 'firstName lastName email')
      .select('student amount balance dueDate status totalAmount amountPaid');

    return latePayments;
  } catch (error) {
    console.error('Error fetching late fees:', error);
    throw error;
  }
};

/**
 * Fetch upcoming events within specified days
 * Default: 7 days
 */
export const getUpcomingEvents = async (daysAhead = 7) => {
  try {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const events = await Event.find({
      startDate: { $gte: now, $lte: futureDate },
      status: { $ne: 'cancelled' }
    })
      .select('title description startDate endDate eventType venue')
      .sort({ startDate: 1 });

    return events;
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
};

/**
 * Fetch upcoming exams within specified days
 * Default: 7 days
 */
export const getUpcomingExams = async (daysAhead = 7) => {
  try {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    // Get all exam schedules and filter for upcoming exam dates
    const examSchedules = await ExamSchedule.find({})
      .populate('class', 'name')
      .populate('schedule.subject', 'name');

    // Filter schedules with exam dates in the upcoming period
    const upcomingExams = [];
    examSchedules.forEach((exam) => {
      exam.schedule.forEach((sched) => {
        if (sched.examDate >= now && sched.examDate <= futureDate) {
          upcomingExams.push({
            examName: exam.examName,
            examType: exam.examType,
            class: exam.class.name,
            subject: sched.subject.name,
            examDate: sched.examDate,
            startTime: sched.startTime,
            endTime: sched.endTime
          });
        }
      });
    });

    return upcomingExams.sort((a, b) => a.examDate - b.examDate);
  } catch (error) {
    console.error('Error fetching upcoming exams:', error);
    throw error;
  }
};

/**
 * Create notifications for admin based on late fees, upcoming events, and exams
 * This function is called periodically or on-demand
 */
export const createAdminNotifications = async (adminId) => {
  try {
    const notifications = [];

    // 1. Late Fees Notification
    const latePayments = await getLateFees();
    if (latePayments.length > 0) {
      const totalLateAmount = latePayments.reduce((sum, payment) => sum + payment.balance, 0);
      const lateFeeNotification = await Notification.findOneAndUpdate(
        {
          recipient: adminId,
          type: 'fee',
          title: { $regex: 'Late Fee Reminder' }
        },
        {
          recipient: adminId,
          title: `Late Fee Reminder - ${latePayments.length} Students`,
          message: `${latePayments.length} student(s) have overdue fees totaling Rs. ${totalLateAmount.toFixed(2)}`,
          type: 'fee',
          read: false,
          relatedEntity: 'fee',
          link: '/accounting/fees',
          actionText: 'View Fees'
        },
        { upsert: true, new: true }
      );
      notifications.push(lateFeeNotification);
    }

    // 2. Upcoming Events Notification
    const upcomingEvents = await getUpcomingEvents(7);
    if (upcomingEvents.length > 0) {
      const eventsList = upcomingEvents.map(e => e.title).join(', ');
      const upcomingEventNotification = await Notification.findOneAndUpdate(
        {
          recipient: adminId,
          type: 'event',
          title: { $regex: 'Upcoming Events' }
        },
        {
          recipient: adminId,
          title: `Upcoming Events - Next 7 Days`,
          message: `${upcomingEvents.length} event(s) scheduled: ${eventsList}`,
          type: 'event',
          read: false,
          relatedEntity: 'event',
          link: '/events',
          actionText: 'View Events'
        },
        { upsert: true, new: true }
      );
      notifications.push(upcomingEventNotification);
    }

    // 3. Upcoming Exams Notification
    const upcomingExams = await getUpcomingExams(7);
    if (upcomingExams.length > 0) {
      const examsList = [...new Set(upcomingExams.map(e => `${e.examName} (${e.class})`))].join(', ');
      const upcomingExamNotification = await Notification.findOneAndUpdate(
        {
          recipient: adminId,
          type: 'exam',
          title: { $regex: 'Upcoming Exams' }
        },
        {
          recipient: adminId,
          title: `Upcoming Exams - Next 7 Days`,
          message: `${upcomingExams.length} exam(s) scheduled: ${examsList}`,
          type: 'exam',
          read: false,
          relatedEntity: 'exam',
          link: '/exams',
          actionText: 'View Exams'
        },
        { upsert: true, new: true }
      );
      notifications.push(upcomingExamNotification);
    }

    return notifications;
  } catch (error) {
    console.error('Error creating admin notifications:', error);
    throw error;
  }
};

/**
 * Get all admin users
 */
export const getAdminUsers = async () => {
  try {
    const admins = await User.find({
      role: { $in: ['admin', 'superadmin'] },
      status: 'active'
    }).select('_id name email role');

    return admins;
  } catch (error) {
    console.error('Error fetching admin users:', error);
    throw error;
  }
};

/**
 * Refresh notifications for all admins
 * Called periodically or on-demand to update notification status
 */
export const refreshAdminNotifications = async () => {
  try {
    const admins = await getAdminUsers();
    const results = [];

    for (const admin of admins) {
      const notifications = await createAdminNotifications(admin._id);
      results.push({
        adminId: admin._id,
        adminName: admin.name,
        notificationsCreated: notifications.length
      });
    }

    return results;
  } catch (error) {
    console.error('Error refreshing admin notifications:', error);
    throw error;
  }
};
