const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  branches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  }],
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ['super_admin', 'owner', 'branch_manager', 'admin', 'waiter', 'kitchen'],
    required: true,
    default: 'waiter'
  },
  phone: String,
  avatar: String,
  
  employeeId: String,
  hireDate: Date,
  salary: Number,
  commissionRate: { type: Number, default: 0 },
  
  shifts: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  
  googleId: String,
  appleId: String,
  
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before save (only if modified)
userSchema.pre('save', async function(next) {
  // Skip if password is not modified or already hashed
  if (!this.isModified('password')) return next();
  
  // Skip if password looks like it's already hashed (bcrypt format)
  if (this.password.startsWith('$2')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  const user = await this.constructor.findById(this._id).select('+password');
  return await bcrypt.compare(candidatePassword, user.password);
};

// Generate employee ID
userSchema.pre('save', async function(next) {
  if (!this.employeeId && this.role !== 'owner' && this.role !== 'super_admin') {
    const count = await this.constructor.countDocuments({ organization: this.organization });
    this.employeeId = `EMP-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);