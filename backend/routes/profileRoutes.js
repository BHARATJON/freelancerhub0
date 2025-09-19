const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Freelancer profile
router.post('/freelancer', auth, roleCheck(['freelancer']), profileController.createOrUpdateFreelancerProfile);
router.put('/freelancer', auth, roleCheck(['freelancer']), profileController.updateFreelancerProfile);
router.get('/freelancer', auth, roleCheck(['freelancer']), profileController.getFreelancerProfile);
router.get('/freelancer/:id', auth, profileController.getFreelancerProfileById);

// Company profile

router.post('/company', auth, roleCheck(['company']), profileController.createOrUpdateCompanyProfile);
router.put('/company', auth, roleCheck(['company']), profileController.updateCompanyProfile);
router.get('/company', auth, roleCheck(['company']), profileController.getCompanyProfile);

module.exports = router; 