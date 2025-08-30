const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
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
  coverLetter: {
    type: String,
    required: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'interviewed', 'hired', 'rejected'],
    default: 'pending'
  },
  companyNotes: {
    type: String,
    maxlength: 1000
  },
  freelancerNotes: {
    type: String,
    maxlength: 1000
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  shortlistedAt: {
    type: Date
  },
  interviewedAt: {
    type: Date
  },
  hiredAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    maxlength: 500
  },
  interview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview'
  }
}, {
  timestamps: true
});

// Ensure unique application per freelancer per job
applicationSchema.index({ job: 1, freelancer: 1 }, { unique: true });

// Index for efficient queries
applicationSchema.index({ freelancer: 1, status: 1 });
applicationSchema.index({ company: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema); 