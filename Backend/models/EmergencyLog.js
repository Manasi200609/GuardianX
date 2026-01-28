const mongoose = require('mongoose');

const emergencyLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // For faster queries
    },
    triggeredAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    triggerType: {
      type: String,
      enum: ['gesture', 'manual', 'motion', 'route_deviation'],
      required: true,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      accuracy: Number, // GPS accuracy in meters
      address: String, // Reverse geocoded address (optional)
    },
    status: {
      type: String,
      enum: ['triggered', 'notified', 'resolved', 'false_alarm'],
      default: 'triggered',
    },
    smsSent: {
      type: Boolean,
      default: false,
    },
    contactsNotified: [
      {
        phone: String,
        sentAt: Date,
        success: Boolean,
      },
    ],
    resolvedAt: Date,
    notes: String, // Admin or user notes
  },
  { timestamps: true }
);

// Index for efficient queries
emergencyLogSchema.index({ userId: 1, triggeredAt: -1 });
emergencyLogSchema.index({ status: 1 });

const EmergencyLog = mongoose.model('EmergencyLog', emergencyLogSchema);

module.exports = EmergencyLog;

