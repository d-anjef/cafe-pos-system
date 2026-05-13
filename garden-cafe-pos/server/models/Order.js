const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true
  },
  name: String,
  price: Number,
  quantity: Number,
  status: {
    type: String,
    enum: ["pending", "in_progress", "ready"],
    default: "pending"
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Table",
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  paymentMethod: {
  type: String,
  enum: ["cash", "card", "upi"],
  default: "cash"},
  
  completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);