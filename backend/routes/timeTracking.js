const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const TimeTracking = require('../models/TimeTracking');
const Contract = require('../models/Contract');

// Start time tracking
router.post('/start', auth, roleCheck(['freelancer']), async (req, res) => {
  try {
    const { contractId, task, description } = req.body;

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    if (contract.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if there's already an active session
    const activeSession = await TimeTracking.findOne({
      contract: contractId,
      freelancer: req.user.id,
      status: 'active'
    });

    if (activeSession) {
      return res.status(400).json({ message: 'You already have an active time tracking session' });
    }

    const timeEntry = new TimeTracking({
      contract: contractId,
      freelancer: req.user.id,
      company: contract.company,
      job: contract.job,
      date: new Date(),
      startTime: new Date(),
      task,
      description,
      status: 'active'
    });

    await timeEntry.save();

    res.status(201).json({
      message: 'Time tracking started',
      timeEntry
    });
  } catch (error) {
    console.error('Start time tracking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Stop time tracking
router.put('/:id/stop', auth, roleCheck(['freelancer']), async (req, res) => {
  try {
    const timeEntry = await TimeTracking.findById(req.params.id);
    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }

    if (timeEntry.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    timeEntry.endTime = new Date();
    timeEntry.status = 'completed';
    await timeEntry.save();

    res.json({
      message: 'Time tracking stopped',
      timeEntry
    });
  } catch (error) {
    console.error('Stop time tracking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get time entries
router.get('/', auth, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'company') {
      query.company = req.user.id;
    } else if (req.user.role === 'freelancer') {
      query.freelancer = req.user.id;
    }

    const timeEntries = await TimeTracking.find(query)
      .populate('contract', 'title')
      .populate('job', 'title')
      .populate('freelancer', 'name')
      .populate('company', 'name')
      .sort({ date: -1 });

    res.json(timeEntries);
  } catch (error) {
    console.error('Get time entries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/reject time entry
router.put('/:id/approve', auth, roleCheck(['company']), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const timeEntry = await TimeTracking.findById(req.params.id);

    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }

    if (timeEntry.company.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    timeEntry.status = status;
    timeEntry.approvedBy = req.user.id;
    timeEntry.approvedAt = new Date();

    if (status === 'rejected') {
      timeEntry.rejectionReason = rejectionReason;
    }

    await timeEntry.save();

    res.json({
      message: `Time entry ${status}`,
      timeEntry
    });
  } catch (error) {
    console.error('Approve time entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;