import FeePayment from '../models/FeePayment.js';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import communicationService from './communicationService.js';
import { generateFeeReceipt } from './invoiceService.js';
import { sendEmail } from './mailService.js';

/**
 * Fee Automation Service - The "Intelligence" behind fee management
 */

/**
 * Auto-send reminders for overdue fees
 */
export const runAutomatedFeeReminders = async () => {
  console.log('[Fee Intelligence] Starting automated fee reminder scan...');
  
  try {
    const today = new Date();
    
    // Find payments that are overdue or pending within reminder window
    // We target: 
    // - Overdue payments
    // - Pending payments due in 3 days
    const upcomingThreshold = new Date();
    upcomingThreshold.setDate(today.getDate() + 3);

    const targetPayments = await FeePayment.find({
      paymentStatus: { $in: ['pending', 'partial', 'overdue'] },
      $or: [
        { dueDate: { $lt: today } }, // Overdue
        { dueDate: { $lte: upcomingThreshold, $gte: today } } // Due soon
      ],
      // Don't remind more than once every 7 days
      $or: [
        { lastReminderSent: { $exists: false } },
        { lastReminderSent: { $lt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) } }
      ]
    }).populate({
      path: 'student',
      populate: { path: 'parent' }
    }).populate('feeStructure');

    console.log(`[Fee Intelligence] Found ${targetPayments.length} payments requiring reminders.`);

    for (const payment of targetPayments) {
      await sendIntelligentReminder(payment);
    }

    return { success: true, processed: targetPayments.length };
  } catch (error) {
    console.error('[Fee Intelligence] Error in automated reminders:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Helper to send reminder via multiple channels
 */
const sendIntelligentReminder = async (payment) => {
  const student = payment.student;
  const parent = student.parent;
  const isOverdue = new Date() > payment.dueDate;
  
  const subject = isOverdue 
    ? `URGENT: Overdue Fee Reminder - ${payment.invoiceNumber}`
    : `Upcoming Fee Reminder - ${payment.invoiceNumber}`;

  const statusText = isOverdue ? 'is OVERDUE' : 'is due soon';
  
  const message = `
    <div style="font-family: Arial, sans-serif;">
      <h2 style="color: #4F46E5;">Fee Payment Notification</h2>
      <p>Dear Parent/Guardian of ${student.firstName} ${student.lastName},</p>
      <p>This is a polite reminder that the fee payment for <strong>${payment.feeStructure.feeName}</strong> ${statusText}.</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Invoice Number:</strong> ${payment.invoiceNumber}</p>
        <p><strong>Amount:</strong> PKR ${payment.totalAmount.toFixed(2)}</p>
        <p><strong>Due Date:</strong> ${new Date(payment.dueDate).toLocaleDateString()}</p>
        <p style="color: #e11d48;"><strong>Current Balance:</strong> PKR ${payment.balance.toFixed(2)}</p>
      </div>
      <p>Please ensure payment is made to avoid any late fee charges or service interruptions.</p>
      <p>If you have already paid, please ignore this message.</p>
      <p>Thank you, <br/>ILM Possible Education Administration</p>
    </div>
  `;

  await communicationService.sendMultiChannelMessage({
    student,
    parent,
    message,
    subject
  });

  // Update payment record
  payment.lastReminderSent = new Date();
  payment.reminderCount = (payment.reminderCount || 0) + 1;
  await payment.save();
  
  console.log(`[Fee Intelligence] Reminder sent for ${payment.invoiceNumber} to ${student.firstName}`);
};

/**
 * Auto-send receipt on payment completion
 */
export const processAutoReceipt = async (paymentId) => {
  try {
    const payment = await FeePayment.findById(paymentId)
      .populate({
        path: 'student',
        populate: { path: 'parent' }
      })
      .populate('feeStructure');

    if (!payment || payment.paymentStatus !== 'paid' || payment.autoReceiptSent) {
      return;
    }

    // Generate receipt if it doesn't exist
    if (!payment.receiptPath || !payment.receiptNumber) {
      if (!payment.receiptNumber) {
        payment.receiptNumber = `RCP${Date.now()}`;
      }
      const { filepath } = await generateFeeReceipt(payment, payment.student);
      payment.receiptPath = filepath;
      await payment.save();
    }

    const parentEmail = payment.student.parent?.email || payment.student.guardianEmail || payment.student.email;
    
    if (parentEmail) {
      await sendEmail({
        to: parentEmail,
        subject: `Fee Payment Receipt - ${payment.receiptNumber}`,
        html: `
          <h2>Payment Completed Successfully</h2>
          <p>Dear Parent,</p>
          <p>We are pleased to confirm that the payment for <strong>${payment.feeStructure.feeName}</strong> has been received in full.</p>
          <p>Please find your digital receipt attached to this email for your records.</p>
          <div style="background-color: #f0fdf4; border: 1px solid #16a34a; padding: 15px; border-radius: 8px;">
            <p><strong>Receipt #:</strong> ${payment.receiptNumber}</p>
            <p><strong>Total Paid:</strong> PKR ${payment.amountPaid.toFixed(2)}</p>
            <p><strong>Balance:</strong> PKR 0.00</p>
          </div>
          <p>Thank you for your timely payment!</p>
        `,
        attachments: [
          {
            filename: `Receipt-${payment.receiptNumber}.pdf`,
            path: payment.receiptPath
          }
        ]
      });

      payment.autoReceiptSent = true;
      await payment.save();
      console.log(`[Fee Intelligence] Auto-receipt sent for ${payment.receiptNumber}`);
    }
  } catch (error) {
    console.error('[Fee Intelligence] Error processing auto-receipt:', error);
  }
};

export default {
  runAutomatedFeeReminders,
  processAutoReceipt
};
