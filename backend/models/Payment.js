const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
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
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  paymentNumber: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  currency: {
    type: String,
    default: 'USD'
  },
  type: {
    type: String,
    enum: ['hourly', 'milestone', 'bonus', 'advance', 'final'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'bank_transfer', 'escrow'],
    required: true
  },
  transactionId: {
    type: String
  },
  description: {
    type: String,
    maxlength: 500
  },
  timeEntries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeTracking'
  }],
  milestone: {
    type: mongoose.Schema.Types.ObjectId
  },
  dueDate: {
    type: Date
  },
  paidAt: {
    type: Date
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  refundedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  fees: {
    platform: {
      type: Number,
      default: 0
    },
    processing: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  netAmount: {
    type: Number,
    required: true
  },
  receipt: {
    url: String,
    generatedAt: Date
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Generate payment number
paymentSchema.pre('save', async function(next) {
  if (this.isNew && !this.paymentNumber) {
    const count = await this.constructor.countDocuments();
    this.paymentNumber = `PAY-${Date.now()}-${count + 1}`;
  }
  next();
});

// Calculate net amount
paymentSchema.pre('save', function(next) {
  if (this.fees && this.amount) {
    this.fees.total = this.fees.platform + this.fees.processing;
    this.netAmount = this.amount - this.fees.total;
  }
  next();
});

// Index for efficient queries
paymentSchema.index({ contract: 1, status: 1 });
paymentSchema.index({ company: 1, status: 1 });
paymentSchema.index({ freelancer: 1, status: 1 });
paymentSchema.index({ status: 1, dueDate: 1 });

module.exports = mongoose.model('Payment', paymentSchema);