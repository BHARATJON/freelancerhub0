const FreelancerProfile = require('../models/FreelancerProfile');
const CompanyProfile = require('../models/CompanyProfile');

exports.createOrUpdateFreelancerProfile = async (req, res) => {
  try {
    const { skills, experience, hourlyRate, portfolio, bio, location, availability } = req.body;
    let profile = await FreelancerProfile.findOne({ user: req.user.id });
    if (profile) {
      profile.skills = skills;
      profile.experience = experience;
      profile.hourlyRate = hourlyRate;
      profile.portfolio = portfolio;
      profile.bio = bio;
      profile.location = location;
      profile.availability = availability;
    } else {
      profile = new FreelancerProfile({ user: req.user.id, skills, experience, hourlyRate, portfolio, bio, location, availability });
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

exports.createOrUpdateCompanyProfile = async (req, res) => {
  try {
    const { companyName, description, website, location, verificationDocs } = req.body;
    let profile = await CompanyProfile.findOne({ user: req.user.id });
    if (profile) {
      profile.companyName = companyName;
      profile.description = description;
      profile.website = website;
      profile.location = location;
      profile.verificationDocs = verificationDocs;
    } else {
      profile = new CompanyProfile({ user: req.user.id, companyName, description, website, location, verificationDocs });
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
    const profile = await CompanyProfile.findOne({ user: req.user.id });
    res.status(200).json(profile);
  } catch (error) {
    console.error('Get company profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 