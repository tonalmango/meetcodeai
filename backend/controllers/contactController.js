const Contact = require('../models/Contact');
const { validationResult } = require('express-validator');
const { sendMail } = require('../utils/mailer');

exports.submitContact = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                errors: errors.array()
            });
        }

        const { name, email, subject, message } = req.body;

        const contact = await Contact.create({
            name,
            email,
            subject,
            message,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        await sendMail({
            to: email,
            subject: 'Thank You for Contacting Us',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6366f1;">Thank You for Reaching Out</h2>
                    <p>Hello ${name},</p>
                    <p>We've received your message and will get back to you as soon as possible.</p>
                    <p><strong>Your Message:</strong></p>
                    <p style="padding: 15px; background-color: #f3f4f6; border-left: 3px solid #6366f1;">
                        ${message}
                    </p>
                    <p>Stay awesome! ✨<br>The MeetCodeAI Team 🚀</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                </div>
            `
        });

        await sendMail({
            to: process.env.EMAIL_USER,
            subject: 'New Contact Form Submission',
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>New Contact Message</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <p><strong>Message:</strong><br>${message}</p>
                    <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                </div>
            `
        });

        res.status(201).json({
            status: 'success',
            message: 'Contact form submitted successfully',
            data: {
                contact: {
                    id: contact._id,
                    name: contact.name,
                    email: contact.email,
                    subject: contact.subject,
                    status: contact.status,
                    createdAt: contact.createdAt
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllContacts = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = status ? { status } : {};

        const contacts = await Contact.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Contact.countDocuments(query);

        res.status(200).json({
            status: 'success',
            results: contacts.length,
            data: {
                contacts,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getContact = async (req, res, next) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                status: 'error',
                message: 'Contact not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: { contact }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateContact = async (req, res, next) => {
    try {
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!contact) {
            return res.status(404).json({
                status: 'error',
                message: 'Contact not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: { contact }
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteContact = async (req, res, next) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);

        if (!contact) {
            return res.status(404).json({
                status: 'error',
                message: 'Contact not found'
            });
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};
