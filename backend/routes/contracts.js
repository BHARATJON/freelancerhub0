const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Contract = require('../models/Contract');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

// Generate contract for hired candidate
router.post('/', auth, roleCheck(['company']), async (req, res) => {
  try {
    const { applicationId, startDate, endDate, hourlyRate, totalHours, terms } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const job = await Job.findById(application.job);
    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const contract = new Contract({
      job: application.job,
      company: req.user.id,
      freelancer: application.freelancer,
      application: applicationId,
      title: `Contract for ${job.title}`,
      description: job.description,
      terms,
      startDate,
      endDate,
      hourlyRate,
      totalHours,
      totalAmount: hourlyRate * totalHours,
      status: 'draft'
    });

    await contract.save();

    // Update application status to hired
    application.status = 'hired';
    application.hiredAt = new Date();
    await application.save();

    // Create notification
    const notification = new Notification({
      recipient: application.freelancer,
      sender: req.user.id,
      type: 'application_hired',
      title: 'Contract Generated',
      message: `A contract has been generated for "${job.title}". Please review and sign.`,
      relatedApplication: application._id,
      relatedJob: application.job
    });

    await notification.save();

    res.status(201).json({
      message: 'Contract generated successfully',
      contract,
      notification
    });
  } catch (error) {
    console.error('Generate contract error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get contracts
router.get('/', auth, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'company') {
      query.company = req.user.id;
    } else if (req.user.role === 'freelancer') {
      query.freelancer = req.user.id;
    }

    const contracts = await Contract.find(query)
      .populate('job', 'title')
      .populate('company', 'name companyName')
      .populate('freelancer', 'name email')
      .sort({ createdAt: -1 });

    res.json(contracts);
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single contract
router.get('/:id', auth, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('job')
      .populate('company', 'name companyName')
      .populate('freelancer', 'name email')
      .populate('application');

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    if (contract.company.toString() !== req.user.id &&
        contract.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(contract);
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Sign contract
router.put('/:id/sign', auth, async (req, res) => {
  try {
    const { signatureData } = req.body;
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    if (contract.company.toString() !== req.user.id &&
        contract.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'company') {
      contract.companySignature = {
        signed: true,
        signedAt: new Date(),
        signatureData
      };
    } else {
      contract.freelancerSignature = {
        signed: true,
        signedAt: new Date(),
        signatureData
      };
    }

    // Check if both parties have signed
    if (contract.companySignature.signed && contract.freelancerSignature.signed) {
      contract.status = 'active';
    }

    await contract.save();

    res.json({
      message: 'Contract signed successfully',
      contract
    });
  } catch (error) {
    console.error('Sign contract error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;