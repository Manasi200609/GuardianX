const mongoose = require('mongoose');

// Sub-schema for emergency contacts
const emergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String, 
      required: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true, // avoid duplicate accounts
      lowercase: true, // normalize email case
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // New field: array of emergency contacts
    emergencyContacts: {
      type: [emergencyContactSchema],
      default: [],
    },

    // any other fields (gesture, guardianMode, etc.) can go here
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
