const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
    index: true
  },
  tableNumber: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'bill-requested', 'cleaning'],
    default: 'available',
    index: true
  },
  floor: String,
  section: String,
  qrCode: String,
  currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  occupiedAt: Date,
  currentBillAmount: {
    type: Number,
    default: 0
  },
  assignedWaiters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reservation: {
    customerName: String,
    customerPhone: String,
    partySize: Number,
    reservationTime: Date,
    notes: String
  }
}, {
  timestamps: true
});

// Compound index for unique table per branch
tableSchema.index({ branch: 1, tableNumber: 1 }, { unique: true });

module.exports = mongoose.model('Table', tableSchema);