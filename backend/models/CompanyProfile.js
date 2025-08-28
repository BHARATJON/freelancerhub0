const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: 2000
  },
  website: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: true
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
    required: true
  },
  founded: {
    type: Number
  },
  logo: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalJobsPosted: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String
  },
  contactInfo: {
    phone: String,
    address: String
  }
}, {
  timestamps: true
});

// Index for search functionality
companyProfileSchema.index({ companyName: 1, industry: 1, location: 1 });

module.exports = mongoose.model('CompanyProfile', companyProfileSchema); 