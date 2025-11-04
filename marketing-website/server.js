const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 8001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the marketing website
app.use(express.static(__dirname));

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mshakir628@gmail.com',
        pass: 'lqwz gsol mijp pmer' // Gmail App Password
    }
});

// Verify email configuration
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Email configuration error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, schoolName, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields'
            });
        }

        // Email to you (admin)
        const adminMailOptions = {
            from: '"ILM Possible Contact Form" <mshakir628@gmail.com>',
            to: 'mshakir628@gmail.com',
            subject: `New Contact Form Submission from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="background: linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h2 style="color: white; margin: 0;">🎓 ILM Possible Education</h2>
                        <p style="color: #e0e0e0; margin: 5px 0 0 0;">New Contact Form Submission</p>
                    </div>
                    
                    <div style="padding: 30px; background: #f9fafb;">
                        <h3 style="color: #4F46E5; margin-top: 0;">Contact Details</h3>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px; font-weight: bold; color: #4b5563; width: 30%;">Name:</td>
                                <td style="padding: 10px; color: #1f2937;">${name}</td>
                            </tr>
                            <tr style="background: white;">
                                <td style="padding: 10px; font-weight: bold; color: #4b5563;">Email:</td>
                                <td style="padding: 10px; color: #1f2937;">
                                    <a href="mailto:${email}" style="color: #4F46E5; text-decoration: none;">${email}</a>
                                </td>
                            </tr>
                            ${schoolName ? `
                            <tr>
                                <td style="padding: 10px; font-weight: bold; color: #4b5563;">School Name:</td>
                                <td style="padding: 10px; color: #1f2937;">${schoolName}</td>
                            </tr>
                            ` : ''}
                        </table>
                        
                        <div style="margin-top: 20px;">
                            <h4 style="color: #4b5563; margin-bottom: 10px;">Message:</h4>
                            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #4F46E5;">
                                ${message.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                            <a href="mailto:${email}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                Reply to ${name}
                            </a>
                        </div>
                    </div>
                    
                    <div style="background: #1f2937; padding: 15px; border-radius: 0 0 10px 10px; text-align: center; color: #9ca3af; font-size: 12px;">
                        <p style="margin: 0;">Received: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })} PKT</p>
                        <p style="margin: 5px 0 0 0;">ILM Possible Education | Malir, Karachi, Pakistan</p>
                    </div>
                </div>
            `
        };

        // Auto-reply email to the user
        const userMailOptions = {
            from: '"ILM Possible Education" <mshakir628@gmail.com>',
            to: email,
            subject: 'Thank you for contacting ILM Possible Education',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="background: linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">🎓 ILM Possible Education</h1>
                        <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 16px;">School Management System</p>
                    </div>
                    
                    <div style="padding: 40px 30px; background: #f9fafb;">
                        <h2 style="color: #4F46E5; margin-top: 0;">Hello ${name}! 👋</h2>
                        
                        <p style="color: #4b5563; line-height: 1.6; font-size: 15px;">
                            Thank you for your interest in <strong>ILM Possible Education</strong>! We've received your message and appreciate you taking the time to reach out to us.
                        </p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e; margin: 20px 0;">
                            <p style="color: #16a34a; margin: 0; font-weight: bold;">✓ Your message has been received</p>
                            <p style="color: #4b5563; margin: 10px 0 0 0; font-size: 14px;">We'll review your inquiry and get back to you within 24 hours.</p>
                        </div>
                        
                        <h3 style="color: #4b5563; margin-top: 30px;">Your Message:</h3>
                        <div style="background: white; padding: 15px; border-radius: 8px; color: #6b7280; font-style: italic; border: 1px solid #e5e7eb;">
                            ${message.replace(/\n/g, '<br>')}
                        </div>
                        
                        <h3 style="color: #4b5563; margin-top: 30px;">In the meantime:</h3>
                        <ul style="color: #6b7280; line-height: 1.8;">
                            <li>Explore our <a href="http://localhost:8001" style="color: #4F46E5;">marketing website</a></li>
                            <li>Check out our comprehensive features</li>
                            <li>Contact us via WhatsApp: <a href="https://wa.me/923232207839" style="color: #22c55e; text-decoration: none;">+92-323-2207839</a></li>
                            <li>Alternative Phone: <a href="tel:+923433463246" style="color: #4F46E5; text-decoration: none;">+92-343-3463246</a></li>
                        </ul>
                        
                        <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%); border-radius: 8px; text-align: center;">
                            <p style="color: #4b5563; margin: 0 0 15px 0; font-size: 14px;">Have urgent questions?</p>
                            <a href="https://wa.me/923232207839" style="display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 0 5px;">
                                📱 WhatsApp Us
                            </a>
                            <a href="tel:+923232207839" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 0 5px;">
                                📞 Call Us
                            </a>
                        </div>
                    </div>
                    
                    <div style="background: #1f2937; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; color: #9ca3af;">
                        <p style="margin: 0; font-size: 14px; font-weight: bold; color: white;">ILM Possible Education</p>
                        <p style="margin: 10px 0; font-size: 13px;">Empowering educational institutions with modern technology</p>
                        <p style="margin: 10px 0; font-size: 12px;">
                            📧 mshakir628@gmail.com<br>
                            📞 +92-323-2207839 | +92-343-3463246<br>
                            📍 Malir, Karachi, Pakistan
                        </p>
                    </div>
                </div>
            `
        };

        // Send both emails
        await transporter.sendMail(adminMailOptions);
        await transporter.sendMail(userMailOptions);

        console.log(`✅ Contact form submission from ${name} (${email})`);

        res.json({
            success: true,
            message: 'Thank you! Your message has been sent successfully. Check your email for confirmation.'
        });

    } catch (error) {
        console.error('❌ Error sending email:', error);
        res.status(500).json({
            success: false,
            message: 'Sorry, there was an error sending your message. Please try again or contact us directly via WhatsApp.'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Email server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 ========================================');
    console.log('🎓 ILM Possible Education - Marketing Website');
    console.log('🚀 ========================================');
    console.log(`📧 Email service running on port ${PORT}`);
    console.log(`🌐 Website: http://localhost:${PORT}`);
    console.log(`📬 Contact form endpoint: http://localhost:${PORT}/api/contact`);
    console.log('✅ Ready to receive contact form submissions!');
    console.log('========================================\n');
});

