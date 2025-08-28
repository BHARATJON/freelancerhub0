const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Submission = require('../models/Submission');
const Job = require('../models/Job');
const Transaction = require('../models/Transaction');

// Submit work
router.post('/', auth, roleCheck(['freelancer']), async (req, res) => {
  try {
    const { jobId, description, files, videoUrl } = req.body;

    const submission = new Submission({
      job: jobId,
      freelancer: req.user.id,
      description,
      files,
      videoUrl
    });

    await submission.save();

    // Notify company via socket
    const job = await Job.findById(jobId);
    if (job) {
      const io = req.app.get('io');
      io.to(job.company.toString()).emit('new-submission', {
        jobId,
        submissionId: submission._id,
        message: 'New work submission received'
      });
    }

    res.status(201).json({
      message: 'Work submitted successfully',
      submission
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get submissions
router.get('/', auth, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'freelancer') {
      query.freelancer = req.user.id;
    } else if (req.user.role === 'company') {
      const jobs = await Job.find({ company: req.user.id });
      query.job = { $in: jobs.map(job => job._id) };
    }

    const submissions = await Submission.find(query)
      .populate('job')
      .populate('freelancer', 'name email');

    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update submission
router.put('/:id', auth, roleCheck(['company']), async (req, res) => {
  try {
    const { status, feedback, paymentAmount } = req.body;
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const job = await Job.findById(submission.job);
    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    submission.status = status;
    submission.feedback = feedback;

    if (paymentAmount) {
      const transaction = new Transaction({
        submission: submission._id,
        company: req.user.id,
        freelancer: submission.freelancer,
        amount: paymentAmount,
        type: status === 'approved' ? 'final' : 'partial'
      });

      await transaction.save();
      submission.paymentAmount = paymentAmount;
    }

    await submission.save();

    // Notify freelancer via socket
    const io = req.app.get('io');
    io.to(submission.freelancer.toString()).emit('submission-update', {
      submissionId: submission._id,
      status,
      message: `Your submission status changed to ${status}`
    });

    res.json({
      message: 'Submission updated successfully',
      submission
    });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;