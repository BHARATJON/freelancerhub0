const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: {
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
  type: {
    type: String,
    enum: ['freelancer-to-company', 'company-to-freelancer'],
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  categories: {
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    onTime: {
      type: Number,
      min: 1,
      max: 5
    },
    value: {
      type: Number,
      min: 1,
      max: 5
    },
    professionalism: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  reportedCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'hidden', 'removed'],
    default: 'active'
  },
  response: {
    comment: String,
    respondedAt: Date
  },
  flags: [{
    reason: String,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Ensure one review per user per job
reviewSchema.index({ reviewer: 1, job: 1 }, { unique: true, sparse: true });

// Index for efficient queries
reviewSchema.index({ targetUser: 1, type: 1 });
reviewSchema.index({ reviewer: 1, type: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ status: 1 });

// Calculate average rating for categories
reviewSchema.virtual('averageCategoryRating').get(function() {
  if (!this.categories) return this.rating;
  
  const categoryRatings = Object.values(this.categories).filter(rating => rating);
  if (categoryRatings.length === 0) return this.rating;
  
  return categoryRatings.reduce((sum, rating) => sum + rating, 0) / categoryRatings.length;
});

// Pre-save middleware to update user ratings
reviewSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('rating')) {
    try {
      const Review = this.constructor;
      
      // Calculate average rating for target user
      const reviews = await Review.find({ 
        targetUser: this.targetUser, 
        status: 'active' 
      });
      
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
      
      // Update user profile
      const User = mongoose.model('User');
      const user = await User.findById(this.targetUser);
      
      if (user) {
        if (user.role === 'freelancer') {
          const FreelancerProfile = mongoose.model('FreelancerProfile');
          await FreelancerProfile.findOneAndUpdate(
            { user: this.targetUser },
            { 
              rating: averageRating,
              totalReviews: reviews.length
            }
          );
        } else if (user.role === 'company') {
          const CompanyProfile = mongoose.model('CompanyProfile');
          await CompanyProfile.findOneAndUpdate(
            { user: this.targetUser },
            { 
              rating: averageRating,
              totalReviews: reviews.length
            }
          );
        }
      }
    } catch (error) {
      console.error('Error updating user rating:', error);
    }
  }
  next();
});

module.exports = mongoose.model('Review', reviewSchema); 