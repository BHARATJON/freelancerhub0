// Update freelancer profile (PUT)
exports.updateFreelancerProfile = async (req, res) => {
  try {
    const { skills, experience, portfolio, bio, location, upi_id, education, certifications, languages } = req.body;
    let profile = await FreelancerProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }
    profile.skills = skills;
    profile.experience = experience;
    profile.portfolio = portfolio;
    profile.bio = bio;
    profile.location = location;
    profile.upi_id = upi_id;
    profile.education = education;
    profile.certifications = certifications;
    profile.languages = languages;
    await profile.save();
    res.status(200).json(profile);
  } catch (error) {
    console.error('Update freelancer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Update company profile (PUT)
exports.updateCompanyProfile = async (req, res) => {
  try {
    const { name, industry, size, founded, description } = req.body;
    const userId = req.user.id;
    let profile = await CompanyProfile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ message: 'Company profile not found' });
    }
    profile.name = name;
    profile.industry = industry;
    profile.size = size;
    profile.founded = founded;
    profile.description = description;
    await profile.save();
    res.status(200).json(profile);
  } catch (error) {
    console.error('Update company profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
const FreelancerProfile = require('../models/FreelancerProfile');
const CompanyProfile = require('../models/CompanyProfile');

exports.createOrUpdateFreelancerProfile = async (req, res) => {
  try {
  const { skills, experience, portfolio, bio, location, upi_id } = req.body;
    let profile = await FreelancerProfile.findOne({ user: req.user.id });
    if (profile) {
  profile.skills = skills;
  profile.experience = experience;
  profile.portfolio = portfolio;
  profile.bio = bio;
  profile.location = location;
  profile.upi_id = upi_id;
    } else {
  profile = new FreelancerProfile({ user: req.user.id, skills, experience, portfolio, bio, location, upi_id });
    }
    await profile.save();
    res.status(200).json(profile);
  } catch (error) {
    console.error('Freelancer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFreelancerProfile = async (req, res) => {
  try {
    const profile = await FreelancerProfile.findOne({ user: req.user.id });
    res.status(200).json(profile);
  } catch (error) {
    console.error('Get freelancer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFreelancerProfileById = async (req, res) => {
  try {
    const profile = await FreelancerProfile.findOne({ user: req.params.id });
    if (!profile) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error('Get freelancer profile by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.createOrUpdateCompanyProfile = async (req, res) => {
  try {
    const { name, industry, size, founded, description } = req.body;
    const userId = req.user.id;
    let profile = await CompanyProfile.findOne({ user: userId });
    if (profile) {
      profile.name = name;
      profile.industry = industry;
      profile.size = size;
      profile.founded = founded;
      profile.description = description;
    } else {
      profile = new CompanyProfile({ user: userId, name, industry, size, founded, description });
    }
    await profile.save();
    res.status(200).json(profile);
  } catch (error) {
    console.error('Company profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCompanyProfile = async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ user: req.user.id }).populate('user', '-password');
    res.status(200).json(profile);
  } catch (error) {
    console.error('Get company profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 