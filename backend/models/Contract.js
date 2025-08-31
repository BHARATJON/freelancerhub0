const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
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
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  contractNumber: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  terms: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true,
    description: 'Fixed price for the project set by the company'
  },
  paymentTerms: {
    type: String,
    enum: ['fixed'],
    default: 'fixed'
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'completed', 'terminated'],
    default: 'draft'
  },
  companySignature: {
    signed: {
      type: Boolean,
      default: false
    },
    signedAt: {
      type: Date
    },
    signatureData: {
      type: String
    }
  },
  freelancerSignature: {
    signed: {
      type: Boolean,
      default: false
    },
    signedAt: {
      type: Date
    },
    signatureData: {
      type: String
    }
  },
  milestones: [{
    title: String,
    description: String,
    dueDate: Date,
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'approved'],
      default: 'pending'
    }
  }],
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Generate contract number
contractSchema.pre('save', async function(next) {
  if (this.isNew && !this.contractNumber) {
    const count = await this.constructor.countDocuments();
    this.contractNumber = `CON-${Date.now()}-${count + 1}`;
  }
  next();
});

// Index for efficient queries
contractSchema.index({ company: 1, status: 1 });
contractSchema.index({ freelancer: 1, status: 1 });
contractSchema.index({ job: 1 });

module.exports = mongoose.model('Contract', contractSchema); 