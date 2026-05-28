const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'eservice_secret');
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) return res.status(401).json({ message: 'User not found.' });
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token.' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Access denied. Admins only.' });
};

const approvedOnly = (req, res, next) => {
  if (req.user && req.user.status === 'approved') return next();
  return res.status(403).json({ message: 'Account not yet approved by admin.' });
};

module.exports = { protect, adminOnly, approvedOnly };
