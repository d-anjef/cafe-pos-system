const mongoose = require("mongoose");

const tableInstanceSchema = new mongoose.Schema({
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: "Table", required: true },
  x: { type: Number, required: true },   // pixels or grid units
  y: { type: Number, required: true },
  width: { type: Number, default: 120 },
  height: { type: Number, default: 80 },
  rotation: { type: Number, default: 0 }
}, { _id: false });

const layoutSchema = new mongoose.Schema({
  name: { type: String, default: "Main Floor" },
  gridSize: { type: Number, default: 20 }, // snap grid
  zoom: { type: Number, default: 1 },
  backgroundColor: { type: String, default: "#f8f8f8" },
  tables: [tableInstanceSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Layout", layoutSchema);