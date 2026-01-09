const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    emergencyContacts: [{  
    name: { type: String, required: true },
    phone: { type: String, required: true } 
  }],
    gesturePattern: { type: String },
    guardianMode: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
