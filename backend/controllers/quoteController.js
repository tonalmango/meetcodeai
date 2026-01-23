const Quote = require('../models/Quote');
const { validationResult } = require('express-validator');
const { sendMail } = require('../utils/mailer');

exports.submitQuote = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                errors: errors.array()
            });
        }

        const { name, agencyName, company, email, services, budget, details, timeline } = req.body;

        // Support both 'company' and 'agencyName' field names
        const companyName = company || agencyName;

        console.log('Creating quote with data:', { name, companyName, email, services, budget });
        
        // Check if MongoDB is connected
        const mongooseState = require('mongoose').connection.readyState;
        console.log('Mongoose connection state:', mongooseState, '(0=disconnected, 1=connected, 2=connecting)');
        
        let quote;
        
        if (mongooseState !== 1) {
            console.warn('MongoDB not connected! Using fallback storage.');
            
            // Fallback: Save to file system
            const fs = require('fs');
            const path = require('path');
            const quotesFile = path.join(__dirname, '../quotes-backup.json');
            
            // Create quote object
            quote = {
                _id: Date.now().toString(),
                name,
                agencyName: companyName,
                email,
                services,
                budget,
                details,
                status: 'pending',
                createdAt: new Date(),
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            };
            
            // Save to backup file
            try {
                let quotes = [];
                if (fs.existsSync(quotesFile)) {
                    const data = fs.readFileSync(quotesFile, 'utf8');
                    quotes = JSON.parse(data);
                }
                quotes.push(quote);
                fs.writeFileSync(quotesFile, JSON.stringify(quotes, null, 2));
                console.log('Quote saved to backup file:', quotesFile);
            } catch (fileError) {
                console.error('Failed to save to backup file:', fileError.message);
            }
        } else {
            // Normal: Save to MongoDB
            quote = await Quote.create({
                name,
                agencyName: companyName,
                email,
                services,
                budget,
                details,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });
        }

        // Send emails (skip if email not configured)
        if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'yourbusiness@gmail.com') {
            try {
                await sendMail({
            to: email,
            subject: 'Your Quote Request Received',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6366f1;">Thank You for Your Quote Request</h2>
                    <p>Hello ${name},</p>
                    <p>We've received your quote request for the following services:</p>
                    <ul>
                        ${services.map(service => `<li>${service}</li>`).join('')}
                    </ul>
                    <p><strong>Budget Range:</strong> ${budget}</p>
                    <p>Our team will review your request and get back to you within 24 hours with a custom quote.</p>
                    <p>Talk soon! ✨<br>The MeetCodeAI Team 🚀</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                </div>
            `
        });

        await sendMail({
            to: process.env.EMAIL_USER,
            subject: 'New Quote Request Submitted',
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>New Quote Request</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Agency:</strong> ${agencyName}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Services:</strong> ${services.join(', ')}</p>
                    <p><strong>Budget:</strong> ${budget}</p>
                    <p><strong>Details:</strong><br>${details || 'No additional details'}</p>
                    <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                </div>
            `
        });
            } catch (emailError) {
                // Log email error but don't fail the request
                console.error('Email sending failed:', emailError.message);
            }
        }

        res.status(201).json({
            status: 'success',
            message: 'Quote request submitted successfully',
            data: {
                quote: {
                    id: quote._id,
                    name: quote.name,
                    agencyName: quote.agencyName,
                    email: quote.email,
                    services: quote.formattedServices || services,
                    budget: quote.budget,
                    status: quote.status,
                    createdAt: quote.createdAt
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllQuotes = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, sort = '-createdAt' } = req.query;
        
        const query = {};
        if (status) query.status = status;
        
        const quotes = await Quote.find(query)
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-__v');
        
        const total = await Quote.countDocuments(query);
        
        res.status(200).json({
            status: 'success',
            data: {
                quotes,
                pagination: {
                    currentPage: page * 1,
                    totalPages: Math.ceil(total / limit),
                    totalQuotes: total,
                    hasNextPage: page * limit < total,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getQuote = async (req, res, next) => {
    try {
        const quote = await Quote.findById(req.params.id);
        
        if (!quote) {
            return res.status(404).json({
                status: 'error',
                message: 'Quote not found'
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: { quote }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateQuote = async (req, res, next) => {
    try {
        const { status, quoteAmount, notes } = req.body;
        
        const quote = await Quote.findByIdAndUpdate(
            req.params.id,
            { status, quoteAmount, notes, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );
        
        if (!quote) {
            return res.status(404).json({
                status: 'error',
                message: 'Quote not found'
            });
        }
        
        if (status === 'quoted' && quoteAmount) {
            await sendMail({
                to: quote.email,
                subject: 'Your Custom Quote is Ready',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #6366f1;">Your Custom Quote is Ready</h2>
                        <p>Hello ${quote.name},</p>
                        <p>We've prepared a custom quote for your requested services:</p>
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3>Quote Details</h3>
                            <p><strong>Quote Amount:</strong> $${quoteAmount.toLocaleString()}</p>
                            <p><strong>Services Included:</strong> ${quote.formattedServices.join(', ')}</p>
                            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
                        </div>
                        <p>Please reply to this email to proceed with the next steps.</p>
                        <p>Let's build! 🚀<br>The MeetCodeAI Team ✨</p>
                    </div>
                `
            });
        }
        
        res.status(200).json({
            status: 'success',
            message: 'Quote updated successfully',
            data: { quote }
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteQuote = async (req, res, next) => {
    try {
        const quote = await Quote.findByIdAndDelete(req.params.id);
        
        if (!quote) {
            return res.status(404).json({
                status: 'error',
                message: 'Quote not found'
            });
        }
        
        res.status(200).json({
            status: 'success',
            message: 'Quote deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.getQuoteStats = async (req, res, next) => {
    try {
        const stats = await Quote.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$quoteAmount' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalQuotes: { $sum: '$count' },
                    statusCounts: { $push: { status: '$_id', count: '$count' } },
                    totalQuoteAmount: { $sum: '$totalAmount' }
                }
            }
        ]);
        
        const serviceStats = await Quote.aggregate([
            { $unwind: '$services' },
            {
                $group: {
                    _id: '$services',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);
        
        const monthlyStats = await Quote.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 6 }
        ]);
        
        res.status(200).json({
            status: 'success',
            data: {
                summary: stats[0] || { totalQuotes: 0, statusCounts: [], totalQuoteAmount: 0 },
                serviceStats,
                monthlyStats
            }
        });
    } catch (error) {
        next(error);
    }
};

