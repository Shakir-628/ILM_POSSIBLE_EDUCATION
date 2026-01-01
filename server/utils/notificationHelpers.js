/**
 * Helper functions to create notifications from within controllers
 * Automatically emits via Socket.IO
 */

import { createAndEmitNotification } from './notificationEmitter.js';

/**
 * Create a late fee notification for a student
 */
export const createLateFeeNotification = async (adminId, studentData, feeData) => {
  try {
    const notification = await createAndEmitNotification({
      recipient: adminId,
      title: `Late Fee Alert - ${studentData.firstName} ${studentData.lastName}`,
      message: `Student ${studentData.firstName} ${studentData.lastName} has an overdue fee of Rs. ${feeData.balance.toFixed(2)} due on ${new Date(feeData.dueDate).toLocaleDateString()}`,
      type: 'fee',
      relatedEntity: 'fee',
      relatedEntityId: feeData._id,
      link: '/accounting/fees',
      actionText: 'View Fee Details'
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating late fee notification:', error);
  }
};

/**
 * Create an upcoming event notification
 */
export const createUpcomingEventNotification = async (adminId, eventData) => {
  try {
    const daysUntil = Math.ceil((new Date(eventData.startDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    const notification = await createAndEmitNotification({
      recipient: adminId,
      title: `Upcoming Event - ${eventData.title}`,
      message: `Event "${eventData.title}" is scheduled in ${daysUntil} day(s) on ${new Date(eventData.startDate).toLocaleDateString()}`,
      type: 'event',
      relatedEntity: 'event',
      relatedEntityId: eventData._id,
      link: '/events',
      actionText: 'View Event'
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating upcoming event notification:', error);
  }
};

/**
 * Create an upcoming exam notification
 */
export const createUpcomingExamNotification = async (adminId, examData, scheduleData) => {
  try {
    const daysUntil = Math.ceil((new Date(scheduleData.examDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    const notification = await createAndEmitNotification({
      recipient: adminId,
      title: `Upcoming Exam - ${examData.examName}`,
      message: `Exam "${examData.examName}" for class ${examData.class?.name} is scheduled in ${daysUntil} day(s)`,
      type: 'exam',
      relatedEntity: 'exam',
      relatedEntityId: examData._id,
      link: '/exams',
      actionText: 'View Exam Schedule'
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating upcoming exam notification:', error);
  }
};

/**
 * Create an announcement notification for all users
 */
export const createAnnouncementNotification = async (recipientId, announcementData) => {
  try {
    const notification = await createAndEmitNotification({
      recipient: recipientId,
      title: `Announcement - ${announcementData.title}`,
      message: announcementData.content?.substring(0, 100) || announcementData.title,
      type: 'announcement',
      relatedEntity: 'announcement',
      relatedEntityId: announcementData._id,
      link: '/announcements',
      actionText: 'View Announcement'
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating announcement notification:', error);
  }
};

/**
 * Create a system alert notification
 */
export const createSystemAlertNotification = async (adminId, alertData) => {
  try {
    const notification = await createAndEmitNotification({
      recipient: adminId,
      title: alertData.title,
      message: alertData.message,
      type: 'warning',
      link: alertData.link || '/dashboard',
      actionText: alertData.actionText || 'View Details'
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating system alert notification:', error);
  }
};

/**
 * Create assignment submission notification
 */
export const createAssignmentNotification = async (recipientId, assignmentData, submissionData) => {
  try {
    const notification = await createAndEmitNotification({
      recipient: recipientId,
      title: `Assignment Submission - ${assignmentData.title}`,
      message: `A new submission has been received for "${assignmentData.title}"`,
      type: 'assignment',
      relatedEntity: 'assignment',
      relatedEntityId: assignmentData._id,
      link: '/assignments',
      actionText: 'View Submission'
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating assignment notification:', error);
  }
};

/**
 * Create grade notification
 */
export const createGradeNotification = async (studentParentId, gradeData, subjectName) => {
  try {
    const notification = await createAndEmitNotification({
      recipient: studentParentId,
      title: `New Grade - ${subjectName}`,
      message: `Your grade for ${subjectName} is ${gradeData.grade}`,
      type: 'grade',
      relatedEntity: 'grade',
      relatedEntityId: gradeData._id,
      link: '/grades',
      actionText: 'View Grade'
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating grade notification:', error);
  }
};

/**
 * Create attendance notification
 */
export const createAttendanceNotification = async (studentParentId, attendanceData, date) => {
  try {
    const status = attendanceData.status?.toUpperCase() || 'RECORDED';
    
    const notification = await createAndEmitNotification({
      recipient: studentParentId,
      title: `Attendance - ${status}`,
      message: `Attendance has been marked as ${status} for ${new Date(date).toLocaleDateString()}`,
      type: 'attendance',
      relatedEntity: 'attendance',
      relatedEntityId: attendanceData._id,
      link: '/attendance',
      actionText: 'View Attendance'
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating attendance notification:', error);
  }
};
