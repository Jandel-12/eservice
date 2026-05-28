require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/resident', require('./routes/resident'));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all: serve index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 E-Service server running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Seed admin user on first run
const seedAdmin = async () => {
  try {
    const User = require('./models/User');
    const exists = await User.findOne({ role: 'admin' });
    if (!exists) {
      await User.create({
        firstName: 'Barangay', lastName: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@talolong.gov.ph',
        password: process.env.ADMIN_PASSWORD || 'ChangeMe@2024!',
        phone: '09000000000',
        address: 'Barangay Hall, Talolong, Tayabas, Quezon',
        birthdate: new Date('1990-01-01'),
        gender: 'Male', role: 'admin', status: 'approved',
      });
      console.log('✅ Admin account created.');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};
setTimeout(seedAdmin, 2000);