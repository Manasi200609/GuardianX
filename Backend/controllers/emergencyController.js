// controllers/emergencyController.js
const EmergencyLog = require('../models/EmergencyLog');
const User = require('../models/User');
const sendSMS = require('../utils/smsService');

/**
 * Log an emergency event
 * POST /api/emergencies
 */
exports.logEmergency = async (req, res) => {
  try {
    const { userId, triggerType, location, gestureData } = req.body;

    if (!userId || !triggerType || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, triggerType, location',
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Create emergency log
    const emergencyLog = new EmergencyLog({
      userId,
      triggerType,
      location: {
        latitude: location.latitude || location.lat,
        longitude: location.longitude || location.lng,
        accuracy: location.accuracy,
        address: location.address,
      },
      gestureData, // Store gesture detection data if available
    });

    await emergencyLog.save();

    // Send SMS to emergency contacts
    let smsResults = [];
    if (user.emergencyContacts && user.emergencyContacts.length > 0) {
      const locationLink = `https://maps.google.com/?q=${emergencyLog.location.latitude},${emergencyLog.location.longitude}`;
      
      const message = `🚨 GUARDIANX EMERGENCY ALERT 🚨\n\n${user.name} has triggered an emergency alert.\n\nTrigger: ${triggerType}\nTime: ${new Date().toLocaleString()}\nLocation: ${locationLink}\n\nPlease check on them immediately.`;

      for (const contact of user.emergencyContacts) {
        try {
          await sendSMS(contact.phone, message);
          smsResults.push({
            phone: contact.phone,
            sentAt: new Date(),
            success: true,
          });
        } catch (smsError) {
          console.error(`Failed to send SMS to ${contact.phone}:`, smsError);
          smsResults.push({
            phone: contact.phone,
            sentAt: new Date(),
            success: false,
          });
        }
      }

      // Update log with SMS results
      emergencyLog.smsSent = smsResults.some(r => r.success);
      emergencyLog.contactsNotified = smsResults;
      emergencyLog.status = 'notified';
      await emergencyLog.save();
    }

    console.log(`✅ Emergency logged: ${emergencyLog._id} | User: ${user.email} | Type: ${triggerType}`);

    return res.status(201).json({
      success: true,
      emergency: emergencyLog,
      smsSent: emergencyLog.smsSent,
      contactsNotified: smsResults.length,
    });
  } catch (error) {
    console.error('logEmergency error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error logging emergency',
      error: error.message,
    });
  }
};

/**
 * Get emergency logs for a user
 * GET /api/emergencies/user/:userId
 */
exports.getUserEmergencies = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const status = req.query.status; // Optional filter

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const emergencies = await EmergencyLog.find(query)
      .sort({ triggeredAt: -1 })
      .limit(limit)
      .populate('userId', 'name email')
      .lean();

    return res.json({
      success: true,
      count: emergencies.length,
      emergencies,
    });
  } catch (error) {
    console.error('getUserEmergencies error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching emergencies',
    });
  }
};

/**
 * Update emergency status (e.g., mark as resolved)
 * PUT /api/emergencies/:emergencyId
 */
exports.updateEmergencyStatus = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { status, notes } = req.body;

    if (!status || !['triggered', 'notified', 'resolved', 'false_alarm'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const updateData = { status };
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }
    if (notes) {
      updateData.notes = notes;
    }

    const emergency = await EmergencyLog.findByIdAndUpdate(
      emergencyId,
      updateData,
      { new: true }
    );

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: 'Emergency log not found',
      });
    }

    return res.json({
      success: true,
      emergency,
    });
  } catch (error) {
    console.error('updateEmergencyStatus error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating emergency',
    });
  }
};

