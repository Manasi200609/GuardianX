// routes/emergencyRoutes.js
const express = require('express');
const router = express.Router();

const {
  logEmergency,
  getUserEmergencies,
  updateEmergencyStatus,
} = require('../controllers/emergencyController');

// POST /api/emergencies - Log a new emergency
router.post('/', logEmergency);

// GET /api/emergencies/user/:userId - Get user's emergency logs
router.get('/user/:userId', getUserEmergencies);

// PUT /api/emergencies/:emergencyId - Update emergency status
router.put('/:emergencyId', updateEmergencyStatus);

module.exports = router;

