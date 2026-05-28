const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'eservice_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address, birthdate, gender } = req.body;

    if (!firstName || !lastName || !email || !password || !phone || !address || !birthdate || !gender) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered.' });

    const user = await User.create({ firstName, lastName, email, password, phone, address, birthdate, gender });

    res.status(201).json({
      message: 'Registration submitted. Please wait for admin approval.',
      user: { id: user._id, email: user.email, status: user.status }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

    if (user.role === 'resident' && user.status === 'pending') {
      return res.status(403).json({ message: 'Your account is pending admin approval.' });
    }
    if (user.role === 'resident' && user.status === 'rejected') {
      return res.status(403).json({ message: `Your registration was rejected. Reason: ${user.rejectionReason || 'No reason provided.'}` });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    id: req.user._id,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    phone: req.user.phone,
    address: req.user.address,
    birthdate: req.user.birthdate,
    gender: req.user.gender,
    role: req.user.role,
    status: req.user.status,
  });
};

module.exports = { register, login, getMe };
