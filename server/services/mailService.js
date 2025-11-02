import nodemailer from "nodemailer";

// Create transporter
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

export default {
  sendEmail,
  sendPasswordResetEmail,
  sendAssignmentNotification,
  sendGradeNotification,
};

