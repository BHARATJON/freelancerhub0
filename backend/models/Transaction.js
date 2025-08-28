const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
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
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['partial', 'final', 'bonus', 'refund'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit-card', 'bank-transfer', 'paypal', 'stripe', 'escrow'],
    required: true
  },
  transactionId: {
    type: String
  },
  description: {
    type: String,
    maxlength: 500
  },
  fees: {
    type: Number,
    default: 0
  },
  netAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  processedAt: {
    type: Date
  },
  failedAt: {
    type: Date
  },
  failureReason: {
    type: String,
    maxlength: 500
  },
  refundReason: {
    type: String,
    maxlength: 500
  },
  refundedAt: {
    type: Date
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
transactionSchema.index({ company: 1, status: 1 });
transactionSchema.index({ freelancer: 1, status: 1 });
transactionSchema.index({ submission: 1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ createdAt: -1 });

// Generate transaction ID before saving
transactionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  
  // Calculate net amount (amount - fees)
  this.netAmount = this.amount - this.fees;
  
  next();
});

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount);
});

// Virtual for formatted net amount
transactionSchema.virtual('formattedNetAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.netAmount);
});

module.exports = mongoose.model('Transaction', transactionSchema); 