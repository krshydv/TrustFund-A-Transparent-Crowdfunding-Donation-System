const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: [true, 'Campaign is required']
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Can be null for guest donations
  },
  amount: {
    type: Number,
    required: [true, 'Donation amount is required'],
    min: [10, 'Minimum donation amount is ₹10']
  },
  donorName: {
    type: String,
    required: [true, 'Donor name is required'],
    trim: true
  },
  donorEmail: {
    type: String,
    required: [true, 'Donor email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  donorPhone: {
    type: String,
    trim: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    sparse: true
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  receiptUrl: {
    type: String
  },
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  refundReason: {
    type: String
  },
  refundedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate receipt number before saving
donationSchema.pre('save', async function(next) {
  if (this.isNew && this.status === 'completed' && !this.receiptNumber) {
    const count = await mongoose.model('Donation').countDocuments();
    this.receiptNumber = `TR${Date.now()}${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes
donationSchema.index({ campaign: 1, createdAt: -1 });
donationSchema.index({ donor: 1, createdAt: -1 });
donationSchema.index({ status: 1 });
donationSchema.index({ receiptNumber: 1 });

module.exports = mongoose.model('Donation', donationSchema);