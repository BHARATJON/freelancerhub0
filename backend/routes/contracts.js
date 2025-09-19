const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Contract = require('../models/Contract');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

// Get contract by jobId for current user
router.get('/job/:jobId', auth, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    let query = { job: jobId };
    // Only allow company or freelancer involved to fetch
    if (req.user.role === 'company') {
      query.company = req.user.id;
    } else if (req.user.role === 'freelancer') {
      query.freelancer = req.user.id;
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const contract = await Contract.findOne(query)
      .populate('job')
      .populate('company', 'name companyName')
      .populate('freelancer', 'name email')
      .populate('application');
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    res.json(contract);
  } catch (error) {
    console.error('Get contract by job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});




// Generate contract for hired candidate
router.post('/', auth, roleCheck(['company']), async (req, res) => {
  try {
    console.log('POST /contracts body:', req.body);
    const { applicationId, startDate, endDate, totalAmount } = req.body;
    const application = await Application.findById(applicationId);
    if (!application) {
      console.log('Application not found:', applicationId);
      return res.status(404).json({ message: 'Application not found' });
    }
    const job = await Job.findById(application.job);
    console.log('job.company:', job.company);
    console.log('req.user.id:', req.user.id);
    if (job.company.toString() !== req.user.id) {
      console.log('Not authorized: job.company', job.company, 'user', req.user.id);
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Create tasks from job models
    const tasks = job.models.map(model => ({
      name: model.modelName,
      weightage: model.modelWeightage,
      completed: false
    }));

    const contract = new Contract({
      contractNumber: `CN-${Date.now()}`,
      job: application.job,
      company: req.user.id,
      freelancer: application.freelancer,
      application: applicationId,
      startDate,
      endDate,
      totalAmount,
      tasks
    });
    await contract.save();
    // Update application status to hired
    application.status = 'hired';
    application.hiredAt = new Date();
    await application.save();
    // Notify freelancer (pseudo, implement Notification model if needed)
    // await Notification.create({ recipient: application.freelancer, type: 'contract_created', message: 'A contract has been created for your job.' });
    res.status(201).json({
      message: 'Contract generated successfully',
      contract
    });
  } catch (error) {
    console.error('Generate contract error:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
});

// Freelancer finalizes contract
router.put('/:id/finalize', auth, roleCheck(['freelancer']), async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    if (contract.freelancer.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    contract.isFinalized = true;
    await contract.save();
    // Notify company (pseudo, implement Notification model if needed)
    // await Notification.create({ recipient: contract.company, type: 'contract_finalized', message: 'Freelancer has finalized the contract.' });
    res.json({ message: 'Contract finalized', contract });
  } catch (error) {
    console.error('Finalize contract error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit contract (company can edit if not finalized)
router.put('/:id', auth, roleCheck(['company']), async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    if (contract.company.toString() !== req.user.id) {
      console.log('Edit contract - contract.company:', contract.company);
      console.log('Edit contract - req.user.id:', req.user.id);
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (contract.isFinalized) return res.status(400).json({ message: 'Cannot edit a finalized contract' });
    const { startDate, endDate, totalAmount } = req.body;
    contract.startDate = startDate;
    contract.endDate = endDate;
    contract.totalAmount = totalAmount;
    await contract.save();
    res.json({ message: 'Contract updated', contract });
  } catch (error) {
    console.error('Edit contract error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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
      .populate('job')
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

// Update contract tasks and progress
router.put('/:id/tasks', auth, roleCheck(['freelancer']), async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    if (contract.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!contract.isFinalized) {
      return res.status(400).json({ message: 'Cannot update tasks for a non-finalized contract' });
    }

    const { tasks } = req.body;
    contract.tasks = tasks;

    // Calculate progress
    const completedTasks = contract.tasks.filter(task => task.completed);
    const totalWeightage = contract.tasks.reduce((acc, task) => acc + task.weightage, 0);
    const completedWeightage = completedTasks.reduce((acc, task) => acc + task.weightage, 0);
    contract.progress = totalWeightage > 0 ? (completedWeightage / totalWeightage) * 100 : 0;

    await contract.save();

    res.json({ message: 'Contract tasks updated', contract });
  } catch (error) {
    console.error('Update contract tasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



module.exports = router;