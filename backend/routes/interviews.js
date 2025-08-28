const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

// Schedule interview
router.post('/', auth, roleCheck(['company']), async (req, res) => {
  try {
    const { applicationId, scheduledTime, duration, notes, interviewType } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const job = await Job.findById(application.job);
    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const interview = new Interview({
      application: applicationId,
      job: application.job,
      company: req.user.id,
      freelancer: application.freelancer,
      scheduledTime,
      duration,
      notes,
      interviewType: interviewType || 'video'
    });

    await interview.save();

    // Update application status to interviewed and link to interview
    application.status = 'interviewed';
    application.interviewedAt = new Date();
    application.interview = interview._id;
    await application.save();

    // Create notification
    const notification = new Notification({
      recipient: application.freelancer,
      sender: req.user.id,
      type: 'interview_scheduled',
      title: 'Interview Scheduled',
      message: `You have been scheduled for an interview for "${job.title}" on ${new Date(scheduledTime).toLocaleString()}.`,
      relatedApplication: application._id,
      relatedJob: application.job,
      relatedInterview: interview._id
    });

    await notification.save();

    // Notify freelancer via socket
    const io = req.app.get('io');
    io.to(application.freelancer.toString()).emit('interview-scheduled', {
      interviewId: interview._id,
      scheduledTime,
      message: notification.message,
      notification: notification
    });

    res.status(201).json({
      message: 'Interview scheduled successfully',
      interview,
      notification
    });
  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get interviews
router.get('/', auth, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'freelancer') {
      query.freelancer = req.user.id;
    } else if (req.user.role === 'company') {
      query.company = req.user.id;
    }

    const interviews = await Interview.find(query)
      .populate('application')
      .populate('company', 'name companyName')
      .populate('freelancer', 'name email');

    res.json(interviews);
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get interviews scheduled by the company
router.get('/company', auth, roleCheck(['company']), async (req, res) => {
  try {
    // Find interviews where the company field matches the logged-in user's id
    const interviews = await Interview.find({ company: req.user._id })
      .populate('application')
      .populate('freelancer', 'name email');
    res.json(interviews);
  } catch (error) {
    console.error('Get company interviews error:', error);
    res.status(500).json({ message: 'Server error: Could not fetch company interviews.' });
  }
});

// Update interview
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.company.toString() !== req.user.id &&
        interview.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (status) {
        interview.status = status;
    }
    if (notes) {
        interview.notes = notes;
    }

    await interview.save();

    if (status === 'in-progress') {
        const io = req.app.get('io');
        io.to(interview.freelancer.toString()).emit('interview-started', {
            interviewId: interview._id
        });
    }

    res.json({
      message: 'Interview updated successfully',
      interview
    });
  } catch (error) {
    console.error('Update interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete interview and update application status
router.put('/:id/complete', auth, roleCheck(['company']), async (req, res) => {
  try {
    // Validate interview ID
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({ message: 'Invalid interview ID' });
    }

    const { outcome, feedback, nextSteps } = req.body;

    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.company.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update interview
    interview.status = 'completed';
    interview.outcome = outcome;
    interview.feedback = feedback;
    interview.completedAt = new Date();
    await interview.save();

    // Update application status based on outcome
    const application = await Application.findById(interview.application);
    if (application) {
      if (outcome === 'passed') {
        application.status = 'shortlisted';
        application.shortlistedAt = new Date();
      } else if (outcome === 'failed') {
        application.status = 'rejected';
        application.rejectedAt = new Date();
        application.rejectionReason = feedback || 'Interview not passed';
      }
      await application.save();
    }

    // Create notification
    const job = await Job.findById(application.job);
    const notificationData = {
      recipient: interview.freelancer,
      sender: req.user.id,
      type: outcome === 'passed' ? 'application_shortlisted' : 'application_rejected',
      title: outcome === 'passed' ? 'Interview Passed - Shortlisted!' : 'Interview Results',
      message: outcome === 'passed'
        ? `Congratulations! You passed the interview for "${job.title}" and have been shortlisted.`
        : `Thank you for your interview for "${job.title}". Unfortunately, you were not selected for this position.`,
      relatedApplication: application._id,
      relatedJob: application.job,
      relatedInterview: interview._id
    };

    const notification = new Notification(notificationData);
    await notification.save();

    // Notify freelancer via socket
    const io = req.app.get('io');
    io.to(interview.freelancer.toString()).emit('interview-completed', {
      interviewId: interview._id,
      outcome,
      message: notificationData.message,
      notification: notification
    });

    res.json({
      message: 'Interview completed successfully',
      interview,
      application,
      notification
    });
  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single interview details
router.get('/:id', auth, async (req, res) => {
  try {
    // Validate interview ID
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({ message: 'Invalid interview ID' });
    }

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Check authorization
    if (interview.company.toString() !== req.user.id &&
        interview.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this interview' });
    }

    await interview.populate([
      { path: 'application' },
      { path: 'job' },
      { path: 'company', select: 'name companyName' },
      { path: 'freelancer', select: 'name email' }
    ]);

    res.json(interview);
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// End interview
router.put('/:id/end', auth, async (req, res) => {
  try {
    // Validate interview ID
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({ message: 'Invalid interview ID' });
    }

    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.company.toString() !== req.user.id &&
        interview.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    interview.status = 'completed';
    interview.completedAt = new Date();
    await interview.save();

    res.json({ message: 'Interview ended successfully', interview });
  } catch (error) {
    console.error('End interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;