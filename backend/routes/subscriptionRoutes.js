const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/plans', subscriptionController.getPlans);

// Protected routes (require authentication)
router.post('/create', authMiddleware.requireLogin, subscriptionController.createOrUpgradeSubscription);
router.get('/:userId', authMiddleware.requireLogin, subscriptionController.getUserSubscription);
router.post('/check-access', authMiddleware.requireLogin, subscriptionController.checkFeatureAccess);
router.post('/check-quota', authMiddleware.requireLogin, subscriptionController.checkAndUseQuota);
router.post('/cancel/:userId', authMiddleware.requireLogin, subscriptionController.cancelSubscription);
router.post('/renew/:userId', authMiddleware.requireLogin, subscriptionController.renewSubscription);

module.exports = router;
