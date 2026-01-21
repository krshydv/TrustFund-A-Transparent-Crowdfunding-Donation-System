const mongoose = require('mongoose');

const fraudAlertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['donation', 'campaign', 'user'],
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'false_alarm'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
fraudAlertSchema.index({ type: 1, relatedId: 1 });
fraudAlertSchema.index({ status: 1, severity: -1 });
fraudAlertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('FraudAlert', fraudAlertSchema);