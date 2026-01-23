const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Payment = require('../models/Payment');

// Subscription Plans with pricing and features
// Only Starter, Pro, Enterprise - No Free Tier
const SUBSCRIPTION_PLANS = {
    starter: {
        name: 'Starter',
        price: 150,
        currency: 'usd',
        billingCycle: 'monthly',
        description: '$150/month - Perfect for freelancers',
        features: {
            quotesPerMonth: 20,
            projectsPerMonth: 5,
            apiCalls: 5000,
            customBranding: false,
            prioritySupport: false,
            advancedAnalytics: true,
            teamMembers: 1,
            storageGB: 10
        }
    },
    pro: {
        name: 'Pro',
        price: 500,
        currency: 'usd',
        billingCycle: 'monthly',
        description: '$500/month - For growing agencies',
        features: {
            quotesPerMonth: 100,
            projectsPerMonth: 20,
            apiCalls: 50000,
            customBranding: true,
            prioritySupport: true,
            advancedAnalytics: true,
            teamMembers: 5,
            storageGB: 100
        }
    },
    enterprise: {
        name: 'Enterprise',
        price: 1000,
        currency: 'usd',
        billingCycle: 'monthly',
        description: '$1000+/month - Custom enterprise solutions',
        features: {
            quotesPerMonth: 999999,
            projectsPerMonth: 999999,
            apiCalls: 999999,
            customBranding: true,
            prioritySupport: true,
            advancedAnalytics: true,
            teamMembers: 999,
            storageGB: 999
        }
    }
};

// Create or upgrade subscription
exports.createOrUpgradeSubscription = async (req, res, next) => {
    try {
        const { userId, plan } = req.body;
        
        if (!SUBSCRIPTION_PLANS[plan]) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid subscription plan'
            });
        }

        let subscription = await Subscription.findOne({ userId });

        if (!subscription) {
            // Create new subscription
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);

            subscription = await Subscription.create({
                userId,
                plan,
                status: 'active',
                startDate,
                endDate,
                renewalDate: endDate,
                features: SUBSCRIPTION_PLANS[plan].features,
                currentBillingCycle: {
                    startDate,
                    endDate,
                    amount: SUBSCRIPTION_PLANS[plan].price
                }
            });

            // Update user with subscription reference
            await User.findByIdAndUpdate(userId, { subscriptionId: subscription._id });
        } else {
            // Upgrade existing subscription
            const oldPlan = subscription.plan;
            subscription.plan = plan;
            subscription.status = 'active';
            subscription.features = SUBSCRIPTION_PLANS[plan].features;
            
            // Reset usage on upgrade
            subscription.usageTracking = {
                quotesUsedThisMonth: 0,
                projectsUsedThisMonth: 0,
                apiCallsUsedThisMonth: 0,
                storageUsedGB: 0,
                lastResetDate: new Date()
            };

            await subscription.save();
        }

        res.status(201).json({
            status: 'success',
            message: `Subscription to ${SUBSCRIPTION_PLANS[plan].name} plan successful`,
            data: {
                subscription
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get user subscription
exports.getUserSubscription = async (req, res, next) => {
    try {
        const { userId } = req.params;

        let subscription = await Subscription.findOne({ userId });

        if (!subscription) {
            // Create free subscription if doesn't exist
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);

            subscription = await Subscription.create({
                userId,
                plan: 'free',
                status: 'active',
                startDate,
                endDate,
                features: SUBSCRIPTION_PLANS.free.features
            });

            await User.findByIdAndUpdate(userId, { subscriptionId: subscription._id });
        }

        // Check if expired
        await subscription.checkExpiry();

        // Reset monthly usage if needed
        await subscription.resetMonthlyUsage();

        res.status(200).json({
            status: 'success',
            data: {
                subscription
            }
        });
    } catch (error) {
        next(error);
    }
};

// Check if user can perform action
exports.checkFeatureAccess = async (req, res, next) => {
    try {
        const { userId, feature } = req.body;

        const subscription = await Subscription.findOne({ userId });

        if (!subscription || subscription.status !== 'active') {
            return res.status(403).json({
                status: 'error',
                message: 'No active subscription'
            });
        }

        const hasFeature = subscription.hasFeature(feature);

        res.status(200).json({
            status: 'success',
            data: {
                hasAccess: hasFeature
            }
        });
    } catch (error) {
        next(error);
    }
};

// Check quota and increment if available
exports.checkAndUseQuota = async (req, res, next) => {
    try {
        const { userId, featureName } = req.body;

        const subscription = await Subscription.findOne({ userId });

        if (!subscription || subscription.status !== 'active') {
            return res.status(403).json({
                status: 'error',
                message: 'No active subscription'
            });
        }

        // Reset monthly usage if needed
        await subscription.resetMonthlyUsage();

        const canUse = subscription.canUseQuota(featureName);

        if (!canUse) {
            return res.status(429).json({
                status: 'error',
                message: `You have reached your ${featureName} quota for this month`
            });
        }

        // Increment usage
        await subscription.incrementUsage(featureName);

        res.status(200).json({
            status: 'success',
            message: `${featureName} quota available and incremented`,
            data: {
                remaining: subscription.features[featureName] - subscription.usageTracking[`${featureName}UsedThisMonth`]
            }
        });
    } catch (error) {
        next(error);
    }
};

// Cancel subscription
exports.cancelSubscription = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const subscription = await Subscription.findOne({ userId });

        if (!subscription) {
            return res.status(404).json({
                status: 'error',
                message: 'Subscription not found'
            });
        }

        await subscription.cancel();

        res.status(200).json({
            status: 'success',
            message: 'Subscription cancelled successfully',
            data: { subscription }
        });
    } catch (error) {
        next(error);
    }
};

// Get subscription plans
exports.getPlans = async (req, res, next) => {
    try {
        res.status(200).json({
            status: 'success',
            data: {
                plans: SUBSCRIPTION_PLANS
            }
        });
    } catch (error) {
        next(error);
    }
};

// Renew subscription (called by webhook or manual renewal)
exports.renewSubscription = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const subscription = await Subscription.findOne({ userId });

        if (!subscription) {
            return res.status(404).json({
                status: 'error',
                message: 'Subscription not found'
            });
        }

        // Calculate new dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        subscription.status = 'active';
        subscription.startDate = startDate;
        subscription.endDate = endDate;
        subscription.renewalDate = endDate;
        subscription.currentBillingCycle = {
            startDate,
            endDate,
            amount: SUBSCRIPTION_PLANS[subscription.plan].price
        };

        // Reset monthly usage
        subscription.usageTracking = {
            quotesUsedThisMonth: 0,
            projectsUsedThisMonth: 0,
            apiCallsUsedThisMonth: 0,
            storageUsedGB: 0,
            lastResetDate: new Date()
        };

        await subscription.save();

        res.status(200).json({
            status: 'success',
            message: 'Subscription renewed successfully',
            data: { subscription }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = SUBSCRIPTION_PLANS;
