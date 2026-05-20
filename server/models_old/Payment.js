const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'esewa', 'khalti', 'qr', 'tap', 'card', 'bank-transfer'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  transactionId: String,
  
  // Split payment support
  splits: [{
    method: String,
    amount: Number,
    transactionId: String
  }],
  
  // Tips
  tip: {
    amount: { type: Number, default: 0 },
    method: String, // How tip was paid
    distributedTo: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      amount: Number
    }]
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  
  // Receipt
  receiptGenerated: {
    type: Boolean,
    default: false
  },
  receiptUrl: String,
  receiptNumber: String,
  
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Refund info
  refund: {
    amount: Number,
    reason: String,
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    refundedAt: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);