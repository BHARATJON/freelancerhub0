const mongoose = require('mongoose');


const companyProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
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
  description: {
    type: String,
    maxlength: 2000
  }
}, {
  timestamps: true
});



module.exports = mongoose.model('CompanyProfile', companyProfileSchema); 