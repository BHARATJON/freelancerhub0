const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
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
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  files: [{
    name: String,
    url: String,
    size: Number,
    type: String
  }],
  videoUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['submitted', 'under-review', 'revision-requested', 'approved', 'rejected'],
    default: 'submitted'
  },
  feedback: {
    type: String,
    maxlength: 2000
  },
  revisionNotes: {
    type: String,
    maxlength: 2000
  },
  paymentAmount: {
    type: Number,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'completed'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  approvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  revisionRequestedAt: {
    type: Date
  },
  revisionDeadline: {
    type: Date
  },
  revisions: [{
    version: Number,
    description: String,
    files: [{
      name: String,
      url: String,
      size: Number,
      type: String
    }],
    submittedAt: {
      type: Date,
      default: Date.now
    },
    feedback: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  qualityScore: {
    type: Number,
    min: 1,
    max: 5
  },
  onTimeDelivery: {
    type: Boolean,
    default: true
  },
  communicationScore: {
    type: Number,
    min: 1,
    max: 5
  },
  overallRating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Index for efficient queries
submissionSchema.index({ job: 1, status: 1 });
submissionSchema.index({ freelancer: 1, status: 1 });
submissionSchema.index({ company: 1, status: 1 });
submissionSchema.index({ submittedAt: -1 });

// Virtual for checking if submission is overdue for review
submissionSchema.virtual('isOverdueForReview').get(function() {
  if (this.status !== 'submitted') return false;
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  return this.submittedAt < threeDaysAgo;
});

// Virtual for checking if revision is overdue
submissionSchema.virtual('isRevisionOverdue').get(function() {
  if (this.status !== 'revision-requested' || !this.revisionDeadline) return false;
  return new Date() > this.revisionDeadline;
});

module.exports = mongoose.model('Submission', submissionSchema); 