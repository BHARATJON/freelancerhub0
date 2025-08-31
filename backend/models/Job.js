const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
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
  requirements: [{
    type: String,
    required: true
  }],
  skills: [{
    type: String,
    required: true
  }],
  budget: {
    type: Number,
    required: true,
    min: 1,
    description: 'Fixed price set by the company'
  },
  budgetType: {
    type: String,
    enum: ['fixed'],
    default: 'fixed',
    required: true
  },
  duration: {
    type: String,
    enum: ['less-than-1-week', '1-2-weeks', '2-4-weeks', '1-3-months', '3-6-months', 'more-than-6-months'],
    required: true
  },
  type: {
    type: String,
    enum: ['project'],
    default: 'project',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'in-progress', 'completed', 'cancelled'],
    default: 'active'
  },
  location: {
    type: String,
    default: 'Remote',
    required: true
  },
  remote: {
    type: Boolean,
    default: true
  },
  experienceLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'expert'],
    required: true
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  hiredFreelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deadline: {
    type: Date
  },
  tags: [{
    type: String
  }],
  views: {
    type: Number,
    default: 0
  },
  applicationsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
jobSchema.index({ 
  title: 'text', 
  description: 'text', 
  location: 1, 
  budget: 1,
  status: 1 
});

// Update applications count when applications are added/removed
jobSchema.pre('save', function(next) {
  if (this.applications) {
    this.applicationsCount = this.applications.length;
  }
  next();
});

module.exports = mongoose.model('Job', jobSchema); 