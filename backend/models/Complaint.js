const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complainant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: [
      'payment-issue',
      'quality-issue',
      'communication-issue',
      'deadline-issue',
      'scam',
      'inappropriate-behavior',
      'other'
    ],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'under-review', 'resolved', 'closed'],
    default: 'open'
  },
  evidence: [{
    type: String,
    description: String,
    url: String
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  resolution: {
    type: String,
    maxlength: 2000
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  resolvedAt: {
    type: Date
  },
  actions: [{
    action: String,
    takenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    takenAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    sentAt: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  }],
  category: {
    type: String,
    enum: ['freelancer-issue', 'company-issue', 'platform-issue'],
    required: true
  },
  impact: {
    type: String,
    enum: ['minor', 'moderate', 'major', 'critical'],
    default: 'moderate'
  },
  estimatedResolutionTime: {
    type: String,
    enum: ['1-2-days', '3-5-days', '1-week', '2-weeks', 'more-than-2-weeks']
  },
  tags: [{
    type: String
  }],
  isEscalated: {
    type: Boolean,
    default: false
  },
  escalatedAt: {
    type: Date
  },
  escalatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  escalationReason: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index for efficient queries
complaintSchema.index({ complainant: 1, status: 1 });
complaintSchema.index({ targetUser: 1, status: 1 });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ type: 1, priority: 1 });
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ priority: 1, createdAt: -1 });

// Virtual for checking if complaint is overdue
complaintSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'open' && this.status !== 'under-review') return false;
  
  const now = new Date();
  const createdAt = new Date(this.createdAt);
  const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
  
  switch (this.priority) {
    case 'urgent':
      return daysSinceCreation > 1;
    case 'high':
      return daysSinceCreation > 3;
    case 'medium':
      return daysSinceCreation > 7;
    case 'low':
      return daysSinceCreation > 14;
    default:
      return false;
  }
});

// Virtual for time since last update
complaintSchema.virtual('timeSinceLastUpdate').get(function() {
  const lastAction = this.actions[this.actions.length - 1];
  if (!lastAction) return null;
  
  const now = new Date();
  const lastUpdate = new Date(lastAction.takenAt);
  const daysSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60 * 24);
  
  return Math.floor(daysSinceUpdate);
});

module.exports = mongoose.model('Complaint', complaintSchema); 