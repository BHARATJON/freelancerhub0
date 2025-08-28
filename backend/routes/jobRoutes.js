const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Application = require('../models/Application');
const Job = require('../models/Job');

// Post a job (company only)
router.post('/', auth, roleCheck(['company']), jobController.createJob);
// List all jobs (public)
router.get('/', jobController.listJobs);
// List jobs posted by the logged-in company (company only)
router.get('/company', auth, roleCheck(['company']), jobController.listCompanyJobs);
// Get job details (public)
router.get('/:id', jobController.getJobDetails);

// Get applications for a job (company)
router.get('/:id/applications', auth, roleCheck(['company']), async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
  
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
  
      if (job.company.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
  
      const applications = await Application.find({ job: req.params.id })
        .populate('freelancer', 'name email');
  
      res.json(applications);
    } catch (error) {
      console.error('Get applications error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;