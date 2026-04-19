import User from "../models/User.js";
import Parent from "../models/Parent.js";
import { sendEmail } from "../services/emailService.js";

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

export default {
    sendBulkEmail,
};
