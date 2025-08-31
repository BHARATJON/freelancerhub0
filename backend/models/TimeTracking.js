const mongoose = require('mongoose');

const timeTrackingSchema = new mongoose.Schema({
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  description: {
    type: String,
    maxlength: 500
  },
  task: {
    type: String,
    maxlength: 200
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'approved', 'rejected'],
    default: 'active'
  },
  amount: {
    type: Number,
    default: 0
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    maxlength: 500
  },
  screenshots: [{
    url: String,
    timestamp: Date,
    description: String
  }],
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Calculate duration when endTime is set
timeTrackingSchema.pre('save', function(next) {
  if (this.endTime && this.startTime) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60)); // Convert to minutes
  // amount should reflect fixed price payments if needed
  }
  next();
});

// Index for efficient queries
timeTrackingSchema.index({ contract: 1, date: 1 });
timeTrackingSchema.index({ freelancer: 1, date: 1 });
timeTrackingSchema.index({ company: 1, date: 1 });
timeTrackingSchema.index({ status: 1 });

module.exports = mongoose.model('TimeTracking', timeTrackingSchema); 