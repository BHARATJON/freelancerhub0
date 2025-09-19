const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  weightage: {
    type: Number,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
});

const contractSchema = new mongoose.Schema({
  contractNumber: {
    type: String,
    unique: true,
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
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  // Removed contractNumber, title, description, terms
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
  isFinalized: {
    type: Boolean,
    default: false
  },
  tasks: [taskSchema],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
  // Removed paymentTerms, status, companySignature, freelancerSignature, milestones, attachments, notes, finalPrice, finalDuration, isFinalized
}, {
  timestamps: true
});




// Index for efficient queries
contractSchema.index({ company: 1 });
contractSchema.index({ freelancer: 1 });
contractSchema.index({ job: 1 });

module.exports = mongoose.model('Contract', contractSchema); 