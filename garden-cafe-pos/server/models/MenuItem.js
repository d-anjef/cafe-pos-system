const mongoose = require('mongoose');

const variantOptionSchema = new mongoose.Schema({
  name:  { type: String, required: true },  // "Chicken"
  price: { type: Number, required: true }   // Full price for this combo
}, { _id: true });

const variantGroupSchema = new mongoose.Schema({
  name:     { type: String, required: true },           // "Type" / "Style"
  required: { type: Boolean, default: true },
  options:  [variantOptionSchema]
}, { _id: true });

const menuItemSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  branches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],

  name: { type: String, required: true, trim: true },
  description: String,

  // ✅ New flexible category system
  category:    { type: String, required: true },   // e.g. "Momo"
  subcategory: { type: String, default: "" },      // optional

  // Base price (used if no variants)
  price: { type: Number, required: true, min: 0 },

  // ✅ Variant system
  hasVariants: { type: Boolean, default: false },
  variantGroups: [variantGroupSchema],

  // Status
  isAvailable: { type: Boolean, default: true },
  isTodaysSpecial: { type: Boolean, default: false },   // ⭐ Today's special flag

  // Tags
  tags: [String],     // popular, spicy, vegan, new, etc.

  // Admin
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

menuItemSchema.index({ organization: 1, category: 1 });
menuItemSchema.index({ organization: 1, isTodaysSpecial: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);