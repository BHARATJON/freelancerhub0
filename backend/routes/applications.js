const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

// Apply for job
router.post('/apply/:jobId', auth, roleCheck(['freelancer']), async (req, res) => {
  try {
  const { coverLetter } = req.body;
    const jobId = req.params.jobId;

    // Find the job to get the company
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      freelancer: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }

    const application = new Application({
      job: jobId,
      freelancer: req.user.id,
      company: job.company, // Fix: set company field
      coverLetter
    });

    await application.save();

    // Update job with new application
    job.applications.push(application._id);
    await job.save();

    // Notify company via socket
    const io = req.app.get('io');
    io.to(job.company.toString()).emit('new-application', {
      jobId,
      freelancerId: req.user.id,
      message: 'New application received'
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's applications (freelancer)
router.get('/', auth, roleCheck(['freelancer']), async (req, res) => {
  try {
    const applications = await Application.find({ freelancer: req.user.id })
      .populate('job')
      .populate('company', 'name companyName');

    res.json(applications);
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get applications for company
router.get('/company', auth, roleCheck(['company']), async (req, res) => {
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

// Update application status
router.put('/status/:id', auth, roleCheck(['company']), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const job = await Job.findById(application.job);
    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Update status and related timestamps
    application.status = status;
    
    // Set appropriate timestamp based on status
    switch (status) {
      case 'reviewed':
        application.reviewedAt = new Date();
        break;
      case 'shortlisted':
        application.shortlistedAt = new Date();
        break;
      case 'interviewed':
        application.interviewedAt = new Date();
        break;
      case 'hired':
        application.hiredAt = new Date();
        // Update the job
        job.status = 'in-progress';
        job.hiredFreelancer = application.freelancer;
        await job.save();
        break;
      case 'rejected':
        application.rejectedAt = new Date();
        application.rejectionReason = rejectionReason || '';
        break;
    }
    
    await application.save();
    
    // Create notification
    const notificationData = {
      recipient: application.freelancer,
      sender: req.user.id,
      type: `application_${status}`,
      title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      relatedApplication: application._id,
      relatedJob: application.job
    };
    
    switch (status) {
      case 'shortlisted':
        notificationData.message = `Congratulations! Your application for "${job.title}" has been shortlisted.`;
        break;
      case 'hired':
        notificationData.message = `Great news! You've been hired for "${job.title}".`;
        break;
      case 'rejected':
        notificationData.message = `Your application for "${job.title}" was not selected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`;
        break;
      default:
        notificationData.message = `Your application status for "${job.title}" has been updated to ${status}.`;
    }
    
    const notification = new Notification(notificationData);
    await notification.save();
    
    // Notify freelancer via socket
    const io = req.app.get('io');
    io.to(application.freelancer.toString()).emit('application-update', {
      applicationId: application._id,
      status,
      message: notificationData.message,
      notification: notification
    });
    
    res.json({
      message: 'Application status updated',
      application,
      notification
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single application by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({ path: 'job', populate: { path: 'company' } })
      .populate('freelancer', 'name email')
      .populate('company', 'name companyName')
      .populate('interview');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check authorization - company can view applications for their jobs, freelancer can view their own
    if (req.user.role === 'company') {
      if (!application.job || application.job.company._id.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to view this application' });
      }
    } else if (req.user.role === 'freelancer') {
      if (application.freelancer._id.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to view this application' });
      }
    }
    
    res.json(application);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;