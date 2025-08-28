const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Review = require('../models/Review');

// Create review
router.post('/', auth, async (req, res) => {
  try {
    const { targetUserId, rating, comment, type } = req.body;

    const review = new Review({
      reviewer: req.user.id,
      targetUser: targetUserId,
      rating,
      comment,
      type
    });

    await review.save();

    res.status(201).json({
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user reviews
router.get('/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ targetUser: req.params.userId })
      .populate('reviewer', 'name companyName');

    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;