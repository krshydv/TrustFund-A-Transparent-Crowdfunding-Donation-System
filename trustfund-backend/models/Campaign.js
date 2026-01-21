const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Campaign title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters'],
    maxlength: [255, 'Title cannot exceed 255 characters']
  },
  description: {
    type: String,
    required: [true, 'Campaign description is required'],
    trim: true,
    minlength: [50, 'Description must be at least 50 characters'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  story: {
    type: String,
    trim: true,
    maxlength: [10000, 'Story cannot exceed 10000 characters']
  },
  goalAmount: {
    type: Number,
    required: [true, 'Goal amount is required'],
    min: [1000, 'Goal amount must be at least ₹1000']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String
    }
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  views: {
    type: Number,
    default: 0
  },
  donorCount: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    trim: true,
    maxlength: [255, 'Location cannot exceed 255 characters']
  },
  beneficiaryName: {
    type: String,
    trim: true,
    maxlength: [255, 'Beneficiary name cannot exceed 255 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  rejectionReason: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  featured: {
    type: Boolean,
    default: false
  },
  urgent: {
    type: Boolean,
    default: false
  },
  lastUpdateAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for progress percentage
campaignSchema.virtual('progressPercentage').get(function() {
  return Math.min(Math.round((this.currentAmount / this.goalAmount) * 100), 100);
});

// Virtual for days remaining
campaignSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const end = new Date(this.endDate);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
});

// Virtual for is expired
campaignSchema.virtual('isExpired').get(function() {
  return new Date() > new Date(this.endDate);
});

// Indexes for faster queries
campaignSchema.index({ creator: 1, createdAt: -1 });
campaignSchema.index({ category: 1, status: 1 });
campaignSchema.index({ status: 1, endDate: -1 });
campaignSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Campaign', campaignSchema);