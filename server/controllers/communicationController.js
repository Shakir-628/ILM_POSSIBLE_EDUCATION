import User from "../models/User.js";
import Parent from "../models/Parent.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import { sendEmail } from "../services/emailService.js";
import { sendWhatsApp } from "../services/communicationService.js";
/**
 * @desc    Send bulk emails to a target audience
 * @route   POST /api/communication/email/bulk
 * @access  Private (Admin)
 */
export const sendBulkEmail = async (req, res) => {
    try {
        const { targetAudience, title, message } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: "Title and message are required",
            });
        }

        let query = { isActive: true };

        if (targetAudience === 'students') query.role = 'student';
        else if (targetAudience === 'teachers') query.role = 'teacher';
        else if (targetAudience === 'staff') query.role = { $in: ['admin', 'superadmin', 'teacher'] };
        else if (targetAudience === 'parents') {
            const parents = await Parent.find({ isActive: true }).select('email');
            const parentEmails = parents.map(p => p.email);
            // Also check for users with role 'parent' just in case
            const parentUsers = await User.find({ role: 'parent', isActive: true }).select('email');
            const parentUserEmails = parentUsers.map(u => u.email);

            const allParentEmails = [...new Set([...parentEmails, ...parentUserEmails])];

            if (allParentEmails.length === 0) {
                return res.status(400).json({ success: false, message: "No parent emails found" });
            }

            // Sending emails
            const emailPromises = allParentEmails.map(email =>
                sendEmail({
                    to: email,
                    subject: title,
                    html: `<div style="font-family: Arial, sans-serif;">${message.replace(/\n/g, '<br>')}</div>`
                })
            );

            await Promise.all(emailPromises);

            return res.status(200).json({
                success: true,
                message: `Emails sent to ${allParentEmails.length} parents`,
            });
        }

        // Handle other audiences (all, students, teachers, staff)
        const users = await User.find(query).select('email');
        const emails = users.map(u => u.email).filter(email => !!email);

        if (emails.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No recipients found for the selected audience",
            });
        }

        // Send emails
        const emailPromises = emails.map(email =>
            sendEmail({
                to: email,
                subject: title,
                html: `<div style="font-family: Arial, sans-serif;">${message.replace(/\n/g, '<br>')}</div>`
            })
        );

        await Promise.all(emailPromises);

        res.status(200).json({
            success: true,
            message: `Emails sent to ${emails.length} users`,
        });
    } catch (error) {
        console.error("Bulk Email Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


/**
 * @desc    Send bulk WhatsApp messages to a target audience
 * @route   POST /api/communication/whatsapp/bulk
 * @access  Private (Admin)
 */
export const sendBulkWhatsApp = async (req, res) => {
    try {
        const { targetAudience, title, message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        const formattedMessage = title ? `*${title}*\n\n${message}` : message;
        let query = { isActive: true };
        
        let allPhones = [];

        if (targetAudience === 'students') {
            const students = await Student.find({ status: 'active' }).select('phone');
            allPhones = students.map(s => s.phone).filter(Boolean);
        }
        else if (targetAudience === 'teachers') {
            const teachers = await Teacher.find({ status: 'active' }).select('phone');
            allPhones = teachers.map(t => t.phone).filter(Boolean);
        }
        else if (targetAudience === 'staff') {
            const teachers = await Teacher.find({ status: 'active' }).select('phone');
            const adminUsers = await User.find({ role: { $in: ['admin', 'superadmin'] }, isActive: true }).select('phone');
            allPhones = [...new Set([...teachers.map(t => t.phone), ...adminUsers.map(u => u.phone)])].filter(Boolean);
        }
        else if (targetAudience === 'parents') {
            const parents = await Parent.find({ isActive: true }).select('phone');
            const parentPhones = parents.map(p => p.phone);
            const parentUsers = await User.find({ role: 'parent', isActive: true }).select('phone');
            const parentUserPhones = parentUsers.map(u => u.phone);

            allPhones = [...new Set([...parentPhones, ...parentUserPhones])].filter(Boolean);
        } else {
            // all
            const students = await Student.find({ status: 'active' }).select('phone');
            const teachers = await Teacher.find({ status: 'active' }).select('phone');
            const parents = await Parent.find({ isActive: true }).select('phone');
            const users = await User.find({ isActive: true }).select('phone');
            
            allPhones = [...new Set([
                ...students.map(s => s.phone),
                ...teachers.map(t => t.phone),
                ...parents.map(p => p.phone),
                ...users.map(u => u.phone)
            ])].filter(Boolean);
        }

        if (allPhones.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No recipients found with valid phone numbers for the selected audience",
            });
        }

        // Send WhatsApp messages and collect per-number results
        const results = await Promise.all(
            allPhones.map(phone => sendWhatsApp(phone, formattedMessage))
        );

        const succeeded = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        console.log(`[WhatsApp Bulk] Sent: ${succeeded.length}, Failed: ${failed.length}`);
        if (failed.length > 0) {
            console.warn('[WhatsApp Bulk] Failed numbers:', failed.map(r => `${r.to} - ${r.error}`));
        }

        return res.status(200).json({
            success: true,
            message: `WhatsApp messages sent to ${succeeded.length} of ${allPhones.length} recipients`,
            sent: succeeded.length,
            failed: failed.length,
            failedDetails: failed.map(r => ({ number: r.to, reason: r.error })),
        });
    } catch (error) {
        console.error("Bulk WhatsApp Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export default {
    sendBulkEmail,
    sendBulkWhatsApp,
};
