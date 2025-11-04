import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email
export const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"School Management System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hello ${userName},</p>
      <p>You requested to reset your password. Click the button below to reset it:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="color: #666; word-break: break-all;">${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">School Management System</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: "Password Reset Request",
    html,
    text: `Reset your password using this link: ${resetUrl}`,
  });
};

// Send assignment notification
export const sendAssignmentNotification = async (studentEmail, assignmentTitle, dueDate, studentName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Assignment Posted</h2>
      <p>Hello ${studentName},</p>
      <p>A new assignment has been posted:</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #4F46E5;">${assignmentTitle}</h3>
        <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
      </div>
      <p>Please log in to view the details and submit your work.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/assignments" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Assignment</a>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">School Management System</p>
    </div>
  `;

  return await sendEmail({
    to: studentEmail,
    subject: `New Assignment: ${assignmentTitle}`,
    html,
  });
};

// Send grade notification
export const sendGradeNotification = async (studentEmail, assignmentTitle, marks, totalMarks, studentName) => {
  const percentage = ((marks / totalMarks) * 100).toFixed(2);
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Assignment Graded</h2>
      <p>Hello ${studentName},</p>
      <p>Your assignment has been graded:</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${assignmentTitle}</h3>
        <p style="font-size: 24px; color: #4F46E5; margin: 10px 0;"><strong>${marks} / ${totalMarks}</strong> (${percentage}%)</p>
      </div>
      <p>Log in to view detailed feedback.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/submissions" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Details</a>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">School Management System</p>
    </div>
  `;

  return await sendEmail({
    to: studentEmail,
    subject: `Grade Posted: ${assignmentTitle}`,
    html,
  });
};

// Send welcome email for new users
export const sendWelcomeEmail = async (email, userName, password, role) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Welcome to ${process.env.APP_NAME || 'ILM Possible Education'}!</h2>
      <p>Hello ${userName},</p>
      <p>Your account has been successfully created with the role: <strong>${role}</strong></p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Your Login Credentials:</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p style="color: #e74c3c;"><strong>⚠️ Please change your password after first login!</strong></p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Login Now</a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">${process.env.APP_NAME || 'School Management System'}</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `Welcome to ${process.env.APP_NAME || 'School Management System'}`,
    html,
    text: `Welcome! Your login: Email: ${email}, Password: ${password}. Please change your password after first login.`,
  });
};

// Send admission confirmation email
export const sendAdmissionConfirmationEmail = async (email, studentData) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">🎉 Admission Confirmed!</h2>
      <p>Dear ${studentData.guardianName},</p>
      <p>We are pleased to inform you that <strong>${studentData.firstName} ${studentData.lastName}</strong> has been successfully admitted to our institution.</p>
      
      <div style="background-color: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2e7d32;">Student Details:</h3>
        <p><strong>Student ID:</strong> ${studentData.studentId}</p>
        <p><strong>Class:</strong> ${studentData.className}</p>
        <p><strong>Admission Date:</strong> ${new Date(studentData.admissionDate).toLocaleDateString()}</p>
      </div>
      
      <p>Next steps:</p>
      <ul>
        <li>Complete fee payment</li>
        <li>Submit required documents</li>
        <li>Collect student ID card</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Access Portal</a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">${process.env.SCHOOL_NAME || 'School Management System'}</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `Admission Confirmation - ${studentData.firstName} ${studentData.lastName}`,
    html,
  });
};

// Send certificate notification email
export const sendCertificateNotificationEmail = async (email, certificateData) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">📜 Certificate Issued</h2>
      <p>Dear ${certificateData.studentName},</p>
      <p>Your <strong>${certificateData.certificateType}</strong> certificate has been issued and is ready for download.</p>
      
      <div style="background-color: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1976d2;">Certificate Details:</h3>
        <p><strong>Certificate Number:</strong> ${certificateData.certificateNumber}</p>
        <p><strong>Type:</strong> ${certificateData.certificateType}</p>
        <p><strong>Issue Date:</strong> ${new Date(certificateData.issueDate).toLocaleDateString()}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/certificates" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Download Certificate</a>
      </div>
      
      <p style="color: #666; font-size: 12px;">Verification Code: ${certificateData.verificationCode}</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">${process.env.SCHOOL_NAME || 'School Management System'}</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `Certificate Issued - ${certificateData.certificateNumber}`,
    html,
  });
};

// Send fee payment receipt email
export const sendFeeReceiptEmail = async (email, paymentData) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">💳 Payment Receipt</h2>
      <p>Dear ${paymentData.studentName},</p>
      <p>Thank you for your payment. Here are the details:</p>
      
      <div style="background-color: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2e7d32;">Payment Details:</h3>
        <p><strong>Receipt Number:</strong> ${paymentData.receiptNumber}</p>
        <p><strong>Amount Paid:</strong> ${paymentData.currency || 'PKR'} ${paymentData.amount}</p>
        <p><strong>Payment Date:</strong> ${new Date(paymentData.paymentDate).toLocaleDateString()}</p>
        <p><strong>Payment Method:</strong> ${paymentData.paymentMethod}</p>
      </div>
      
      ${paymentData.balanceRemaining > 0 ? `
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Remaining Balance:</strong> ${paymentData.currency || 'PKR'} ${paymentData.balanceRemaining}</p>
        </div>
      ` : `
        <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #155724;">✅ All fees paid! Thank you.</p>
        </div>
      `}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/fees" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Payment History</a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">${process.env.SCHOOL_NAME || 'School Management System'}</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `Payment Receipt - ${paymentData.receiptNumber}`,
    html,
  });
};

// Send attendance alert email
export const sendAttendanceAlertEmail = async (email, attendanceData) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e74c3c;">⚠️ Attendance Alert</h2>
      <p>Dear ${attendanceData.guardianName},</p>
      <p>This is to inform you about the attendance of <strong>${attendanceData.studentName}</strong>:</p>
      
      <div style="background-color: #fee; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e74c3c;">
        <h3 style="margin-top: 0; color: #c0392b;">Attendance Summary:</h3>
        <p><strong>Attendance Rate:</strong> ${attendanceData.attendanceRate}%</p>
        <p><strong>Total Days:</strong> ${attendanceData.totalDays}</p>
        <p><strong>Present:</strong> ${attendanceData.presentDays}</p>
        <p><strong>Absent:</strong> ${attendanceData.absentDays}</p>
      </div>
      
      ${attendanceData.attendanceRate < 75 ? `
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;"><strong>Note:</strong> Attendance is below 75%. Please ensure regular attendance.</p>
        </div>
      ` : ''}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/attendance" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Attendance</a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">${process.env.SCHOOL_NAME || 'School Management System'}</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `Attendance Alert - ${attendanceData.studentName}`,
    html,
  });
};

// Send announcement email
export const sendAnnouncementEmail = async (email, announcementData) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      ${announcementData.priority === 'urgent' ? '<div style="background-color: #e74c3c; color: white; padding: 10px; text-align: center; font-weight: bold;">🚨 URGENT ANNOUNCEMENT 🚨</div>' : ''}
      
      <h2 style="color: #4F46E5;">${announcementData.title}</h2>
      <p style="color: #666; font-size: 12px;">Posted on: ${new Date(announcementData.date).toLocaleDateString()}</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        ${announcementData.content}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/announcements" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View All Announcements</a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">${process.env.SCHOOL_NAME || 'School Management System'}</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `${announcementData.priority === 'urgent' ? '🚨 URGENT: ' : ''}${announcementData.title}`,
    html,
  });
};

// Send event reminder email
export const sendEventReminderEmail = async (email, eventData) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">📅 Upcoming Event Reminder</h2>
      <p>Hello,</p>
      <p>This is a reminder about the upcoming event:</p>
      
      <div style="background-color: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1976d2;">${eventData.title}</h3>
        <p><strong>Date:</strong> ${new Date(eventData.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${eventData.time || 'TBD'}</p>
        <p><strong>Location:</strong> ${eventData.location || 'School Campus'}</p>
        ${eventData.description ? `<p style="margin-top: 15px;">${eventData.description}</p>` : ''}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/events" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Event Details</a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">${process.env.SCHOOL_NAME || 'School Management System'}</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `Event Reminder: ${eventData.title}`,
    html,
  });
};

// Send report card notification email
export const sendReportCardEmail = async (email, reportCardData) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">📊 Report Card Available</h2>
      <p>Dear ${reportCardData.guardianName},</p>
      <p>The report card for <strong>${reportCardData.studentName}</strong> is now available.</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Academic Summary:</h3>
        <p><strong>Class:</strong> ${reportCardData.className}</p>
        <p><strong>Exam:</strong> ${reportCardData.examName}</p>
        <p><strong>Academic Year:</strong> ${reportCardData.academicYear}</p>
        <p><strong>Overall Percentage:</strong> ${reportCardData.percentage}%</p>
        <p><strong>Grade:</strong> ${reportCardData.grade}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/report-cards" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Report Card</a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">${process.env.SCHOOL_NAME || 'School Management System'}</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `Report Card Available - ${reportCardData.studentName}`,
    html,
  });
};

// Send fee reminder email
export const sendFeeReminderEmail = async (email, feeData) => {
  const daysOverdue = Math.floor((new Date() - new Date(feeData.dueDate)) / (1000 * 60 * 60 * 24));
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${daysOverdue > 0 ? '#e74c3c' : '#f39c12'};">💰 Fee Payment ${daysOverdue > 0 ? 'Overdue' : 'Reminder'}</h2>
      <p>Dear ${feeData.guardianName},</p>
      <p>This is a ${daysOverdue > 0 ? 'reminder that payment is overdue' : 'friendly reminder about upcoming payment'} for <strong>${feeData.studentName}</strong>.</p>
      
      <div style="background-color: ${daysOverdue > 0 ? '#fee' : '#fff3cd'}; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${daysOverdue > 0 ? '#e74c3c' : '#f39c12'};">
        <h3 style="margin-top: 0;">Payment Details:</h3>
        <p><strong>Fee Type:</strong> ${feeData.feeType}</p>
        <p><strong>Amount Due:</strong> ${feeData.currency || 'PKR'} ${feeData.amount}</p>
        <p><strong>Due Date:</strong> ${new Date(feeData.dueDate).toLocaleDateString()}</p>
        ${daysOverdue > 0 ? `<p style="color: #c0392b;"><strong>Days Overdue:</strong> ${daysOverdue}</p>` : ''}
      </div>
      
      <p>Please make the payment at your earliest convenience to avoid any late fees.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/fees" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Pay Now</a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">${process.env.SCHOOL_NAME || 'School Management System'}</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `Fee Payment ${daysOverdue > 0 ? 'Overdue' : 'Reminder'} - ${feeData.studentName}`,
    html,
  });
};

// Send exam schedule notification
export const sendExamScheduleEmail = async (email, examData) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">📝 Exam Schedule Published</h2>
      <p>Dear ${examData.studentName || 'Student'},</p>
      <p>The exam schedule for <strong>${examData.examName}</strong> has been published.</p>
      
      <div style="background-color: #fce4ec; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #c2185b;">Exam Details:</h3>
        <p><strong>Exam:</strong> ${examData.examName}</p>
        <p><strong>Class:</strong> ${examData.className}</p>
        <p><strong>Start Date:</strong> ${new Date(examData.startDate).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> ${new Date(examData.endDate).toLocaleDateString()}</p>
      </div>
      
      <p>Please check the portal for the complete schedule and prepare accordingly.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/exam-schedule" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Exam Schedule</a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">${process.env.SCHOOL_NAME || 'School Management System'}</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `Exam Schedule: ${examData.examName}`,
    html,
  });
};

export default {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendAdmissionConfirmationEmail,
  sendCertificateNotificationEmail,
  sendFeeReceiptEmail,
  sendFeeReminderEmail,
  sendAttendanceAlertEmail,
  sendAnnouncementEmail,
  sendEventReminderEmail,
  sendReportCardEmail,
  sendExamScheduleEmail,
  sendAssignmentNotification,
  sendGradeNotification,
};

