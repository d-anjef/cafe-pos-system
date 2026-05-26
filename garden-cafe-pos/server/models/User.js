const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: false },
  branches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch" }],
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["super_admin", "owner", "branch_manager", "admin", "waiter", "kitchen"], required: true, default: "waiter" },
  phone: String,
  avatar: String,
  employeeId: String,
  hireDate: Date,
  salary: Number,
  commissionRate: { type: Number, default: 0 },
  shifts: [{ day: String, startTime: String, endTime: String }],
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
  googleId: String,
  appleId: String,
  lastLogin: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre("save", async function() {
  if (!this.isModified("password")) return;
  if (this.password && this.password.startsWith("$2")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.pre("save", async function() {
  if (this.role === "owner" || this.role === "super_admin") return;
  if (this.employeeId) return;
  if (!this.organization) return;
  const count = await this.constructor.countDocuments({ organization: this.organization });
  this.employeeId = "EMP-" + String(count + 1).padStart(4, "0");
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const user = await this.constructor.findById(this._id).select("+password");
    if (!user || !user.password) return false;
    return await bcrypt.compare(candidatePassword, user.password);
  } catch (err) {
    return false;
  }
};

module.exports = mongoose.model("User", userSchema);
