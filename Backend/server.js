require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const sosRoutes = require('./routes/sosRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes'); // Emergency logs

const app = express();

// middleware
app.use(cors({
  origin: '*', // Allow all origins (for development)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// All user-related routes: /api/users/...
app.use('/api/users', userRoutes);

// SOS routes under same base: /api/users/:userId/sos
app.use('/api/users', sosRoutes);

// Emergency logs routes: /api/emergencies/...
app.use('/api/emergencies', emergencyRoutes);

// test route
app.get('/test', (req, res) => {
  res.send('API is working');
});

const PORT = 5000;

mongoose
  .connect('mongodb://127.0.0.1:27017/guardianx')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error(err));
