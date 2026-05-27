const mongoose = require("mongoose");

const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  code: {
    type: String,
    required: true,
    length: 6
  },
  purpose: {
    type: String,
    enum: ["signup", "email-change", "password-reset"],
    default: "signup"
  },
  attempts: {
    type: Number,
    default: 0
  },
  used: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }  // Auto-delete after expiry (MongoDB TTL)
  }
}, { timestamps: true });

// Compound index for fast lookups
verificationCodeSchema.index({ email: 1, code: 1, used: 1 });

module.exports = mongoose.model("VerificationCode", verificationCodeSchema);