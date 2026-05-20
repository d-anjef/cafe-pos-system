const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  logo: {
    type: String,
    default: null
  },
  brandColor: {
    primary: { type: String, default: '#d4af37' },
    secondary: { type: String, default: '#1a1a1a' }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'starter', 'business', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'trialing', 'past_due', 'canceled', 'paused'],
      default: 'trialing'
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'esewa', 'khalti', 'manual'],
      default: 'manual'
    }
  },
  limits: {
    branches: { type: Number, default: 1 },
    tables: { type: Number, default: 5 },
    staff: { type: Number, default: 3 },
    menuItems: { type: Number, default: 20 },
    analyticsRetention: { type: Number, default: 7 }
  },
  features: {
    pdfReceipts: { type: Boolean, default: false },
    qrOrdering: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    multiCurrency: { type: Boolean, default: false },
    inventory: { type: Boolean, default: false },
    employeeMetrics: { type: Boolean, default: false }
  },
  settings: {
    currency: { type: String, default: 'NPR' },
    timezone: { type: String, default: 'Asia/Kathmandu' },
    language: { type: String, default: 'en' },
    taxRate: { type: Number, default: 13 },
    serviceCharge: { type: Number, default: 10 }
  },
  contactInfo: {
    email: String,
    phone: String,
    address: String,
    website: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Auto-generate slug from name
organizationSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

module.exports = mongoose.model('Organization', organizationSchema);