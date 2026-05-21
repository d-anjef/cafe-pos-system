const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  name: { type: String, required: true, trim: true },     // "Momo"
  icon: { type: String, default: "🍽️" },                  // emoji
  description: String,
  displayOrder: { type: Number, default: 0 },
  subcategories: [{ type: String }],                       // ["Steam", "Jhol", "Sadeko"]
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

categorySchema.index({ organization: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);