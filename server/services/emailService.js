import nodemailer from "nodemailer";

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
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
      from: `"${process.env.APP_NAME || 'School Management System'}" <${
        process.env.EMAIL_USER
      }>`,
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

// Send forgot password email
export const sendForgotPasswordEmail = async (email, resetToken, resetUrl) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>You requested a password reset for your account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p style="margin-top: 20px; color: #666;">This link will expire in 1 hour.</p>
      <p style="color: #666;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: "Password Reset Request",
    html,
    text: `Reset your password: ${resetUrl}`,
  });
};

// Send assignment notification
export const sendAssignmentNotification = async (email, assignmentDetails) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Assignment Posted</h2>
      <p><strong>Title:</strong> ${assignmentDetails.title}</p>
      <p><strong>Subject:</strong> ${assignmentDetails.subject}</p>
      <p><strong>Due Date:</strong> ${new Date(assignmentDetails.dueDate).toLocaleDateString()}</p>
      <p><strong>Description:</strong></p>
      <p>${assignmentDetails.description}</p>
      <a href="${process.env.CLIENT_URL}/assignments/${assignmentDetails.id}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">View Assignment</a>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `New Assignment: ${assignmentDetails.title}`,
    html,
  });
};

// Send grade notification
export const sendGradeNotification = async (email, gradeDetails) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Grade Updated</h2>
      <p><strong>Subject:</strong> ${gradeDetails.subject}</p>
      <p><strong>Marks:</strong> ${gradeDetails.marks} / ${gradeDetails.totalMarks}</p>
      <p><strong>Grade:</strong> ${gradeDetails.grade}</p>
      ${gradeDetails.feedback ? `<p><strong>Feedback:</strong> ${gradeDetails.feedback}</p>` : ""}
      <a href="${process.env.CLIENT_URL}/grades" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View All Grades</a>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `Grade Posted: ${gradeDetails.subject}`,
    html,
  });
};

// Send announcement email
export const sendAnnouncementEmail = async (email, announcement) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${announcement.title}</h2>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        ${announcement.content}
      </div>
      ${announcement.priority === 'urgent' ? '<p style="color: red; font-weight: bold;">⚠️ URGENT</p>' : ''}
      <a href="${process.env.CLIENT_URL}/announcements" style="display: inline-block; padding: 10px 20px; background-color: #17a2b8; color: white; text-decoration: none; border-radius: 5px;">View Announcement</a>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `Announcement: ${announcement.title}`,
    html,
  });
};

export default {
  sendEmail,
  sendForgotPasswordEmail,
  sendAssignmentNotification,
  sendGradeNotification,
  sendAnnouncementEmail,
};

