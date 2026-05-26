const mongoose = require('mongoose');

const staffPerformanceSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  
  // Shift tracking
  shifts: [{
    clockIn: Date,
    clockOut: Date,
    totalHours: Number,
    breakTime: Number
  }],
  
  // Performance metrics
  metrics: {
    ordersServed: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    tipsReceived: { type: Number, default: 0 },
    commissionEarned: { type: Number, default: 0 },
    customerRating: { type: Number, default: 0 },
    orderAccuracy: { type: Number, default: 100 }, // %
    averageServiceTime: Number // minutes
  },
  
  // Issues/complaints
  incidents: [{
    type: String,
    description: String,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: Date
  }]
}, {
  timestamps: true
});

// Compound index for unique performance per day
staffPerformanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('StaffPerformance', staffPerformanceSchema);