const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["available", "occupied", "bill_requested"],
    default: "available"
  },
  activeOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("Table", tableSchema);