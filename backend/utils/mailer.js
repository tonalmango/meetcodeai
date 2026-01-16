const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Send email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} options.from - Sender email (optional)
 */
const sendMail = async (options) => {
    try {
        // If SMTP credentials are not configured, just log and return success
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log('SMTP not configured. Email would be sent:', {
                to: options.to,
                subject: options.subject
            });
            return { success: true, message: 'Email logged (SMTP not configured)' };
        }

        const mailOptions = {
            from: options.from || process.env.SMTP_FROM || process.env.SMTP_USER,
            to: options.to,
            subject: options.subject,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log('Email sent successfully:', {
            messageId: info.messageId,
            to: options.to,
            subject: options.subject
        });

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw error, just log it - we don't want email failures to break the API
        return { success: false, error: error.message };
    }
};

module.exports = { sendMail };
