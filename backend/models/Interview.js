const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 15,
    max: 480 // 8 hours max
  },
  type: {
    type: String,
    enum: ['video', 'audio', 'text', 'in-person'],
    default: 'video'
  },
  platform: {
    type: String,
    enum: ['zoom', 'skype', 'teams', 'google-meet', 'other'],
    default: 'zoom'
  },
  meetingLink: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    maxlength: 2000
  },
  companyFeedback: {
    type: String,
    maxlength: 1000
  },
  freelancerFeedback: {
    type: String,
    maxlength: 1000
  },
  outcome: {
    type: String,
    enum: ['hired', 'rejected', 'pending', 'rescheduled'],
    default: 'pending'
  },
  nextSteps: {
    type: String,
    maxlength: 500
  },
  rescheduledTo: {
    type: Date
  },
  cancelledBy: {
    type: String,
    enum: ['company', 'freelancer', 'system']
  },
  cancellationReason: {
    type: String,
    maxlength: 500
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
interviewSchema.index({ company: 1, status: 1 });
interviewSchema.index({ freelancer: 1, status: 1 });
interviewSchema.index({ scheduledTime: 1, status: 1 });

// Virtual for checking if interview is overdue
interviewSchema.virtual('isOverdue').get(function() {
  return this.status === 'scheduled' && this.scheduledTime < new Date();
});

// Virtual for checking if interview is upcoming (within 24 hours)
interviewSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return this.status === 'scheduled' && 
         this.scheduledTime > now && 
         this.scheduledTime <= tomorrow;
});

module.exports = mongoose.model('Interview', interviewSchema); 