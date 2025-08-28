const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Application = require('../models/Application');
const Job = require('../models/Job');

// Get applications received for company jobs
router.get('/company/applications', auth, roleCheck(['company']), async (req, res) => {
  try {
    // Find applications where the company field matches the logged-in user's id
    const applications = await Application.find({ company: req.user._id })
      .populate('job', 'title budget duration location status')
      .populate('freelancer', 'name email');

    res.json(applications);
  } catch (error) {
    console.error('Get company applications error:', error);
    res.status(500).json({ message: 'Server error: Could not fetch company applications.' });
  }
});

module.exports = router;