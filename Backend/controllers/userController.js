// controllers/userController.js
const User = require('../models/User');
const sendSMS = require('../utils/smsService');

/* ========== AUTH ========== */

// Register user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = new User({ name, email, password });
    await user.save();

    return res.status(201).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error('registerUser error', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during signup',
      error: err.message,
    });
  }
};

// Login user (hackathon: plain password)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('loginUser error', error);
    return res.status(400).json({ error: error.message });
  }
};

/* ========== GUARDIAN MODE ========== */

// Enable Guardian mode by userId
// controllers/userController.js (example)
exports.setGuardianMode = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body; // true or false

    const user = await User.findByIdAndUpdate(
      id,
      { guardianMode: active },   // store current state
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: `Guardian mode ${active ? 'enabled' : 'disabled'}`,
      user,
    });
  } catch (error) {
    console.error('setGuardianMode error', error);
    return res.status(400).json({ error: error.message });
  }
};


// Enable Guardian mode by email (optional, for app using email)
exports.enableGuardianModeByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOneAndUpdate(
      { email },
      { guardianMode: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Guardian mode enabled',
      user,
    });
  } catch (error) {
    console.error('enableGuardianModeByEmail error', error);
    return res.status(400).json({ error: error.message });
  }
};

/* ========== EMERGENCY CONTACTS ========== */

// Update contacts by userId
exports.updateContacts = async (req, res) => {
  // Example inside updateContacts controller
  try {
    const { contacts } = req.body;

    if (!Array.isArray(contacts)) {
      return res.status(400).json({ success: false, message: 'Contacts must be an array' });
    }

    if (contacts.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'You can store at most 5 emergency contacts',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { emergencyContacts: contacts },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error('Update contacts error:', err);
    res.status(500).json({ success: false, message: 'Server error updating contacts' });
  }
};

// Update contacts by email (for app using email)
exports.updateContactsByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const { contacts } = req.body;

    const user = await User.findOneAndUpdate(
      { email },
      { $set: { emergencyContacts: contacts } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Emergency contacts updated',
      emergencyContacts: user.emergencyContacts,
    });
  } catch (err) {
    console.error('updateContactsByEmail error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* ========== GESTURE (stub) ========== */

exports.updateGesture = async (req, res) => {
  try {
    const { id } = req.params;
    const { gesturePattern } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { gesturePattern } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Gesture updated',
      gesturePattern: user.gesturePattern,
    });
  } catch (err) {
    console.error('updateGesture error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* ========== SOS (by id and by email) ========== */

// SOS by userId
exports.triggerSOS = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.guardianMode) {
      return res.status(400).json({ message: 'Guardian mode is OFF' });
    }

    const locationLink =
      lat && lng
        ? `https://maps.google.com/?q=${lat},${lng}`
        : 'Location not available';

    const message = `🚨 SOS ALERT 🚨
${user.name} may be in danger.
Location: ${locationLink}`;

    for (const contact of user.emergencyContacts) {
      await sendSMS(contact.phone, message);
    }

    return res.json({ message: 'SOS sent to emergency contacts' });
  } catch (error) {
    console.error('triggerSOS error', error);
    return res.status(500).json({ message: 'SOS failed' });
  }
};

// SOS by email (for app using email)
exports.triggerSOSByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const { lat, lng } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.guardianMode) {
      return res.status(400).json({ message: 'Guardian mode is OFF' });
    }

    const locationLink =
      lat && lng
        ? `https://maps.google.com/?q=${lat},${lng}`
        : 'Location not available';

    const message = `🚨 SOS ALERT 🚨
${user.name} may be in danger.
Location: ${locationLink}`;

    for (const contact of user.emergencyContacts) {
      await sendSMS(contact.phone, message);
    }

    return res.json({ message: 'SOS sent to emergency contacts' });
  } catch (error) {
    console.error('triggerSOSByEmail error', error);
    return res.status(500).json({ message: 'SOS failed' });
  }
};

// Get contacts by userId
// Get contacts by userId
exports.getContactsById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('emergencyContacts');
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    return res.json({
      success: true,
      contacts: user.emergencyContacts || [],
    });
  } catch (err) {
    console.error('getContactsById error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error getting contacts' });
  }
};


