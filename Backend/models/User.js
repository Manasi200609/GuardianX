// models/User.js
const mongoose = require('mongoose');

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
      unique: true,        // avoid duplicate accounts
      lowercase: true,     // normalize email case
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    // any other fields (contacts, gesture, guardianMode, etc.)
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
