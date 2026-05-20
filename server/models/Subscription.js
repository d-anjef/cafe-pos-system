const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['free', 'starter', 'business', 'enterprise'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'trialing', 'past_due', 'canceled', 'paused'],
    default: 'trialing'
  },
  
  provider: {
    type: String,
    enum: ['stripe', 'esewa', 'khalti', 'manual'],
    required: true
  },
  providerCustomerId: String,
  providerSubscriptionId: String,
  
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'NPR'
  },
  
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  trialStart: Date,
  trialEnd: Date,
  canceledAt: Date,
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  
  paymentHistory: [{
    date: Date,
    amount: Number,
    status: String,
    method: String,
    invoiceUrl: String,
    transactionId: String
  }],
  
  usage: {
    branches: { type: Number, default: 0 },
    tables: { type: Number, default: 0 },
    staff: { type: Number, default: 0 },
    orders: { type: Number, default: 0 }
  },
  
  renewalReminder: {
    type: Boolean,
    default: true
  },
  lastReminderSent: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Subscription', subscriptionSchema);