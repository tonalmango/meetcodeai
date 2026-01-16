const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    plan: {
        type: String,
        enum: ['starter', 'pro', 'enterprise'],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'expired', 'cancelled'],
        default: 'inactive'
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    renewalDate: {
        type: Date
    },
    autoRenew: {
        type: Boolean,
        default: true
    },
    paymentMethodId: {
        type: String // Stripe or PayPal stored payment method
    },
    stripeCustomerId: {
        type: String
    },
    stripeSubscriptionId: {
        type: String
    },
    currentBillingCycle: {
        startDate: Date,
        endDate: Date,
        amount: Number
    },
    billingHistory: [{
        date: Date,
        amount: Number,
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded']
        },
        invoiceId: String,
        transactionId: String
    }],
    features: {
        quotesPerMonth: {
            type: Number,
            default: 0
        },
        projectsPerMonth: {
            type: Number,
            default: 0
        },
        apiCalls: {
            type: Number,
            default: 0
        },
        customBranding: {
            type: Boolean,
            default: false
        },
        prioritySupport: {
            type: Boolean,
            default: false
        },
        advancedAnalytics: {
            type: Boolean,
            default: false
        },
        teamMembers: {
            type: Number,
            default: 1
        },
        storageGB: {
            type: Number,
            default: 1
        }
    },
    usageTracking: {
        quotesUsedThisMonth: {
            type: Number,
            default: 0
        },
        projectsUsedThisMonth: {
            type: Number,
            default: 0
        },
        apiCallsUsedThisMonth: {
            type: Number,
            default: 0
        },
        storageUsedGB: {
            type: Number,
            default: 0
        },
        lastResetDate: {
            type: Date,
            default: Date.now
        }
    },
    discountCode: {
        type: String
    },
    discountPercentage: {
        type: Number,
        default: 0
    },
    notes: String
}, {
    timestamps: true
});

// Auto-expire subscription if endDate passed
subscriptionSchema.methods.checkExpiry = async function() {
    if (this.endDate && this.endDate < new Date()) {
        this.status = 'expired';
        await this.save();
    }
    return this.status;
};

// Check if user has specific feature
subscriptionSchema.methods.hasFeature = function(featureName) {
    if (this.status !== 'active') return false;
    return this.features[featureName] ? true : false;
};

// Check if user can use additional quota
subscriptionSchema.methods.canUseQuota = function(featureName, amount = 1) {
    if (this.status !== 'active') return false;
    
    const used = this.usageTracking[`${featureName}UsedThisMonth`] || 0;
    const limit = this.features[featureName.replace('Used', '')] || 0;
    
    return (used + amount) <= limit;
};

// Increment usage
subscriptionSchema.methods.incrementUsage = async function(featureName) {
    const usageKey = `${featureName}UsedThisMonth`;
    this.usageTracking[usageKey] = (this.usageTracking[usageKey] || 0) + 1;
    await this.save();
};

// Reset monthly usage
subscriptionSchema.methods.resetMonthlyUsage = async function() {
    const now = new Date();
    const lastReset = this.usageTracking.lastResetDate;
    
    if (!lastReset || 
        lastReset.getMonth() !== now.getMonth() || 
        lastReset.getFullYear() !== now.getFullYear()) {
        
        this.usageTracking.quotesUsedThisMonth = 0;
        this.usageTracking.projectsUsedThisMonth = 0;
        this.usageTracking.apiCallsUsedThisMonth = 0;
        this.usageTracking.lastResetDate = new Date();
        await this.save();
    }
};

// Cancel subscription
subscriptionSchema.methods.cancel = async function() {
    this.status = 'cancelled';
    this.endDate = new Date();
    await this.save();
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
