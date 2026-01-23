const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    agencyName: {
        type: String,
        required: false,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    services: [{
        type: String,
        enum: ['website', 'landing', 'portfolio', 'chatbot', 'email', 'ecommerce'],
        required: true
    }],
    budget: {
        type: String,
        enum: ['under-1000', '1000-3k', '3k-5k', '5k-10k', '10k+', 'not-sure', '1-2k', '2-5k', '5-10k'],
        required: true
    },
    details: {
        type: String,
        trim: true,
        maxlength: [2000, 'Details cannot exceed 2000 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'contacted', 'quoted', 'accepted', 'rejected'],
        default: 'pending'
    },
    quoteAmount: {
        type: Number,
        min: 0
    },
    notes: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

quoteSchema.index({ email: 1, createdAt: -1 });
quoteSchema.index({ status: 1 });

quoteSchema.virtual('formattedServices').get(function() {
    const serviceMap = {
        'website': 'Business Website',
        'landing': 'Landing Page',
        'portfolio': 'Portfolio Website',
        'chatbot': 'AI Chatbot',
        'email': 'Email Automation',
        'ecommerce': 'E-commerce Solution'
    };
    return this.services.map(service => serviceMap[service] || service);
});

const Quote = mongoose.model('Quote', quoteSchema);

module.exports = Quote;