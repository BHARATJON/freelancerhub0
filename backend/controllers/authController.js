const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = new User({ email, password, role, name });
    await user.save();
    const token = user.generateAuthToken();
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, email: user.email, role: user.role, name: user.name }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = user.generateAuthToken();
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email, role: user.role, name: user.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ id: user._id, email: user.email, role: user.role, name: user.name });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};