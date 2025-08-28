const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Complaint = require('../models/Complaint');

// File complaint
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, type, targetUserId } = req.body;

    const complaint = new Complaint({
      complainant: req.user.id,
      targetUser: targetUserId,
      title,
      description,
      type
    });

    await complaint.save();

    res.status(201).json({
      message: 'Complaint filed successfully',
      complaint
    });
  } catch (error) {
    console.error('Complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get complaints (admin only)
router.get('/', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('complainant', 'name email')
      .populate('targetUser', 'name email')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resolve complaint (admin only)
router.put('/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { status, resolution } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, resolution, resolvedBy: req.user.id, resolvedAt: Date.now() },
      { new: true }
    );

    res.json({
      message: 'Complaint resolved successfully',
      complaint
    });
  } catch (error) {
    console.error('Resolve complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;