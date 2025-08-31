const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Freelancer profile
router.post('/freelancer', auth, roleCheck(['freelancer']), profileController.createOrUpdateFreelancerProfile);
router.get('/freelancer', auth, roleCheck(['freelancer']), profileController.getFreelancerProfile);
router.get('/freelancer/:id', auth, profileController.getFreelancerProfileById);

// Company profile
router.post('/company', auth, roleCheck(['company']), profileController.createOrUpdateCompanyProfile);
router.get('/company', auth, roleCheck(['company']), profileController.getCompanyProfile);

module.exports = router; 