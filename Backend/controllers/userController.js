const User = require('../models/User');

// REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    const { name, email , password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'All fields are required' });
    }

    // ... check if user exists, hash password, save user ...

    return res
      .status(201)
      .json({ success: true, message: 'User created', user: savedUser });
  } catch (err) {
    console.error('Register error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error during signup' });
  }
};

// ENABLE GUARDIAN MODE
exports.enableGuardianMode = async (req, res) => {
  try { 
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { guardianMode: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Guardian mode enabled",
      user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const sendSMS = require("../utils/smsService");

exports.triggerSOS = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.guardianMode) {
      return res.status(400).json({ message: "Guardian mode is OFF" });
    }

    const message = `🚨 SOS ALERT 🚨
${user.name} may be in danger.
Location tracking started.`;

    for (let contact of user.emergencyContacts) {
      await sendSMS(contact, message);
    }

    res.json({ message: "SOS sent to emergency contacts" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "SOS failed" });
  }
};
// in userController.js
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password }); // for hackathon only; use hashed passwords later
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// UPDATE EMERGENCY CONTACTS
exports.updateContacts = async (req, res) => {
  try {
    const { id } = req.params;
    const { emergencyContacts } = req.body; // array of phone numbers or objects

    const user = await User.findByIdAndUpdate(
      id,
      { emergencyContacts },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Emergency contacts updated',
      user,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// UPDATE GESTURE PATTERN
exports.updateGesture = async (req, res) => {
  try {
    const { id } = req.params;
    const { gesturePattern } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { gesturePattern },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Gesture pattern updated',
      user,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

