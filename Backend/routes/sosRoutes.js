// routes/sosRoutes.js
const express = require('express');
const router = express.Router();

const User = require('../models/User');
const sendSMS = require('../utils/smsService');

// POST /api/users/:id/sos
router.post('/:id/sos', async (req, res) => {
  try {
    console.log('SOS params:', req.params);
    console.log('SOS body:', req.body);

    const { id } = req.params;
    const { lat, lng } = req.body;

    const user = await User.findById(id);
    if (!user || !user.emergencyContacts || !user.emergencyContacts.length) {
      return res
        .status(400)
        .json({ message: 'No emergency contacts configured' });
    }

    const locationLink =
      lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : 'Location N/A';

    const baseText = `SOS from ${user.email || 'GuardianX user'}. I need help.`;
    const message = `${baseText} ${locationLink}`;

    for (const c of user.emergencyContacts) {
      await sendSMS(c.phone, message);
    }

    return res.json({ message: 'SOS sent to contacts' });
  } catch (err) {
    console.error('SOS error', err);
    return res.status(500).json({ message: 'Server error sending SOS' });
  }
});

module.exports = router;
