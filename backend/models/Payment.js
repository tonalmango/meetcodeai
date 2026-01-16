const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  quoteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd'
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'bank_transfer', 'check', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: String,
  paypalOrderId: String,
  customerInfo: {
    name: String,
    email: String,
    phone: String
  },
  description: String,
  paidAt: Date,
  refundedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
