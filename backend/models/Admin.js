const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['super-admin', 'admin', 'moderator', 'support'],
    default: 'admin'
  },
  permissions: [{
    type: String,
    enum: [
      'manage-users',
      'manage-jobs',
      'manage-complaints',
      'manage-payments',
      'view-analytics',
      'manage-content',
      'manage-system'
    ]
  }],
  assignedComplaints: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint'
  }],
  resolvedComplaints: {
    type: Number,
    default: 0
  },
  averageResolutionTime: {
    type: Number, // in hours
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Index for efficient queries
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });
adminSchema.index({ lastActivity: -1 });

// Virtual for checking if admin has specific permission
adminSchema.virtual('hasPermission').get(function() {
  return function(permission) {
    return this.permissions.includes(permission);
  };
});

// Virtual for checking if admin is super admin
adminSchema.virtual('isSuperAdmin').get(function() {
  return this.role === 'super-admin';
});

module.exports = mongoose.model('Admin', adminSchema); 