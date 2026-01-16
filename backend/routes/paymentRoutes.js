const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Subscription payment routes (no auth required for initial checkout)
router.post('/checkout/create-order', paymentController.createCheckoutOrder);
router.post('/checkout/capture', paymentController.capturePayment);

module.exports = router;
