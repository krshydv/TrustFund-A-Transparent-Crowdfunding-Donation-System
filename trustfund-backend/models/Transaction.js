const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: false // <--- CHANGED: Set to false so we can create txn first
  },
  // Allow different providers (Razorpay, Stripe, or Mock)
  paymentProvider: {
    type: String,
    default: 'razorpay'
  },
  // Generic ID fields (works for Razorpay orderId, Stripe intent, or Mock ID)
  transactionId: { 
    type: String,
    unique: true,
    sparse: true
  },
  paymentId: { 
    type: String,
    sparse: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true
  },
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'succeeded', 'failed', 'refunded', 'pending'],
    default: 'pending'
  },
  // Legacy Razorpay fields (kept for compatibility if you switch back)
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);