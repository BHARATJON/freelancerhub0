const Job = require('../models/Job');
const mongoose = require('mongoose');

exports.createJob = async (req, res) => {
  try {
    const {
      title, description, requirements, skills, budget, budgetType, duration, type, location, remote, experienceLevel
    } = req.body;
    if (!title || !description || !requirements || !skills || !budget || !budgetType || !duration || !type || !location || !experienceLevel) {
      return res.status(400).json({ message: 'Missing required fields. Please fill out all required job details.' });
    }
    if (!Array.isArray(requirements) || requirements.length === 0) {
      return res.status(400).json({ message: 'At least one requirement is required.' });
    }
    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ message: 'At least one skill is required.' });
    }
    const job = new Job({
      company: req.user.id,
      title, description, requirements, skills, budget, budgetType, duration, type, location, remote, experienceLevel
    });
    await job.save();
    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (error) {
    console.error('Job creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.listJobs = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    } else {
      query = { $or: [{ status: 'active' }, { status: { $exists: false } }] };
    }

    const jobs = await Job.find(query).populate('company', 'name');
    res.status(200).json(jobs);
  } catch (error) {
    console.error('List jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getJobDetails = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid job ID' });
  }
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).populate('company', 'name email').populate('hiredFreelancer', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.status(200).json(job);
  } catch (error) {
    console.error('Get job details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listCompanyJobs = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { company: req.user.id };

    if (status) {
      query.status = status;
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    console.error('List company jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFreelancerJobs = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { hiredFreelancer: req.user.id };

    if (status) {
      query.status = status;
    }

    const jobs = await Job.find(query).populate('company', 'name');
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Get freelancer jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.completeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    job.status = 'completed';
    await job.save();

    res.json({ message: 'Job marked as completed', job });
  } catch (error) {
    console.error('Complete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 