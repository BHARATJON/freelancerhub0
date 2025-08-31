const mongoose = require('mongoose');

const freelancerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  skills: [{
    type: String,
    required: true
  }],
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'expert'],
    required: true
  },
  portfolio: [{
    title: String,
    description: String,
    link: String,
    image: String
  }],
  bio: {
    type: String,
    maxlength: 1000
  },
  location: {
    type: String,
    required: true
  },
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  certifications: [{
    name: String,
    issuer: String,
    year: Number,
    link: String
  }],
  languages: [{
    language: String,
    proficiency: {
      type: String,
      enum: ['basic', 'conversational', 'fluent', 'native']
    }
  }],
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
  completedJobs: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
freelancerProfileSchema.index({ skills: 1, location: 1 });

module.exports = mongoose.model('FreelancerProfile', freelancerProfileSchema); 