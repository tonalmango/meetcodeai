const axios = require('axios');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');

// Get subscription plans from subscriptionController
const getSubscriptionPlans = () => {
  return {
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
};

// PayPal API endpoints
const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api.paypal.com/v1'
  : 'https://api.sandbox.paypal.com/v1';

// Get PayPal access token
const getPayPalAccessToken = async () => {
  try {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios.post(`${PAYPAL_API_BASE}/oauth2/token`, 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('PayPal token error:', error);
    throw new Error('Failed to get PayPal access token');
  }
};

// Create checkout order (subscription)
exports.createCheckoutOrder = async (req, res, next) => {
  try {
    const { userId, plan, email, name } = req.body;

    const SUBSCRIPTION_PLANS = getSubscriptionPlans();

    if (!SUBSCRIPTION_PLANS[plan]) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid subscription plan'
      });
    }

    const planDetails = SUBSCRIPTION_PLANS[plan];
    const accessToken = await getPayPalAccessToken();

    // Create order in PayPal
    const response = await axios.post(
      `${PAYPAL_API_BASE}/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: userId,
          amount: {
            currency_code: 'USD',
            value: planDetails.price.toString(),
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: planDetails.price.toString()
              }
            }
          },
          items: [{
            name: `MeetCodeAI ${planDetails.name} Plan`,
            description: `Monthly subscription - $${planDetails.price}`,
            sku: plan,
            unit_amount: {
              currency_code: 'USD',
              value: planDetails.price.toString()
            },
            quantity: '1'
          }],
          custom_id: plan
        }],
        payer: {
          email_address: email,
          name: {
            given_name: name.split(' ')[0] || name,
            surname: name.split(' ')[1] || ''
          }
        },
        application_context: {
          brand_name: 'MeetCodeAI',
          locale: 'en-US',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${process.env.FRONTEND_URL}/payment-success`,
          cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Return order ID and approval link
    const approvalLink = response.data.links.find(link => link.rel === 'approve')?.href;

    res.status(201).json({
      status: 'success',
      data: {
        orderId: response.data.id,
        approvalLink,
        plan,
        amount: planDetails.price,
        planName: planDetails.name
      }
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    next(error);
  }
};

// Capture payment and create subscription
exports.capturePayment = async (req, res, next) => {
  try {
    const { orderId, userId, plan, email, name } = req.body;

    if (!orderId || !userId || !plan) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: orderId, userId, plan'
      });
    }

    const SUBSCRIPTION_PLANS = getSubscriptionPlans();

    if (!SUBSCRIPTION_PLANS[plan]) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid subscription plan'
      });
    }

    const planDetails = SUBSCRIPTION_PLANS[plan];
    const accessToken = await getPayPalAccessToken();

    // Capture the order
    const captureResponse = await axios.post(
      `${PAYPAL_API_BASE}/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (captureResponse.data.status !== 'COMPLETED') {
      return res.status(400).json({
        status: 'error',
        message: 'Payment was not completed',
        paymentStatus: captureResponse.data.status
      });
    }

    // Payment successful - create/update subscription
    const transactionId = captureResponse.data.purchase_units[0].payments.captures[0].id;
    const paidAt = new Date(captureResponse.data.purchase_units[0].payments.captures[0].create_time);

    // Update or create subscription
    let subscription = await Subscription.findOne({ userId });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    if (!subscription) {
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
          amount: planDetails.price
        },
        billingHistory: [{
          date: paidAt,
          amount: planDetails.price,
          status: 'completed',
          invoiceId: `INV-${orderId}`,
          transactionId
        }]
      });

      // Update user with subscription
      await User.findByIdAndUpdate(userId, { subscriptionId: subscription._id });
    } else {
      // Update existing subscription
      subscription.plan = plan;
      subscription.status = 'active';
      subscription.startDate = startDate;
      subscription.endDate = endDate;
      subscription.renewalDate = endDate;
      subscription.features = SUBSCRIPTION_PLANS[plan].features;
      subscription.currentBillingCycle = {
        startDate,
        endDate,
        amount: planDetails.price
      };
      
      // Add to billing history
      subscription.billingHistory.push({
        date: paidAt,
        amount: planDetails.price,
        status: 'completed',
        invoiceId: `INV-${orderId}`,
        transactionId
      });

      // Reset usage
      subscription.usageTracking = {
        quotesUsedThisMonth: 0,
        projectsUsedThisMonth: 0,
        apiCallsUsedThisMonth: 0,
        storageUsedGB: 0,
        lastResetDate: new Date()
      };

      await subscription.save();
    }

    // Record payment
    const payment = await Payment.create({
      quoteId: null,
      projectId: null,
      amount: planDetails.price,
      currency: 'usd',
      paymentMethod: 'paypal',
      status: 'completed',
      transactionId,
      paypalOrderId: orderId,
      customerInfo: {
        name,
        email
      },
      description: `Subscription to ${planDetails.name} plan`,
      paidAt
    });

    res.status(200).json({
      status: 'success',
      message: `Payment successful! You're now subscribed to ${planDetails.name}`,
      data: {
        subscription,
        payment,
        transactionId
      }
    });
  } catch (error) {
    console.error('Capture payment error:', error);
    next(error);
  }
};
