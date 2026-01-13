const express = require('express');
app.use(express.json());
const User = require('../models/User');       // adjust path if needed
const sendSMS = require('../utils/smsService');
const router = express.Router();

// POST /api/users/:userId/sos
router.post('/sos/:id', async (req, res) => {
  try {
    console.log('setGuardianMode params:', req.params);
    console.log('setGuardianMode body:', req.body);

    const { userId } = req.params;
    const { lat, lng } = req.body;

    const user = await User.findById(userId);
    if (!user || !user.emergencyContacts?.length) {
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

    res.json({ message: 'SOS sent to contacts' });
  } catch (err) {
    console.error('SOS error', err);
    res.status(500).json({ message: 'Server error sending SOS' });
  }
});

module.exports = router;
